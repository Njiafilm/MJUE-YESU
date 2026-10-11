/* MJUE YESU v3.1 — marekebisho ya tabia (kushiriki, kunakili, kufungua PDF, muundo wa GC wa lesoni, lugha) */
(function(){
  'use strict';

  function hasNative(m){ return !!(window.MJUE_NATIVE && typeof window.MJUE_NATIVE[m] === 'function'); }

  /* ---------- Toast ndogo ---------- */
  var toastEl = null, toastT = 0;
  function toast(t){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:5000;background:#222;color:#fff;padding:9px 16px;border-radius:999px;font-size:13px;max-width:86%;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = t; toastEl.style.opacity = '.95';
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.style.opacity = '0'; }, 2200);
  }

  /* ---------- Kushiriki / kunakili / viungo vya nje (WebView haina navigator.share wala window.open) ---------- */
  try{
    if(hasNative('share') && !navigator.share){
      Object.defineProperty(navigator, 'share', { configurable: true, value: function(d){
        d = d || {}; window.MJUE_NATIVE.share(String(d.title || ''), String(d.text || ''), String(d.url || '')); return Promise.resolve();
      }});
    }
    if(hasNative('copy')){
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: function(t){ window.MJUE_NATIVE.copy(String(t)); return Promise.resolve(); }
      }});
    }
    if(hasNative('openUrl')){
      var _open = window.open;
      window.open = function(u){
        if(u && /^https?:/i.test(String(u))){ window.MJUE_NATIVE.openUrl(String(u)); return null; }
        return _open ? _open.apply(window, arguments) : null;
      };
    }
  }catch(e){}

  /* ---------- IndexedDB (picha/PDF za admin) ---------- */
  function idbGet(key){
    return new Promise(function(res, rej){
      var q = indexedDB.open('mjue_yesu_admin_db', 1);
      q.onupgradeneeded = function(e){
        var db = e.target.result;
        if(!db.objectStoreNames.contains('files')) db.createObjectStore('files');
        if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
      };
      q.onsuccess = function(){
        var g = q.result.transaction('files').objectStore('files').get(key);
        g.onsuccess = function(){ res(g.result); }; g.onerror = function(){ rej(g.error); };
      };
      q.onerror = function(){ rej(q.error); };
    });
  }
  function blobToB64(b){
    return new Promise(function(res, rej){
      var r = new FileReader(); r.onload = function(){ res(String(r.result)); }; r.onerror = function(){ rej(r.error); }; r.readAsDataURL(b);
    });
  }

  /* PDF: fungua kwa programu ya simu (viungo vya blob: havifunguki ndani ya WebView) */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a.pdf-link[data-pdfkey]');
    if(!a) return;
    e.preventDefault(); e.stopPropagation();
    var key = a.getAttribute('data-pdfkey'), name = a.getAttribute('data-pdfname') || 'file.pdf';
    toast('Inafungua PDF…');
    idbGet(key).then(function(blob){
      if(!blob){ toast('PDF haipatikani'); return; }
      if(hasNative('openPdf')) return blobToB64(blob).then(function(d){ window.MJUE_NATIVE.openPdf(d, name); });
      var u = URL.createObjectURL(blob), l = document.createElement('a');
      l.href = u; l.download = name; l.target = '_blank'; document.body.appendChild(l); l.click();
      setTimeout(function(){ l.remove(); }, 800);
    }).catch(function(){ toast('Imeshindwa kufungua PDF'); });
  }, true);

  /* Lugha (Kiswahili / English) kwa picha na PDF za admin */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.lang-pills button[data-lang]');
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    try{ localStorage.setItem('mjue_lang', b.getAttribute('data-lang') === 'en' ? 'en' : 'sw'); }catch(x){}
    if(window.MJUE_ADMIN && window.MJUE_ADMIN.inject) window.MJUE_ADMIN.inject();
  }, true);

  /* ---------- Lesoni: muundo wa GC (bila vitufe vya mafungu) ---------- */
  function refFromBtn(btn){
    var d = (btn.getAttribute('data-pass') || '').split('|');
    if(d.length < 2 || !d[0]) return null;
    var label = (btn.textContent || '').replace(/^\s*(?:\uD83D\uDCD6)?\s*(?:Fungua\s+)?/, '').trim();
    var m = label.match(/(\d+)\s*:\s*(\d+)(?:\s*[\u2013\-]\s*(\d+)(?!\s*:))?/);
    var v1 = m ? m[2] : '', v2 = m && m[3] ? m[3] : '';
    var a = document.createElement('a');
    a.className = 'ref-link'; a.textContent = label;
    a.setAttribute('data-pass', d[0] + '|' + d[1] + '|' + v1);
    if(v2) a.setAttribute('data-end', v2);
    return a;
  }

  function gcify(root){
    if(!root) return;
    root.querySelectorAll('.lesson-day-banner .pass-btn').forEach(function(btn){
      if(btn.getAttribute('data-gc')) return;
      btn.setAttribute('data-gc', '1');
      btn.textContent = btn.textContent.replace(/^\s*\uD83D\uDCD6\s*/, '');
    });
    root.querySelectorAll('.lesson-cover').forEach(function(c){
      if(c.querySelector('.lesson-day-banner')) c.classList.add('gc-cover');
    });
    // Safu za vitufe zimefichwa na CSS. Pale mafungu hayamo ndani ya maandishi, tengeneza mstari wa viungo wenye mstari chini.
    root.querySelectorAll('.lesson-refbox, .pass-row').forEach(function(box){
      if(box.getAttribute('data-gc')) return;
      box.setAttribute('data-gc', '1');
      if(box.classList.contains('pass-row') && box.closest('.lesson-refbox')) return;
      if(box.closest('.lesson-memory, .soma-text, .lesson-cover')) return;
      var btns = box.querySelectorAll('.pass-btn');
      if(!btns.length) return;
      var line = document.createElement('div'); line.className = 'gc-refline';
      var b = document.createElement('b'); b.textContent = 'Soma: '; line.appendChild(b);
      var n = 0;
      [].forEach.call(btns, function(btn){
        var a = refFromBtn(btn); if(!a) return;
        if(n++) line.appendChild(document.createTextNode('; '));
        line.appendChild(a);
      });
      if(n) box.parentNode.insertBefore(line, box);
    });
  }
  var body = document.getElementById('lessonReaderBody');
  var injT = 0;
  function wantInject(){
    var r = document.getElementById('lessonReader');
    if(!r || !r.classList.contains('show')) return;
    if(!window.MJUE_ADMIN || !window.MJUE_ADMIN.inject) return;
    if(body.querySelector(':scope > .public-admin-block')) return;
    clearTimeout(injT);
    injT = setTimeout(function(){
      if(!body.querySelector(':scope > .public-admin-block')) window.MJUE_ADMIN.inject();
    }, 150);
  }
  if(body){
    new MutationObserver(function(){ gcify(body); wantInject(); }).observe(body, { childList: true });
    gcify(body);
  }
  window.MJUE_GC = { gcify: gcify, toast: toast };

  /* ---------- Tafsiri (Kiswahili <-> English) kwa maandishi ya kisanduku ---------- */
  function netGet(url){
    var f = window.MJUE_CLOUD && window.MJUE_CLOUD.net;
    if(f) return f('GET', url, {}, null);
    return fetch(url).then(function(r){ return r.text().then(function(t){ return { status: r.status, text: t }; }); });
  }
  function chunkText(text, max){
    var out = [], cur = '';
    String(text).split(/(\n)/).forEach(function(tok){
      if(tok.length > max){
        var sents = tok.split(/(?<=[.!?])\s+/);
        sents.forEach(function(sn){
          if((cur + sn).length > max && cur){ out.push(cur); cur = ''; }
          while(sn.length > max){ out.push(sn.slice(0, max)); sn = sn.slice(max); }
          cur += (cur && sn ? ' ' : '') + sn;
        });
      } else if((cur + tok).length > max && cur){ out.push(cur); cur = tok; }
      else cur += tok;
    });
    if(cur) out.push(cur);
    return out;
  }
  async function gTranslate(q, from, to){
    var r = await netGet('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(q));
    if(r.status === 0) throw new Error('Hakuna mtandao');
    if(r.status !== 200) throw new Error('HTTP ' + r.status);
    var j = JSON.parse(r.text);
    var t = (j[0] || []).map(function(x){ return (x && x[0]) || ''; }).join('');
    if(!t) throw new Error('Jibu tupu');
    return t;
  }
  async function mTranslate(q, from, to){
    var pieces = chunkText(q, 450), out = '';
    for(var i = 0; i < pieces.length; i++){
      if(!pieces[i].trim()){ out += pieces[i]; continue; }
      var r = await netGet('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(pieces[i]) + '&langpair=' + from + '%7C' + to);
      if(r.status === 0) throw new Error('Hakuna mtandao');
      var j = JSON.parse(r.text);
      var t = j && j.responseData && j.responseData.translatedText;
      if(!t) throw new Error('Jibu tupu');
      out += t + (i < pieces.length - 1 && !/\n$/.test(pieces[i]) ? ' ' : '');
    }
    return out;
  }
  async function translate(text, from, to){
    text = String(text || '');
    if(!text.trim()) return '';
    var parts = chunkText(text, 1200), out = '';
    for(var i = 0; i < parts.length; i++){
      if(!parts[i].trim()){ out += parts[i]; continue; }
      var t;
      try{ t = await gTranslate(parts[i], from, to); }
      catch(e1){ t = await mTranslate(parts[i], from, to); }
      out += t;
    }
    return out;
  }
  window.MJUE_TR = { translate: translate };

  /* ---------- Upload: njia mbadala (kichagua cha moja kwa moja) na ukaguzi wa kichagua cha WebView ---------- */
  function upStatus(m){ var U = window.MJUE_ADMIN_UPLOAD; if(U && U.status) U.status(m); }
  var picks = {};
  window.__mjuePick = function(kind, id, name, mime, chunk, last){
    var k = kind + '#' + id + '#' + name;
    picks[k] = (picks[k] || '') + chunk;
    if(!last) return;
    var b64 = picks[k]; delete picks[k];
    try{
      var bin = atob(b64), u8 = new Uint8Array(bin.length);
      for(var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      var file = new File([u8], name, { type: mime || (kind === 'pdf' ? 'application/pdf' : 'image/jpeg') });
      var U = window.MJUE_ADMIN_UPLOAD;
      if(!U){ upStatus('❌ Dashboard haijawa tayari'); return; }
      if(kind === 'pdf') U.setPdf(file); else U.addImages([file]);
    }catch(e){ upStatus('❌ Imeshindwa kusoma faili: ' + ((e && e.message) || e)); }
  };
  document.querySelectorAll('.alt-pick').forEach(function(b){
    if(hasNative('pickFile')) b.hidden = false;
    b.addEventListener('click', function(){
      var kind = b.getAttribute('data-pick') === 'pdf' ? 'pdf' : 'image';
      upStatus('⏳ Inasubiri uchaguzi wa faili…');
      window.MJUE_NATIVE.pickFile(kind, kind === 'image');
    });
  });
  function watchInput(id, label){
    var input = document.getElementById(id);
    if(!input) return;
    input.addEventListener('click', function(){
      var opened = false, got = false;
      upStatus('⏳ Inafungua kichagua faili (' + label + ')…');
      function onVis(){
        if(document.visibilityState === 'hidden'){ opened = true; return; }
        if(opened){
          document.removeEventListener('visibilitychange', onVis);
          setTimeout(function(){ if(!got) upStatus('⚠ Hakuna faili lililochaguliwa' + (hasNative('pickFile') ? ' — jaribu kitufe cha "njia mbadala" chini yake.' : '.')); }, 1800);
        }
      }
      document.addEventListener('visibilitychange', onVis);
      input.addEventListener('change', function(){ got = true; }, { once: true });
      setTimeout(function(){
        if(!opened && !got) upStatus('⚠ Kichagua faili hakijafunguka' + (hasNative('pickFile') ? ' — tumia kitufe cha "njia mbadala" chini yake.' : '.'));
      }, 1500);
    });
  }
  watchInput('adminImages', 'picha');
  watchInput('adminPdf', 'PDF');

  /* ---------- Viungo vya mafungu kila mahali (maandishi yoyote yenye jina la kitabu cha Biblia) ---------- */
  var SKIP = 'a,button,textarea,input,select,script,style,[contenteditable="true"],.ref-link,#verseSheet,#bibleReader,.lesson-day-banner';
  function linkTextIn(root){
    var E = window.MJUE_EXTRAS;
    if(!root || !E || !E.linkNode) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function(n){
      var pn = n.parentNode;
      if(!pn || pn.nodeType !== 1 || !/\d/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      return pn.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }});
    var list = [], n;
    while((n = w.nextNode())) list.push(n);
    list.forEach(function(t){ if(t.parentNode) E.linkNode(t); });
  }
  function linkAll(){
    if(body && !body.classList.contains('editing')) linkTextIn(body);
    ['home', 'lesoni', 'historia', 'adminPreviewBox', 'adminPublicPages'].forEach(function(id){ linkTextIn(document.getElementById(id)); });
    document.querySelectorAll('.public-admin-block').forEach(linkTextIn);
  }
  var linkT = 0;
  function scheduleLink(){ clearTimeout(linkT); linkT = setTimeout(linkAll, 200); }
  new MutationObserver(scheduleLink).observe(document.body, { childList: true, subtree: true });
  if(body){
    // wakati lesoni inafunguka: unganisha mara moja (kabla mfumo wa kuhariri haujachukua nakala ya asili)
    new MutationObserver(function(){ if(!body.classList.contains('editing')) linkTextIn(body); }).observe(body, { childList: true });
  }
  scheduleLink();
})();

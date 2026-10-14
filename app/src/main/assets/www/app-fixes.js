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
    // "Usomaji: Zaburi NN" kwenye kichwa cha siku: kiwe maandishi ya kawaida (yanahaririwa), kiungo kinaundwa kiotomatiki
    root.querySelectorAll('.lesson-day-banner .pass-btn').forEach(function(btn){
      var sp = document.createElement('span');
      sp.className = 'day-read';
      sp.textContent = btn.textContent.replace(/^\s*\uD83D\uDCD6\s*/, '').trim();
      btn.parentNode.replaceChild(sp, btn);
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

  /* ---------- Kusoma maandishi (OCR) kwenye picha na PDF kisha kuyaweka kwenye "Maelezo" ---------- */
  var ocrPend = {}, ocrSeq = 1, ocrBusy = false;
  window.__mjueOcrCb = function(id, ok, payload){
    var p = ocrPend[id]; if(!p) return;
    delete ocrPend[id];
    clearTimeout(p.t);
    if(ok) p.res(String(payload || '')); else p.rej(new Error(String(payload || 'Hitilafu')));
  };
  window.__mjueOcrProg = function(id, done, total){ var p = ocrPend[id]; if(p && p.prog) p.prog(done, total); };
  function ocrOne(blob, kind, prog){
    return new Promise(function(res, rej){
      if(!hasNative('ocr')){ rej(new Error('Kusoma maandishi kunapatikana kwenye app ya simu pekee')); return; }
      blobToB64(blob).then(function(d){
        var id = ocrSeq++;
        var t = setTimeout(function(){ if(ocrPend[id]){ delete ocrPend[id]; rej(new Error('Imechukua muda mrefu mno')); } }, 300000);
        ocrPend[id] = { res: res, rej: rej, prog: prog, t: t };
        try{ window.MJUE_NATIVE.ocr(id, kind, d); }catch(e){ delete ocrPend[id]; clearTimeout(t); rej(e); }
      }).catch(rej);
    });
  }
  function cleanOcr(t){
    return String(t || '').replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function putDesc(text, replace){
    var ta = document.getElementById('adminDesc');
    if(!ta) return;
    ta.value = (replace || !ta.value.trim()) ? text : ta.value.replace(/\s+$/, '') + '\n\n' + text;
    try{ ta.dispatchEvent(new Event('input', { bubbles: true })); }catch(e){}
  }
  async function ocrItems(items, replace){
    if(!items.length) return;
    if(!hasNative('ocr')){ upStatus('⚠ Kusoma maandishi kunapatikana kwenye app ya simu pekee.'); return; }
    if(ocrBusy){ upStatus('⏳ Kusoma maandishi kunaendelea, subiri…'); return; }
    ocrBusy = true;
    var got = [];
    try{
      for(var i = 0; i < items.length; i++){
        var it = items[i];
        var label = it.kind === 'pdf' ? 'PDF' : 'picha ' + (i + 1) + '/' + items.length;
        upStatus('🔍 Inasoma maandishi (' + label + ')…');
        var txt = cleanOcr(await ocrOne(it.blob, it.kind, function(d, t){ upStatus('🔍 Inasoma maandishi (' + label + ') ukurasa ' + d + '/' + t + '…'); }));
        if(txt) got.push(txt);
      }
      var all = got.join('\n\n');
      if(!all){ upStatus('⚠ Hakuna maandishi yaliyoonekana. Jaribu picha iliyo wazi zaidi.'); return; }
      putDesc(all, !!replace);
      upStatus('✅ Maandishi (herufi ' + all.length + ') yameongezwa kwenye Maelezo. Yahakiki, kisha bofya Hifadhi.');
    }catch(e){
      upStatus('❌ Imeshindwa kusoma maandishi: ' + ((e && e.message) || e));
    }finally{ ocrBusy = false; }
  }
  // Kiotomatiki mara tu picha/PDF inapopakiwa
  window.MJUE_AFTER_UPLOAD = function(kind, files){
    var items = [];
    [].forEach.call(files || [], function(f){ if(f) items.push({ kind: kind, blob: f }); });
    ocrItems(items, false);
  };
  // Kwa mkono: soma tena picha/PDF zote za lugha hii na ubadilishe Maelezo
  var ocrBtn = document.getElementById('adminOcr');
  if(ocrBtn) ocrBtn.addEventListener('click', async function(){
    var items = [];
    try{
      var keys = window.__adminImageKeys || [];
      for(var i = 0; i < keys.length; i++){ var b = await idbGet(keys[i]); if(b) items.push({ kind: 'image', blob: b }); }
      var pdf = window.__adminPdf || (window.__adminPdfKey ? await idbGet(window.__adminPdfKey) : null);
      if(pdf && !window.__adminPdfRemoved) items.push({ kind: 'pdf', blob: pdf });
    }catch(e){}
    if(!items.length){ upStatus('⚠ Hakuna picha au PDF ya kusoma. Pakia kwanza.'); return; }
    var ta = document.getElementById('adminDesc');
    if(ta && ta.value.trim() && !confirm('Maelezo yaliyopo yatabadilishwa na maandishi yaliyosomwa. Endelea?')) return;
    ocrItems(items, true);
  });

  /* ---------- Viungo vya mafungu kila mahali (maandishi yoyote yenye jina la kitabu cha Biblia) ---------- */
  var SKIP = 'a,button,textarea,input,select,script,style,[contenteditable="true"],.ref-link,#verseSheet,#bibleReader,.day-name';
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

/* ===================== JUMA / SIKU YA SASA KILA MAHALI ===================== */
(function(){
  'use strict';
  function toast(t){ if(window.MJUE_GC && window.MJUE_GC.toast) window.MJUE_GC.toast(t); }
  var BASE = new Date(2026, 8, 26); // Lesoni 1 ya Q4 2026 inaanza Sabato, Septemba 26, 2026
  var DN = ['Sabato', 'Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa'];
  var WD = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  var MN = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];
  function $(id){ return document.getElementById(id); }
  function dstart(n){ return new Date(BASE.getFullYear(), BASE.getMonth(), BASE.getDate() + 7 * (n - 1)); }
  function ddate(n, i){ var s = dstart(n); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + i); }
  function today(){ var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function diff(a, b){ return Math.round((a - b) / 86400000); }
  function longDate(d){ return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MN[d.getMonth()] + ' ' + d.getFullYear(); }
  function shortDate(d){ return d.getDate() + ' ' + MN[d.getMonth()]; }
  function qLabel(d){ return 'Q' + (Math.floor(d.getMonth() / 3) + 1) + ' ' + d.getFullYear(); }
  function state(){
    var t = today(), d0 = diff(t, dstart(1));
    if(d0 < 0) return { n: 1, i: null, st: 'before' };
    if(diff(t, ddate(13, 6)) > 0) return { n: 13, i: null, st: 'after' };
    var n = Math.min(13, Math.floor(d0 / 7) + 1);
    return { n: n, i: d0 - 7 * (n - 1), st: 'during' };
  }

  /* ---------- Data ya juma kutoka kwenye kiolezo cha somo ---------- */
  function labelOf(btn){
    return (btn.textContent || '').replace(/^\s*(?:\uD83D\uDCD6)?\s*(?:Fungua\s+)?/, '').replace(/^Usomaji:\s*/, '').trim();
  }
  function refOf(btn){
    var d = (btn.getAttribute('data-pass') || '').split('|');
    if(d.length < 2 || !d[0]) return null;
    var label = labelOf(btn);
    var m = label.match(/(\d+)\s*:\s*(\d+)(?:\s*[\u2013\-]\s*(\d+)(?!\s*:))?/);
    return { label: label, pass: d[0] + '|' + d[1] + '|' + (m ? m[2] : ''), end: (m && m[3]) ? m[3] : '' };
  }
  function anchor(r){
    var a = document.createElement('a');
    a.className = 'ref-link'; a.textContent = r.label;
    a.setAttribute('data-pass', r.pass); if(r.end) a.setAttribute('data-end', r.end);
    return a;
  }
  function appendRefs(el, refs){
    refs.forEach(function(r, i){ if(i) el.appendChild(document.createTextNode('; ')); el.appendChild(anchor(r)); });
  }
  function dayIdx(txt){
    txt = (txt || '').replace(/\s*LEO\s*$/, '').trim();
    if(/^Sabato/i.test(txt) || /^Somo\s*la/i.test(txt)) return 0;
    return DN.indexOf(txt);
  }
  var weekCache = {};
  function parseWeek(n){
    if(weekCache[n]) return weekCache[n];
    if(typeof window.__q4Template !== 'function') return null;
    var html; try{ html = window.__q4Template(n); }catch(e){ return null; }
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    var days = {}, bodyKeys = [];
    [].forEach.call(doc.querySelectorAll('.lesson-cover, .lesson-page'), function(pg){
      var nm = pg.querySelector('.day-name'); if(!nm) return;
      var idx = dayIdx(nm.textContent); if(idx < 0 || days[idx]) return;
      var h = pg.querySelector('.lesson-page-title');
      var banner = [], reads = [], seen = {};
      [].forEach.call(pg.querySelectorAll('.pass-btn'), function(b){
        if(b.closest('.lesson-memory')) return;
        var r = refOf(b); if(!r || seen[r.label]) return; seen[r.label] = 1;
        (b.closest('.lesson-day-banner') ? banner : reads).push(r);
      });
      days[idx] = { title: h ? h.textContent.trim() : '', banner: banner, reads: reads };
      bodyKeys.push(JSON.stringify(reads.map(function(r){ return r.label; })));
    });
    // Mafungu yanayofanana kila siku (somo la jumla) yanaonyeshwa mara moja kwa juma, si kila siku
    var weekReads = [];
    var uniq = bodyKeys.filter(function(k, i){ return bodyKeys.indexOf(k) === i; });
    if(bodyKeys.length > 2 && uniq.length === 1){
      Object.keys(days).forEach(function(k){ if(!weekReads.length) weekReads = days[k].reads; days[k].reads = []; });
    }
    var cp = doc.querySelector('.lesson-cover > p');
    var out = { days: days, weekReads: weekReads, weekText: cp ? cp.textContent.replace(/^\s*Somo la Juma Hili:\s*/, '').trim() : '' };
    weekCache[n] = out;
    return out;
  }
  function readsFor(st, wk){
    if(!wk || st.st !== 'during') return [];
    var d = wk.days[st.i];
    var r = d ? d.banner.concat(d.reads) : [];
    if(!r.length) r = (wk.weekReads || []).slice();
    return r;
  }

  /* ---------- Karatasi ya "Neno la Leo / Usomaji wa leo" ---------- */
  var rs = document.createElement('div');
  rs.id = 'readSheet';
  rs.innerHTML = '<div class="rs-back"></div><div class="rs-box"><div class="rs-grab"></div><div class="rs-head"><div class="rs-title">Neno la Leo</div><button type="button" class="rs-x" aria-label="Funga">\u00D7</button></div><div class="rs-body"></div></div>';
  document.body.appendChild(rs);
  function closeRS(){ rs.classList.remove('open'); }
  rs.querySelector('.rs-back').addEventListener('click', closeRS);
  rs.querySelector('.rs-x').addEventListener('click', closeRS);
  function openRS(){
    var st = state(), wk = parseWeek(st.n), mem = (window.__q4Memory || {})[st.n], titles = window.__q4Titles || {};
    var b = rs.querySelector('.rs-body'); b.innerHTML = '';
    var d = document.createElement('div'); d.className = 'rs-date';
    d.textContent = longDate(new Date()) + ' \u00B7 Lesoni ' + st.n + (titles[st.n] ? ' \u2014 ' + titles[st.n] : '');
    b.appendChild(d);
    if(mem){
      var h = document.createElement('h4'); h.textContent = 'Fungu la kukariri (juma hili)'; b.appendChild(h);
      var q = document.createElement('blockquote'); q.appendChild(document.createTextNode('\u201C' + mem.text + '\u201D '));
      q.appendChild(document.createTextNode('(')); q.appendChild(anchor({ label: mem.ref, pass: mem.pass, end: '' })); q.appendChild(document.createTextNode(')'));
      b.appendChild(q);
    }
    var reads = readsFor(st, wk);
    var h2 = document.createElement('h4'); h2.textContent = 'Usomaji wa Biblia wa leo'; b.appendChild(h2);
    var rd = document.createElement('div'); rd.className = 'rs-reads';
    if(reads.length) appendRefs(rd, reads); else rd.textContent = 'Soma fungu la kukariri na mada ya juma.';
    b.appendChild(rd);
    if(wk && wk.weekReads && wk.weekReads.length && st.st === 'during'){
      var h3 = document.createElement('h4'); h3.textContent = 'Mafungu ya juma hili'; b.appendChild(h3);
      var wr = document.createElement('div'); wr.className = 'rs-reads'; appendRefs(wr, wk.weekReads); b.appendChild(wr);
    }
    var go = document.createElement('button'); go.type = 'button'; go.className = 'rs-open'; go.textContent = '\uD83D\uDCD6 Fungua somo la leo';
    go.addEventListener('click', function(){
      closeRS();
      if(st.st === 'during') window.__mjueTargetDay = st.i;
      var f = window.mjueOpenLesson || window.openLesson;
      if(typeof f === 'function') f('q4-' + st.n);
    });
    b.appendChild(go);
    rs.classList.add('open');
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('#cloudTiles button[data-act="daily"]');
    if(!t) return;
    e.stopPropagation(); e.preventDefault();
    openRS();
  }, true);

  /* ---------- Uhariri wa kadi za tabu ya Lesoni (admin) ---------- */
  var editing = false, snap = [];
  function isAdmin(){
    try{ if(window.MJUE_CLOUD && window.MJUE_CLOUD.isAdmin && window.MJUE_CLOUD.isAdmin()) return true; }catch(e){}
    try{ return sessionStorage.getItem('mjue_yesu_admin_session') === '1'; }catch(e){ return false; }
  }
  function eds(){
    var out = [];
    ['#sabatoMchanaBox h3', '#sabatoMchanaBox p', '#sabatoMchanaBox li', '#currentLessonCard h3', '#currentLessonCard > p',
     '#lesoni .questions li', '#lesoni .prayer-text'].forEach(function(sel){
      [].forEach.call(document.querySelectorAll(sel), function(e){ out.push(e); });
    });
    return out;
  }
  function cleanHtml(html){
    var d = document.createElement('div'); d.innerHTML = html;
    [].forEach.call(d.querySelectorAll('script,style,iframe,object,embed'), function(n){ n.remove(); });
    [].forEach.call(d.querySelectorAll('a.ref-link'), function(a){ a.replaceWith(document.createTextNode(a.textContent)); });
    [].forEach.call(d.querySelectorAll('*'), function(n){
      [].slice.call(n.attributes).forEach(function(a){ if(/^on/i.test(a.name) || a.name === 'contenteditable' || a.name === 'spellcheck') n.removeAttribute(a.name); });
    });
    return d.innerHTML;
  }
  function skey(n){ return 'mjue_edit_home-q4-' + n; }
  function loadSaved(n){ try{ return JSON.parse(localStorage.getItem(skey(n)) || '{}') || {}; }catch(e){ return {}; } }
  function applyEdits(n){
    var saved = loadSaved(n), list = eds();
    Object.keys(saved).forEach(function(k){ var e = list[+k]; if(e && typeof saved[k] === 'string') e.innerHTML = saved[k]; });
  }
  var editBtn = document.createElement('button');
  editBtn.type = 'button'; editBtn.id = 'homeEditBtn'; editBtn.textContent = '\u270F\uFE0F Hariri'; editBtn.hidden = true;
  var bar = document.createElement('div');
  bar.id = 'homeEditBar'; bar.hidden = true;
  bar.innerHTML = '<span>\u270F\uFE0F Unahariri kadi za juma hili</span><button type="button" data-a="reset">Rudisha</button><button type="button" data-a="cancel">Ghairi</button><button type="button" class="pri" data-a="save">Hifadhi</button>';
  function setEditing(on){
    editing = on;
    eds().forEach(function(e){ if(on){ e.setAttribute('contenteditable', 'true'); e.setAttribute('spellcheck', 'false'); } else e.removeAttribute('contenteditable'); });
    var l = $('lesoni'); if(l) l.classList.toggle('home-editing', on);
    bar.hidden = !on; editBtn.hidden = on || !isAdmin();
    if(on) snap = eds().map(function(e){ return cleanHtml(e.innerHTML); });
  }
  editBtn.addEventListener('click', function(){ setEditing(true); });
  bar.addEventListener('click', function(e){
    var b = e.target.closest('button[data-a]'); if(!b) return;
    var a = b.getAttribute('data-a'), n = state().n;
    if(a === 'save'){
      var list = eds(), saved = loadSaved(n), changed = 0;
      list.forEach(function(el, i){ var h = cleanHtml(el.innerHTML); if(h !== snap[i]){ saved[i] = h; changed++; } });
      try{ if(Object.keys(saved).length) localStorage.setItem(skey(n), JSON.stringify(saved)); else localStorage.removeItem(skey(n)); }catch(x){}
      if(window.mjueCloudLessonEdit) window.mjueCloudLessonEdit('home-q4-' + n, Object.keys(saved).length ? saved : null);
      setEditing(false); refreshWeek(); toast(changed ? 'Imehifadhiwa' : 'Hakuna mabadiliko');
    } else if(a === 'cancel'){
      setEditing(false); refreshWeek();
    } else if(a === 'reset'){
      if(!confirm('Rudisha maandishi ya asili ya kadi hizi?')) return;
      try{ localStorage.removeItem(skey(n)); }catch(x){}
      if(window.mjueCloudLessonEdit) window.mjueCloudLessonEdit('home-q4-' + n, null);
      setEditing(false); refreshWeek(); toast('Yamerudishwa');
    }
  });
  var hero = $('lesoniQuarterHero');
  if(hero){ hero.style.position = 'relative'; hero.appendChild(editBtn); }
  document.body.appendChild(bar);
  function showEditBtn(){ editBtn.hidden = editing || !isAdmin(); }

  /* ---------- Kusasisha kila sehemu kulingana na tarehe ya leo ---------- */
  function findCard(re){
    var cards = document.querySelectorAll('#lesoni .card');
    for(var i = 0; i < cards.length; i++){ var h = cards[i].querySelector('h3'); if(h && re.test(h.textContent)) return cards[i]; }
    return null;
  }
  function refreshWeek(){
    if(editing) return;
    var st = state(), n = st.n, wk = parseWeek(n);
    var titles = window.__q4Titles || {}, dates = window.__q4Dates || {}, mem = (window.__q4Memory || {})[n];
    var td = today();
    var Q = (window.MJUE_EXTRAS && window.MJUE_EXTRAS.questions) || {};
    try{ if(window.MJUE_TODAY && window.MJUE_TODAY.refresh) window.MJUE_TODAY.refresh(); }catch(e){}

    // Tarehe ya leo kichwani
    var hb = document.querySelector('.hero-badge'); if(hb) hb.textContent = longDate(new Date());

    // Kitufe kikubwa cha "Fungua somo la leo"
    var tb = $('todayLessonBtn');
    if(tb){
      tb.setAttribute('data-open-lesson', 'q4-' + n);
      var tsm = tb.querySelector('small');
      if(tsm) tsm.textContent = 'Lesoni ' + n + ' \u00B7 ' + (st.st === 'during' ? (st.i === 0 ? 'Sabato' : DN[st.i]) + ', ' + shortDate(td) : (titles[n] || ''));
    }

    // Neno la Leo = fungu la kukariri la juma hili
    var dt = document.querySelector('.daily-text'), dr = document.querySelector('.daily-ref'), dl = document.querySelector('.daily-label');
    if(mem && dt && dr){
      var text = '\u201C' + mem.text + '\u201D';
      if(window.MJUE_CLOUD && window.MJUE_CLOUD.setDailyDefault) window.MJUE_CLOUD.setDailyDefault(text, mem.ref);
      else { dt.textContent = text; dr.textContent = mem.ref; }
      if(dl) dl.textContent = 'NENO LA LEO \u00B7 FUNGU LA KUKARIRI (JUMA ' + n + ')';
    }
    // Usomaji wa Biblia wa siku
    var reads = readsFor(st, wk);
    var card = document.querySelector('.daily-card');
    if(card){
      var rd = $('dailyRead');
      if(!rd){ rd = document.createElement('div'); rd.id = 'dailyRead'; rd.className = 'daily-read'; card.insertBefore(rd, card.querySelector('.soft-action')); }
      rd.textContent = '';
      if(reads.length){
        var bb = document.createElement('b'); bb.textContent = '\uD83D\uDCD6 Usomaji wa leo: '; rd.appendChild(bb); appendRefs(rd, reads); rd.style.display = '';
      } else rd.style.display = 'none';
    }
    var tsp = document.querySelector('#cloudTiles button[data-act="daily"] span');
    if(tsp){
      var sm = tsp.querySelector('small'); if(!sm){ sm = document.createElement('small'); tsp.appendChild(sm); }
      sm.textContent = reads.length ? reads[0].label : (mem ? mem.ref : '');
    }

    // Ratiba ya Kujifunza (tabu ya Lesoni)
    var sc = findCard(/Ratiba ya Kujifunza/);
    if(sc && wk){
      var h3 = sc.querySelector('h3'); if(h3) h3.textContent = 'Ratiba ya Kujifunza \u00B7 Lesoni ' + n + ' (' + (dates[n] || '') + ')';
      var ul = sc.querySelector('.schedule'); ul.innerHTML = '';
      for(var i = 0; i < 7; i++){
        var dd = wk.days[i], isT = (st.st === 'during' && st.i === i);
        var li = document.createElement('li'); if(isT) li.className = 'is-today'; li.setAttribute('data-day-open', i);
        var sp = document.createElement('span'); sp.className = 'day'; sp.textContent = DN[i]; li.appendChild(sp);
        var dv = document.createElement('div');
        dv.appendChild(document.createTextNode(((dd && dd.title) || (i === 6 ? 'Rudia somo \u00B7 Tafakari' : '')) + ' '));
        var ds = document.createElement('span'); ds.style.cssText = 'color:var(--olive);font-weight:700';
        ds.textContent = '(' + (isT ? 'Leo \u00B7 ' : '') + shortDate(ddate(n, i)) + ')'; dv.appendChild(ds);
        var all = dd ? dd.banner.concat(dd.reads) : [];
        if(all.length){
          var rl = document.createElement('div'); rl.className = 'gc-refline';
          var rb = document.createElement('b'); rb.textContent = 'Soma: '; rl.appendChild(rb); appendRefs(rl, all); dv.appendChild(rl);
        }
        li.appendChild(dv); ul.appendChild(li);
      }
      var wr = $('weekRefsLine'); if(wr) wr.remove();
      var wl = document.createElement('div'); wl.id = 'weekRefsLine'; wl.className = 'gc-refline week-refs';
      var wb = document.createElement('b'); wb.textContent = 'Mafungu ya juma hili: '; wl.appendChild(wb);
      if(wk.weekReads && wk.weekReads.length) appendRefs(wl, wk.weekReads); else wl.appendChild(document.createTextNode(wk.weekText || ''));
      if(wl.childNodes.length > 1) sc.insertBefore(wl, ul);
    }

    // Maswali ya Kujadili
    var qc = findCard(/Maswali ya Kujadili/);
    if(qc){
      var ol = qc.querySelector('ol');
      if(Q[n] && ol){ ol.innerHTML = ''; Q[n].forEach(function(t){ var li2 = document.createElement('li'); li2.textContent = t; ol.appendChild(li2); }); qc.style.display = ''; }
      else qc.style.display = 'none';
    }
    // Sala ya Somo
    var pc = findCard(/Sala ya Somo/);
    if(pc){
      var pp = pc.querySelector('p'); if(pp){ pp.classList.add('prayer-text');         if(n !== 1) pp.textContent = '\u201CBwana wangu, asante kwa Neno lako. Nisaidie nijifunze \u201C' + (titles[n] || ('Lesoni ' + n)) + '\u201D wiki hii, nisikie sauti yako, na nitende kulingana na uliyosema. Katika jina la Yesu, Amina.\u201D';
      }
    }
    // Kidokezo cha leo
    var tip = document.querySelector('#lesoni .tip');
    if(tip){
      tip.textContent = '';
      var tb2 = document.createElement('b'); tb2.textContent = 'Kidokezo \u00B7 ' + shortDate(td) + ': '; tip.appendChild(tb2);
      if(reads.length){ tip.appendChild(document.createTextNode('Soma ')); appendRefs(tip, reads); tip.appendChild(document.createTextNode('.')); }
      else tip.appendChild(document.createTextNode('Soma mada ya juma' + (mem ? ' na fungu la kukariri ' : '')));
      if(!reads.length && mem) appendRefs(tip, [{ label: mem.ref, pass: mem.pass, end: '' }]);
    }

    // Robo nzima: alama ya "Wiki hii" inafuata tarehe
    var rc = findCard(/Robo nzima/);
    if(rc){
      var rh = rc.querySelector('h3'); if(rh) rh.textContent = 'Robo nzima \u00B7 Q4 2026';
      var pl = rc.querySelectorAll('p')[0];
      if(pl){
        pl.innerHTML = '';
        for(var k = 1; k <= 13; k++){
          var row = document.createElement('div');
          var isCur = (st.st === 'during' && k === n);
          var past = (st.st === 'after') || (st.st === 'during' && k < n);
          row.className = 'robo-row' + (isCur ? ' cur' : '') + (past ? ' past' : '');
          row.setAttribute('data-robo', k);
          row.textContent = k + '. ' + (titles[k] || '') + ' \u2014 ' + (dates[k] || '') + (isCur ? '   \u2190 Wiki hii' : '');
          pl.appendChild(row);
        }
      }
    }

    // Robo mpya / kabla ya kuanza (otomatiki kwa tarehe)
    var qr = $('quarterRoll');
    if(hero){
      if(!qr){ qr = document.createElement('div'); qr.id = 'quarterRoll'; hero.appendChild(qr); }
      qr.textContent = '';
      if(st.st === 'after'){
        var nx = ddate(14, 0), nq = qLabel(new Date(nx.getFullYear(), nx.getMonth(), nx.getDate() + 6));
        qr.appendChild(document.createTextNode('\u2705 Robo ya Q4 2026 imekamilika. Robo mpya (' + nq + ') inaanza ' + longDate(nx) + '. Masomo ya robo hiyo yakipatikana yatawekwa hapa. Kwa sasa masomo ya GC: '));
        var gl = document.createElement('a'); gl.className = 'rq-link'; gl.href = '#'; gl.textContent = 'ssnet.org';
        gl.addEventListener('click', function(ev){ ev.preventDefault(); window.open('https://ssnet.org/study-guides/'); });
        qr.appendChild(gl);
        qr.style.display = '';
      } else if(st.st === 'before'){
        qr.textContent = '\u23F3 Robo hii inaanza ' + longDate(dstart(1)) + '.'; qr.style.display = '';
      } else qr.style.display = 'none';
    }

    applyEdits(n);
    showEditBtn();
  }
  document.addEventListener('click', function(e){
    var r = e.target.closest && e.target.closest('[data-robo]');
    if(!r || editing) return;
    var f = window.mjueOpenLesson || window.openLesson;
    if(typeof f === 'function') f('q4-' + r.getAttribute('data-robo'));
  });

  var lastDay = '';
  function tick(){
    var k = today().toDateString();
    if(k !== lastDay){ lastDay = k; refreshWeek(); } else showEditBtn();
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tick(); });
  document.addEventListener('mjue-synced', function(){ if(!editing) refreshWeek(); });
  document.addEventListener('mjue-auth', showEditBtn);
  setInterval(tick, 60000);
  setTimeout(function(){ lastDay = today().toDateString(); refreshWeek(); }, 500);
  window.MJUE_WEEK = { refresh: refreshWeek, state: state };
})();

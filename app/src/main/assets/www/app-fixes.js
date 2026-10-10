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
})();

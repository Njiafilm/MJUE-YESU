/* MJUE YESU — Cloud Sync (injini)
 * Hupakua maudhui yaliyowekwa na admin (Firestore) na kuyaweka kwenye app kwa watumiaji wote.
 * Maudhui huhifadhiwa kwenye kifaa (IndexedDB) ili app ifanye kazi offline.
 */
(function(){
'use strict';
var C = window.MJUE_CLOUD_CONFIG || {};
var ON = !!(C.apiKey && C.projectId);
var DOC = 'projects/' + C.projectId + '/databases/(default)/documents';
var BASE = 'https://firestore.googleapis.com/v1/' + DOC;
var CHUNK = 300000; // herufi kwa kila kipande (Firestore: kikomo 1MB kwa hati)
var API = window.MJUE_CLOUD = { on: ON, state: { lastSync: 0, lastErr: '', items: 0 } };

var $ = function(id){ return document.getElementById(id); };
function toast(t){
  var el = $('cloudToast');
  if(!el){ el = document.createElement('div'); el.id = 'cloudToast'; el.className = 'cloud-toast'; document.body.appendChild(el); }
  el.textContent = t; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(function(){ el.classList.remove('show'); }, 2600);
}
API.toast = toast;

/* ---------------- Mtandao (native bridge au fetch) ---------------- */
var pend = {}, nid = 1;
window.__mjueNetCb = function(id, st, txt){ var f = pend[id]; if(f){ delete pend[id]; f({ status: st, text: txt }); } };
function net(method, url, headers, body){
  return new Promise(function(res, rej){
    if(window.MJUE_NATIVE && window.MJUE_NATIVE.request){
      var id = nid++; pend[id] = res;
      setTimeout(function(){ if(pend[id]){ delete pend[id]; rej(new Error('Mtandao umechelewa')); } }, 90000);
      try{ window.MJUE_NATIVE.request(id, method, url, JSON.stringify(headers || {}), body == null ? '' : String(body)); }
      catch(e){ delete pend[id]; rej(e); }
    } else {
      fetch(url, { method: method, headers: headers || {}, body: body == null ? undefined : body })
        .then(function(r){ return r.text().then(function(t){ res({ status: r.status, text: t }); }); })
        .catch(rej);
    }
  });
}
async function api(method, url, body, tokFn){
  var h = { 'Content-Type': 'application/json' };
  if(tokFn){ var t = await tokFn(); if(!t) throw new Error('Hujaingia'); h.Authorization = 'Bearer ' + t; }
  var r = await net(method, url, h, body == null ? null : JSON.stringify(body));
  if(r.status === 0) throw new Error('Hakuna mtandao');
  var j = null; try{ j = r.text ? JSON.parse(r.text) : null; }catch(e){}
  if(r.status >= 400){
    var m = (j && j.error && j.error.message) || ('HTTP ' + r.status);
    var e2 = new Error(m); e2.status = r.status; throw e2;
  }
  return j;
}
API.net = net; API.api = api;

/* ---------------- Admin auth (Firebase Auth REST) ---------------- */
var AK = 'mjue_cloud_auth';
var auth = null; try{ auth = JSON.parse(localStorage.getItem(AK) || 'null'); }catch(e){}
function setSession(on){
  try{ if(on) sessionStorage.setItem('mjue_yesu_admin_session', '1'); else sessionStorage.removeItem('mjue_yesu_admin_session'); }catch(e){}
}
function saveAuth(a){
  auth = a;
  try{ if(a) localStorage.setItem(AK, JSON.stringify(a)); else localStorage.removeItem(AK); }catch(e){}
  setSession(!!a);
  try{ document.dispatchEvent(new CustomEvent('mjue-auth')); }catch(e){}
}
if(ON && auth) setSession(true); else if(!auth) setSession(false);

API.isAdmin = function(){ return !!auth; };
API.adminEmail = function(){ return auth ? auth.email : ''; };
API.login = async function(email, pw){
  var j;
  try{
    j = await api('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + C.apiKey,
      { email: email, password: pw, returnSecureToken: true });
  }catch(e){
    var m = String(e.message || '');
    if(/INVALID_LOGIN|INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_EMAIL|MISSING/.test(m)) throw new Error('Barua pepe au nenosiri si sahihi.');
    if(/TOO_MANY/.test(m)) throw new Error('Majaribio mengi mno. Subiri kidogo.');
    throw e;
  }
  saveAuth({ email: j.email, idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn) * 1000 });
};
API.logout = function(){ saveAuth(null); };
async function adminToken(){
  if(!auth) return null;
  if(auth.exp - 60000 > Date.now()) return auth.idToken;
  var r = await net('POST', 'https://securetoken.googleapis.com/v1/token?key=' + C.apiKey,
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    'grant_type=refresh_token&refresh_token=' + encodeURIComponent(auth.refreshToken));
  if(r.status === 0) throw new Error('Hakuna mtandao');
  var j = null; try{ j = JSON.parse(r.text); }catch(e){}
  if(r.status >= 400 || !j || !j.id_token){ saveAuth(null); throw new Error('Kipindi cha admin kimeisha. Ingia tena.'); }
  auth.idToken = j.id_token; auth.refreshToken = j.refresh_token || auth.refreshToken; auth.exp = Date.now() + (+j.expires_in) * 1000;
  saveAuth(auth); return auth.idToken;
}
API.adminToken = adminToken;

/* ---------------- Cache (IndexedDB) ---------------- */
var dbp = null;
function kdb(){
  return dbp || (dbp = new Promise(function(res, rej){
    var q = indexedDB.open('mjue_cloud', 1);
    q.onupgradeneeded = function(){ q.result.createObjectStore('kv'); };
    q.onsuccess = function(){ res(q.result); };
    q.onerror = function(){ rej(q.error); };
  }));
}
async function kvGet(k){ var db = await kdb(); return new Promise(function(res, rej){ var g = db.transaction('kv').objectStore('kv').get(k); g.onsuccess = function(){ res(g.result); }; g.onerror = function(){ rej(g.error); }; }); }
async function kvSet(k, v){ var db = await kdb(); return new Promise(function(res, rej){ var t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
async function kvDel(k){ var db = await kdb(); return new Promise(function(res, rej){ var t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
async function kvAll(prefix){
  var db = await kdb();
  return new Promise(function(res, rej){
    var out = {}, q = db.transaction('kv').objectStore('kv').openCursor();
    q.onsuccess = function(){ var c = q.result; if(!c){ res(out); return; } if(String(c.key).indexOf(prefix) === 0) out[c.key.slice(prefix.length)] = c.value; c.continue(); };
    q.onerror = function(){ rej(q.error); };
  });
}

/* ---------------- Hifadhi ya vipande (blobs) ---------------- */
function split(s){ var a = []; for(var i = 0; i < s.length; i += CHUNK) a.push(s.slice(i, i + CHUNK)); if(!a.length) a.push(''); return a; }
function cid(name, i){ return name + '--' + i; }
function wname(id){ return DOC + '/blobs/' + id; }
async function getManifest(){
  try{
    var d = await api('GET', BASE + '/meta/manifest?key=' + C.apiKey);
    var s = d && d.fields && d.fields.m && d.fields.m.stringValue;
    return s ? JSON.parse(s) : {};
  }catch(e){ if(e.status === 404) return {}; throw e; }
}
function commit(writes){ return api('POST', BASE + ':commit', { writes: writes }, adminToken); }
async function getBlob(name, n){
  var idx = []; for(var i = 0; i < n; i++) idx.push(i);
  var parts = new Array(n), k = 0;
  async function worker(){
    while(k < n){
      var i2 = idx[k++];
      var d = await api('GET', BASE + '/blobs/' + cid(name, i2) + '?key=' + C.apiKey);
      parts[i2] = (d && d.fields && d.fields.d && d.fields.d.stringValue) || '';
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  return parts.join('');
}
async function pool(list, n, fn){
  var k = 0;
  async function w(){ while(k < list.length){ var it = list[k++]; await fn(it); } }
  var ws = []; for(var i = 0; i < Math.min(n, list.length); i++) ws.push(w());
  await Promise.all(ws);
}

var STATE = {};     // name -> {v, s}  (maudhui yaliyopakuliwa)
var AUDIOMAN = {};  // 'audio_N' -> {v, n}
API.getBlobText = function(name){ return STATE[name] ? STATE[name].s : null; };
API.hasBlob = function(name){ return !!STATE[name]; };
API.names = function(){ return Object.keys(STATE).concat(Object.keys(AUDIOMAN)); };

API.putBlob = async function(name, s, onProgress){
  if(!ON) throw new Error('Cloud haijawekwa');
  var parts = split(s), group = [], size = 0;
  for(var i = 0; i < parts.length; i++){
    group.push({ update: { name: wname(cid(name, i)), fields: { d: { stringValue: parts[i] } } } });
    size += parts[i].length;
    if(size >= 1500000){ await commit(group); group = []; size = 0; }
    if(onProgress) onProgress(Math.round((i + 1) / parts.length * 90));
  }
  if(group.length) await commit(group);
  var m = await getManifest(), old = m[name];
  m[name] = { v: Date.now(), n: parts.length };
  await commit([{ update: { name: DOC + '/meta/manifest', fields: { m: { stringValue: JSON.stringify(m) } } } }]);
  if(old && old.n > parts.length){
    var del = []; for(var j = parts.length; j < old.n; j++) del.push({ delete: wname(cid(name, j)) });
    try{ await commit(del); }catch(e){}
  }
  if(onProgress) onProgress(100);
  if(/^audio_/.test(name)){ AUDIOMAN[name] = m[name]; await kvSet('audio:' + name, { v: m[name].v, s: s }); delete AUDIO_URL[name.slice(6)]; }
  else { STATE[name] = { v: m[name].v, s: s }; await kvSet('blob:' + name, STATE[name]); applyOne(name, s, false); }
  await kvSet('manifest', m);
  API.state.items = Object.keys(m).length;
};
API.delBlob = async function(name){
  if(!ON) throw new Error('Cloud haijawekwa');
  var m = await getManifest(), e = m[name];
  if(e){
    var del = []; for(var j = 0; j < e.n; j++) del.push({ delete: wname(cid(name, j)) });
    await commit(del);
    delete m[name];
    await commit([{ update: { name: DOC + '/meta/manifest', fields: { m: { stringValue: JSON.stringify(m) } } } }]);
  }
  if(/^audio_/.test(name)){ delete AUDIOMAN[name]; await kvDel('audio:' + name); delete AUDIO_URL[name.slice(6)]; }
  else { delete STATE[name]; await kvDel('blob:' + name); applyOne(name, null, true); }
  await kvSet('manifest', m);
  API.state.items = Object.keys(m).length;
};
API.readLatest = async function(name){
  var m = await getManifest(), e = m[name];
  if(!e) return null;
  return await getBlob(name, e.n);
};

/* ---------------- Usawazishaji ---------------- */
var syncing = null, firstRun = true;
function order(a, b){ var pa = /^bible_/.test(a) ? 0 : 1, pb = /^bible_/.test(b) ? 0 : 1; return pa - pb; }
API.sync = function(force){
  if(!ON) return Promise.resolve(false);
  if(syncing) return syncing;
  syncing = (async function(){
    try{
      var m = await getManifest();
      var names = Object.keys(m), changed = [];
      var todo = names.filter(function(n){ return !/^audio_/.test(n) && (force || !STATE[n] || STATE[n].v !== m[n].v); });
      await pool(todo, 2, async function(n){
        var s = await getBlob(n, m[n].n);
        STATE[n] = { v: m[n].v, s: s }; await kvSet('blob:' + n, STATE[n]); changed.push(n);
      });
      AUDIOMAN = {};
      names.forEach(function(n){ if(/^audio_/.test(n)) AUDIOMAN[n] = m[n]; });
      var removed = Object.keys(STATE).filter(function(n){ return !m[n]; });
      changed.sort(order).forEach(function(n){ applyOne(n, STATE[n].s, false); });
      for(var i = 0; i < removed.length; i++){ var n2 = removed[i]; delete STATE[n2]; await kvDel('blob:' + n2); applyOne(n2, null, true); }
      await kvSet('manifest', m);
      API.state.lastSync = Date.now(); API.state.lastErr = ''; API.state.items = names.length;
      try{ localStorage.setItem('mjue_cloud_last', String(API.state.lastSync)); }catch(e){}
      if((changed.length || removed.length) && !firstRun) toast('✅ Maudhui mapya yamepakuliwa');
      firstRun = false;
      try{ document.dispatchEvent(new CustomEvent('mjue-synced', { detail: { changed: changed, removed: removed } })); }catch(e){}
      return true;
    }catch(e){
      API.state.lastErr = e.message || String(e);
      return false;
    }finally{ syncing = null; }
  })();
  return syncing;
};

/* ---------------- Kutumia maudhui ---------------- */
function applyOne(name, s, removed){
  try{
    if(name === 'logo') applyLogo(removed ? null : s);
    else if(name === 'texts') applyTexts(removed ? {} : JSON.parse(s));
    else if(name === 'daily') applyDaily(removed ? null : JSON.parse(s));
    else if(name === 'hymns') applyHymns(removed ? {} : JSON.parse(s));
    else if(name.indexOf('bible_') === 0) applyBible(name.slice(6), removed ? null : JSON.parse(s));
    else if(name.indexOf('biblepatch_') === 0) applyPatch(name.slice(11), removed ? null : JSON.parse(s));
    else if(name.indexOf('lessonedit_') === 0) applyLessonEdit(name.slice(11), removed ? null : JSON.parse(s));
    else if(name.indexOf('lessonblock_') === 0) applyLessonBlock(name.slice(12), removed ? null : JSON.parse(s));
  }catch(e){ console.warn('apply', name, e); }
}

/* --- Nembo --- */
function applyLogo(u){
  document.querySelectorAll('img.app-logo, img.hero-logo').forEach(function(i){ i.src = u || i.getAttribute('data-default') || 'logo.png'; });
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function(l){ if(u) l.href = u; });
}
API.currentLogo = function(){ var i = document.querySelector('img.hero-logo'); return i ? i.src : 'logo.png'; };

/* --- Maandishi ya app (CMS) --- */
var CMS_SEL = '.top-title,.hero h1,.hero p,.hero-badge,.footer-note,#home .welcome-kicker,#home h2,#home h3,#home p,#home .daily-label,#home .hero-action,#home .soft-action,#home .sub,#biblia h2,#biblia .sub,#lesoni h2,#lesoni .sub,#nyimbo h2,#nyimbo .sub,#historia h2,#historia .sub';
var cmsReady = false, TEXTS = {};
function indexCms(){
  if(cmsReady) return; cmsReady = true;
  var counters = {};
  [].forEach.call(document.querySelectorAll(CMS_SEL), function(el){
    if(el.children.length || el.id || el.closest('#cloudTiles,#cmsOverlay,#chatOverlay,#lessonReader,.song-list') || el.classList.contains('daily-text')) return;
    if(!el.textContent.trim()) return;
    var sc = (el.closest('.panel') || {}).id || (el.closest('.hero') ? 'hero' : (el.closest('.topbar') ? 'top' : 'misc'));
    counters[sc] = (counters[sc] || 0) + 1;
    el.setAttribute('data-cms', sc + '.' + counters[sc]);
    el.setAttribute('data-orig', el.textContent);
  });
}
function applyTexts(map){
  indexCms(); TEXTS = map || {};
  document.querySelectorAll('[data-cms]').forEach(function(el){
    var k = el.getAttribute('data-cms');
    var t = TEXTS[k] != null ? TEXTS[k] : el.getAttribute('data-orig');
    if(el.textContent !== t) el.textContent = t;
  });
}
API.indexCms = indexCms;
API.getTexts = function(){ return TEXTS; };

/* --- Neno la Leo --- */
var DAILY = null, DAILY_ORIG = null;
function todayKey(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function renderDaily(){
  var t = document.querySelector('.daily-text'), r = document.querySelector('.daily-ref');
  if(!t || !r) return;
  if(!DAILY_ORIG) DAILY_ORIG = { t: t.textContent, r: r.textContent };
  var pick = null;
  if(DAILY) pick = (DAILY.byDate && DAILY.byDate[todayKey()]) || DAILY.def || null;
  if(pick && pick.text){
    t.textContent = '\u201C' + String(pick.text).replace(/^[\u201C"]+|[\u201D"]+$/g, '') + '\u201D';
    r.textContent = pick.ref || '';
  } else { t.textContent = DAILY_ORIG.t; r.textContent = DAILY_ORIG.r; }
}
function applyDaily(d){ DAILY = d; renderDaily(); }
API.getDaily = function(){ return DAILY; };
document.addEventListener('visibilitychange', function(){ if(!document.hidden) renderDaily(); });

/* --- Nyimbo --- */
var HY_ORIG = null;
function applyHymns(d){
  var H = window.__MJUE_HYMNS; if(!H) return;
  if(!HY_ORIG) HY_ORIG = JSON.parse(JSON.stringify(H));
  Object.keys(H).forEach(function(k){ delete H[k]; });
  Object.keys(HY_ORIG).forEach(function(k){ H[k] = HY_ORIG[k]; });
  var set = d.set || {}, del = d.del || [];
  Object.keys(set).forEach(function(k){ H[k] = { t: set[k].t, v: set[k].v }; });
  del.forEach(function(k){ delete H[k]; });
  syncSongList(set, del);
}
function syncSongList(set, del){
  var list = $('songList'); if(!list) return;
  var items = {};
  [].forEach.call(list.querySelectorAll('.song-item'), function(it){
    var n = it.getAttribute('data-song'); items[n] = it;
    var tt = it.querySelector('.title');
    if(tt && tt.getAttribute('data-otitle') == null) tt.setAttribute('data-otitle', tt.textContent);
    if(it.getAttribute('data-cloud') && !set[n]){ it.remove(); delete items[n]; return; }
    it.hidden = false;
    if(tt) tt.textContent = tt.getAttribute('data-otitle');
  });
  Object.keys(set).forEach(function(n){
    var it = items[n];
    if(!it){
      it = document.createElement('div'); it.className = 'song-item'; it.setAttribute('data-num', n); it.setAttribute('data-song', n); it.setAttribute('data-cloud', '1');
      it.innerHTML = '<div class="icon"></div><div class="title"></div>';
      it.querySelector('.icon').textContent = n;
      var ref = null, nn = +n;
      [].some.call(list.querySelectorAll('.song-item'), function(x){ if(+x.getAttribute('data-song') > nn){ ref = x; return true; } return false; });
      list.insertBefore(it, ref);
      items[n] = it;
    }
    var t2 = it.querySelector('.title'); if(t2) t2.textContent = set[n].t;
  });
  del.forEach(function(n){ var it = items[n]; if(it){ if(it.getAttribute('data-cloud')) it.remove(); else it.hidden = true; } });
}
API.hymnEntry = function(n){ var H = window.__MJUE_HYMNS || {}; return H[String(n)] || null; };
var AUDIO_URL = {};
function d2b(u){
  var p = u.split(','), mime = (p[0].match(/:(.*?);/) || [])[1] || 'application/octet-stream';
  var bin = atob(p[1]), a = new Uint8Array(bin.length);
  for(var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type: mime });
}
API.d2b = d2b;
async function prefetchAudio(num){
  var name = 'audio_' + num, e = AUDIOMAN[name];
  if(!e || AUDIO_URL[num]) return;
  var c = await kvGet('audio:' + name), s;
  if(c && c.v === e.v) s = c.s; else { s = await getBlob(name, e.n); await kvSet('audio:' + name, { v: e.v, s: s }); }
  AUDIO_URL[num] = URL.createObjectURL(d2b(s));
}
window.mjueCloudAudioCands = function(num){ return AUDIO_URL[num] ? [AUDIO_URL[num]] : []; };
API.hasAudio = function(n){ return !!AUDIOMAN['audio_' + n]; };

/* --- Biblia (matoleo mapya + marekebisho ya aya) --- */
var CLOUD_TRANS = {}, BACKUP = {}, PATCHES = {}, ORIGV = {};
var BUILTIN = { NENO: 1, ULB: 1, KJVSW: 1 };
function T(){ return window.MJUE_YESU_TRANSLATIONS; }
function switchBox(){ var u = $('transUlb'); return u ? u.parentNode : document.querySelector('.bible-trans-switch'); }
window.mjueCloudTransList = function(){ return Object.keys(CLOUD_TRANS).filter(function(id){ return !BUILTIN[id]; }).map(function(id){ return [id, CLOUD_TRANS[id].label]; }); };
API.versions = function(){
  var t = T() || {}, out = [];
  var names = { NENO: 'Neno (Toleo Wazi)', ULB: 'ULB (Literal)', KJVSW: 'KJV Kiswahili' };
  Object.keys(t).forEach(function(id){ out.push({ id: id, label: (CLOUD_TRANS[id] && CLOUD_TRANS[id].label) || names[id] || id, cloud: !!CLOUD_TRANS[id], builtin: !!BUILTIN[id] }); });
  return out;
};
function setCloudTrans(id){
  if(typeof window.mjueYesuSetTrans === 'function') window.mjueYesuSetTrans(id);
  var c = CLOUD_TRANS[id];
  if(c) window.MJUE_YESU_BIBLE_SOURCE = c.source;
  var box = switchBox();
  if(box) [].forEach.call(box.querySelectorAll('button'), function(b){ b.classList.toggle('active', b.id === 'transCloud_' + id); });
  var rd = $('offlineBibleReady'); if(rd && c) rd.textContent = '\uD83D\uDCE5 ' + c.label + ' \u00B7 Imepakuliwa \u00B7 Bila intaneti';
}
function ensureBtn(id){
  if(BUILTIN[id]) return;
  var box = switchBox(); if(!box) return;
  var b = $('transCloud_' + id), c = CLOUD_TRANS[id];
  if(!b){
    b = document.createElement('button'); b.type = 'button'; b.id = 'transCloud_' + id; b.setAttribute('data-trans', id);
    b.addEventListener('click', function(){ setCloudTrans(id); });
    box.appendChild(b);
    if(!box.getAttribute('data-cloud-bound')){
      box.setAttribute('data-cloud-bound', '1');
      box.addEventListener('click', function(e){
        var bb = e.target.closest('button'); if(bb && !/^transCloud_/.test(bb.id)) [].forEach.call(box.querySelectorAll('[id^="transCloud_"]'), function(x){ x.classList.remove('active'); });
      });
    }
  }
  b.innerHTML = '';
  b.appendChild(document.createTextNode(c.label));
  var sp = document.createElement('span'); sp.className = 'bible-trans-label'; sp.textContent = c.sub || 'Cloud \u00B7 Offline'; b.appendChild(sp);
}
function purgeOrig(id){ Object.keys(ORIGV).forEach(function(k){ if(k.indexOf(id + '|') === 0) delete ORIGV[k]; }); }
function paint(id){
  var t = T(), p = PATCHES[id]; if(!t || !t[id] || !p) return;
  Object.keys(p).forEach(function(code){ Object.keys(p[code]).forEach(function(ch){ Object.keys(p[code][ch]).forEach(function(v){
    var key = [id, code, ch, v].join('|'), d = t[id];
    d[code] = d[code] || {}; d[code][ch] = d[code][ch] || {};
    if(!(key in ORIGV)) ORIGV[key] = d[code][ch][v] === undefined ? null : d[code][ch][v];
    d[code][ch][v] = p[code][ch][v];
  }); }); });
}
function unpaint(id){
  var t = T(); if(!t || !t[id]) return;
  Object.keys(ORIGV).forEach(function(key){
    var a = key.split('|'); if(a[0] !== id) return;
    var d = t[id]; if(d[a[1]] && d[a[1]][a[2]]){ if(ORIGV[key] === null) delete d[a[1]][a[2]][a[3]]; else d[a[1]][a[2]][a[3]] = ORIGV[key]; }
    delete ORIGV[key];
  });
}
function rebind(id){ if(window.MJUE_YESU_ACTIVE_TRANS === id && typeof window.mjueYesuSetTrans === 'function'){ if(CLOUD_TRANS[id]) setCloudTrans(id); else window.mjueYesuSetTrans(id); } }
function applyPatch(id, p){ unpaint(id); PATCHES[id] = p || undefined; paint(id); rebind(id); }
function applyBible(id, d){
  var t = T(); if(!t) return;
  if(!d){
    unpaint(id); delete CLOUD_TRANS[id];
    if(BACKUP[id]){ t[id] = BACKUP[id]; delete BACKUP[id]; } else delete t[id];
    var b = $('transCloud_' + id); if(b) b.remove();
    paint(id);
    if(window.MJUE_YESU_ACTIVE_TRANS === id && typeof window.mjueYesuSetTrans === 'function') window.mjueYesuSetTrans('NENO');
    return;
  }
  if(t[id] && !CLOUD_TRANS[id] && !BACKUP[id]) BACKUP[id] = t[id];
  purgeOrig(id);
  t[id] = d.data;
  CLOUD_TRANS[id] = { label: d.label || id, source: d.source || d.label || id, sub: d.sub || 'Cloud \u00B7 Offline' };
  ensureBtn(id); paint(id);
  var pref = null; try{ pref = localStorage.getItem('mjue_bible_trans'); }catch(e){}
  if(window.MJUE_YESU_ACTIVE_TRANS === id || pref === id) setCloudTrans(id);
}
API.getPatch = function(id){ return PATCHES[id] || null; };
API.verse = function(id, code, ch, v){ var t = T(); return t && t[id] && t[id][code] && t[id][code][ch] ? t[id][code][ch][v] : undefined; };

/* --- Lesoni: marekebisho ya maandishi + picha/PDF --- */
function applyLessonEdit(key, obj){
  try{ if(obj) localStorage.setItem('mjue_edit_' + key, JSON.stringify(obj)); else localStorage.removeItem('mjue_edit_' + key); }catch(e){}
}
window.mjueCloudLessonEdit = function(key, obj){
  if(!ON || !API.isAdmin()) return;
  var p = obj ? API.putBlob('lessonedit_' + key, JSON.stringify(obj)) : API.delBlob('lessonedit_' + key);
  p.then(function(){ toast('\u2601 Imetumwa kwa watumiaji wote'); }, function(e){ toast('Imeshindwa kutuma: ' + e.message); });
};
function adb(){
  return new Promise(function(res, rej){
    var q = indexedDB.open('mjue_yesu_admin_db', 1);
    q.onupgradeneeded = function(e){ var db = e.target.result; if(!db.objectStoreNames.contains('files')) db.createObjectStore('files'); if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta'); };
    q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); };
  });
}
async function aGet(k){ var db = await adb(); return new Promise(function(res, rej){ var g = db.transaction('files').objectStore('files').get(k); g.onsuccess = function(){ res(g.result); }; g.onerror = function(){ rej(g.error); }; }); }
async function aPut(k, v){ var db = await adb(); return new Promise(function(res, rej){ var t = db.transaction('files', 'readwrite'); t.objectStore('files').put(v, k); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
async function aDel(k){ var db = await adb(); return new Promise(function(res, rej){ var t = db.transaction('files', 'readwrite'); t.objectStore('files').delete(k); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
var META_KEY = 'mjue_yesu_admin_meta_v1';
function loadMeta(){ try{ return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }catch(e){ return {}; } }
function blobToData(b){ return new Promise(function(res, rej){ var r = new FileReader(); r.onload = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); }; r.readAsDataURL(b); }); }
API.blobToData = blobToData;
function imgToData(file, maxDim, q, type){
  return new Promise(function(res, rej){
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function(){
      var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, maxDim / Math.max(w, h));
      var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      var x = c.getContext('2d'); if(type === 'image/jpeg'){ x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
      x.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL(type, q));
    };
    im.onerror = function(){ URL.revokeObjectURL(url); rej(new Error('Picha haisomeki')); };
    im.src = url;
  });
}
API.imgToData = imgToData;
window.mjueCloudLessonBlock = async function(key, m){
  if(!ON || !API.isAdmin() || !m) return;
  try{
    toast('\u2601 Inapakia maudhui ya somo\u2026');
    async function pack(v){
      var imgs = [];
      for(var i = 0; i < (v.imageKeys || []).length; i++){
        var b = await aGet(v.imageKeys[i]); if(!b) continue;
        imgs.push(b.size > 400000 || /png|webp/.test(b.type) ? await imgToData(b, 1280, 0.78, 'image/jpeg') : await blobToData(b));
      }
      var pdf = null;
      if(v.pdfKey){ var pb = await aGet(v.pdfKey); if(pb){ if(pb.size > 4000000) throw new Error('PDF ni kubwa kuliko 4MB'); pdf = await blobToData(pb); } }
      return { title: v.title || '', desc: v.desc || '', images: imgs, pdf: pdf, pdfName: v.pdfName || '' };
    }
    var sw = await pack(m);
    var en = m.en ? await pack(m.en) : null;
    var payload = JSON.stringify({ title: sw.title, desc: sw.desc, images: sw.images, pdf: sw.pdf, pdfName: sw.pdfName, en: en, public: m.public !== false });
    if(payload.length > 9000000) throw new Error('Maudhui ni makubwa mno (zaidi ya 9MB)');
    await API.putBlob('lessonblock_' + key, payload);
    toast('\u2601 Imetumwa kwa watumiaji wote');
  }catch(e){ alert('Imeshindwa kutuma kwa cloud: ' + e.message); }
};
window.mjueCloudLessonBlockDel = function(key){
  if(!ON || !API.isAdmin()) return;
  API.delBlob('lessonblock_' + key).then(function(){ toast('\u2601 Imefutwa kwa watumiaji wote'); }, function(e){ toast('Imeshindwa: ' + e.message); });
};
async function applyLessonBlock(key, d){
  var meta = loadMeta();
  async function dropOld(o){
    if(!o) return;
    for(var i = 0; i < (o.imageKeys || []).length; i++) await aDel(o.imageKeys[i]);
    if(o.pdfKey) await aDel(o.pdfKey);
  }
  if(!d){
    var old = meta[key];
    if(old && old.cloud){
      await dropOld(old); await dropOld(old.en);
      delete meta[key]; localStorage.setItem(META_KEY, JSON.stringify(meta));
    }
  } else {
    var o = meta[key];
    if(o && o.cloud){ await dropOld(o); await dropOld(o.en); }
    async function store(v, prefix){
      var ik = [], pk = null;
      for(var n = 0; n < (v.images || []).length; n++){ var k = prefix + '_img' + n; await aPut(k, d2b(v.images[n])); ik.push(k); }
      if(v.pdf){ pk = prefix + '_pdf'; await aPut(pk, d2b(v.pdf)); }
      return { title: v.title || '', desc: v.desc || '', imageKeys: ik, pdfKey: pk, pdfName: v.pdfName || '' };
    }
    var sw = await store(d, 'cloud_' + key);
    var entry = { title: sw.title, desc: sw.desc, imageKeys: sw.imageKeys, pdfKey: sw.pdfKey, pdfName: sw.pdfName, public: d.public !== false, updated: new Date().toISOString(), cloud: true };
    if(d.en) entry.en = await store(d.en, 'cloud_' + key + '_en');
    meta[key] = entry;
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }
  try{ if(window.MJUE_ADMIN && window.MJUE_ADMIN.inject) await window.MJUE_ADMIN.inject(); }catch(e){}
}

/* ---------------- Kuanza ---------------- */
function wrapLyrics(){
  var o = window.showLyrics; if(typeof o !== 'function' || o.__cloud) return;
  var w = function(n){ try{ prefetchAudio(n).catch(function(){}); }catch(e){} return o.apply(this, arguments); };
  w.__cloud = true; window.showLyrics = w;
}
async function init(){
  indexCms(); wrapLyrics();
  if(!ON) return;
  try{
    var cached = await kvAll('blob:');
    Object.keys(cached).forEach(function(n){ STATE[n] = cached[n]; });
    Object.keys(STATE).sort(order).forEach(function(n){ applyOne(n, STATE[n].s, false); });
    var man = await kvGet('manifest');
    if(man) Object.keys(man).forEach(function(n){ if(/^audio_/.test(n)) AUDIOMAN[n] = man[n]; });
    API.state.items = man ? Object.keys(man).length : 0;
    API.state.lastSync = +(localStorage.getItem('mjue_cloud_last') || 0);
  }catch(e){ console.warn('cache', e); }
  API.sync();
  setInterval(function(){ if(!document.hidden) API.sync(); }, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) API.sync(); });
  window.addEventListener('online', function(){ API.sync(); });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 0); });
else setTimeout(init, 0);
})();

/* MJUE YESU — Cloud UI: paneli ya admin (Biblia, Nyimbo, Nembo, Maandishi), vigae vya nyumbani, gumzo */
(function(){
'use strict';
var M = window.MJUE_CLOUD; if(!M) return;
var C = window.MJUE_CLOUD_CONFIG || {};
var $ = function(id){ return document.getElementById(id); };
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ago(ts){
  if(!ts) return 'bado';
  var s = Math.round((Date.now() - ts) / 1000);
  if(s < 60) return 'sasa hivi'; if(s < 3600) return 'dakika ' + Math.round(s / 60) + ' zilizopita';
  if(s < 86400) return 'saa ' + Math.round(s / 3600) + ' zilizopita'; return 'siku ' + Math.round(s / 86400) + ' zilizopita';
}

/* ---------------- CSS ---------------- */
var st = document.createElement('style');
st.textContent = [
  '.cloud-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:2600;background:#222;color:#fff;padding:9px 16px;border-radius:999px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .25s;max-width:90%;text-align:center}',
  '.cloud-toast.show{opacity:.96}',
  '.song-item[hidden]{display:none!important}',
  '.cloud-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 18px}',
  '.cloud-tiles button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:128px;padding:12px 8px;border:1px solid var(--line);border-radius:16px;background:var(--paper);color:var(--text);cursor:pointer;font:inherit}',
  '.cloud-tiles button:active{opacity:.8}',
  '.cloud-tiles img{height:66px;max-width:100%;object-fit:contain;border-radius:12px}',
  '.cloud-tiles span{font-size:12.5px;font-weight:800;letter-spacing:.3px;text-align:center}',
  '.cloud-tiles small{display:block;font-weight:600;font-size:10.5px;color:var(--muted);letter-spacing:0}',
  '#cmsOverlay{z-index:300}',
  '.cms-box{max-width:560px!important}',
  '.cms-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}',
  '.cms-head h2{flex:1;margin:0!important}',
  '.cms-x{border:0;background:var(--soft);color:var(--text);width:36px;height:36px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer}',
  '.cms-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px}',
  '.cms-tabs button{border:1.5px solid var(--line);background:var(--paper);color:var(--text);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:700;cursor:pointer}',
  '.cms-tabs button.on{background:#6B2D9B;color:#fff;border-color:#6B2D9B}',
  '.cms-sec{border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px;background:var(--soft)}',
  '.cms-sec h3{margin:0 0 6px;font-size:14px;color:#6B2D9B}',
  '.cms-sec p.hint{font-size:12px;color:var(--muted);margin:4px 0}',
  '.cms-item{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed var(--line);font-size:13.5px}',
  '.cms-item b{flex:1;min-width:0}',
  '.cms-item .btn-a{flex:none!important;padding:6px 10px!important;font-size:12px!important}',
  '.cms-msg{font-size:13px;margin:8px 0;min-height:18px;word-break:break-word}',
  '.cms-msg.err{color:#b00020}.cms-msg.ok{color:#1b7a3a}',
  '.cms-box .row .btn-a{min-width:120px}',
  '.cms-logo-prev{width:84px;height:84px;object-fit:contain;border:1px solid var(--line);border-radius:14px;background:#fff;padding:6px}',
  'body.cms-editing [data-cms]{outline:1.5px dashed #d4a017;outline-offset:3px;border-radius:4px;min-height:1em;-webkit-user-select:text;user-select:text}',
  '.cms-bar{position:fixed;left:0;right:0;bottom:0;z-index:2500;display:none;gap:8px;align-items:center;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0));background:var(--paper);border-top:1px solid var(--line);box-shadow:0 -4px 16px rgba(0,0,0,.15)}',
  '.cms-bar.show{display:flex}.cms-bar span{flex:1;font-size:13px;font-weight:700}',
  '.cms-bar button{border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}',
  '#chatOverlay{display:none;position:fixed;inset:0;z-index:310;background:var(--bg);flex-direction:column}',
  '#chatOverlay.open{display:flex}',
  '.chat-top{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0)) 12px 10px;background:#6B2D9B;color:#fff}',
  '.chat-top b{flex:1;font-size:16px}',
  '.chat-top button{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:10px;padding:8px 12px;font-size:15px;cursor:pointer}',
  '#chatMsgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}',
  '.chat-m{max-width:86%;padding:8px 11px;border-radius:14px;background:var(--paper);border:1px solid var(--line);font-size:14px;line-height:1.4;align-self:flex-start;word-break:break-word}',
  '.chat-m.me{align-self:flex-end;background:#ede4f5;color:#2a1f3d}',
  '.chat-m small{display:block;font-size:10.5px;opacity:.7;margin-bottom:2px}',
  '.chat-m .del{border:0;background:none;color:#b00020;font-size:12px;cursor:pointer;margin-left:6px}',
  '.chat-foot{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px calc(8px + env(safe-area-inset-bottom,0));border-top:1px solid var(--line);background:var(--paper)}',
  '.chat-foot input{flex:1;min-width:0;padding:11px 12px;border:1.5px solid var(--line);border-radius:12px;font-size:15px;background:var(--bg);color:var(--text)}',
  '.chat-foot #chatName{flex:1 1 100%;font-size:13px;padding:8px 12px}',
  '.chat-foot button{border:0;background:#6B2D9B;color:#fff;border-radius:12px;padding:0 16px;font-weight:700;font-size:14px;cursor:pointer}',
  '.chat-empty{text-align:center;color:var(--muted);font-size:13px;margin-top:30px}'
].join('\n');
document.head.appendChild(st);

/* ---------------- Vigae vya nyumbani ---------------- */
function addTiles(){
  var home = $('home'); if(!home || $('cloudTiles')) return;
  var d = document.createElement('div'); d.id = 'cloudTiles'; d.className = 'cloud-tiles';
  d.innerHTML =
    '<button type="button" data-act="lessons"><img src="img/tile-lessons.webp" alt=""><span>LESONI</span></button>' +
    '<button type="button" data-act="daily"><img src="img/tile-daily.webp" alt=""><span>NENO LA LEO</span></button>' +
    '<button type="button" data-act="chat"><img src="img/tile-chat.webp" alt=""><span>GUMZO LA WATUMIAJI</span></button>' +
    '<button type="button" data-act="update"><img src="img/tile-update.webp" alt=""><span>FANYA SASISHO<small id="cloudStamp"></small></span></button>';
  var ref = home.querySelector('.section-head') || home.firstChild;
  home.insertBefore(d, ref);
  d.addEventListener('click', function(e){
    var b = e.target.closest('button[data-act]'); if(!b) return;
    var a = b.getAttribute('data-act');
    if(a === 'lessons'){ if(typeof window.tab === 'function') window.tab('lesoni'); }
    else if(a === 'daily'){ var c = document.querySelector('.daily-card'); if(c){ c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.style.transition = 'transform .3s'; c.style.transform = 'scale(1.03)'; setTimeout(function(){ c.style.transform = ''; }, 500); } }
    else if(a === 'chat') openChat();
    else if(a === 'update') openCms();
  });
  stamp();
}
function stamp(){ var s = $('cloudStamp'); if(s) s.textContent = M.on ? ('Imesasishwa: ' + ago(M.state.lastSync)) : 'Cloud haijawekwa'; }
document.addEventListener('mjue-synced', stamp);

/* ---------------- Paneli ya Admin (CMS) ---------------- */
var ov = document.createElement('div');
ov.id = 'cmsOverlay'; ov.className = 'admin-overlay'; ov.setAttribute('aria-hidden', 'true');
ov.innerHTML = '<div class="admin-box cms-box"><div class="cms-head"><h2 id="cmsTitle">\u2601 Usimamizi wa App</h2><button type="button" class="cms-x" id="cmsClose" aria-label="Funga">\u00D7</button></div><div id="cmsBody"></div></div>';
document.body.appendChild(ov);
var body = $('cmsBody'), tabNow = 'bible';
function openCms(){ ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); render(); }
function closeCms(){ ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); }
$('cmsClose').addEventListener('click', closeCms);
ov.addEventListener('click', function(e){ if(e.target === ov) closeCms(); });
document.addEventListener('mjue-auth', function(){ if(ov.classList.contains('open')) render(); });
window.MJUE_CMS = { open: openCms, close: closeCms };

function setMsg(t, k){ var m = $('cmsMsg'); if(m){ m.textContent = t; m.className = 'cms-msg ' + (k || ''); } }
async function run(label, fn){
  setMsg('\u23F3 ' + label + '\u2026');
  try{ var r = await fn(); setMsg('\u2705 Imekamilika \u2014 watumiaji wote wataipokea wanapofungua app.', 'ok'); return r; }
  catch(e){ setMsg('\u274C ' + (e.message || e), 'err'); }
}
function prog(p){ setMsg('\u23F3 Inatuma\u2026 ' + p + '%'); }

function render(){
  if(!M.on){
    body.innerHTML = '<div class="cms-sec"><h3>Cloud haijawekwa</h3><p class="hint">Ili mabadiliko ya admin yafike kwa watumiaji wote, weka <b>apiKey</b> na <b>projectId</b> ya Firebase kwenye faili <b>cloud-config.js</b>, kisha jenga APK upya. Maelekezo kamili yako kwenye <b>SETUP_CLOUD.md</b>.</p></div>';
    return;
  }
  if(!M.isAdmin()){ viewLogin(); return; }
  viewDash();
}

function viewLogin(){
  body.innerHTML =
    '<div class="cms-sec"><h3>\uD83D\uDD04 Masasisho</h3><p class="hint">Mara ya mwisho: <b id="cmsLast">' + ago(M.state.lastSync) + '</b></p>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="cmsSyncNow">Angalia masasisho sasa</button></div></div>' +
    '<div class="cms-sec"><h3>\uD83D\uDD10 Ingia kama Admin</h3>' +
    '<label>Barua pepe ya admin</label><input type="email" id="cmsEmail" autocomplete="username" placeholder="admin@example.com">' +
    '<label>Nenosiri</label><input type="password" id="cmsPass" autocomplete="current-password">' +
    '<div class="row"><button type="button" class="btn-a btn-primary" id="cmsLogin">Ingia</button></div></div>' +
    '<div class="cms-msg" id="cmsMsg"></div>';
  $('cmsSyncNow').onclick = async function(){ setMsg('\u23F3 Inaangalia\u2026'); var ok = await M.sync(true); setMsg(ok ? '\u2705 App imesasishwa.' : '\u274C ' + (M.state.lastErr || 'Imeshindwa'), ok ? 'ok' : 'err'); $('cmsLast').textContent = ago(M.state.lastSync); stamp(); };
  var go = async function(){
    setMsg('\u23F3 Inaingia\u2026');
    try{ await M.login(($('cmsEmail').value || '').trim(), $('cmsPass').value || ''); toast2('Umeingia kama admin'); }
    catch(e){ setMsg('\u274C ' + e.message, 'err'); }
  };
  $('cmsLogin').onclick = go;
  $('cmsPass').addEventListener('keydown', function(e){ if(e.key === 'Enter') go(); });
}
function toast2(t){ M.toast(t); }

function viewDash(){
  var tabs = [['bible', '\uD83D\uDCD6 Biblia'], ['songs', '\uD83C\uDFB5 Nyimbo'], ['logo', '\uD83D\uDDBC Nembo'], ['texts', '\u270F\uFE0F Maandishi'], ['status', '\u2699 Hali']];
  body.innerHTML = '<div class="cms-tabs" id="cmsTabs">' + tabs.map(function(t){ return '<button type="button" data-t="' + t[0] + '" class="' + (t[0] === tabNow ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
    '<div id="cmsTab"></div><div class="cms-msg" id="cmsMsg"></div>';
  $('cmsTabs').onclick = function(e){ var b = e.target.closest('button[data-t]'); if(!b) return; tabNow = b.getAttribute('data-t'); viewDash(); };
  ({ bible: tabBible, songs: tabSongs, logo: tabLogo, texts: tabTexts, status: tabStatus })[tabNow]($('cmsTab'));
}

/* ---- Biblia ---- */
function bookList(){
  var out = [];
  if(typeof books !== 'undefined'){ (books.old || []).concat(books['new'] || []).forEach(function(b){ out.push({ n: b[0], c: b[1], ch: b[2] }); }); }
  return out;
}
function parseCSV(text, delim){
  var rows = [], row = [], f = '', q = false;
  for(var i = 0; i < text.length; i++){
    var c = text[i];
    if(q){ if(c === '"'){ if(text[i + 1] === '"'){ f += '"'; i++; } else q = false; } else f += c; }
    else if(c === '"' && f === '') q = true;
    else if(c === delim){ row.push(f); f = ''; }
    else if(c === '\n' || c === '\r'){ if(c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if(f !== '' || row.length){ row.push(f); rows.push(row); }
  return rows;
}
function parseBible(text, fname){
  var t = String(text).replace(/^\uFEFF/, '').trim(), obj = null;
  var codes = {}; bookList().forEach(function(b){ codes[b.c] = 1; });
  var mm = t.match(/MJUE_YESU_TRANSLATIONS\.[A-Za-z0-9_]+\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if(mm) obj = JSON.parse(mm[1]);
  else if(t.charAt(0) === '{') obj = JSON.parse(t);
  else {
    var delim = /\.tsv$/i.test(fname) || (t.split('\n')[0].split('\t').length > t.split('\n')[0].split(',').length) ? '\t' : ',';
    obj = {};
    parseCSV(t, delim).forEach(function(r){
      if(r.length < 4 || !/^\d+$/.test((r[1] || '').trim())) return;
      var code = r[0].trim().toUpperCase(), ch = r[1].trim(), v = (r[2] || '').trim();
      if(!/^\d+$/.test(v)) return;
      ((obj[code] = obj[code] || {})[ch] = obj[code][ch] || {})[v] = r.slice(3).join(delim).trim();
    });
  }
  if(obj && obj.data && !obj.GEN && !obj.MAT && typeof obj.data === 'object') obj = obj.data;
  if(obj && !obj.GEN && !obj.MAT){ var ks = Object.keys(obj); if(ks.length === 1 && obj[ks[0]] && (obj[ks[0]].GEN || obj[ks[0]].MAT)) obj = obj[ks[0]]; }
  var data = {}, nb = 0, nv = 0, unknown = [];
  Object.keys(obj || {}).forEach(function(k){
    var code = k.toUpperCase();
    if(!codes[code]){ unknown.push(k); return; }
    var chs = obj[k]; if(!chs || typeof chs !== 'object') return;
    data[code] = {};
    Object.keys(chs).forEach(function(ch){
      var vs = chs[ch]; if(!vs || typeof vs !== 'object') return;
      data[code][ch] = {};
      Object.keys(vs).forEach(function(v){ var s = vs[v]; if(typeof s === 'string' && s.trim()){ data[code][ch][v] = s.trim(); nv++; } });
    });
    nb++;
  });
  if(!nb) throw new Error('Faili halina vitabu vinavyojulikana (GEN, EXO, \u2026 REV). Angalia muundo.');
  return { data: data, nb: nb, nv: nv, unknown: unknown };
}

function tabBible(el){
  var vs = M.versions();
  var list = vs.map(function(v){
    return '<div class="cms-item"><b>' + esc(v.label) + ' <small>(' + esc(v.id) + ')' + (v.cloud ? ' \u2601' : '') + (v.builtin && !v.cloud ? ' \u00B7 ya msingi' : '') + '</small></b>' +
      (v.cloud ? '<button type="button" class="btn-a btn-sec" data-delbible="' + esc(v.id) + '">' + (v.builtin ? 'Rudisha ya msingi' : 'Futa') + '</button>' : '') + '</div>';
  }).join('');
  var bl = bookList();
  el.innerHTML =
    '<div class="cms-sec"><h3>Matoleo ya Biblia</h3>' + list + '</div>' +
    '<div class="cms-sec"><h3>\u2795 Ongeza / badilisha toleo la Biblia</h3>' +
    '<p class="hint">Faili: <b>JSON</b> (muundo wa app), <b>CSV/TSV</b> (safu 4: code, sura, aya, maandishi \u2014 mf. <i>GEN,1,1,"Hapo mwanzo\u2026"</i>) au <b>kjv_sw.js</b>. Ukitumia ID ya toleo lililopo (mf. NENO), toleo hilo litabadilishwa kwa watumiaji wote.</p>' +
    '<label>ID fupi (herufi/namba, mf. SUV)</label><input type="text" id="bvId" maxlength="10" placeholder="SUV" autocapitalize="characters">' +
    '<label>Jina la toleo</label><input type="text" id="bvLabel" placeholder="Swahili Union Version">' +
    '<label>Chanzo / haki miliki (inaonekana kwenye msomaji)</label><input type="text" id="bvSource" placeholder="Jina la mchapishaji / leseni">' +
    '<label>Faili la Biblia</label><input type="file" id="bvFile" accept=".json,.csv,.tsv,.txt,.js,application/json,text/csv,text/plain">' +
    '<div class="row"><button type="button" class="btn-a btn-primary" id="bvGo">Pakia kwa watumiaji wote</button></div></div>' +
    '<div class="cms-sec"><h3>\u270F\uFE0F Hariri aya</h3>' +
    '<label>Toleo</label><select id="veVer">' + vs.map(function(v){ return '<option value="' + esc(v.id) + '">' + esc(v.label) + '</option>'; }).join('') + '</select>' +
    '<label>Kitabu</label><select id="veBook">' + bl.map(function(b){ return '<option value="' + b.c + '">' + esc(b.n) + '</option>'; }).join('') + '</select>' +
    '<div style="display:flex;gap:8px"><div style="flex:1"><label>Sura</label><input type="number" id="veCh" min="1" value="1"></div><div style="flex:1"><label>Aya</label><input type="number" id="veV" min="1" value="1"></div></div>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="veLoad">Pakia aya</button></div>' +
    '<label>Maandishi ya aya</label><textarea id="veText" placeholder="Bofya \u201CPakia aya\u201D kisha hariri\u2026"></textarea>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="veReset">Rudisha aya ya awali</button><button type="button" class="btn-a btn-primary" id="veSave">Hifadhi aya</button></div></div>';

  el.querySelectorAll('[data-delbible]').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-delbible');
      if(!confirm('Futa toleo ' + id + ' kwa watumiaji wote?')) return;
      run('Inafuta', async function(){ await M.delBlob('bible_' + id); if(M.getBlobText('biblepatch_' + id) != null) await M.delBlob('biblepatch_' + id); }).then(viewDash);
    };
  });
  $('bvGo').onclick = async function(){
    var id = ($('bvId').value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    var label = ($('bvLabel').value || '').trim(), source = ($('bvSource').value || '').trim(), f = $('bvFile').files[0];
    if(!id) return setMsg('\u274C Weka ID ya toleo.', 'err');
    if(!label) return setMsg('\u274C Weka jina la toleo.', 'err');
    if(!f) return setMsg('\u274C Chagua faili la Biblia.', 'err');
    var parsed;
    try{ setMsg('\u23F3 Inasoma faili\u2026'); parsed = parseBible(await f.text(), f.name); }
    catch(e){ return setMsg('\u274C ' + e.message, 'err'); }
    var payload = JSON.stringify({ id: id, label: label, sub: 'Cloud \u00B7 Offline', source: source || label, data: parsed.data });
    var mb = (payload.length / 1048576).toFixed(1);
    if(payload.length > 14000000) return setMsg('\u274C Faili ni kubwa mno (' + mb + ' MB). Kikomo ni 14 MB.', 'err');
    var extra = parsed.unknown.length ? '\n\nVitabu visivyojulikana (vitarukwa): ' + parsed.unknown.slice(0, 8).join(', ') : '';
    if(parsed.nb < 66) extra += '\n\nOnyo: vitabu ' + parsed.nb + ' tu kati ya 66.';
    if(!confirm('Toleo "' + label + '" (' + id + ')\nVitabu: ' + parsed.nb + ' \u00B7 Aya: ' + parsed.nv + ' \u00B7 ' + mb + ' MB' + extra + '\n\nLipakie kwa watumiaji wote?')) return;
    run('Inatuma', function(){ return M.putBlob('bible_' + id, payload, prog); }).then(function(){ viewDash(); setMsg('\u2705 Toleo ' + label + ' limepakiwa. Watumiaji wote wataliona kwenye Biblia.', 'ok'); });
  };
  var loadVerse = function(){
    var v = M.verse($('veVer').value, $('veBook').value, String($('veCh').value), String($('veV').value));
    $('veText').value = v || '';
    setMsg(v === undefined ? 'Aya hii haipo kwenye toleo hili \u2014 ukihifadhi itaongezwa.' : '', '');
  };
  $('veLoad').onclick = loadVerse;
  async function savePatch(mutator, label){
    var id = $('veVer').value, name = 'biblepatch_' + id;
    await run(label, async function(){
      var cur = await M.readLatest(name); cur = cur ? JSON.parse(cur) : {};
      mutator(cur);
      var empty = !Object.keys(cur).some(function(c){ return Object.keys(cur[c]).length; });
      if(empty) await M.delBlob(name); else await M.putBlob(name, JSON.stringify(cur));
    });
  }
  $('veSave').onclick = function(){
    var code = $('veBook').value, ch = String($('veCh').value), v = String($('veV').value), txt = ($('veText').value || '').trim();
    if(!txt) return setMsg('\u274C Andika maandishi ya aya.', 'err');
    savePatch(function(p){ ((p[code] = p[code] || {})[ch] = p[code][ch] || {})[v] = txt; }, 'Inahifadhi aya');
  };
  $('veReset').onclick = function(){
    var code = $('veBook').value, ch = String($('veCh').value), v = String($('veV').value);
    savePatch(function(p){ if(p[code] && p[code][ch]){ delete p[code][ch][v]; if(!Object.keys(p[code][ch]).length) delete p[code][ch]; if(!Object.keys(p[code]).length) delete p[code]; } }, 'Inarudisha aya').then(loadVerse);
  };
}

/* ---- Nyimbo ---- */
function tabSongs(el){
  el.innerHTML =
    '<div class="cms-sec"><h3>\uD83C\uDFB5 Ongeza / hariri wimbo</h3>' +
    '<label>Namba ya wimbo</label><div style="display:flex;gap:8px"><input type="number" id="soNum" min="1" placeholder="mf. 221" style="flex:1"><button type="button" class="btn-a btn-sec" id="soLoad" style="flex:none;padding:0 14px">Pakia</button></div>' +
    '<label>Jina la wimbo</label><input type="text" id="soTitle">' +
    '<label>Maneno (tenganisha beti kwa mstari tupu)</label><textarea id="soLyrics" style="min-height:200px" placeholder="Beti la 1\u2026&#10;&#10;Beti la 2\u2026"></textarea>' +
    '<p class="hint">Kolasi: andika kolasi lilelile (neno kwa neno) kila mahali linapoimbwa \u2014 app huitambua kiotomatiki.</p>' +
    '<label>Sauti ya wimbo (mp3/m4a, hadi 4 MB) \u2014 si lazima</label><input type="file" id="soAudio" accept="audio/*">' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="soDel">Futa wimbo</button><button type="button" class="btn-a btn-primary" id="soSave">Hifadhi</button></div>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="soDelAudio">Futa sauti tu</button></div></div>';
  var num = function(){ return String(parseInt($('soNum').value, 10) || ''); };
  $('soLoad').onclick = function(){
    var n = num(); if(!n) return setMsg('\u274C Weka namba.', 'err');
    var h = M.hymnEntry(n), it = document.querySelector('#songList .song-item[data-song="' + n + '"] .title');
    $('soTitle').value = (h && h.t) || (it && it.textContent) || '';
    $('soLyrics').value = h && h.v ? h.v.join('\n\n') : '';
    setMsg(h || it ? 'Wimbo umepakiwa.' : 'Wimbo huu haupo \u2014 ukihifadhi utaongezwa.', '');
  };
  $('soSave').onclick = function(){
    var n = num(), title = ($('soTitle').value || '').trim(), lyr = ($('soLyrics').value || '').trim(), f = $('soAudio').files[0];
    if(!n) return setMsg('\u274C Weka namba ya wimbo.', 'err');
    if(!title) return setMsg('\u274C Weka jina la wimbo.', 'err');
    if(f && f.size > 4000000) return setMsg('\u274C Sauti ni kubwa kuliko 4 MB.', 'err');
    var verses = lyr ? lyr.split(/\n\s*\n/).map(function(s){ return s.trim(); }).filter(Boolean) : [];
    run('Inahifadhi wimbo', async function(){
      var cur = await M.readLatest('hymns'); cur = cur ? JSON.parse(cur) : {};
      cur.set = cur.set || {}; cur.del = (cur.del || []).filter(function(x){ return x !== n; });
      cur.set[n] = { t: title, v: verses };
      await M.putBlob('hymns', JSON.stringify(cur));
      if(f){ var u = await M.blobToData(f); await M.putBlob('audio_' + n, u, prog); }
    }).then(function(){ $('soAudio').value = ''; });
  };
  $('soDel').onclick = function(){
    var n = num(); if(!n) return setMsg('\u274C Weka namba.', 'err');
    if(!confirm('Futa wimbo ' + n + ' kwa watumiaji wote?')) return;
    run('Inafuta', async function(){
      var cur = await M.readLatest('hymns'); cur = cur ? JSON.parse(cur) : {};
      cur.set = cur.set || {}; cur.del = cur.del || [];
      delete cur.set[n]; if(cur.del.indexOf(n) < 0) cur.del.push(n);
      await M.putBlob('hymns', JSON.stringify(cur));
      if(M.hasAudio(n)) await M.delBlob('audio_' + n);
    });
  };
  $('soDelAudio').onclick = function(){
    var n = num(); if(!n) return setMsg('\u274C Weka namba.', 'err');
    if(!M.hasAudio(n)) return setMsg('Wimbo huu hauna sauti ya cloud.', '');
    run('Inafuta sauti', function(){ return M.delBlob('audio_' + n); });
  };
}

/* ---- Nembo ---- */
function tabLogo(el){
  el.innerHTML =
    '<div class="cms-sec"><h3>\uD83D\uDDBC Nembo ya app</h3>' +
    '<img class="cms-logo-prev" id="lgPrev" src="' + esc(M.currentLogo()) + '" alt="">' +
    '<p class="hint">Nembo inabadilika kwenye upau wa juu na ukurasa wa nyumbani kwa watumiaji wote. (Aikoni ya app kwenye skrini ya simu haiwezi kubadilishwa kwa mbali \u2014 inahitaji APK mpya.)</p>' +
    '<label>Chagua picha mpya (PNG/JPG/SVG)</label><input type="file" id="lgFile" accept="image/*">' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="lgReset">Rudisha ya awali</button><button type="button" class="btn-a btn-primary" id="lgSave">Weka nembo</button></div></div>';
  $('lgFile').onchange = function(){ var f = this.files[0]; if(f) $('lgPrev').src = URL.createObjectURL(f); };
  $('lgSave').onclick = function(){
    var f = $('lgFile').files[0]; if(!f) return setMsg('\u274C Chagua picha.', 'err');
    run('Inatuma nembo', async function(){
      var u = await M.imgToData(f, 256, 0.92, 'image/png');
      await M.putBlob('logo', u);
    });
  };
  $('lgReset').onclick = function(){ if(!M.hasBlob('logo')) return setMsg('Tayari ni nembo ya awali.', ''); run('Inarudisha', function(){ return M.delBlob('logo'); }).then(function(){ $('lgPrev').src = M.currentLogo(); }); };
}

/* ---- Maandishi + Neno la Leo ---- */
var bar = document.createElement('div'); bar.className = 'cms-bar';
bar.innerHTML = '<span>\u270F\uFE0F Unahariri maandishi ya app</span><button type="button" data-a="reset" style="background:var(--soft);color:var(--text)">Rudisha yote</button><button type="button" data-a="cancel" style="background:var(--soft);color:var(--text)">Ghairi</button><button type="button" data-a="save" style="background:#6B2D9B;color:#fff">Hifadhi</button>';
document.body.appendChild(bar);
var editing = false;
function cmsEls(){ return [].slice.call(document.querySelectorAll('[data-cms]')); }
function setTextEdit(on){
  editing = on; document.body.classList.toggle('cms-editing', on); bar.classList.toggle('show', on);
  cmsEls().forEach(function(e){ if(on){ e.setAttribute('contenteditable', 'true'); e.setAttribute('spellcheck', 'false'); } else e.removeAttribute('contenteditable'); });
}
function startTextEdit(){
  M.indexCms(); closeCms();
  if(typeof window.tab === 'function') window.tab('home');
  setTextEdit(true);
  M.toast('Gusa maandishi yoyote kuyahariri, kisha bofya Hifadhi');
}
document.addEventListener('click', function(e){
  if(editing && e.target.closest && e.target.closest('[data-cms]')){ e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
document.addEventListener('paste', function(e){
  if(!editing || !e.target.closest || !e.target.closest('[data-cms]')) return;
  e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
});
bar.addEventListener('click', function(e){
  var b = e.target.closest('button[data-a]'); if(!b) return; var a = b.getAttribute('data-a');
  if(a === 'cancel'){ setTextEdit(false); cmsEls().forEach(function(el){ var k = el.getAttribute('data-cms'), t = M.getTexts()[k]; el.textContent = t != null ? t : el.getAttribute('data-orig'); }); }
  else if(a === 'reset'){
    if(!confirm('Rudisha maandishi YOTE ya app kuwa ya awali kwa watumiaji wote?')) return;
    setTextEdit(false);
    (M.hasBlob('texts') ? M.delBlob('texts') : Promise.resolve()).then(function(){ M.toast('\u2601 Imerudishwa'); }, function(er){ M.toast(er.message); });
  } else if(a === 'save'){
    var map = Object.assign({}, M.getTexts()), n = 0;
    cmsEls().forEach(function(el){ var k = el.getAttribute('data-cms'), t = el.textContent.trim(); if(t !== el.getAttribute('data-orig') && t){ map[k] = t; } else delete map[k]; });
    n = Object.keys(map).length; setTextEdit(false);
    var p = n ? M.putBlob('texts', JSON.stringify(map)) : (M.hasBlob('texts') ? M.delBlob('texts') : Promise.resolve());
    p.then(function(){ M.toast('\u2601 Imetumwa kwa watumiaji wote'); }, function(er){ M.toast('Imeshindwa: ' + er.message); });
  }
});

function tabTexts(el){
  var d = M.getDaily() || {}, dates = Object.keys(d.byDate || {}).sort();
  el.innerHTML =
    '<div class="cms-sec"><h3>\u270F\uFE0F Maandishi ya app</h3><p class="hint">Hariri vichwa na maelezo ya Nyumbani, Biblia, Lesoni, Nyimbo na Zaidi moja kwa moja kwenye skrini.</p>' +
    '<div class="row"><button type="button" class="btn-a btn-primary" id="txStart">Anza kuhariri maandishi</button></div></div>' +
    '<div class="cms-sec"><h3>\uD83D\uDCD6 Neno la Leo</h3>' +
    '<p class="hint">Bila tarehe = neno la kawaida. Ukichagua tarehe, neno hilo litaonekana siku hiyo tu.</p>' +
    '<label>Tarehe (si lazima)</label><input type="date" id="dvDate">' +
    '<label>Fungu</label><textarea id="dvText" style="min-height:80px" placeholder="Mimi ndimi njia, na kweli, na uzima."></textarea>' +
    '<label>Marejeo</label><input type="text" id="dvRef" placeholder="Yohana 14:6">' +
    '<div class="row"><button type="button" class="btn-a btn-primary" id="dvSave">Hifadhi neno</button></div>' +
    (d.def ? '<div class="cms-item"><b>Kawaida: ' + esc(d.def.ref) + '</b><button type="button" class="btn-a btn-sec" data-dvdel="">Futa</button></div>' : '') +
    dates.map(function(k){ return '<div class="cms-item"><b>' + esc(k) + ' \u2014 ' + esc(d.byDate[k].ref) + '</b><button type="button" class="btn-a btn-sec" data-dvdel="' + esc(k) + '">Futa</button></div>'; }).join('') + '</div>';
  $('txStart').onclick = startTextEdit;
  $('dvSave').onclick = function(){
    var date = $('dvDate').value, text = ($('dvText').value || '').trim(), ref = ($('dvRef').value || '').trim();
    if(!text) return setMsg('\u274C Andika fungu.', 'err');
    run('Inahifadhi', async function(){
      var cur = await M.readLatest('daily'); cur = cur ? JSON.parse(cur) : {};
      if(date){ cur.byDate = cur.byDate || {}; cur.byDate[date] = { text: text, ref: ref }; } else cur.def = { text: text, ref: ref };
      await M.putBlob('daily', JSON.stringify(cur));
    }).then(viewDash);
  };
  el.querySelectorAll('[data-dvdel]').forEach(function(b){
    b.onclick = function(){
      var k = b.getAttribute('data-dvdel');
      run('Inafuta', async function(){
        var cur = await M.readLatest('daily'); cur = cur ? JSON.parse(cur) : {};
        if(k){ if(cur.byDate) delete cur.byDate[k]; } else delete cur.def;
        var empty = !cur.def && !Object.keys(cur.byDate || {}).length;
        if(empty) await M.delBlob('daily'); else await M.putBlob('daily', JSON.stringify(cur));
      }).then(viewDash);
    };
  });
}

/* ---- Hali ---- */
function tabStatus(el){
  el.innerHTML =
    '<div class="cms-sec"><h3>\u2601 Hali ya cloud</h3>' +
    '<div class="cms-item"><b>Admin</b><span>' + esc(M.adminEmail()) + '</span></div>' +
    '<div class="cms-item"><b>Project</b><span>' + esc(C.projectId) + '</span></div>' +
    '<div class="cms-item"><b>Vitu vilivyopo</b><span>' + M.state.items + '</span></div>' +
    '<div class="cms-item"><b>Usawazishaji wa mwisho</b><span>' + ago(M.state.lastSync) + '</span></div>' +
    (M.state.lastErr ? '<p class="hint" style="color:#b00020">Kosa la mwisho: ' + esc(M.state.lastErr) + '</p>' : '') +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="stSync">Sasisha sasa</button></div></div>' +
    '<div class="cms-sec"><h3>\uD83D\uDCDA Lesoni</h3><p class="hint">Hariri maelezo, picha na PDF za somo. Kuhariri maandishi ya somo: fungua somo kisha bofya \u270F\uFE0F. Yote hutumwa kwa watumiaji wote.</p>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="stLessons">Fungua usimamizi wa Lesoni</button></div></div>' +
    '<div class="cms-sec"><h3>\uD83D\uDCAC Gumzo</h3><p class="hint">Kama admin unaweza kufuta ujumbe wowote ndani ya gumzo.</p>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="stChat">Fungua gumzo</button></div></div>' +
    '<div class="row"><button type="button" class="btn-a btn-sec" id="stOut">Toka (Logout)</button></div>';
  $('stSync').onclick = async function(){ setMsg('\u23F3 Inasawazisha\u2026'); var ok = await M.sync(true); setMsg(ok ? '\u2705 Imekamilika' : '\u274C ' + M.state.lastErr, ok ? 'ok' : 'err'); stamp(); };
  $('stLessons').onclick = function(){ closeCms(); if(window.MJUE_ADMIN) window.MJUE_ADMIN.open(); };
  $('stChat').onclick = function(){ closeCms(); openChat(); };
  $('stOut').onclick = function(){ M.logout(); };
}

/* ---------------- Gumzo la watumiaji ---------------- */
var chatEl = document.createElement('div');
chatEl.id = 'chatOverlay';
chatEl.innerHTML = '<div class="chat-top"><b>\uD83D\uDCAC Gumzo la Watumiaji</b><button type="button" id="chatRef" aria-label="Onyesha upya">\u21BB</button><button type="button" id="chatX" aria-label="Funga">\u00D7</button></div>' +
  '<div id="chatMsgs"><div class="chat-empty">Inapakia\u2026</div></div>' +
  '<div class="chat-foot"><input type="text" id="chatName" maxlength="30" placeholder="Jina lako"><input type="text" id="chatIn" maxlength="500" placeholder="Andika ujumbe\u2026"><button type="button" id="chatSend">Tuma</button></div>';
document.body.appendChild(chatEl);
var chatTimer = null, anon = null, lastSend = 0, DOCB = 'https://firestore.googleapis.com/v1/projects/' + C.projectId + '/databases/(default)/documents';
try{ anon = JSON.parse(localStorage.getItem('mjue_chat_auth') || 'null'); }catch(e){}
async function chatToken(){
  if(M.isAdmin()) return M.adminToken();
  if(anon && anon.exp - 60000 > Date.now()) return anon.idToken;
  var j;
  if(anon && anon.refreshToken){
    var r = await M.net('POST', 'https://securetoken.googleapis.com/v1/token?key=' + C.apiKey, { 'Content-Type': 'application/x-www-form-urlencoded' }, 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(anon.refreshToken));
    try{ j = JSON.parse(r.text); }catch(e){}
    if(r.status < 400 && j && j.id_token){ anon = { idToken: j.id_token, refreshToken: j.refresh_token, exp: Date.now() + (+j.expires_in) * 1000 }; }
    else anon = null;
  }
  if(!anon){
    var s = await M.api('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + C.apiKey, { returnSecureToken: true });
    anon = { idToken: s.idToken, refreshToken: s.refreshToken, exp: Date.now() + (+s.expiresIn) * 1000 };
  }
  try{ localStorage.setItem('mjue_chat_auth', JSON.stringify(anon)); }catch(e){}
  return anon.idToken;
}
function chatNameGet(){ try{ return localStorage.getItem('mjue_chat_name') || ''; }catch(e){ return ''; } }
async function chatLoad(){
  var box = $('chatMsgs');
  try{
    var res = await M.api('POST', DOCB + ':runQuery?key=' + C.apiKey, { structuredQuery: { from: [{ collectionId: 'chat' }], orderBy: [{ field: { fieldPath: 'ts' }, direction: 'DESCENDING' }], limit: 60 } });
    var msgs = (res || []).filter(function(x){ return x.document; }).map(function(x){
      var f = x.document.fields || {};
      return { id: x.document.name, name: (f.name && f.name.stringValue) || '?', text: (f.text && f.text.stringValue) || '', ts: f.ts && f.ts.timestampValue ? Date.parse(f.ts.timestampValue) : 0 };
    }).reverse();
    var atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80, me = chatNameGet();
    box.innerHTML = '';
    if(!msgs.length){ box.innerHTML = '<div class="chat-empty">Hakuna ujumbe bado. Anza mazungumzo! \uD83D\uDE4F</div>'; return; }
    msgs.forEach(function(m){
      var d = document.createElement('div'); d.className = 'chat-m' + (m.name === me ? ' me' : '');
      var sm = document.createElement('small'); sm.textContent = m.name + ' \u00B7 ' + new Date(m.ts).toLocaleString('sw-TZ', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
      if(M.isAdmin()){ var x = document.createElement('button'); x.className = 'del'; x.type = 'button'; x.textContent = '\uD83D\uDDD1'; x.onclick = function(){ if(confirm('Futa ujumbe huu?')) M.api('POST', DOCB + ':commit', { writes: [{ delete: m.id }] }, M.adminToken).then(chatLoad); }; sm.appendChild(x); }
      var t = document.createElement('div'); t.textContent = m.text;
      d.appendChild(sm); d.appendChild(t); box.appendChild(d);
    });
    if(atBottom || !chatLoad.once){ box.scrollTop = box.scrollHeight; chatLoad.once = true; }
  }catch(e){ if(!box.children.length || box.querySelector('.chat-empty')) box.innerHTML = '<div class="chat-empty">Imeshindwa kupakia gumzo: ' + esc(e.message) + '</div>'; }
}
function openChat(){
  if(!M.on){ M.toast('Gumzo linahitaji cloud (angalia SETUP_CLOUD.md)'); return; }
  chatEl.classList.add('open'); $('chatName').value = chatNameGet(); chatLoad.once = false; chatLoad();
  clearInterval(chatTimer); chatTimer = setInterval(chatLoad, 5000);
}
function closeChat(){ chatEl.classList.remove('open'); clearInterval(chatTimer); }
$('chatX').onclick = closeChat; $('chatRef').onclick = chatLoad;
async function chatSend(){
  var name = ($('chatName').value || '').trim(), text = ($('chatIn').value || '').trim();
  if(!name) return M.toast('Weka jina lako kwanza');
  if(!text) return;
  if(Date.now() - lastSend < 2000) return;
  lastSend = Date.now();
  try{ localStorage.setItem('mjue_chat_name', name); }catch(e){}
  $('chatSend').disabled = true;
  try{
    await M.api('POST', DOCB + '/chat', { fields: { name: { stringValue: name }, text: { stringValue: text }, ts: { timestampValue: new Date().toISOString() } } }, chatToken);
    $('chatIn').value = ''; await chatLoad();
    var b = $('chatMsgs'); b.scrollTop = b.scrollHeight;
  }catch(e){ M.toast('Imeshindwa kutuma: ' + e.message); }
  $('chatSend').disabled = false;
}
$('chatSend').onclick = chatSend;
$('chatIn').addEventListener('keydown', function(e){ if(e.key === 'Enter') chatSend(); });

/* ---------------- Unganisha na admin ya zamani (Lesoni) ---------------- */
(function(){
  var ao = $('adminOverlay'); if(!ao) return;
  if(M.on){
    var u = $('adminUser'); if(u){ u.type = 'email'; u.placeholder = 'Barua pepe ya admin'; if(u.previousElementSibling) u.previousElementSibling.textContent = 'Barua pepe ya admin'; }
    var er = $('adminErr'); if(er) er.textContent = 'Barua pepe au nenosiri si sahihi.';
    ao.addEventListener('click', async function(e){
      if(!e.target.closest || !e.target.closest('#adminLoginBtn')) return;
      e.stopImmediatePropagation(); e.preventDefault();
      try{ await M.login(($('adminUser').value || '').trim(), $('adminPass').value || ''); $('adminPass').value = ''; if(window.MJUE_ADMIN) window.MJUE_ADMIN.open(); M.toast('Umeingia kama admin'); }
      catch(err){ if(er){ er.textContent = err.message; er.classList.add('show'); } }
    }, true);
    ao.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('#adminLogout')) M.logout(); }, true);
    var dash = $('adminDash');
    if(dash){
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn-a btn-primary'; btn.style.cssText = 'width:100%;margin-bottom:12px;background:#4A1D6E';
      btn.textContent = '\u2601 Dhibiti app yote (Biblia, Nyimbo, Nembo, Maandishi)';
      btn.onclick = function(){ ao.classList.remove('open'); openCms(); };
      dash.insertBefore(btn, dash.children[1] || null);
      [].forEach.call(dash.querySelectorAll('p'), function(p){ if(/^Picha\/PDF/.test(p.textContent)) p.textContent = '\u2601 Mabadiliko yote yanatumwa kwa watumiaji wote (cloud).'; });
    }
  }
})();

/* Kitufe cha Back cha Android */
var oldBack = window.mjueBack;
window.mjueBack = function(){
  if(chatEl.classList.contains('open')){ closeChat(); return true; }
  if(editing){ bar.querySelector('[data-a="cancel"]').click(); return true; }
  if(ov.classList.contains('open')){ closeCms(); return true; }
  return oldBack ? oldBack() : false;
};

addTiles();
})();

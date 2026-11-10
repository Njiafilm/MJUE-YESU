/* =====================================================================
   MJUE YESU — Ukaguzi wa sasisho la app (kupitia Cloud/Firestore iliyopo)
   - Admin anatangaza toleo jipya: Usimamizi wa App -> "Tangaza Sasisho la App"
     (inahifadhi blob 'appupdate' = {code,name,url,notes})
   - Kila app inapofunguliwa/kusawazisha, ikiona code > toleo lililosakinishwa, inaonyesha ujumbe wa "Pakua".
   Haibadilishi mfumo wa Cloud uliopo; inasoma tu blob moja.
   ===================================================================== */
(function(){
'use strict';
var BLOB='appupdate', LS_SKIP='mjue_upd_skip';
function M(){return window.MJUE_CLOUD||null;}
function installed(){
  try{ if(window.MJUE_NATIVE && typeof window.MJUE_NATIVE.appVersionCode==='function'){ var n=+window.MJUE_NATIVE.appVersionCode(); if(n>0) return n; } }catch(e){}
  return 0; // haijulikani (kivinjari) -> usionyeshe ujumbe
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function info(){
  var m=M(); if(!m||!m.getBlobText) return null;
  var t=m.getBlobText(BLOB); if(!t) return null;
  try{ var o=JSON.parse(t); if(o&&+o.code>0&&/^https?:\/\//.test(o.url||'')) return o; }catch(e){}
  return null;
}
(function css(){
  var st=document.createElement('style');
  st.textContent='#updOv{position:fixed;inset:0;z-index:5000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);padding:20px}'+
  '#updOv.open{display:flex}'+
  '#updBox{width:min(92vw,400px);background:var(--paper,#fff);color:var(--text,#222);border-radius:24px;padding:22px 20px;box-shadow:0 12px 40px rgba(0,0,0,.4)}'+
  '#updBox h3{margin:0 0 6px;font-size:21px;color:var(--olive,#5a2a8a)}'+
  '#updBox p{margin:6px 0;font-size:15px;line-height:1.5;white-space:pre-line}'+
  '#updBox .ub{display:flex;gap:10px;margin-top:16px}'+
  '#updBox button{flex:1;padding:13px;border:0;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer}'+
  '#updGo{background:var(--olive,#6b2d9b);color:#fff}#updLater{background:var(--soft,#eee);color:var(--text,#222)}';
  (document.head||document.documentElement).appendChild(st);
})();
function show(o){
  var ov=document.getElementById('updOv');
  if(!ov){ ov=document.createElement('div'); ov.id='updOv'; document.body.appendChild(ov); }
  ov.innerHTML='<div id="updBox"><h3>🔔 Sasisho Jipya</h3><p><b>Toleo '+esc(o.name||o.code)+'</b> la MJUE YESU linapatikana.</p>'+(o.notes?'<p>'+esc(o.notes)+'</p>':'')+
   '<p style="font-size:13px;opacity:.75">Pakua na usakinishe juu ya app uliyo nayo. Data yako itabaki.</p><div class="ub"><button type="button" id="updLater">Baadaye</button><button type="button" id="updGo">Pakua sasa</button></div></div>';
  ov.classList.add('open');
  document.getElementById('updLater').onclick=function(){ ov.classList.remove('open'); try{localStorage.setItem(LS_SKIP,JSON.stringify({c:+o.code,t:Date.now()}));}catch(e){} };
  document.getElementById('updGo').onclick=function(){
    ov.classList.remove('open');
    try{ if(window.MJUE_NATIVE&&window.MJUE_NATIVE.openUrl) window.MJUE_NATIVE.openUrl(o.url); else window.open(o.url,'_blank'); }catch(e){}
  };
}
function check(){
  var o=info(), cur=installed(); if(!o||!cur||+o.code<=cur) return;
  try{ var sk=JSON.parse(localStorage.getItem(LS_SKIP)||'null'); if(sk&&sk.c===+o.code&&Date.now()-sk.t<24*3600*1000) return; }catch(e){}
  if(document.getElementById('updOv')&&document.getElementById('updOv').classList.contains('open')) return;
  show(o);
}
document.addEventListener('mjue-synced',function(){setTimeout(check,800);});
document.addEventListener('DOMContentLoaded',function(){setTimeout(check,4000);});

/* ---------- Sehemu ya admin ---------- */
function adminSection(){
  var body=document.getElementById('cmsBody'), m=M();
  if(!body||!m||!m.isAdmin||!m.isAdmin()||!body.querySelector('.cms-tabs')||document.getElementById('updAdmin')) return;
  var cur=info()||{}, d=document.createElement('div'); d.id='updAdmin'; d.className='cms-sec';
  d.innerHTML='<h3>📲 Tangaza Sasisho la App</h3><p class="hint">Watumiaji wote wataona ujumbe wa "Pakua" wakifungua app yenye toleo la chini. Toleo lililosakinishwa kwako: <b>'+(installed()||'?')+'</b>.</p>'+
   '<input id="updCode" type="number" placeholder="versionCode (mfano 14)" value="'+esc(cur.code||'')+'" style="width:100%;margin:4px 0;padding:10px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box">'+
   '<input id="updName" placeholder="Jina la toleo (mfano 4.0.5)" value="'+esc(cur.name||'')+'" style="width:100%;margin:4px 0;padding:10px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box">'+
   '<input id="updUrl" placeholder="Kiungo cha kupakua APK (https://...)" value="'+esc(cur.url||'')+'" style="width:100%;margin:4px 0;padding:10px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box">'+
   '<textarea id="updNotes" placeholder="Mapya katika toleo hili (hiari)" rows="3" style="width:100%;margin:4px 0;padding:10px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box">'+esc(cur.notes||'')+'</textarea>'+
   '<div class="row"><button type="button" class="btn-a" id="updPub">Tangaza</button> <button type="button" class="btn-a btn-sec" id="updDel">Ondoa tangazo</button></div><div id="updMsg" class="hint"></div>';
  body.appendChild(d);
  var msg=function(t){document.getElementById('updMsg').textContent=t;};
  document.getElementById('updPub').onclick=async function(){
    var code=+document.getElementById('updCode').value, url=document.getElementById('updUrl').value.trim();
    if(!(code>0)||!/^https?:\/\//.test(url)){ msg('❌ Weka versionCode sahihi na kiungo kinachoanza na https://'); return; }
    try{ msg('⏳ Inatuma…'); await m.putBlob(BLOB,JSON.stringify({code:code,name:document.getElementById('updName').value.trim(),url:url,notes:document.getElementById('updNotes').value.trim()})); msg('✅ Limetangazwa kwa watumiaji wote.'); }
    catch(e){ msg('❌ '+(e.message||e)); }
  };
  document.getElementById('updDel').onclick=async function(){
    try{ msg('⏳…'); if(m.hasBlob(BLOB)) await m.delBlob(BLOB); msg('✅ Tangazo limeondolewa.'); }catch(e){ msg('❌ '+(e.message||e)); }
  };
}
document.addEventListener('DOMContentLoaded',function(){
  new MutationObserver(adminSection).observe(document.body,{childList:true,subtree:true});
});
})();

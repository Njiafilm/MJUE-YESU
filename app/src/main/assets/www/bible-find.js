/* =====================================================================
   MJUE YESU — Kitafuta aya/mafungu ndani ya kisomaji cha Biblia + vishale vya kusogeza
   - Andika namba ya aya (16 au 16-18)  -> inaruka kwenye aya hiyo kwenye sura iliyo wazi
   - Andika kifungu (Yohana 3:16, 1 Wakorintho 13:4-7, Zaburi 23) -> inafungua kifungu hicho
   - Andika neno (upendo)  -> inaangazia aya za sura hii zenye neno, na kuorodhesha mafungu kote kwenye Biblia
   - Vishale ▲ ▼ vinasogeza ukurasa; mwisho wa sura ▼ inakuwa "Sura inayofuata →"
   Haibadilishi msimbo uliopo wa kisomaji; inajiunganisha baada ya kila sura kufunguliwa.
   ===================================================================== */
(function(){
'use strict';

var MAX_LIST=60, MIN_WORD=3;
var hits=[], hitIdx=-1, timer=null;

function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function norm(s){
  s=String(s||'').toLowerCase();
  try{s=s.normalize('NFD').replace(/[̀-ͯ]/g,'');}catch(e){}
  return s.replace(/[‘’“”]/g,'');
}
function books(){
  var out=[], bs=document.querySelectorAll('.book-card[data-code]');
  for(var i=0;i<bs.length;i++) out.push({code:bs[i].getAttribute('data-code'),name:bs[i].getAttribute('data-name'),ch:+bs[i].getAttribute('data-chapters')});
  return out;
}
function data(){return window.MJUE_YESU_BIBLE_DATA||{};}
function reader(){return document.getElementById('bibleReader');}

/* ---------- CSS ---------- */
(function css(){
  var st=document.createElement('style'); st.id='bible-find-style';
  st.textContent=
  '#findBar{flex-basis:100%;display:none;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}'+
  '#findBar.open{display:flex}'+
  '#findBar input{flex:1;min-width:150px;font-size:15px;padding:9px 12px;border-radius:11px;border:1px solid var(--line,#ccc);background:var(--paper,#fff);color:var(--text,#222)}'+
  '#findBar .fb{border:1px solid var(--line,#ccc);background:var(--paper,#fff);padding:8px 11px;border-radius:11px;font-size:14px;cursor:pointer;color:var(--text,#222)}'+
  '#findBar .fcount{font-size:12px;color:var(--muted,#777);min-width:54px;text-align:center}'+
  '#findResults{max-width:760px;margin:0 auto;padding:6px 16px 0}'+
  '#findResults .fr{width:100%;text-align:left;border:1px solid var(--line,#ddd);background:var(--soft,#f3eee6);border-radius:14px;padding:10px 12px;margin:0 0 8px;cursor:pointer;color:var(--text,#222)}'+
  '#findResults .fr b{display:block;font-size:13px;color:var(--olive,#5a3a8a);margin-bottom:2px}'+
  '#findResults .fr span{font-size:13.5px;line-height:1.5}'+
  '#findResults .fr mark,.verse mark.fhit{background:rgba(212,160,23,.45);color:inherit;border-radius:3px;padding:0 1px}'+
  '#findResults .fnote{font-size:12px;color:var(--muted,#777);padding:2px 2px 10px}'+
  '.verse.find-hit{background:rgba(212,160,23,.14)}'+
  '.verse.find-cur{outline:2px solid var(--gold,#d4a017);background:rgba(212,160,23,.22)}'+
  '#readerFloat{position:fixed;right:14px;bottom:86px;z-index:1600;display:none;flex-direction:column;gap:10px}'+
  '#readerFloat.show{display:flex}'+
  '#readerFloat button{width:48px;height:48px;border-radius:50%;border:0;font-size:20px;font-weight:800;cursor:pointer;color:#fff;background:var(--olive,#6b2d9b);box-shadow:0 4px 14px rgba(0,0,0,.3);opacity:.92}'+
  '#readerFloat button.next{width:auto;min-width:48px;padding:0 16px;border-radius:24px;font-size:14px}'+
  '#nextChapterBottom{display:block;margin:6px auto 70px;padding:13px 22px;border-radius:14px;border:0;background:var(--olive,#6b2d9b);color:#fff;font-size:15px;font-weight:800;cursor:pointer}';
  (document.head||document.documentElement).appendChild(st);
})();

/* ---------- Kuangazia aya kwenye sura iliyo wazi ---------- */
function verses(){return document.querySelectorAll('#offlineVerses .verse');}
function clearMarks(){
  var vs=verses();
  for(var i=0;i<vs.length;i++){
    vs[i].classList.remove('find-hit','find-cur','selected');
    var ms=vs[i].querySelectorAll('mark.fhit');
    for(var j=0;j<ms.length;j++){var t=document.createTextNode(ms[j].textContent); ms[j].parentNode.replaceChild(t,ms[j]);}
    vs[i].normalize();
  }
  hits=[]; hitIdx=-1;
}
function jumpVerses(a,b){
  clearMarks();
  var vs=verses(), first=null;
  for(var i=0;i<vs.length;i++){
    var n=+(vs[i].querySelector('.verse-num')||{}).textContent;
    if(n>=a && n<=b){vs[i].classList.add('selected'); if(!first) first=vs[i];}
  }
  if(first) first.scrollIntoView({behavior:'smooth',block:'center'});
  return !!first;
}
function markWord(word){
  clearMarks();
  var w=String(word).toLowerCase(), vs=verses();
  for(var i=0;i<vs.length;i++){
    var tn=null, nodes=vs[i].childNodes;
    for(var k=0;k<nodes.length;k++){if(nodes[k].nodeType===3){tn=nodes[k];break;}}
    if(!tn) continue;
    var txt=tn.nodeValue, ntxt=txt.toLowerCase();
    var at=ntxt.indexOf(w);
    if(at<0) continue;
    var frag=document.createDocumentFragment(), pos=0;
    while(at>=0){
      frag.appendChild(document.createTextNode(txt.slice(pos,at)));
      var m=document.createElement('mark'); m.className='fhit'; m.textContent=txt.slice(at,at+w.length); frag.appendChild(m);
      pos=at+w.length; at=ntxt.indexOf(w,pos);
    }
    frag.appendChild(document.createTextNode(txt.slice(pos)));
    vs[i].replaceChild(frag,tn);
    vs[i].classList.add('find-hit'); hits.push(vs[i]);
  }
  if(hits.length) gotoHit(0);
  return hits.length;
}
function gotoHit(i){
  if(!hits.length) return;
  hitIdx=(i+hits.length)%hits.length;
  for(var k=0;k<hits.length;k++) hits[k].classList.toggle('find-cur',k===hitIdx);
  hits[hitIdx].scrollIntoView({behavior:'smooth',block:'center'});
  setCount();
}
function setCount(){
  var c=$('#findBar .fcount'); if(!c) return;
  c.textContent=hits.length?((hitIdx+1)+'/'+hits.length):'';
}

/* ---------- Marejeo (Yohana 3:16) ---------- */
function parseRef(q){
  var m=q.trim().match(/^(\d?\s*[^\d:.,\-–]+?)\s+(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?$/);
  if(!m) return null;
  var nm=norm(m[1]).replace(/\s+/g,' ').trim(), bs=books(), found=null, i;
  for(i=0;i<bs.length;i++){ if(norm(bs[i].name)===nm){found=bs[i];break;} }
  if(!found){
    var c=[]; for(i=0;i<bs.length;i++){ if(norm(bs[i].name).indexOf(nm)===0) c.push(bs[i]); }
    if(c.length===1) found=c[0];
  }
  if(!found) return null;
  var ch=Math.max(1,Math.min(+m[2],found.ch));
  return {book:found,ch:ch,v1:m[3]?+m[3]:0,v2:m[4]?+m[4]:(m[3]?+m[3]:0)};
}
function openRef(r){
  if(typeof window.openPassageFromLesson==='function') window.openPassageFromLesson(r.book.code,r.ch,r.v1||'');
}

/* ---------- Utafutaji wa Biblia nzima kwa neno ---------- */
function searchAll(word){
  var w=String(word).toLowerCase(), D=data(), bs=books(), out=[], total=0;
  for(var b=0;b<bs.length;b++){
    var bk=D[bs[b].code]; if(!bk) continue;
    for(var ch=1;ch<=bs[b].ch;ch++){
      var cp=bk[String(ch)]; if(!cp) continue;
      for(var v in cp){
        if(!cp.hasOwnProperty(v)) continue;
        if(String(cp[v]).toLowerCase().indexOf(w)>=0){ total++; if(out.length<MAX_LIST) out.push({b:bs[b],ch:ch,v:+v,t:cp[v]}); }
      }
    }
  }
  return {list:out,total:total};
}
function snippet(t,word){
  var w=String(word).toLowerCase(), at=String(t).toLowerCase().indexOf(w);
  var s=Math.max(0,at-50), e=Math.min(t.length,at+w.length+90);
  var pre=t.slice(s,at), mid=t.slice(at,at+w.length), post=t.slice(at+w.length,e);
  return (s>0?'…':'')+esc(pre)+'<mark>'+esc(mid)+'</mark>'+esc(post)+(e<t.length?'…':'');
}
function renderResults(html){
  var box=$('#findResults'); if(!box) return;
  box.innerHTML=html||''; box.style.display=html?'block':'none';
}
function onQuery(raw,enter){
  var q=String(raw||'').trim();
  clearMarks(); setCount();
  if(!q){renderResults(''); return;}
  // 1) namba ya aya / mfululizo wa aya: 16 au 16-18
  var m=q.match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
  if(m){
    var a=+m[1], b=m[2]?+m[2]:a;
    var ok=jumpVerses(a,b);
    renderResults(ok?'':'<div class="fnote">Aya '+a+' haipo kwenye sura hii.</div>');
    return;
  }
  // 2) kifungu
  var r=parseRef(q);
  if(r){
    var label=r.book.name+' '+r.ch+(r.v1?':'+r.v1+(r.v2&&r.v2!==r.v1?'-'+r.v2:''):'');
    renderResults('<button type="button" class="fr" data-open-ref="1"><b>📖 '+esc(label)+'</b><span>Gusa kufungua kifungu hiki.</span></button>');
    $('#findResults [data-open-ref]').onclick=function(){openRef(r);};
    if(enter) openRef(r);
    return;
  }
  // 3) neno
  if(norm(q).length<MIN_WORD){renderResults('<div class="fnote">Andika herufi '+MIN_WORD+' au zaidi kutafuta neno.</div>'); return;}
  var here=markWord(q), res=searchAll(q), h='';
  h+='<div class="fnote">'+(here?('Aya '+here+' kwenye sura hii zimeangaziwa. '):'Hakuna kwenye sura hii. ')+'Biblia nzima: <b>'+res.total+'</b> '+(res.total===1?'aya':'aya')+(res.total>MAX_LIST?' (zinaonyeshwa '+MAX_LIST+' za kwanza)':'')+'.</div>';
  for(var i=0;i<res.list.length;i++){
    var x=res.list[i];
    h+='<button type="button" class="fr" data-c="'+esc(x.b.code)+'" data-h="'+x.ch+'" data-v="'+x.v+'"><b>'+esc(x.b.name)+' '+x.ch+':'+x.v+'</b><span>'+snippet(x.t,q)+'</span></button>';
  }
  renderResults(h);
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('#findResults .fr[data-c]'); if(!b) return;
  e.preventDefault();
  if(typeof window.openPassageFromLesson==='function') window.openPassageFromLesson(b.getAttribute('data-c'),+b.getAttribute('data-h'),b.getAttribute('data-v'));
});

/* ---------- Kuunganisha kwenye kisomaji ---------- */
function enhance(){
  var rd=reader(); if(!rd||!rd.classList.contains('show')) return;
  var act=$('.reader-actions',rd); if(!act) return;
  if(!$('#findToggle',rd)){
    var tg=document.createElement('button'); tg.id='findToggle'; tg.type='button'; tg.textContent='🔍 Tafuta';
    act.appendChild(tg);
    var bar=document.createElement('div'); bar.id='findBar';
    bar.innerHTML='<input id="findInput" type="search" inputmode="search" autocomplete="off" placeholder="Aya (16), kifungu (Yohana 3:16) au neno">'+
      '<button type="button" class="fb" id="findPrev" aria-label="Iliyotangulia">▲</button>'+
      '<span class="fcount"></span>'+
      '<button type="button" class="fb" id="findNext" aria-label="Inayofuata">▼</button>'+
      '<button type="button" class="fb" id="findClose" aria-label="Funga">✕</button>';
    act.appendChild(bar);
    var res=document.createElement('div'); res.id='findResults'; res.style.display='none';
    var offl=$('#offlineVerses',rd); if(offl&&offl.parentNode) offl.parentNode.insertBefore(res,offl); else act.parentNode.appendChild(res);
    tg.onclick=function(){
      var open=!bar.classList.contains('open'); bar.classList.toggle('open',open);
      if(open){ $('#findInput').focus(); } else { $('#findInput').value=''; onQuery(''); }
    };
    $('#findClose').onclick=function(){bar.classList.remove('open'); $('#findInput').value=''; onQuery('');};
    $('#findInput').addEventListener('input',function(e){var v=e.target.value; clearTimeout(timer); timer=setTimeout(function(){onQuery(v,false);},250);});
    $('#findInput').addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault(); var v=e.target.value; clearTimeout(timer);
        if(hits.length && !/^\d/.test(v.trim()) && !parseRef(v)) gotoHit(hitIdx+1); else onQuery(v,true);}
    });
    $('#findNext').onclick=function(){gotoHit(hitIdx+1);};
    $('#findPrev').onclick=function(){gotoHit(hitIdx-1);};
  }
  // Upau mwembamba wenye kirudisha nyuma
  var inner=$('.bible-reader-inner',rd);
  if(inner && !$('#bfBar',rd)){
    var h2=$('.bible-reader-title h2',rd);
    var bar2=document.createElement('div'); bar2.id='bfBar';
    bar2.innerHTML='<button type="button" id="bfBack" aria-label="Rudi nyuma">←</button><span id="bfTitle"></span>';
    $('#bfTitle',bar2).textContent=h2?h2.textContent:'';
    inner.insertBefore(bar2,inner.firstChild);
    $('#bfBack',bar2).onclick=function(){var c=$('#closeBibleReader',rd); if(c) c.click();};
  }
  // Kitufe cha "Sura inayofuata" mwisho wa sura
  var offl2=$('#offlineVerses',rd);
  if(offl2 && !$('#nextChapterBottom',rd)){
    var nx=$('#nextChapter',rd);
    var nb=document.createElement('button'); nb.id='nextChapterBottom'; nb.type='button';
    if(nx && !nx.disabled){ nb.textContent='Sura inayofuata →'; nb.onclick=function(){nx.click(); rd.scrollTop=0;}; }
    else { nb.textContent='Mwisho wa kitabu — rudi kwenye orodha'; nb.onclick=function(){var c=$('#closeBibleReader',rd); if(c) c.click();}; }
    offl2.parentNode.insertBefore(nb,offl2.nextSibling);
    var pv=$('#prevChapter',rd);
    if(pv && !pv.disabled){
      var pb=document.createElement('button'); pb.type='button'; pb.id='bfPrevBottom'; pb.textContent='← Sura iliyotangulia';
      pb.style.cssText='display:block;margin:0 auto;padding:11px 20px;border-radius:14px;border:0;background:#ecdac4;color:#2b1d10;font-size:14px;font-weight:700;cursor:pointer';
      pb.onclick=function(){pv.click(); rd.scrollTop=0;};
      nb.parentNode.insertBefore(pb,nb);
      nb.style.marginTop='10px';
    }
  }
  updateFloat();
}

/* ---------- Vishale vya kusogeza (floating) ---------- */
function floatBox(){
  var f=document.getElementById('readerFloat');
  if(f) return f;
  f=document.createElement('div'); f.id='readerFloat';
  f.innerHTML='<button type="button" id="rfUp" aria-label="Rudi juu">▲</button><button type="button" id="rfDown" class="next" aria-label="Sogeza mbele">▼</button>';
  document.body.appendChild(f);
  f.addEventListener('click',function(e){
    var rd=reader(); if(!rd) return;
    var b=e.target.closest('button'); if(!b) return;
    var step=Math.round(rd.clientHeight*0.82);
    if(b.id==='rfUp') rd.scrollBy({top:-step,behavior:'smooth'});
    else if(b.id==='rfDown'){
      var atEnd=rd.scrollTop+rd.clientHeight>=rd.scrollHeight-12;
      var nx=$('#nextChapter',rd);
      if(atEnd && nx && !nx.disabled){nx.click(); rd.scrollTop=0;}
      else rd.scrollBy({top:step,behavior:'smooth'});
    }
  });
  return f;
}
function updateFloat(){
  var f=floatBox(), rd=reader(), show=!!(rd&&rd.classList.contains('show'));
  f.classList.toggle('show',show);
  if(!show) return;
  var down=$('#rfDown'), up=$('#rfUp'), nx=$('#nextChapter',rd);
  var atEnd=rd.scrollTop+rd.clientHeight>=rd.scrollHeight-12, atTop=rd.scrollTop<=12;
  if(down) down.textContent=(atEnd&&nx&&!nx.disabled)?'Sura →':'▼';
  if(up) up.style.visibility=atTop?'hidden':'visible';
}
function watch(){
  var rd=reader();
  if(rd && !rd.__bfWatch){
    rd.__bfWatch=true;
    new MutationObserver(function(){enhance();}).observe(rd,{childList:true,attributes:true,attributeFilter:['class']});
    rd.addEventListener('scroll',updateFloat,{passive:true});
  }
  enhance();
}
document.addEventListener('DOMContentLoaded',function(){watch(); if(document.body) new MutationObserver(function(){watch();}).observe(document.body,{childList:true});});
setInterval(function(){if(reader()) {watch(); updateFloat();}},1500);

/* =====================================================================
   Muundo wa utafutaji wa skrini nzima + "Chagua Sura"
   - Kitufe cha ⌕ (orodha ya vitabu) kinafungua skrini ya kutafuta: kitabu, kifungu, au neno
   - Kitufe cha ≡ (ndani ya sura) kinafungua "Chagua Sura" (gridi ya sura zote za kitabu)
   ===================================================================== */
{
var st=document.createElement('style'); st.id='bible-ui-style';
st.textContent=
'#bsOverlay{position:fixed;inset:0;z-index:3000;display:none;flex-direction:column;background:var(--paper,#f0e4d4)}'+
'#bsOverlay.open{display:flex}'+
'#bsTop{display:flex;align-items:center;gap:10px;padding:max(14px,env(safe-area-inset-top)) 14px 12px;background:#cdbdad}'+
'#bsBack{flex:none;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.55);font-size:22px;color:#4b3621;cursor:pointer}'+
'#bsInput{flex:1;min-width:0;height:48px;border:0;border-radius:24px;padding:0 18px;font-size:17px;background:#f0e4d4;color:#3a2a1a;outline:0;text-align:left}'+
'#bsList{flex:1;overflow:auto;padding:12px 14px 90px;-webkit-overflow-scrolling:touch}'+
'#bsList .bsn{font-size:12.5px;color:#7a6650;padding:2px 4px 10px}'+
'#bsList .bsh{font-size:12px;font-weight:800;letter-spacing:.06em;color:#7a6650;padding:8px 4px 6px;text-transform:uppercase}'+
'#bsList .bsi{display:block;width:100%;text-align:left;border:0;background:#ddd0c0;border-radius:18px;padding:13px 16px;margin:0 0 9px;font-size:16px;color:#3a2a1a;cursor:pointer}'+
'#bsList .bsi b{display:block;font-size:14px;color:#6b4a2a;margin-bottom:2px}'+
'#bsList .bsi span{font-size:14px;line-height:1.5}'+
'#bsList .bsi mark{background:rgba(212,160,23,.5);color:inherit;border-radius:3px;padding:0 1px}'+
'#chapFab{position:fixed;right:25px;bottom:82px;width:64px;height:64px;border:0;border-radius:24px;background:#a07850;color:#fff;font-size:34px;line-height:1;box-shadow:0 5px 14px rgba(70,48,28,.3);z-index:1650;cursor:pointer;display:none}'+
'#chapFab.show{display:block}'+
'#readerFloat{display:none!important}'+
'#bibleReader .bible-reader-top,#bibleReader .reader-actions,#bibleReader #findBar{display:none!important}'+
'#bfBar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:max(10px,env(safe-area-inset-top)) 14px 10px;background:var(--paper,#fdfbff);border-bottom:1px solid var(--line,#e3dcee)}'+
'#bfBack{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:#ecdac4;color:#2b1d10;font-size:24px;cursor:pointer}'+
'#bfTitle{font-size:20px;font-weight:800;color:var(--olive,#4b2a7a)}'+
'#bfNav{display:flex;gap:10px;justify-content:center;margin:6px 16px 0}'+
'#bfNav button{flex:1;padding:12px;border:0;border-radius:14px;background:#ecdac4;color:#2b1d10;font-size:15px;font-weight:700;cursor:pointer}'+
'#chapDlg{position:fixed;inset:0;z-index:3100;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45)}'+
'#chapDlg.open{display:flex}'+
'#chapBox{width:min(92vw,420px);max-height:78vh;overflow:auto;background:#f0e4d4;border-radius:30px;padding:22px 16px 26px;box-shadow:0 10px 40px rgba(0,0,0,.35)}'+
'#chapBox h3{margin:0 0 14px 8px;font-size:26px;color:#2b1d10}'+
'#chapGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}'+
'#chapGrid button{height:46px;border:0;border-radius:14px;background:#ecdac4;font-size:19px;color:#2b1d10;cursor:pointer}'+
'#chapGrid button.cur{background:#a07850;color:#fff;font-weight:800}';
document.head.appendChild(st);

var ov=document.createElement('div'); ov.id='bsOverlay';
ov.innerHTML='<div id="bsTop"><button type="button" id="bsBack" aria-label="Rudi">←</button><input id="bsInput" type="search" inputmode="search" autocomplete="off" placeholder="Tafuta kitabu, kifungu au neno"></div><div id="bsList"></div>';
var dlg=document.createElement('div'); dlg.id='chapDlg';
dlg.innerHTML='<div id="chapBox"><h3>Chagua Sura</h3><div id="chapGrid"></div></div>';
var fab=document.createElement('button'); fab.id='chapFab'; fab.type='button'; fab.setAttribute('aria-label','Chagua sura'); fab.textContent='≡';
function mount(){document.body.appendChild(ov);document.body.appendChild(dlg);document.body.appendChild(fab);}
if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);

var inp=function(){return document.getElementById('bsInput');}, list=function(){return document.getElementById('bsList');};
function openBookCard(b,ch,v){
  closeSearch();
  if(typeof window.mjueYesuOpenBible==='function') window.mjueYesuOpenBible(b.name,b.code,ch||1,v||'');
}
function render(q){
  q=String(q||'').trim(); var h='', bs=books(), L=list();
  if(!q){
    h='<div class="bsh">Vitabu vyote</div>';
    for(var i=0;i<bs.length;i++) h+='<button type="button" class="bsi" data-bk="'+i+'">'+esc(bs[i].name)+'</button>';
    L.innerHTML=h; L._bs=bs; return;
  }
  var nq=norm(q), r=parseRef(q), shown=[];
  if(r){
    var lb=r.book.name+' '+r.ch+(r.v1?':'+r.v1+(r.v2&&r.v2!==r.v1?'-'+r.v2:''):'');
    h+='<button type="button" class="bsi" data-ref="1"><b>📖 Fungua</b>'+esc(lb)+'</button>';
  }
  var bm=[]; for(var j=0;j<bs.length;j++){ if(norm(bs[j].name).indexOf(nq)>=0) bm.push(j); }
  if(bm.length){ h+='<div class="bsh">Vitabu</div>'; for(var k=0;k<bm.length;k++) h+='<button type="button" class="bsi" data-bk="'+bm[k]+'">'+esc(bs[bm[k]].name)+'</button>'; }
  if(!/^\d/.test(q) && !r && !bm.length && nq.length>=MIN_WORD){
    var res=searchAll(q);
    h+='<div class="bsh">Aya zenye "'+esc(q)+'"</div><div class="bsn">Jumla: <b>'+res.total+'</b>'+(res.total>MAX_LIST?' (zinaonyeshwa '+MAX_LIST+' za kwanza)':'')+'</div>';
    for(var x=0;x<res.list.length;x++){var o=res.list[x]; shown.push(o);
      h+='<button type="button" class="bsi" data-v="'+x+'"><b>'+esc(o.b.name)+' '+o.ch+':'+o.v+'</b><span>'+snippet(o.t,q)+'</span></button>';}
  } else if(!r && !bm.length){
    h+='<div class="bsn">Hakuna kilichopatikana. Andika jina la kitabu (Yohana), kifungu (Yohana 3:16) au neno (upendo).</div>';
  }
  L.innerHTML=h; L._bs=bs; L._ref=r; L._shown=shown;
}
function openSearch(){ ov.classList.add('open'); inp().value=''; render(''); setTimeout(function(){inp().focus();},60); }
function closeSearch(){ ov.classList.remove('open'); try{inp().blur();}catch(e){} }
document.addEventListener('click',function(e){
  var t=e.target;
  if(t.closest && t.closest('#bibleSearchFab')){ e.preventDefault(); e.stopImmediatePropagation(); openSearch(); return; }
  if(t.closest && t.closest('#bsBack')){ closeSearch(); return; }
  var it=t.closest&&t.closest('#bsList .bsi'); 
  if(it){
    var L=list();
    if(it.hasAttribute('data-bk')) openBookCard(L._bs[+it.getAttribute('data-bk')],1);
    else if(it.hasAttribute('data-ref')) { var r=L._ref; closeSearch(); openRef(r); }
    else if(it.hasAttribute('data-v')) { var o=L._shown[+it.getAttribute('data-v')]; closeSearch(); if(typeof window.openPassageFromLesson==='function') window.openPassageFromLesson(o.b.code,o.ch,o.v); }
    return;
  }
  if(t.closest && t.closest('#chapFab')){ openChap(); return; }
  if(t===dlg){ dlg.classList.remove('open'); return; }
  var cb=t.closest&&t.closest('#chapGrid button');
  if(cb){ dlg.classList.remove('open'); var bk=curBook(); if(bk&&typeof window.mjueYesuOpenBible==='function') window.mjueYesuOpenBible(bk.name,bk.code,+cb.textContent); }
},true);
document.addEventListener('input',function(e){ if(e.target&&e.target.id==='bsInput'){var v=e.target.value; clearTimeout(e.target._t); e.target._t=setTimeout(function(){render(v);},200);} },true);
document.addEventListener('keydown',function(e){
  if(e.target&&e.target.id==='bsInput'&&e.key==='Enter'){ e.preventDefault(); var L=list(); var f=L.querySelector('.bsi'); if(f) f.click(); }
  if(e.key==='Escape'){ closeSearch(); dlg.classList.remove('open'); }
},true);

function curBook(){
  var h=document.querySelector('#bibleReader .bible-reader-title h2'); if(!h) return null;
  var t=h.textContent.trim().replace(/\s*\d+(:\d+)?$/,''), n=norm(t), bs=books();
  for(var i=0;i<bs.length;i++) if(norm(bs[i].name)===n) return bs[i];
  return null;
}
function curCh(){var h=document.querySelector('#bibleReader .bible-reader-title h2'); var m=h&&h.textContent.match(/(\d+)(?::\d+)?\s*$/); return m?+m[1]:0;}
function openChap(){
  var bk=curBook(); if(!bk) return;
  var c=curCh(), g=document.getElementById('chapGrid'), h='';
  for(var i=1;i<=bk.ch;i++) h+='<button type="button"'+(i===c?' class="cur"':'')+'>'+i+'</button>';
  g.innerHTML=h; dlg.classList.add('open');
}
setInterval(function(){
  var rd=reader(), show=!!(rd&&rd.classList.contains('show'));
  fab.classList.toggle('show',show&&!ov.classList.contains('open'));
},400);
}
})();

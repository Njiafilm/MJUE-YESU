/* =====================================================================
   MJUE YESU — Admin: ongeza / hariri robo za masomo (bila kujenga APK upya)
   Usimamizi wa App -> "Robo za Masomo". Inahifadhi blob 'quarters' (Firestore),
   na kila app huipakua na kuiongeza kwenye kichaguzi cha robo na orodha ya masomo.
   ===================================================================== */
(function(){
'use strict';
function M(){return window.MJUE_CLOUD||null;}
function Q(){return window.MJUE_Q||null;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var IN='width:100%;margin:4px 0;padding:10px;border-radius:10px;border:1px solid #ccc;box-sizing:border-box;font-size:15px';

function optionsHtml(sel){
  var q=Q(), top=Math.max(q.maxIndex(),q.curIndex())+4, h='';
  for(var k=2;k<=top;k++){
    var x=q.quarter(k);
    h+='<option value="'+k+'"'+(k===sel?' selected':'')+'>'+esc(x.label)+' · '+esc(q.dateRange(x.start).split(' – ')[0])+(x.hasData?(x.draft?' 📝 RASIMU · ':' ✓ ')+esc(x.title):' (tupu)')+'</option>';
  }
  return h;
}
function linesFor(k){
  var q=Q().quarter(k), out=[];
  for(var n=1;n<=13;n++){
    var m=q.memory[n];
    out.push([q.titles[n]||'', (q.en_titles&&q.en_titles[n])||'', m?m.ref:'', (q.rt&&q.rt[n])||(Q().readLabels?Q().readLabels(q,n):''), ((q.days&&q.days[n])||[]).join(' // ')].join(' | '));
  }
  return out.join('\n');
}
function fill(k){
  var q=Q().quarter(k);
  document.getElementById('qaTitle').value=q.hasData?q.title:'';
  document.getElementById('qaEn').value=q.hasData?(q.en||''):'';
  document.getElementById('qaLines').value=q.hasData?linesFor(k):'';
  document.getElementById('qaPubChk').checked=q.hasData?!q.draft:false;
  document.getElementById('qaState').textContent=q.hasData?(q.draft?'Hali: 📝 RASIMU — watumiaji hawaioni, wewe tu (admin) unaiona.':'Hali: ✅ IMECHAPISHWA — watumiaji wote wanaiona.'):'Hali: robo hii bado haina masomo.';
  var d=[]; for(var n=1;n<=13;n++) d.push(n+': '+q.dates[n]);
  document.getElementById('qaDates').textContent='Tarehe za masomo (zinapatikana kiotomatiki): '+d.slice(0,3).join(' · ')+' … '+d[12]+'.';
}
function refreshOptions(k){ var sel=document.getElementById('qaSel'); if(sel) sel.innerHTML=optionsHtml(k); }
function parse(text){
  var rows=String(text||'').split(/\r?\n/).map(function(l){return l.trim();}).filter(function(l){return l;}), L=[];
  for(var i=0;i<rows.length&&i<13;i++){
    var p=rows[i].split('|').map(function(x){return x.trim();});
    var dd=(p[4]||'').split('//').map(function(x){return x.trim();}).filter(function(x){return x;});
    L.push({t:p[0]||'',en:p[1]||'',m:p[2]||'',r:p[3]||'',d:dd,mt:p[5]||''});
  }
  return L;
}
async function currentBlob(m){
  var t=null;
  try{ t=await m.readLatest('quarters'); }catch(e){ t=m.getBlobText&&m.getBlobText('quarters'); }
  try{ var o=t?JSON.parse(t):{}; if(!o.q) o.q={}; o.v=1; return o; }catch(e){ return {v:1,q:{}}; }
}
function section(){
  var body=document.getElementById('cmsBody'), m=M();
  if(!body||!m||!m.isAdmin||!m.isAdmin()||!Q()||!body.querySelector('.cms-tabs')||document.getElementById('qaAdmin')) return;
  var q=Q(), start=Math.min(Math.max(q.curIndex()+1,2),q.maxIndex()+1);
  var d=document.createElement('div'); d.id='qaAdmin'; d.className='cms-sec';
  d.innerHTML='<h3>📚 Robo za Masomo</h3>'+
   '<p class="hint">Ongeza robo mpya (mfano Q2 2027) au hariri iliyopo. Robo ikihifadhiwa, itaonekana kwenye kichaguzi cha "Chagua robo ya kujifunza", kwenye orodha ya masomo, na mafungu ya kukariri (Zaidi) kwa watumiaji wote. Tarehe zinahesabiwa zenyewe.</p>'+
   '<select id="qaSel" style="'+IN+'">'+optionsHtml(start)+'</select>'+
   '<input id="qaTitle" placeholder="Jina la robo (Kiswahili) mf. Unabii Mkuu" style="'+IN+'">'+
   '<input id="qaEn" placeholder="Jina la robo (Kiingereza) — hiari" style="'+IN+'">'+
   '<div id="qaDates" class="hint"></div>'+
   '<label class="hint" style="display:block;margin-top:6px"><b>Masomo (mstari mmoja kwa somo, hadi 13).</b> Muundo (tumia <code>|</code> kutenganisha):<br><code>Kichwa cha somo | English title | Fungu la kukariri | Mafungu ya kusoma | Vichwa vya siku 5 (Jumapili–Alhamisi) vikitenganishwa na //</code><br>Mfano: <code>Mwana wa Adamu | The Son of Man | Danieli 7:10 | Mwanzo 3:8–19; Danieli 7:10, 22 | Kichwa cha Jumapili // Jumatatu // Jumanne // Jumatano // Alhamisi</code><br>Sehemu ya 4 na 5 ni hiari. Maandishi ya fungu la kukariri yanatafutwa kwenye Biblia ya Neno kiotomatiki (hiari: sehemu ya 6 = maandishi yako).</label>'+
   '<textarea id="qaLines" rows="14" placeholder="Kichwa cha somo 1 | English title | Danieli 2:28 | Danieli 2:28; Mathayo 24:15" style="'+IN+';font-family:monospace;font-size:13px"></textarea>'+
   '<div id="qaState" class="hint" style="font-weight:700"></div>'+
   '<label style="display:flex;gap:10px;align-items:center;margin:10px 0;font-size:15px"><input type="checkbox" id="qaPubChk" style="width:22px;height:22px"> <span><b>Chapisha kwa watumiaji wote</b><br><small>Usipoweka tiki, robo huhifadhiwa kama <b>rasimu</b>: wewe tu (admin) unaiona na unaweza kuiandaa taratibu.</small></span></label>'+
   '<div class="row"><button type="button" class="btn-a" id="qaSave">Hifadhi robo hii</button> <button type="button" class="btn-a btn-sec" id="qaFlip">Chapisha / Rudisha rasimu</button> <button type="button" class="btn-a btn-sec" id="qaDel">Rudisha ya awali</button></div>'+
   '<div id="qaMsg" class="hint"></div>';
  body.appendChild(d);
  var $=function(i){return document.getElementById(i);}, msg=function(t){$('qaMsg').textContent=t;};
  $('qaSel').onchange=function(){fill(+this.value);};
  fill(+$('qaSel').value);
  $('qaSave').onclick=async function(){
    var k=+$('qaSel').value, title=$('qaTitle').value.trim(), L=parse($('qaLines').value);
    if(!title){ msg('❌ Weka jina la robo.'); return; }
    if(!L.length){ msg('❌ Weka angalau somo moja.'); return; }
    var api=window.MJUE_BIBLE_API, bad=[];
    L.forEach(function(l,i){ if(l.m && api && api.ready()){ var r=api.resolve(l.m); if(!r||!r.text) bad.push((i+1)+': '+l.m); } });
    try{
      msg('⏳ Inatuma…');
      var o=await currentBlob(M());
      o.q[k]={title:title,en:$('qaEn').value.trim(),lessons:L,pub:!!$('qaPubChk').checked};
      await M().putBlob('quarters',JSON.stringify(o));
      msg((o.q[k].pub?'✅ Imehifadhiwa na IMECHAPISHWA kwa watumiaji wote (':'📝 Imehifadhiwa kama RASIMU — watumiaji hawaioni (')+L.length+' masomo).'+(bad.length?' ⚠ Fungu la kukariri halikupatikana kwenye Biblia kwa somo: '+bad.join(', ')+' (angalia jina la kitabu/sura/aya).':''));
      if(q.refresh) q.refresh(); refreshOptions(k);
    }catch(e){ msg('❌ '+(e.message||e)); }
  };
  $('qaFlip').onclick=async function(){
    var k=+$('qaSel').value;
    try{
      var o=await currentBlob(M());
      if(!o.q[k]){ msg('❌ Hifadhi robo kwanza.'); return; }
      o.q[k].pub=!(o.q[k].pub!==false);
      msg('⏳…'); await M().putBlob('quarters',JSON.stringify(o));
      msg(o.q[k].pub?'✅ Robo imechapishwa kwa watumiaji wote.':'📝 Robo imerudishwa kuwa rasimu.');
      if(q.refresh) q.refresh(); refreshOptions(k); fill(k);
    }catch(e){ msg('❌ '+(e.message||e)); }
  };
  $('qaDel').onclick=async function(){
    var k=+$('qaSel').value;
    try{
      msg('⏳…'); var o=await currentBlob(M()); delete o.q[k];
      if(Object.keys(o.q).length) await M().putBlob('quarters',JSON.stringify(o)); else if(M().hasBlob('quarters')) await M().delBlob('quarters');
      msg('✅ Mabadiliko ya robo hii yameondolewa.'); fill(k); if(q.refresh) q.refresh();
    }catch(e){ msg('❌ '+(e.message||e)); }
  };
}
document.addEventListener('DOMContentLoaded',function(){
  new MutationObserver(section).observe(document.body,{childList:true,subtree:true});
});
})();

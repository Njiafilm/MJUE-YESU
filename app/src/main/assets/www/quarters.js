/* =====================================================================
   MJUE YESU — Mfumo wa robo (quarters.js)
   - Data ya robo: Q3 2026, Q4 2026, Q1 2027 (na kuendelea)
   - Robo ya sasa hupatikana kwa tarehe (otomatiki): wiki 13 kwa robo, kila robo huanza Sabato
   - Orodha ya robo (Lesoni), mafungu 13 ya kukariri (Zaidi), Neno la Leo na kikumbusho cha kila siku
   KUONGEZA ROBO MPYA: ongeza kipengele kwenye DATA hapa chini (angalia "Q1 2027" kama mfano).
   ===================================================================== */
(function(){
'use strict';

var MS=['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ago','Sept','Okt','Nov','Des'];
var MFULL=['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Septemba','Oktoba','Novemba','Desemba'];
var DAYS=['Sabato Mchana','Jumapili','Jumatatu','Jumanne','Jumatano','Alhamisi','Ijumaa'];

function pad(n){return n<10?'0'+n:''+n;}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function parseISO(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate());}
function diffDays(a,b){return Math.round((a-b)/86400000);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function range(s){
  var e=addDays(s,6);
  return s.getMonth()===e.getMonth()
    ? MS[s.getMonth()]+' '+s.getDate()+' – '+e.getDate()
    : MS[s.getMonth()]+' '+s.getDate()+' – '+MS[e.getMonth()]+' '+e.getDate();
}
function shortDate(d){return MS[d.getMonth()]+' '+d.getDate();}
function ssGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function ssSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function toast(t){try{if(window.MJUE_GC&&window.MJUE_GC.toast){window.MJUE_GC.toast(t);return;}}catch(e){} }

/* ------------------------------------------------------------------
   MSINGI: Lesoni 1 ya Q3 2026 ilianza Sabato, Juni 27, 2026.
   Kila robo = wiki 13 (siku 91) mfululizo. Robo n huanza FIRST + 91*n.
   ------------------------------------------------------------------ */
var FIRST=new Date(2026,5,27);
var QDAYS=91;
function qStart(k){return addDays(FIRST,QDAYS*k);}
function qLabel(start){var m=addDays(start,7);return 'Q'+(Math.floor(m.getMonth()/3)+1)+' '+m.getFullYear();}
function qSpan(start){var a=addDays(start,7),b=addDays(start,7+84);return (MFULL[a.getMonth()]+' – '+MFULL[b.getMonth()]).toUpperCase();}

/* ------------------------------------------------------------------
   DATA YA ROBO (kielezo = nambari ya robo tangu Q3 2026: 0=Q3 2026, 1=Q4 2026, 2=Q1 2027, 3=Q2 2027 ...)
   ------------------------------------------------------------------ */
var DATA={};

DATA[0]={legacy:'q3',key:'q3',title:'1 & 2 Wakorintho',en:'1 & 2 Corinthians',
  titles:{1:'Huduma ya Paulo huko Korintho',2:'Ujumbe wa Msalaba',3:'Umoja katika Kristo',4:'Dhambi ndani ya Kanisa',5:'Yote kwa Utukufu wa Mungu',6:'Karama za Roho',7:'Picha ya Upendo',8:'Nguvu ya Ufufuo wa Kristo',9:'Huduma inayoendeshwa na Upendo',10:'Huduma ya Kikristo ya Kweli',11:'Ustewadi na Misheni',12:'Kushughulika na Walimu wa Uongo',13:'Neema, Upendo na Ushirika'},
  memory:{}};

DATA[1]={legacy:'q4',key:'q4',title:'Zawadi ya Unabii',en:'The Gift of Prophecy',titles:null,memory:null}; // inajazwa na index.html (setLegacyQ4)

/* Q1 2027 — "Great Apocalyptic Prophecies" (GC SDA Adult Bible Study Guide) */
DATA[2]={key:'q1-27',title:'Unabii Mkuu wa Kiapokaliptiki',en:'Great Apocalyptic Prophecies',
  titles:{
    1:'Kufasiri Unabii wa Kiapokaliptiki',
    2:'Danieli 2 na 7: Misingi ya Unabii wa Kiapokaliptiki',
    3:'Mwana wa Adamu na Hukumu ya Mwisho',
    4:'Danieli 8: Mkuu wa Jeshi la Mbinguni',
    5:'Danieli 9: Kuja kwa Masihi',
    6:'Siku ya Upatanisho ya Mwisho wa Nyakati',
    7:'Mathayo 24: Mahubiri ya Yesu kuhusu Unabii',
    8:'Mtoto, Kanisa na Joka: Ufunuo 12',
    9:'Silaha za Joka Dhidi ya Masalio, Sehemu ya 1: Mnyama kutoka Baharini',
    10:'Silaha za Joka Dhidi ya Masalio, Sehemu ya 2: Mnyama kutoka Nchi Kavu',
    11:'Jumbe za Malaika Watatu: Ufunuo 14:1–12',
    12:'Kilele cha Matarajio ya Kiapokaliptiki: Tumaini lenye Baraka',
    13:'Kujiandaa kwa Kilele cha Mwisho'},
  en_titles:{1:'Interpreting Apocalyptic Prophecies',2:"Daniel 2 and 7: The ABC's of Apocalyptic Prophecies",3:'The Son of Man and the Final Judgment',4:'Daniel 8: The Prince of the Heavenly Host',5:'Daniel 9: The Coming of the Messiah',6:'The Eschatological Day of Atonement',7:"Matthew 24: Jesus' Sermon on Apocalyptic Prophecy",8:'The Child, the Church and the Dragon: Revelation 12',9:'Instruments of the Dragon Against the Remnant, Part 1: The Beast From the Sea',10:'Instruments of the Dragon Against the Remnant, Part 2: The Beast From the Earth',11:"The Three Angels' Messages: Revelation 14:1–12",12:'The Climax of Apocalyptic Expectation: The Blessed Hope',13:'Preparing for the Apocalyptic Consummation'},
  /* Mafungu ya kukariri: kutoka toleo la GC la "Great Apocalyptic Prophecies" (2002, Sabbath School Net).
     Maandishi ya Kiswahili ni ya Biblia ya Neno ndani ya app. THIBITISHA na kitabu rasmi cha Q1 2027 kikichapishwa. */
  memory:{
 "1": {
  "ref": "Danieli 2:28",
  "pass": "DAN|2|28",
  "text": "lakini yuko Mungu mbinguni afunuaye siri."
 },
 "2": {
  "ref": "Danieli 7:27",
  "pass": "DAN|7|27",
  "text": "Ndipo ufalme, mamlaka na ukuu wa falme chini ya mbingu yote utakabidhiwa kwa watakatifu, watu wa Yeye Aliye Juu Sana. Ufalme wake utakuwa ufalme wa milele, nao watawala wote watamwabudu na kumtii yeye."
 },
 "3": {
  "ref": "Danieli 7:10",
  "pass": "DAN|7|10",
  "text": "Mto wa moto ulikuwa unatiririka, ukipita mbele yake. Maelfu elfu wakamhudumia; kumi elfu mara kumi elfu wakasimama mbele zake. Mahakama ikakaa kuhukumu, na vitabu vikafunguliwa."
 },
 "4": {
  "ref": "Danieli 8:17",
  "pass": "DAN|8|17",
  "text": "Alipokuwa akikaribia pale nilipokuwa nimesimama, niliogopa, nikaanguka kifudifudi. Akaniambia, “Mwana wa mwanadamu, fahamu kuwa maono haya yanahusu siku za mwisho.”"
 },
 "5": {
  "ref": "Isaya 53:5",
  "pass": "ISA|53|5",
  "text": "Lakini alitobolewa kwa ajili ya makosa yetu, alichubuliwa kwa ajili ya maovu yetu; adhabu iliyotuletea sisi amani ilikuwa juu yake, na kwa majeraha yake sisi tumepona."
 },
 "6": {
  "ref": "Waebrania 9:23",
  "pass": "HEB|9|23",
  "text": "Kwa hiyo, ilikuwa muhimu kwa nakala za vitu vile vya mbinguni vitakaswe kwa dhabihu hizi, lakini vitu halisi vya mbinguni vilihitaji dhabihu bora kuliko hizi."
 },
 "7": {
  "ref": "Mathayo 24:30",
  "pass": "MAT|24|30",
  "text": "Ndipo itakapotokea ishara ya Mwana wa Adamu angani, na makabila yote ya dunia yataomboleza. Nao watamwona Mwana wa Adamu akija juu ya mawingu ya angani, katika uwezo na utukufu mkuu."
 },
 "8": {
  "ref": "Ufunuo 12:11-12",
  "pass": "REV|12|11",
  "text": "Nao wakamshinda kwa damu ya Mwana-Kondoo na kwa neno la ushuhuda wao. Wala wao hawakuyapenda maisha yao hata kufa. Kwa hiyo, furahini ninyi mbingu na wote wakaao humo! Lakini ole wenu nchi na bahari, kwa maana huyo ibilisi ameshuka kwenu, akiwa amejaa ghadhabu, kwa sababu anajua ya kuwa muda wake ni mfupi!"
 },
 "9": {
  "ref": "Ufunuo 13:10",
  "pass": "REV|13|10",
  "text": "Ikiwa mtu ni wa kuchukuliwa mateka, atachukuliwa mateka. Ikiwa mtu ni wa kuuawa kwa upanga, atauawa kwa upanga. Hapa ndipo penye wito wa subira na imani ya watakatifu."
 },
 "10": {
  "ref": "Ufunuo 14:1",
  "pass": "REV|14|1",
  "text": "Kisha nikatazama na hapo mbele yangu alikuwepo Mwana-Kondoo, akiwa amesimama juu ya Mlima Sayuni. Pamoja naye walikuwa wale 144,000 wenye Jina la Mwana-Kondoo na Jina la Baba yake likiwa limeandikwa kwenye vipaji vya nyuso zao."
 },
 "11": {
  "ref": "Ufunuo 14:7",
  "pass": "REV|14|7",
  "text": "Akasema kwa sauti kubwa, “Mcheni Mungu na kumpa utukufu, kwa maana saa ya hukumu yake imewadia. Mwabuduni yeye aliyeziumba mbingu, dunia, bahari na chemchemi za maji.”"
 },
 "12": {
  "ref": "Ufunuo 22:20-21",
  "pass": "REV|22|20",
  "text": "Yeye anayeshuhudia mambo haya asema, “Hakika, naja upesi!” Amen. Njoo, Bwana Yesu. Neema ya Bwana Yesu iwe na watakatifu wote. Amen."
 },
 "13": {
  "ref": "Waefeso 2:17, 19",
  "pass": "EPH|2|17",
  "text": "Alikuja na kuhubiri amani kwenu ninyi mliokuwa mbali na pia akahubiri amani kwao waliokuwa karibu. Hivyo basi, ninyi sasa si wageni tena wala wapitaji, bali mmekuwa wenyeji pamoja na watakatifu na pia jamaa wa nyumbani mwake Mungu."
 }
},
  /* Mafungu makuu ya kusoma kwa juma: [kodi, sura, fungu la kwanza, jina] */
  reads:{
    2:[['DAN',2,1,'Danieli 2'],['DAN',7,1,'Danieli 7']],
    3:[['DAN',7,9,'Danieli 7:9-14']],
    4:[['DAN',8,1,'Danieli 8']],
    5:[['DAN',9,1,'Danieli 9']],
    6:[['HEB',9,1,'Waebrania 9']],
    7:[['MAT',24,1,'Mathayo 24']],
    8:[['REV',12,1,'Ufunuo 12']],
    9:[['REV',13,1,'Ufunuo 13:1-10']],
    10:[['REV',13,11,'Ufunuo 13:11-18']],
    11:[['REV',14,1,'Ufunuo 14:1-12']]
  }};

/* Mafungu ya "Somo la Juma Hili" (kusoma kwa juma) — Q1 2027. Yanageuzwa kuwa viungo vya Biblia kiotomatiki.
   Chanzo: toleo la GC (2002) la "Great Apocalyptic Prophecies". THIBITISHA na kitabu rasmi cha 2027. */
DATA[2].rt={
 1:'Danieli 2:28; Danieli 7:15–18; Mathayo 24:15, 16; Luka 24:27; 2 Wathesalonike 2:3–8',
 2:'Danieli 2; Danieli 7',
 3:'Mwanzo 3:8–19; Zaburi 95:5, 10; Danieli 7:10, 22; Yohana 5:24, 25; Warumi 14:10; 2 Wakorintho 5:10; Waebrania 9:24; Ufunuo 20:12, 13',
 4:'Danieli 8',
 5:'Ezra 7; Danieli 9; Waebrania 10:8–10',
 6:'Kutoka 25:8; Walawi 16; Danieli 7:9–11, 13, 14; Danieli 8:14; Danieli 9:24; Warumi 8:34; Waebrania 7:25',
 7:'Mathayo 24; Mathayo 25',
 8:'Ufunuo 12',
 9:'Ufunuo 13:1–10',
 10:'Ufunuo 13:11–18',
 11:'Ufunuo 14:1–12',
 12:'Isaya 35; Mathayo 24:30; Yohana 14:1–3; Matendo 1:10, 11; 1 Wakorintho 15:51–57; 1 Wathesalonike 4:15–17; Ufunuo 21:1–7',
 13:'Mwanzo 5:18–24; Isaya 53:5, 6; Matendo 2:38; 2 Wakorintho 5:18–21; 1 Yohana 1:9; 1 Yohana 2:1, 2'
};

/* ------------------------------------------------------------------
   ROBO ZA CLOUD (admin): blob 'quarters' = {v:1,q:{"<kielezo cha robo>":{title,en,lessons:[{t,en,m,mt,r}]}}}
     t=kichwa cha somo, en=kichwa cha Kiingereza, m=rejea ya fungu la kukariri, mt=maandishi (hiari; yakikosekana
     yanatafutwa kwenye Biblia ya app), r=mafungu ya kusoma ya juma. Zinaongezwa/kubadilisha DATA bila kujenga APK upya.
   ------------------------------------------------------------------ */
var CLOUD={}, cloudSig=null, cloudChanged=false;
function qKeyFor(k){var l=qLabel(qStart(k)).split(' '); return l[0].toLowerCase()+'-'+String(l[1]).slice(2);}
function hasKeys(o){if(!o)return false; for(var x in o){if(o.hasOwnProperty(x)) return true;} return false;}
function copyObj(o){var r={}; if(o){for(var x in o){if(o.hasOwnProperty(x)) r[x]=o[x];}} return r;}
function bibleReady(){try{var a=window.MJUE_BIBLE_API; return !!(a&&a.ready&&a.ready());}catch(e){return false;}}
function cloudLoad(){
  var t=''; try{var m=window.MJUE_CLOUD; t=(m&&m.getBlobText&&m.getBlobText('quarters'))||'';}catch(e){}
  var sig=t+'|'+(bibleReady()?1:0);
  if(sig===cloudSig) return;
  cloudSig=sig; cloudChanged=true; CLOUD={};
  if(t){try{var o=JSON.parse(t), qs=(o&&o.q)||{}; for(var k in qs){if(qs.hasOwnProperty(k)&&+k>=2) CLOUD[+k]=qs[k];}}catch(e){}}
}
function resolveMem(ref,txt){
  var a=window.MJUE_BIBLE_API, r=null;
  try{r=a&&a.resolve?a.resolve(ref):null;}catch(e){}
  if(r) return {ref:r.ref,pass:r.pass,text:txt||r.text};
  return {ref:ref,pass:'',text:txt||''};
}
function dataOf(k){
  cloudLoad();
  var d=DATA[k], c=CLOUD[k];
  if(d&&d.legacy) return d;
  if(!c) return (d&&hasKeys(d.titles))?d:(d||null);
  var o=copyObj(d); o.titles=copyObj(d&&d.titles); o.en_titles=copyObj(d&&d.en_titles); o.memory=copyObj(d&&d.memory); o.rt=copyObj(d&&d.rt);
  o.key=(d&&d.key)||qKeyFor(k);
  if(c.title) o.title=c.title; if(c.en) o.en=c.en;
  var L=c.lessons||[];
  for(var i=0;i<L.length&&i<13;i++){
    var n=i+1,l=L[i]||{};
    if(l.t) o.titles[n]=l.t; if(l.en) o.en_titles[n]=l.en; if(l.r) o.rt[n]=l.r;
    if(l.m) o.memory[n]=resolveMem(l.m,l.mt);
  }
  if(!o.title) o.title='Robo mpya';
  return o;
}

/* ------------------------------------------------------------------ */
var legacyQ4=null;
function setLegacyQ4(o){legacyQ4=o;}

function quarter(k){
  var d=dataOf(k), start=qStart(k), has=!!d&&(!!d.legacy||hasKeys(d.titles));
  var q={k:k,start:start,end:addDays(start,90),label:qLabel(start),span:qSpan(start),hasData:has,legacy:null,key:'qx'+k,
         title:'',en:'',titles:{},memory:{},reads:{},en_titles:{},rt:{}};
  if(has){
    q.legacy=d.legacy||null; q.key=d.key; q.title=d.title; q.en=d.en||''; q.reads=d.reads||{}; q.en_titles=d.en_titles||{}; q.rt=d.rt||{};
    q.titles=d.titles||{}; q.memory=d.memory||{};
    if(d.legacy==='q4' && legacyQ4){q.titles=legacyQ4.titles; q.memory=legacyQ4.memory;}
  }
  q.dates={}; for(var n=1;n<=13;n++) q.dates[n]=range(addDays(start,7*(n-1)));
  if(d && d.legacy==='q4' && legacyQ4 && legacyQ4.dates) q.dates=legacyQ4.dates;
  return q;
}
function isPast(q){return q.end<today();}
function curIndex(){var k=Math.floor(diffDays(today(),FIRST)/QDAYS); return k<0?0:k;}
function maxDataIndex(){cloudLoad(); var m=0,k; for(k in DATA){if(DATA.hasOwnProperty(k)&&+k>m)m=+k;} for(k in CLOUD){if(CLOUD.hasOwnProperty(k)&&hasKeys((dataOf(+k)||{}).titles)&&+k>m)m=+k;} return m;}

/* Robo ya sasa (kwa tarehe). Ikiwa robo ya tarehe hiyo bado haina data, inarudisha robo ya mwisho yenye data (stale=true). */
function active(){
  var k=curIndex(), q=quarter(k);
  if(q.hasData) return q;
  for(var j=Math.min(k,maxDataIndex());j>=0;j--){var qq=quarter(j); if(qq.hasData){qq.stale=true; return qq;}}
  return quarter(0);
}
/* Orodha ya robo kwa kichaguzi: mpya juu. Inajumuisha robo ijayo yenye data, na robo ya sasa hata isipokuwa na data. */
function list(){
  var top=Math.max(maxDataIndex(),curIndex()), out=[];
  for(var k=top;k>=0;k--){out.push(quarter(k));}
  return out;
}
function keyFor(q,n){
  if(q.legacy==='q4') return 'q4-'+n;
  if(q.legacy==='q3') return String(n);
  return q.key+'-'+n;
}
function lookup(key){
  key=String(key);
  for(var k=0;k<=maxDataIndex();k++){
    var q=quarter(k); if(!q.hasData) continue;
    var m;
    if(q.legacy==='q3'){ if(/^\d+$/.test(key)) return {q:q,n:+key}; continue; }
    m=key.match(new RegExp('^'+q.key.replace(/[-]/g,'\\-')+'-(\\d+)$'));
    if(m) return {q:q,n:+m[1]};
  }
  return null;
}
function isLegacy(key){var r=lookup(key); return !r || !!r.q.legacy;}

/* ------------------------------------------------------------------
   Kiolezo cha somo (robo zisizo za zamani: Q1 2027 na kuendelea)
   ------------------------------------------------------------------ */
function memBlock(m){
  if(!m) return '';
  return '<div class="memory-verse lesson-memory"><div class="label">FUNGU LA KUKARIRI</div>'+(m.text?'<p>“'+esc(m.text)+'”</p>':'')+'<div class="ref">'+esc(m.ref)+'</div>'+
         (m.pass?'<div class="pass-row"><button type="button" class="pass-btn lesson-bible-btn" data-pass="'+esc(m.pass)+'">📖 '+esc(m.ref)+'</button></div>':'')+'</div>';
}
function readBtns(q,n){
  var r=(q.reads&&q.reads[n])||[], h='';
  for(var i=0;i<r.length;i++) h+='<button type="button" class="pass-btn lesson-bible-btn" data-pass="'+r[i][0]+'|'+r[i][1]+'|'+r[i][2]+'">📖 '+esc(r[i][3])+'</button> ';
  return h;
}
function readLabels(q,n){
  var r=(q.reads&&q.reads[n])||[], a=[];
  for(var i=0;i<r.length;i++) a.push(r[i][3]);
  return a.join('; ');
}
var DAY_THEME=['Utangulizi wa somo','Fungu la kukariri','Mafungu makuu ya juma','Mada ya juma katika Maandiko','Kristo katikati ya unabii','Kuishi somo hili','Tafakari ya juma na azimio'];
function dayText(i,title,m){
  var ref=m?m.ref:'';
  var t=[
    'Karibu kwenye somo la juma hili: <b>'+esc(title)+'</b>. Soma mada kwa sala, kisha fungua mafungu ya Biblia yaliyoorodheshwa hapa chini.',
    m?('Soma polepole fungu la kukariri (<b>'+esc(ref)+'</b>) mara tatu, kisha jaribu kulisema bila kuangalia.'):'Soma fungu la juma hili kwa sala na tafakari.',
    'Soma mafungu makuu ya juma hili na uandike jambo moja ulilojifunza.',
    'Linganisha mafungu ya juma hili na maandiko mengine yanayohusiana na mada ya “'+esc(title)+'”.',
    'Unabii wote wa Biblia unamwelekeza Kristo. Jiulize: somo hili linamwonyeshaje Yesu kama Mwokozi na Mfalme wetu?',
    'Chagua hatua moja ya vitendo utakayochukua kutokana na somo hili wiki hii.',
    m?('Rudia fungu la kukariri (<b>'+esc(ref)+'</b>) na tafakari ujumbe wa juma zima. Andika azimio lako.'):'Rudia somo la juma na tafakari ujumbe wake. Andika azimio lako.'
  ];
  return t[i]||'';
}
function template(q,n){
  var title=q.titles[n]||('Lesoni '+n), m=q.memory[n], dates=q.dates[n];
  var s=addDays(q.start,7*(n-1));
  var rl=(q.rt&&q.rt[n])||readLabels(q,n), rb='';
  var h='<section class="lesson-cover">'+
    '<div class="lesson-day-banner"><span class="day-name">Somo la '+n+'</span><span class="day-meta">SABATO MCHANA<br>'+esc(dates)+'</span></div>'+
    '<h1 class="lesson-page-title" style="font-size:1.7rem">'+esc(title)+'</h1>'+
    (q.en_titles&&q.en_titles[n]?'<div style="font-size:12.5px;color:var(--muted);margin:2px 0 6px"><i>'+esc(q.en_titles[n])+'</i></div>':'')+
    '<p style="font-size:14px;color:var(--muted);margin:8px 0"><b>Somo la Juma Hili:</b> '+esc(rl||(m?m.ref:''))+'</p>'+
    memBlock(m)+
    '<div class="lesson-copy"><p>'+dayText(0,title,m)+'</p>'+(rb?'<div class="pass-row" style="margin-top:10px">'+rb+'</div>':'')+
    '<p class="q">*Jifunze somo la juma hili kwa maandalizi ya Sabato ijayo.</p></div></section>';
  for(var i=1;i<7;i++){
    var d=addDays(s,i);
    h+='<article class="lesson-page"><div class="lesson-day-banner"><span class="day-name">'+DAYS[i]+'</span><span class="day-meta">'+esc(shortDate(d))+'</span></div>'+
      '<h2 class="lesson-page-title">'+esc(DAY_THEME[i])+'</h2>'+
      '<div class="lesson-copy"><p>'+dayText(i,title,m)+'</p>'+
      (i===1&&m?memBlock(m):'')+
      (rb?'<div class="pass-row" style="margin-top:10px">'+rb+'</div>':'')+
      '</div></article>';
  }
  return h;
}

/* ------------------------------------------------------------------
   Kiolesura: CSS
   ------------------------------------------------------------------ */
(function css(){
  var st=document.createElement('style'); st.id='quarters-style';
  st.textContent=
  '.quarter-btn .q-now{display:inline-block;margin-left:4px;padding:1px 6px;border-radius:999px;background:var(--gold,#d4a017);color:#2b1a05;font-size:9px;font-weight:900;letter-spacing:.4px;vertical-align:1px}'+
  '.quarter-btn.q-empty{opacity:.75;border-style:dashed}'+
  '.mem-section{margin:0 0 26px}'+
  '.mem-section .mem-h{margin:6px 0 4px;font-size:19px;color:var(--brown-dark,#3a1a08)}'+
  '.mem-section .mem-sub{margin:0 0 10px;font-size:13px;color:var(--muted,#777);line-height:1.5}'+
  '.mem-card{background:var(--paper,#fff);border:1px solid var(--line,#ddd);border-radius:16px;padding:12px 14px;margin:0 0 10px}'+
  '.mem-card.cur{border-color:var(--gold,#d4a017);box-shadow:0 0 0 2px color-mix(in srgb,var(--gold,#d4a017) 45%,transparent)}'+
  '.mem-card.past{opacity:.92}'+
  '.mem-card .mem-top{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;letter-spacing:.4px;color:var(--olive,#5a3a8a)}'+
  '.mem-card .mem-top .mem-wk{flex:1}'+
  '.mem-card .mem-now{padding:2px 8px;border-radius:999px;background:var(--gold,#d4a017);color:#2b1a05;font-size:10px;font-weight:900}'+
  '.mem-card .mem-title{margin:4px 0 6px;font-weight:700;font-size:14px;color:var(--text,#222)}'+
  '.mem-card .mem-text{font-family:Georgia,serif;font-size:15px;line-height:1.55;margin:0 0 6px;color:var(--text,#222)}'+
  '.mem-card .mem-ref{font-weight:800;font-size:13px;color:var(--olive,#5a3a8a);background:none;border:0;padding:0;text-decoration:underline dotted;cursor:pointer}'+
  '.mem-empty{padding:10px 12px;border-radius:12px;background:var(--soft,#eee);font-size:13px;color:var(--muted,#777)}'+
  '.rem-box{margin:8px 0 12px;padding:10px 12px;border-radius:14px;background:var(--soft,#eee);border:1px solid var(--line,#ddd)}'+
  '.rem-box .rem-title{font-weight:800;font-size:13.5px;margin:0 0 6px;color:var(--text,#222)}'+
  '.rem-box .rem-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'+
  '.rem-box .rem-sw{display:flex;align-items:center;gap:8px;font-size:13px;flex:1;min-width:170px;color:var(--text,#222)}'+
  '.rem-box .rem-sw input{width:20px;height:20px}'+
  '.rem-box .rem-time{font-size:15px;padding:6px 8px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--paper,#fff);color:var(--text,#222)}'+
  '.rem-box .rem-note{margin-top:6px;font-size:11.5px;color:var(--muted,#777);line-height:1.45}'+
  '.q-upcoming{margin:0 0 10px;padding:10px 12px;border-radius:12px;background:var(--soft,#eee);font-size:13px;color:var(--text,#222)}';
  (document.head||document.documentElement).appendChild(st);
})();

/* ------------------------------------------------------------------
   Lesoni: kichaguzi cha robo + orodha ya masomo
   ------------------------------------------------------------------ */
var selectedK=null;
function selQuarter(){
  if(selectedK!=null){var q=quarter(selectedK); return q;}
  return active();
}
function renderLesoni(){
  var panel=document.getElementById('lesoni'); if(!panel) return;
  var act=active(), q=selQuarter(), td=today();

  // Kichwa cha robo (hero)
  var b=document.getElementById('lesoniQBadge'), t=document.getElementById('lesoniQTitle'), s=document.getElementById('lesoniQSub');
  if(b) b.textContent=q.label+' · '+q.span;
  if(t) t.textContent=q.hasData?q.title:(isPast(q)?'Masomo ya robo':'Robo mpya');
  if(s) s.textContent=q.hasData
      ? 'Lesoni za Sabato Adult Bible Study Guide · Kuanzia '+MS[q.start.getMonth()]+' '+q.start.getDate()+', '+q.start.getFullYear()+(q.en?' · '+q.en:'')
      : (isPast(q)?'Masomo ya robo hii hayapo kwenye app. Kuanzia ':'Masomo ya robo hii yataongezwa GC yakichapisha. Kuanzia ')+MS[q.start.getMonth()]+' '+q.start.getDate()+', '+q.start.getFullYear();

  // Kichaguzi cha robo
  var pk=document.getElementById('lessonQuarterPicker');
  if(pk){
    var h='', L=list();
    for(var i=0;i<L.length;i++){
      var x=L[i], isAct=(x.k===act.k&&!act.stale), upcoming=x.start>td;
      h+='<button type="button" class="quarter-btn'+(x.k===q.k?' active':'')+(x.hasData?'':' q-empty')+'" data-qk="'+x.k+'">'+esc(x.label)+
         (isAct?'<span class="q-now">SASA</span>':'')+'<br><small>'+esc(x.hasData?x.title:(isPast(x)?'Masomo ya robo':'Inakuja'))+(upcoming&&x.hasData?' · ijayo':'')+'</small></button>';
    }
    pk.innerHTML=h;
  }
  var nt=document.querySelector('#lesoni .lesson-extra-note'); if(nt) nt.style.display='none';
  var extra=document.getElementById('otherLessonChoices'); if(extra) extra.hidden=true;

  // Orodha ya masomo
  var ll=document.getElementById('lessonList');
  if(ll){
    var card=ll.parentElement, badge=card&&card.querySelector('.badge'), h3=card&&card.querySelector('h3');
    if(badge) badge.textContent='ORODHA YA MASOMO · '+q.label;
    if(h3) h3.textContent=(q.hasData?q.title:(isPast(q)?'Masomo ya robo':'Robo mpya'))+' ('+(q.hasData?13:0)+')';
    if(!q.hasData){
      if(isPast(q)) ll.innerHTML='<div class="q-upcoming">Masomo ya '+esc(q.label)+' hayapo kwenye app hii. Chagua Q3 2026 au robo mpya.</div>'; else
      ll.innerHTML='<div class="q-upcoming">⏳ Robo hii inaanza '+esc(MS[q.start.getMonth()]+' '+q.start.getDate()+', '+q.start.getFullYear())+'. Masomo yake yatawekwa hapa yakipatikana kutoka GC.</div>';
    } else {
      var r='', curN=null;
      if(q.k===act.k && !act.stale){var d0=diffDays(td,q.start); if(d0>=0&&d0<91) curN=Math.floor(d0/7)+1;}
      for(var n=1;n<=13;n++){
        var key=keyFor(q,n), isC=(n===curN);
        r+='<button class="lesson-row'+(isC?' active':'')+'" type="button" data-open-lesson="'+key+'"><span class="num">'+n+'</span><span><b>'+esc(q.titles[n]||('Lesoni '+n))+
           '</b><small>'+esc(q.dates[n])+(isC?' · Wiki hii':'')+'</small></span><span class="arrow">›</span></button>';
      }
      ll.innerHTML=r;
    }
  }
}
document.addEventListener('click',function(e){
  var qb=e.target.closest&&e.target.closest('.quarter-btn[data-qk]');
  if(qb){selectedK=+qb.getAttribute('data-qk'); renderLesoni(); return;}
  var lr=e.target.closest&&e.target.closest('#lessonList .lesson-row[data-open-lesson]');
  if(lr){
    var f=window.mjueOpenLesson||window.openLesson;
    if(typeof f==='function'){e.preventDefault(); e.stopPropagation(); f(lr.getAttribute('data-open-lesson'));}
  }
},true);

/* ------------------------------------------------------------------
   Zaidi: mafungu yote 13 ya kukariri ya robo ya sasa
   ------------------------------------------------------------------ */
function weekNow(q){
  var d0=diffDays(today(),q.start);
  if(d0<0||d0>90) return null;
  return Math.floor(d0/7)+1;
}
function renderMem(){
  var panel=document.getElementById('historia'); if(!panel) return;
  var q=active(), sec=document.getElementById('memSection');
  if(!sec){sec=document.createElement('div'); sec.id='memSection'; sec.className='mem-section'; panel.insertBefore(sec,panel.firstChild);}
  var cur=q.stale?null:weekNow(q), h='';
  h+='<h2 class="mem-h" id="memHeading">📖 Mafungu ya Kukariri · '+esc(q.label)+'</h2>';
  h+='<p class="mem-sub">'+esc(q.title)+' — fungu moja kila juma (mafungu yote 13). Robo mpya ikianza, orodha hii hubadilika yenyewe.</p>';
  h+='<div class="rem-box" data-rem></div>';
  var any=false;
  for(var n=1;n<=13;n++){
    var m=q.memory[n]; if(!m) continue; any=true;
    var isC=(n===cur), past=(cur!=null&&n<cur)||(q.stale);
    h+='<div class="mem-card'+(isC?' cur':'')+(past?' past':'')+'"><div class="mem-top"><span class="mem-wk">JUMA '+n+' · '+esc(q.dates[n])+'</span>'+(isC?'<span class="mem-now">WIKI HII</span>':'')+'</div>'+
       '<div class="mem-title">'+esc(q.titles[n]||'')+'</div>'+
       (m.text?'<p class="mem-text">“'+esc(m.text)+'”</p>':'')+
       '<button type="button" class="mem-ref" data-mem-pass="'+esc(m.pass)+'">📖 '+esc(m.ref)+'</button></div>';
  }
  if(!any) h+='<div class="mem-empty">Mafungu ya kukariri ya robo hii bado hayajawekwa.</div>';
  sec.innerHTML=h;
  renderRem();
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-mem-pass]'); if(!b) return;
  var p=(b.getAttribute('data-mem-pass')||'').split('|');
  if(p.length>=2 && typeof window.openPassageFromLesson==='function') window.openPassageFromLesson(p[0],p[1],p[2]||'');
});

/* ------------------------------------------------------------------
   Kikumbusho cha kila siku (arifa ya Android) — kukariri fungu la juma
   ------------------------------------------------------------------ */
var REM_KEY='mjue_verse_reminder';
function getRem(){
  try{var o=JSON.parse(ssGet(REM_KEY)||'null'); if(o&&typeof o==='object') return {on:!!o.on,h:+o.h>=0?+o.h:6,m:+o.m>=0?+o.m:0};}catch(e){}
  return {on:false,h:6,m:0};
}
function weeklyPayload(){
  var out=[], td=today(), maxK=Math.max(maxDataIndex(),curIndex());
  for(var k=0;k<=maxK;k++){
    var q=quarter(k); if(!q.hasData) continue;
    for(var n=1;n<=13;n++){
      var m=q.memory[n]; if(!m) continue;
      var s=addDays(q.start,7*(n-1)), e=addDays(s,6);
      if(diffDays(e,td)<-1) continue;
      out.push({s:iso(s),e:iso(e),n:n,q:q.label,r:m.ref,t:m.text});
    }
  }
  return out;
}
function native(){try{return window.MJUE_NATIVE&&typeof window.MJUE_NATIVE.setDailyReminder==='function'?window.MJUE_NATIVE:null;}catch(e){return null;}}
function syncNative(){
  var r=getRem(), nat=native(); if(!nat) return 'web';
  try{return String(nat.setDailyReminder(!!r.on,r.h,r.m,JSON.stringify(weeklyPayload())));}catch(e){return 'error';}
}
function timeStr(r){return pad(r.h)+':'+pad(r.m);}
function renderRem(){
  var r=getRem(), nat=!!native();
  var boxes=document.querySelectorAll('[data-rem]');
  for(var i=0;i<boxes.length;i++){
    var b=boxes[i];
    b.innerHTML='<div class="rem-title">⏰ Kikumbusho cha kila siku</div>'+
      '<div class="rem-row"><label class="rem-sw"><input type="checkbox" class="rem-on"'+(r.on?' checked':'')+'><span>Nikumbushe kukariri fungu la juma hili</span></label>'+
      '<input type="time" class="rem-time" value="'+timeStr(r)+'"></div>'+
      '<div class="rem-note">'+(r.on?(nat?'Utapata arifa kila siku saa '+timeStr(r)+' ikiwa na fungu la juma hilo. Fungu hubadilika yenyewe kila juma na kila robo.':'Kikumbusho kimehifadhiwa. Arifa hufanya kazi kwenye app ya Android iliyosakinishwa.'):'Washa ili upate arifa ya kila siku siku nzima ya juma.')+'</div>';
  }
}
document.addEventListener('change',function(e){
  var t=e.target; if(!t||!t.classList) return;
  var r=getRem();
  if(t.classList.contains('rem-on')){ r.on=!!t.checked; }
  else if(t.classList.contains('rem-time')){
    var p=String(t.value||'').split(':'); if(p.length>=2){r.h=+p[0]||0; r.m=+p[1]||0;}
  } else return;
  ssSet(REM_KEY,JSON.stringify(r));
  var st=syncNative();
  renderRem();
  if(r.on){
    if(st==='denied') toast('Ruhusu arifa kwenye mipangilio ya simu ili kikumbusho kifanye kazi');
    else toast('Kikumbusho kimewashwa · saa '+timeStr(r));
  } else if(t.classList.contains('rem-on')) toast('Kikumbusho kimezimwa');
});

/* Kikumbusho kwenye kadi ya Neno la Leo (Nyumbani) */
function renderHomeRem(){
  var card=document.querySelector('#home .daily-card'); if(!card) return;
  var box=document.getElementById('remHome');
  if(!box){box=document.createElement('div'); box.id='remHome'; box.className='rem-box'; box.setAttribute('data-rem','');
    var sa=card.querySelector('.soft-action'); if(sa) card.insertBefore(box,sa); else card.appendChild(box);}
}

/* Kichwa cha "Neno la Leo · Fungu la Kukariri (Juma n)" — kinasasishwa na refreshWeek (app-fixes.js) */
function homeHeading(n){
  var el=document.querySelector('#home .section-head h2'); if(!el) return;
  try{ if(window.MJUE_CLOUD&&window.MJUE_CLOUD.indexCms) window.MJUE_CLOUD.indexCms(); }catch(e){}
  el.removeAttribute('data-cms'); el.removeAttribute('data-orig'); el.id='dailyHeading';
  el.textContent='NENO LA LEO · FUNGU LA KUKARIRI (JUMA '+n+')';
}

/* ------------------------------------------------------------------ */
function refreshAll(){
  try{renderLesoni();}catch(e){console.error('quarters:lesoni',e);}
  try{renderMem();}catch(e){console.error('quarters:mem',e);}
  try{renderHomeRem();renderRem();}catch(e){console.error('quarters:rem',e);}
  try{syncNative();}catch(e){}
}
var lastDay='';
function tick(){var k=today().toDateString(); if(k!==lastDay){lastDay=k; selectedK=null; refreshAll();}}
function boot(){lastDay=today().toDateString(); refreshAll(); setTimeout(refreshAll,700); setTimeout(renderMem,2500);}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,80);});
else setTimeout(boot,80);
document.addEventListener('visibilitychange',function(){if(!document.hidden) tick();});
setInterval(tick,60000);
setInterval(function(){cloudLoad(); if(cloudChanged){cloudChanged=false; refreshAll();}},1500);

window.MJUE_Q={
  FIRST:FIRST, quarter:quarter, active:active, list:list, key:function(n,q){return keyFor(q||active(),n);},
  lookup:lookup, isLegacy:isLegacy, template:template, setLegacyQ4:setLegacyQ4,
  start:function(){return active().start;}, label:function(){return active().label;}, homeHeading:homeHeading,
  refresh:refreshAll, renderMem:renderMem, payload:weeklyPayload, DATA:DATA,
  qStart:qStart, qLabel:qLabel, maxIndex:maxDataIndex, curIndex:curIndex, dateRange:range, hasKeys:hasKeys, readLabels:readLabels, resolveMem:resolveMem
};
})();

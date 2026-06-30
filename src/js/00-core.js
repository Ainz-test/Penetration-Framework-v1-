var B64DATA='__B64DATA_PLACEHOLDER__';
var D={},PHASES=[],TOOLS=[],PAYLOADS=[],MITRE=[];
window.onerror=function(m,s,l){var e=document.getElementById('err');if(e){e.style.display='block';e.textContent='JS Error: '+m+' (line '+l+')';}return false;};

var APP={
  section:'framework',profile:'default',lang:'en',
  phase:'pre',step:'p1',tab:'cmd',exp:{},q:'',drawer:false,
  ck:{},notes:{},eng:'New Engagement',
  findings:[],editFinding:null,fFilter:'all',fStatus:'all',
  scope:{targets:[],oot:[],windows:[],contacts:[],type:'Black Box',start:'',end:'',client:''},
  kc:[],kcNarr:'',
  timerSessions:[],timerActive:null,timerInterval:null,timerSelPhase:'recon',
  toolsCat:0,toolsSearch:'',
  apiKey:'',apiEndpoint:'/api/chat',
  reportTester:'',reportDate:'',reportLang:'',
  profiles:[]
};

function pkey(k){return 'apt_'+APP.profile+'_'+k;}
// psave is fire-and-forget (callers never await it) so every existing call
// site throughout the app keeps working unchanged. The encrypt+write (if
// encryption is enabled) happens in the background — see 00b-crypto.js.
function psave(k,v){secureSet(pkey(k),v);}
// pload is async because decryption is async. It has exactly one call site
// (loadProfile, below) plus a couple of direct localStorage reads elsewhere
// that route through secureGet directly — see 12-profiles.js/13-settings.js.
function pload(k,d){return secureGet(pkey(k),d);}

function initData(){
  try{
    var raw=atob(B64DATA);
    D=JSON.parse(raw);
    PHASES=D.phases||[];
    TOOLS=D.tools||[];
    PAYLOADS=D.payloads||[];
    MITRE=D.mitre||[];
  }catch(e){
    document.getElementById('err').style.display='block';
    document.getElementById('err').textContent='Data error: '+e;
  }
}

function loadProfile(){
  APP.lang=localStorage.getItem('apt_lang')||'en';
  return Promise.all([
    pload('ck',{}), pload('notes',{}), pload('eng','New Engagement'),
    pload('phase','pre'), pload('step','p1'), pload('findings',[]),
    pload('scope',{targets:[],oot:[],windows:[],contacts:[],type:'Black Box',start:'',end:'',client:''}),
    pload('timer_sessions',[]), pload('kc',[]), pload('kc_narr',''),
    secureGet('api_key',''), secureGet('api_endpoint','/api/chat'), secureGet('apt_profiles',[])
  ]).then(function(r){
    APP.ck=r[0]; APP.notes=r[1]; APP.eng=r[2]; APP.phase=r[3]||'pre'; APP.step=r[4]||'p1';
    APP.findings=r[5]; APP.scope=r[6]; APP.timerSessions=r[7]; APP.kc=r[8]; APP.kcNarr=r[9];
    APP.apiKey=r[10]; APP.apiEndpoint=r[11]; APP.profiles=r[12];
    if(!APP.profiles.length){
      APP.profiles=[{id:'default',name:'Default Engagement',created:Date.now()}];
      secureSet('apt_profiles',APP.profiles);
    }
  });
}

function getPhase(id){for(var i=0;i<PHASES.length;i++){if(PHASES[i].id===id)return PHASES[i];}return PHASES[0];}
function getStep(ph,sid){for(var i=0;i<ph.steps.length;i++){if(ph.steps[i].id===sid)return ph.steps[i];}return ph.steps[0];}
function phaseIdx(){for(var i=0;i<PHASES.length;i++){if(PHASES[i].id===APP.phase)return i;}return 0;}
function stepIdx(ph){for(var i=0;i<ph.steps.length;i++){if(ph.steps[i].id===APP.step)return i;}return 0;}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function copy(txt,btn){
  navigator.clipboard.writeText(txt).then(function(){
    if(!btn)return;
    var orig=btn.textContent;
    btn.textContent='Copied!';
    btn.classList.add('ok');
    setTimeout(function(){btn.textContent=orig;btn.classList.remove('ok');},1200);
  });
}
var COPYDATA={};
var _copyCtr=0;
function regCopy(s){
  var id='cp'+(_copyCtr++);
  COPYDATA[id]=s;
  return id;
}
function copyById(id,btn){
  copy(COPYDATA[id],btn);
}
function fmtDate(ts){var d=new Date(ts);return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'});}
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5);}

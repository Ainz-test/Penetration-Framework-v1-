var B64DATA='__B64DATA_PLACEHOLDER__';
var D={},PHASES=[],TOOLS=[],PAYLOADS=[],MITRE=[];
window.onerror=function(m,s,l){var e=document.getElementById('err');if(e){e.style.display='block';e.textContent='JS Error: '+m+' (line '+l+')';}return false;};

var APP={
  section:'framework',profile:'default',
  phase:'pre',step:'p1',tab:'cmd',exp:{},q:'',drawer:false,
  ck:{},notes:{},eng:'New Engagement',
  findings:[],editFinding:null,fFilter:'all',fStatus:'all',
  scope:{targets:[],oot:[],windows:[],contacts:[],type:'Black Box',start:'',end:'',client:''},
  kc:[],kcNarr:'',
  timerSessions:[],timerActive:null,timerInterval:null,timerSelPhase:'recon',
  toolsCat:0,toolsSearch:'',
  apiKey:'',apiEndpoint:'/api/chat',
  reportTester:'',reportDate:'',
  profiles:[]
};

function pkey(k){return 'apt_'+APP.profile+'_'+k;}
function psave(k,v){try{localStorage.setItem(pkey(k),JSON.stringify(v));}catch(e){}}
function pload(k,d){try{var v=localStorage.getItem(pkey(k));return v!==null?JSON.parse(v):d;}catch(e){return d;}}

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
  APP.ck=pload('ck',{});
  APP.notes=pload('notes',{});
  APP.eng=pload('eng','New Engagement');
  APP.phase=pload('phase','pre')||'pre';
  APP.step=pload('step','p1')||'p1';
  APP.findings=pload('findings',[]);
  var ds={targets:[],oot:[],windows:[],contacts:[],type:'Black Box',start:'',end:'',client:''};
  APP.scope=pload('scope',ds);
  APP.timerSessions=pload('timer_sessions',[]);
  APP.kc=pload('kc',[]);
  APP.kcNarr=pload('kc_narr','');
  APP.apiKey=localStorage.getItem('api_key')||'';
  APP.apiEndpoint=localStorage.getItem('api_endpoint')||'/api/chat';
  APP.profiles=JSON.parse(localStorage.getItem('apt_profiles')||'[]');
  if(!APP.profiles.length){
    APP.profiles=[{id:'default',name:'Default Engagement',created:Date.now()}];
    localStorage.setItem('apt_profiles',JSON.stringify(APP.profiles));
  }
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

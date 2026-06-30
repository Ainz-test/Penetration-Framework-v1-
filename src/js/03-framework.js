function toggleDrawer(){APP.drawer=!APP.drawer;rDrawer();}
function closeDrawer(){APP.drawer=false;rDrawer();}
function openDrawer(){APP.drawer=true;rDrawer();}

function rDrawer(){
  var ph=getPhase(APP.phase);
  var mask=document.getElementById('mask');
  var drawer=document.getElementById('drawer');
  var hambtn=document.getElementById('hambtn');
  if(mask)mask.classList.toggle('on',APP.drawer);
  if(drawer)drawer.classList.toggle('on',APP.drawer);
  if(hambtn)hambtn.classList.toggle('on',APP.drawer);

  var steps=ph.steps||[];
  var h='<div class="drwhdr">';
  h+='<div class="drwphase" style="color:'+ph.color+'">'+ph.icon+' '+esc(tx(ph.label))+'</div>';
  h+='<div class="drwdesc">'+esc(tx(ph.desc))+'</div></div>';
  var doneCount=0,total=0;
  steps.forEach(function(st){
    total+=st.checklist?st.checklist.length:0;
    (st.checklist||[]).forEach(function(c,i){if(APP.ck[st.id+'_'+i])doneCount++;});
  });
  h+='<div class="pbar" style="margin:0 10px 6px;height:2px"><div class="pfill" style="width:'+(total?Math.round(doneCount/total*100):0)+'%;background:'+ph.color+'"></div></div>';
  steps.forEach(function(st){
    var done=0,total2=st.checklist?st.checklist.length:0;
    (st.checklist||[]).forEach(function(c,i){if(APP.ck[st.id+'_'+i])done++;});
    var pct=total2?Math.round(done/total2*100):0;
    var isOn=APP.step===st.id;
    var pri=st.priority||'medium';
    var priC=pri==='critical'?'#dc2626':pri==='high'?'#ea580c':'#475569';
    h+='<button class="drwbtn'+(isOn?' on':'')+'" onclick="selectStep(\''+st.id+'\')" style="'+(isOn?'border-left-color:'+ph.color+';':'')+'">'+
      '<div class="drwtitle"><span>'+esc(tx(st.title))+'</span>'+
      '<span class="badge" style="background:'+priC+';font-size:7px">'+t('pri_'+pri).toUpperCase()+'</span></div>'+
      '<div class="pbar"><div class="pfill" style="width:'+pct+'%;background:'+ph.color+'"></div></div>'+
      '</button>';
  });

  var sph='';
  PHASES.forEach(function(p){
    var totPh=0,donePh=0;
    (p.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){totPh++;if(APP.ck[st.id+'_'+i])donePh++;});
    });
    var pct=totPh?Math.round(donePh/totPh*100):0;
    sph+='<button class="sph-btn'+(p.id===APP.phase?' on':'')+'" onclick="selectPhase(\''+p.id+'\')">'+
      '<span class="sph-ico">'+p.icon+'</span>'+
      '<div class="sph-info"><div class="sph-lbl" style="color:'+(p.id===APP.phase?p.color:'var(--t1)')+'">'+esc(tx(p.label))+'</div>'+
      '<div class="sph-pct">'+pct+'% '+t('complete_lbl').toLowerCase()+'</div></div>'+
      ringHTML(pct,p.color,26,pct+'%')+'</button>';
  });

  if(drawer)drawer.innerHTML='<div class="sidebar-phases">'+sph+'</div>'+h;
}

function selectPhase(id){
  APP.phase=id;
  APP.drawer=false;
  var ph=getPhase(id);
  APP.step=(ph.steps&&ph.steps[0])?ph.steps[0].id:'';
  APP.tab='cmd';
  APP.q='';
  psave('phase',APP.phase);psave('step',APP.step);
  renderAll();
}

function selectStep(id){
  APP.step=id;
  APP.tab='cmd';
  APP.drawer=false;
  APP.q='';
  psave('step',APP.step);
  renderAll();
}

function rPhaseNav(){
  var h='';
  PHASES.forEach(function(p){
    var totPh=0,donePh=0;
    (p.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){totPh++;if(APP.ck[st.id+'_'+i])donePh++;});
    });
    var pct=totPh?Math.round(donePh/totPh*100):0;
    var on=p.id===APP.phase;
    h+='<button class="ptab'+(on?' on':'')+'" onclick="selectPhase(\''+p.id+'\')" style="border-bottom-color:'+(on?p.color:'transparent')+'">'
      +'<span class="pico">'+p.icon+'</span>'
      +'<span class="plbl" style="color:'+(on?p.color:'var(--t2)')+'">'+esc(tx(p.short))+'</span>'
      +'</button>';
  });
  document.getElementById('phasenav').innerHTML=h;
}

function rStepHdr(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var done=0,tot=st.checklist?st.checklist.length:0;
  (st.checklist||[]).forEach(function(c,i){if(APP.ck[st.id+'_'+i])done++;});
  var pct=tot?Math.round(done/tot*100):0;
  var priColors={critical:'#dc2626',high:'#ea580c',medium:'#ca8a04',low:'#16a34a'};
  var pri=st.priority||'medium';
  document.getElementById('stephdr').innerHTML=
    '<div class="sphrow">'
    +'<div style="flex:1;min-width:0">'
    +'<div class="sphcrumb"><span style="color:'+ph.color+'">'+ph.icon+' '+esc(tx(ph.label))+'</span><span style="color:var(--t3)">›</span><span style="color:var(--t3)">'+esc(tx(st.title))+'</span></div>'
    +'<div class="sphtitle">'+esc(tx(st.title))+'</div>'
    +'<div class="sphsumm">'+esc(tx(st.summary))+'</div>'
    +'</div>'
    +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">'
    +'<span class="badge" style="background:'+priColors[pri]+'">'+t('pri_'+pri).toUpperCase()+'</span>'
    +ringHTML(pct,ph.color,38,pct+'%')+'</div></div>'
    +'<div class="pbar"><div class="pfill" style="width:'+pct+'%;background:'+ph.color+'"></div></div>';
}

function rTabBar(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  if(APP.q){
    document.getElementById('tabbar').innerHTML='<button class="tbtn on">'+t('tab_search_results')+'</button>';
    return;
  }
  var cmds=st.commands||[];
  var h='<button class="tbtn'+(APP.tab==='cmd'?' on':'')+'" onclick="setTab(\'cmd\')">'+t('tab_commands')+' ('+cmds.length+')</button>'
   +'<button class="tbtn'+(APP.tab==='chk'?' on':'')+'" onclick="setTab(\'chk\')">'+t('tab_checklist')+' ('+(st.checklist||[]).length+')</button>'
   +'<button class="tbtn'+(APP.tab==='inf'?' on':'')+'" onclick="setTab(\'inf\')">'+t('tab_info')+'</button>'
   +'<button class="tbtn'+(APP.tab==='nts'?' on':'')+'" onclick="setTab(\'nts\')">'+t('tab_notes')+'</button>';
  document.getElementById('tabbar').innerHTML=h;
}

function setTab(t){APP.tab=t;rTabBar();rContent();}

function rContent(){
  if(APP.q){rSearch();return;}
  if(APP.tab==='cmd')rCmds();
  else if(APP.tab==='chk')rChk();
  else if(APP.tab==='inf')rInf();
  else if(APP.tab==='nts')rNts();
}

function hlCmd(s,q){
  if(!q)return esc(s);
  var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return esc(s).replace(re,'<mark class="srchmark">$1</mark>');
}

function rCmds(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var cmds=st.commands||[];
  if(!cmds.length){document.getElementById('content').innerHTML='<div class="empty">'+t('no_commands_step')+'</div>';return;}
  var h='';
  cmds.forEach(function(cmd){
    var exp=APP.exp[cmd.id];
    var cmdClean=cmd.cmd||'';
    h+='<div class="cmdcard" style="border-left-color:'+ph.color+'">'
      +'<div class="cmdhdr"><div><div class="cmdtitle">'+esc(tx(cmd.title))+'</div><div class="cmdpurpose">'+esc(tx(cmd.purpose))+'</div></div>'
      +'<button class="copybtn" onclick="copyById(\''+regCopy(cmdClean)+'\',this)">&#9113; '+t('copy_btn')+'</button></div>'
      +'<div class="cmdpre"><pre>'+fmtCmd(cmdClean)+'</pre></div>';
    if(cmd.example){
      h+='<div class="cmdex"><div class="exlbl">'+t('example_lbl')+'</div><pre>'+esc(cmd.example)+'</pre></div>';
    }
    h+='<button class="detog" onclick="toggleExp(\''+cmd.id+'\')"><span>'+t('flags_details')+'</span><span>'+(exp?'▲':'▼')+'</span></button>';
    if(exp){
      h+='<div class="deblk">';
      (cmd.flags||[]).forEach(function(f){
        h+='<div class="flagrow"><span class="flagkey">'+esc(f.f)+'</span><span class="flagdesc">'+esc(tx(f.d))+'</span></div>';
      });
      if(cmd.note)h+='<div class="notebox"><span class="ni">'+t('tip_lbl')+'</span> '+esc(tx(cmd.note))+'</div>';
      if(cmd.out)h+='<div class="outbox"><span class="oi">'+t('out_lbl')+'</span> '+esc(tx(cmd.out))+'</div>';
      h+='</div>';
    }
    h+='</div>';
  });
  document.getElementById('content').innerHTML=h;
}

function fmtCmd(cmd){
  return esc(cmd).replace(/\{([^}]+)\}/g,'<i class="cv">{$1}</i>')
    .replace(/(#[^\n]*)/g,'<span class="cc">$1</span>');
}

function toggleExp(id){
  APP.exp[id]=!APP.exp[id];
  var content=document.getElementById('content');
  if(!content)return;
  rCmds();
}

function rChk(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var items=st.checklist||[];
  var done=0;
  items.forEach(function(c,i){if(APP.ck[st.id+'_'+i])done++;});
  var pct=items.length?Math.round(done/items.length*100):0;
  var h='<div class="chkhdr">'
    +'<div class="chkcount">'+done+' / '+items.length+' '+t('complete_lbl')+' ('+pct+'%)</div>'
    +'<button class="togallbtn" onclick="toggleAll()">'+( done===items.length?t('uncheck_all'):t('check_all'))+'</button>'
    +'</div>'
    +'<div class="chklist">';
  items.forEach(function(c,i){
    var k=st.id+'_'+i;
    var chk=APP.ck[k];
    h+='<div class="chkitem'+(chk?' done':'')+'" onclick="toggleChk(\''+k+'\')">'
      +'<div class="chkbox'+(chk?' on':'')+'">'+(chk?'&#10003;':'')+'</div>'
      +'<div class="chktxt">'+esc(tx(c))+'</div></div>';
  });
  h+='</div>';
  document.getElementById('content').innerHTML=h;
}

function toggleChk(k){
  APP.ck[k]=!APP.ck[k];
  psave('ck',APP.ck);
  rChk();
  rStepHdr();
  updateRing();
}

function toggleAll(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var items=st.checklist||[];
  var done=0;
  items.forEach(function(c,i){if(APP.ck[st.id+'_'+i])done++;});
  var setTo=done!==items.length;
  items.forEach(function(c,i){APP.ck[st.id+'_'+i]=setTo;});
  psave('ck',APP.ck);
  rChk();rStepHdr();updateRing();
}

function rInf(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var h='';
  if(st.tip){
    h+='<div class="tipcard"><span class="tipicon">&#9889;</span>'
      +'<div><div class="tiplbl">'+t('elite_tip')+'</div><div class="tiptxt">'+esc(tx(st.tip))+'</div></div></div>';
  }
  if(st.deliverable){
    h+='<div class="delivbox"><div class="delivlbl">'+t('deliverable_lbl')+'</div><div class="delivtxt">'+esc(tx(st.deliverable))+'</div></div>';
  }
  if(st.tools&&st.tools.length){
    h+='<div class="toolsbox" style="margin-top:9px"><div class="toolslbl">'+t('tools_used')+'</div><div class="toolswrap">';
    st.tools.forEach(function(tn){h+='<span class="toolchip">'+esc(tn)+'</span>';});
    h+='</div></div>';
  }
  if(!h)h='<div class="empty">'+t('no_info_step')+'</div>';
  document.getElementById('content').innerHTML=h;
}

function rNts(){
  var ph=getPhase(APP.phase);
  var st=getStep(ph,APP.step);
  var nk='note_'+st.id;
  var val=APP.notes[nk]||'';
  var h='<div class="notelbl">'+t('engagement_notes')+' — '+esc(tx(st.title))+'</div>'
    +'<textarea class="notetxt" placeholder="'+esc(t('notes_placeholder'))+'" '
    +'oninput="saveNote(\''+nk+'\',this.value)">'+esc(val)+'</textarea>'
    +'<div class="notefoot">'+t('notes_autosave')+'</div>';
  document.getElementById('content').innerHTML=h;
}

function saveNote(k,v){
  APP.notes[k]=v;
  psave('notes',APP.notes);
}

function rSearch(){
  var q=APP.q.toLowerCase();
  if(!q){rCmds();return;}
  var results=[];
  PHASES.forEach(function(ph){
    (ph.steps||[]).forEach(function(st){
      (st.commands||[]).forEach(function(cmd){
        var hay=(tx(cmd.title)+' '+tx(cmd.purpose)+' '+cmd.cmd+' '+(cmd.example||'')+' '+tx(cmd.note)).toLowerCase();
        if(hay.indexOf(q)>=0)results.push({ph:ph,st:st,cmd:cmd});
      });
    });
  });
  var h='<div class="srchhdr">'+results.length+' '+t('results_for')+' "'+esc(APP.q)+'"</div>';
  if(!results.length){h+='<div class="empty">'+t('no_search_match')+'</div>';document.getElementById('content').innerHTML=h;return;}
  h+='<div class="srchres">';
  results.forEach(function(r){
    var clean=r.cmd.cmd||'';
    h+='<div class="srchitem" onclick="goCmd(\''+r.ph.id+'\',\''+r.st.id+'\')">'
      +'<div class="srchctx">'+r.ph.icon+' '+esc(tx(r.ph.label))+' › '+esc(tx(r.st.title))+'</div>'
      +'<div class="srchtitle">'+hlCmd(tx(r.cmd.title),APP.q)+'</div>'
      +'<div class="srchcmd">'+hlCmd(clean.split('\n')[0],APP.q)+'</div>'
      +'</div>';
  });
  h+='</div>';
  document.getElementById('content').innerHTML=h;
}

function goCmd(phId,stId){
  clearSearch();
  APP.phase=phId;APP.step=stId;APP.tab='cmd';
  renderAll();
}

function handleSearch(v){
  APP.q=v;
  document.getElementById('clrbtn').style.display=v?'block':'none';
  if(v){APP.tab='search';}else{APP.tab='cmd';}
  rTabBar();rContent();
}
function clearSearch(){
  document.getElementById('searchinp').value='';
  document.getElementById('clrbtn').style.display='none';
  APP.q='';APP.tab='cmd';
  rTabBar();rContent();
}

function rStepNav(){
  var ph=getPhase(APP.phase);
  var steps=ph.steps||[];
  var si=stepIdx(ph);
  var prevArrow=APP.lang==='ar'?'&#8594;':'&#8592;';
  var nextArrow=APP.lang==='ar'?'&#8592;':'&#8594;';
  var h='<button class="snbtn" onclick="prevStep()" '+(si===0?'disabled':'')+'>'+prevArrow+' '+t('prev_btn')+'</button>';
  h+='<div class="sdots">';
  steps.forEach(function(st,i){
    var done=0,tot=st.checklist?st.checklist.length:0;
    (st.checklist||[]).forEach(function(c,ii){if(APP.ck[st.id+'_'+ii])done++;});
    var pct=tot?done/tot:0;
    var w=i===si?18:6;
    h+='<div class="sdot" onclick="selectStep(\''+st.id+'\')" style="width:'+w+'px;background:'+(i===si?ph.color:pct===1?'#166534':'#2e2e4e')+'" title="'+esc(tx(st.title))+'"></div>';
  });
  h+='</div>';
  h+='<button class="snbtn" onclick="nextStep()" '+(si===steps.length-1?'disabled':'')+'>'+t('next_btn')+' '+nextArrow+'</button>';
  document.getElementById('stepnav').innerHTML=h;
}

function prevStep(){var ph=getPhase(APP.phase);var si=stepIdx(ph);if(si>0){APP.step=ph.steps[si-1].id;psave('step',APP.step);renderAll();}}
function nextStep(){var ph=getPhase(APP.phase);var steps=ph.steps;var si=stepIdx(ph);if(si<steps.length-1){APP.step=steps[si+1].id;psave('step',APP.step);renderAll();}}

function rBN(){
  var h='';
  PHASES.forEach(function(p){
    var totPh=0,donePh=0;
    (p.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){totPh++;if(APP.ck[st.id+'_'+i])donePh++;});
    });
    var pct=totPh?Math.round(donePh/totPh*100):0;
    var on=p.id===APP.phase;
    h+='<button class="bni" onclick="selectPhase(\''+p.id+'\')" style="border-top-color:'+(on?p.color:'transparent')+'">'
      +'<span style="font-size:14px">'+p.icon+'</span>'
      +'<span style="font-size:8px;color:'+(on?p.color:'var(--t3)')+'">'+esc(tx(p.short))+'</span>'
      +'</button>';
  });
  document.getElementById('bottomnav').innerHTML=h;
}

function updateRing(){
  var tot=0,done=0;
  PHASES.forEach(function(ph){
    (ph.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){tot++;if(APP.ck[st.id+'_'+i])done++;});
    });
  });
  var pct=tot?Math.round(done/tot*100):0;
  var ph=getPhase(APP.phase);
  document.getElementById('totalring').innerHTML=ringHTML(pct,ph.color,34,pct+'%');
}

function renderAll(){
  var ph=getPhase(APP.phase);
  rPhaseNav();
  rDrawer();
  rStepHdr();
  rTabBar();
  rContent();
  rStepNav();
  rBN();
  updateRing();
  document.getElementById('engname').textContent=APP.eng;
}

function startEditEng(){
  var n=prompt(t('engagement_name_prompt'),APP.eng);
  if(n!==null&&n.trim()){APP.eng=n.trim();psave('eng',APP.eng);document.getElementById('engname').textContent=APP.eng;}
}

function doReset(){
  if(!confirm(t('reset_confirm')))return;
  APP.ck={};APP.notes={};psave('ck',{});psave('notes',{});
  renderAll();
}

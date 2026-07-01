function renderDashboard(el){
  var findings=APP.findings||[];
  var scope=APP.scope||{};

  // --- compute stats ---
  var sevCounts={Critical:0,High:0,Medium:0,Low:0,Info:0};
  findings.forEach(function(f){sevCounts[f.severity]=(sevCounts[f.severity]||0)+1;});
  var openCount=findings.filter(function(f){return f.status==='Open';}).length;

  // total engagement progress
  var totChk=0,doneChk=0;
  PHASES.forEach(function(ph){
    (ph.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){totChk++;if(APP.ck[st.id+'_'+i])doneChk++;});
    });
  });
  var totalPct=totChk?Math.round(doneChk/totChk*100):0;

  // total time logged
  var totalMs=0;
  (APP.timerSessions||[]).forEach(function(s){totalMs+=s.end-s.start;});

  // current phase progress
  var curPh=getPhase(APP.phase);
  var curSt=getStep(curPh,APP.step);

  // day tracking
  var startDate=scope.start?new Date(scope.start):null;
  var endDate=scope.end?new Date(scope.end):null;
  var today=new Date();
  var dayStr='';
  if(startDate&&endDate){
    var elapsed=Math.ceil((today-startDate)/(1000*60*60*24));
    var total=Math.ceil((endDate-startDate)/(1000*60*60*24));
    dayStr=t('dash_day')+' '+Math.max(1,elapsed)+' '+t('dash_of')+' '+total;
  }

  var h='<div class="sec-hdr">';
  h+='<div><div class="sec-title">&#127775; '+t('dash_title')+'</div>';
  if(dayStr)h+='<div class="sec-subtitle">'+esc(dayStr)+'</div>';
  h+='</div>';
  // live timer badge
  if(APP.timerActive){
    h+='<div class="dash-timer-badge active">&#9210; '+esc(tx(getPhase(APP.timerSelPhase).short)||APP.timerSelPhase)+'</div>';
  }
  h+='</div>';

  h+='<div class="sec-body">';

  // engagement name + meta
  h+='<div class="dash-eng-header">';
  h+='<div><div class="dash-eng-name">'+esc(APP.eng)+'</div>';
  var metaParts=[];
  if(scope.type)metaParts.push(esc(scope.type));
  if(scope.client)metaParts.push(esc(scope.client));
  if(metaParts.length)h+='<div class="dash-eng-meta">'+metaParts.join(' &nbsp;·&nbsp; ')+'</div>';
  h+='</div>';
  h+='<button class="btn sm" onclick="setSection(\'scope\')">&#128196; '+t('dash_edit_scope')+'</button>';
  h+='</div>';

  // quick action buttons
  h+='<div class="dash-quick-actions">';
  h+='<button class="dash-action-btn" onclick="setSection(\'framework\')">&#128221; '+t('nav_framework')+'</button>';
  h+='<button class="dash-action-btn" onclick="openFinding(null);setSection(\'findings\')">+ '+t('add_finding')+'</button>';
  h+='<button class="dash-action-btn" onclick="setSection(\'timer\')'+(APP.timerActive?';stopTimer()':';startTimer()')+'">'+( APP.timerActive?'&#9632; '+t('stop_btn'):'&#9654; '+t('start_timer_btn'))+'</button>';
  h+='<button class="dash-action-btn" onclick="setSection(\'report\')">&#128202; '+t('nav_report')+'</button>';
  h+='</div>';

  // findings severity chips
  h+='<div class="dash-findings-row">';
  var sevDef=[['Critical','#dc2626'],['High','#ea580c'],['Medium','#ca8a04'],['Low','#16a34a'],['Info','#475569']];
  sevDef.forEach(function(s){
    var col=s[1];
    h+='<div class="dash-sev-chip" style="border-top-color:'+col+'">'
      +'<div class="dash-sev-num" style="color:'+col+'">'+( sevCounts[s[0]]||0)+'</div>'
      +'<div class="dash-sev-lbl">'+t('sev_'+s[0].toLowerCase())+'</div>'
      +'</div>';
  });
  h+='</div>';

  // stat cards
  h+='<div class="dash-grid">';
  var statItems=[
    {lbl:t('dash_total_findings'),val:findings.length,sub:openCount+' '+t('open_lbl'),col:'#3b82f6'},
    {lbl:t('dash_time_logged'),val:fmtDurShort(totalMs),sub:'',col:'#7c3aed'},
    {lbl:t('dash_progress'),val:totalPct+'%',sub:doneChk+'/'+totChk+' '+t('dash_checks'),col:'#22c55e'},
    {lbl:t('dash_profiles'),val:( APP.profiles||[]).length,sub:t('dash_active_engagement'),col:'#f59e0b'},
  ];
  statItems.forEach(function(s){
    h+='<div class="dash-stat">'
      +'<div class="dash-stat-accent" style="background:'+s.col+'"></div>'
      +'<div class="dash-stat-label">'+s.lbl+'</div>'
      +'<div class="dash-stat-value" style="color:'+s.col+'">'+s.val+'</div>'
      +(s.sub?'<div class="dash-stat-sub">'+s.sub+'</div>':'')
      +'</div>';
  });
  h+='</div>';

  // per-phase progress bars
  h+='<div class="dash-progress-card">';
  h+='<div class="dash-progress-header"><span class="dash-progress-title">'+t('dash_phase_progress')+'</span>'
    +'<span class="dash-progress-pct" style="color:'+curPh.color+'">'+totalPct+'%</span></div>';
  h+='<div class="dash-phase-bars">';
  PHASES.forEach(function(p){
    var tot=0,done=0;
    (p.steps||[]).forEach(function(st){
      (st.checklist||[]).forEach(function(c,i){tot++;if(APP.ck[st.id+'_'+i])done++;});
    });
    var pct=tot?Math.round(done/tot*100):0;
    h+='<div class="dash-phase-bar-row" onclick="selectPhase(\''+p.id+'\');setSection(\'framework\')" style="cursor:pointer">'
      +'<span class="dash-phase-icon">'+p.icon+'</span>'
      +'<span class="dash-phase-name" style="color:'+(APP.phase===p.id?p.color:'var(--t2)')+'">'+esc(tx(p.short))+'</span>'
      +'<div class="dash-phase-track"><div class="dash-phase-fill" style="width:'+pct+'%;background:'+p.color+'"></div></div>'
      +'<span class="dash-phase-pct">'+pct+'%</span>'
      +'</div>';
  });
  h+='</div></div>';

  // resume card
  h+='<div class="dash-resume-card" onclick="setSection(\'framework\')">'
    +'<div style="font-size:20px">'+curPh.icon+'</div>'
    +'<div class="dash-resume-info">'
    +'<div class="dash-resume-label">'+t('dash_continue')+'</div>'
    +'<div class="dash-resume-step">'+esc(tx(curSt.title))+'</div>'
    +'<div class="dash-resume-phase">'+esc(tx(curPh.label))+'</div>'
    +'</div>'
    +'<div class="dash-resume-arrow">'+(APP.lang==='ar'?'&#8592;':'&#8594;')+'</div>'
    +'</div>';

  // scope quick-ref (if configured)
  if(scope.targets&&scope.targets.length){
    h+='<div class="sos-box"><div class="sos-title">&#9888; '+t('quick_reference')+'</div>';
    h+='&#10003; '+t('scope_qr_inscope')+': '+esc(scope.targets.slice(0,4).join(', '))+(scope.targets.length>4?'…':'')+'<br>';
    if(scope.oot&&scope.oot.length)h+='&#10007; '+t('scope_qr_oos')+': '+esc(scope.oot.slice(0,2).join(', '))+(scope.oot.length>2?'…':'')+'<br>';
    if(scope.windows&&scope.windows.length)h+='&#128336; '+t('scope_qr_window')+': '+esc(scope.windows[0])+'<br>';
    if(scope.contacts&&scope.contacts.length)h+='&#128222; '+t('scope_qr_emergency')+': '+esc(scope.contacts[0].name)+' '+esc(scope.contacts[0].phone);
    h+='</div>';
  }

  h+='</div>';
  el.innerHTML=h;
}

function fmtDurShort(ms){
  if(!ms)return '0h';
  var s=Math.floor(ms/1000),hh=Math.floor(s/3600),mm=Math.floor((s%3600)/60);
  return hh+'h'+(mm?'  '+mm+'m':'');
}

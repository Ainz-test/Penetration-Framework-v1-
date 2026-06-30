function renderTimer(el){
  var sessions=APP.timerSessions||[];
  var active=APP.timerActive;
  var totals={};
  sessions.forEach(function(s){
    var dur=s.end-s.start;
    totals[s.phase]=(totals[s.phase]||0)+dur;
  });

  var h='<div class="sec-hdr"><div class="sec-title">&#9203; Time Tracker</div>'
    +'<button class="btn danger sm" onclick="clearTimerLog()">Clear Log</button></div>';

  var elapsedStr='00:00:00';
  if(active){
    var elapsed=Math.floor((Date.now()-active.start)/1000);
    var hh=Math.floor(elapsed/3600),mm=Math.floor((elapsed%3600)/60),ss=elapsed%60;
    elapsedStr=(hh<10?'0'+hh:hh)+':'+(mm<10?'0'+mm:mm)+':'+(ss<10?'0'+ss:ss);
  }

  h+='<div class="timer-display">'
    +'<div class="timer-clock">'+elapsedStr+'</div>'
    +'<div class="timer-phase-label">'+(active?'&#9210; '+esc(active.phase.toUpperCase()):'No timer running')+'</div>'
    +'<div class="timer-btns">';
  if(active){
    h+='<button class="btn danger" onclick="stopTimer()">&#9632; Stop</button>';
  }
  h+='</div></div>';

  h+='<div class="timer-phase-pick">';
  PHASES.forEach(function(p){
    h+='<button class="tph-btn'+(APP.timerSelPhase===p.id?' on':'')+'" onclick="APP.timerSelPhase=\''+p.id+'\';renderTimer(document.getElementById(\'secbody\'))" style="'+(APP.timerSelPhase===p.id?'border-color:'+p.color+';color:'+p.color+';background:rgba(0,0,0,.3)':'')+'">'
      +p.icon+' '+p.short+'</button>';
  });
  h+='</div>';

  if(!active){
    h+='<div style="padding:10px 20px;border-bottom:1px solid var(--bdr);flex-shrink:0">'
      +'<button class="btn primary" onclick="startTimer()" style="width:100%">&#9654; Start Timer — '+esc((APP.timerSelPhase||'select phase').toUpperCase())+'</button>'
      +'</div>';
  }

  h+='<div class="timer-log">';
  if(!sessions.length){h+='<div class="empty">No sessions logged yet. Start a timer above.</div>';}
  else{
    var grouped={};
    sessions.forEach(function(s){if(!grouped[s.phase])grouped[s.phase]=0;grouped[s.phase]+=s.end-s.start;});
    Object.keys(grouped).forEach(function(phase){
      var ms=grouped[phase];
      var ph=PHASES.find(function(p){return p.id===phase;})||{color:'#475569',icon:'?'};
      h+='<div class="timer-row">'
        +'<span style="font-size:14px">'+ph.icon+'</span>'
        +'<span class="timer-row-ph">'+esc(phase)+'</span>'
        +'<span class="timer-row-dur" style="color:'+ph.color+'">'+fmtDur(ms)+'</span>'
        +'</div>';
    });
    sessions.slice().reverse().slice(0,10).forEach(function(s){
      var ph=PHASES.find(function(p){return p.id===s.phase;})||{color:'#475569',icon:'?'};
      h+='<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.03)">'
        +'<span style="font-size:12px;color:var(--t3)">'+ph.icon+'</span>'
        +'<span style="font-size:11px;color:var(--t2);flex:1">'+esc(s.phase)+'</span>'
        +'<span style="font-size:11px;color:var(--t3)">'+fmtDate(s.start)+'</span>'
        +'<span style="font-size:12px;font-weight:600;font-family:monospace">'+fmtDur(s.end-s.start)+'</span>'
        +'</div>';
    });
  }
  h+='</div>';

  var totalMs=0;
  sessions.forEach(function(s){totalMs+=s.end-s.start;});
  h+='<div class="timer-total">'
    +'<span class="timer-total-lbl">Total Engagement Time</span>'
    +'<span class="timer-total-val">'+fmtDur(totalMs)+'</span>'
    +'</div>';
  el.innerHTML=h;
}

function fmtDur(ms){
  var s=Math.floor(ms/1000),hh=Math.floor(s/3600),mm=Math.floor((s%3600)/60),ss=s%60;
  return (hh>0?hh+'h ':'')+(mm<10?'0'+mm:mm)+'m '+(ss<10?'0'+ss:ss)+'s';
}

function startTimer(){
  if(APP.timerActive)stopTimer();
  APP.timerActive={phase:APP.timerSelPhase,start:Date.now()};
  if(APP.timerInterval)clearInterval(APP.timerInterval);
  APP.timerInterval=setInterval(function(){
    if(APP.section==='timer')renderTimer(document.getElementById('secbody'));
  },1000);
  renderTimer(document.getElementById('secbody'));
}

function stopTimer(){
  if(!APP.timerActive)return;
  var session={phase:APP.timerActive.phase,start:APP.timerActive.start,end:Date.now()};
  APP.timerSessions.push(session);
  psave('timer_sessions',APP.timerSessions);
  APP.timerActive=null;
  if(APP.timerInterval){clearInterval(APP.timerInterval);APP.timerInterval=null;}
  if(APP.section==='timer')renderTimer(document.getElementById('secbody'));
}

function clearTimerLog(){
  if(!confirm('Clear all timer sessions?'))return;
  APP.timerSessions=[];
  psave('timer_sessions',[]);
  renderTimer(document.getElementById('secbody'));
}

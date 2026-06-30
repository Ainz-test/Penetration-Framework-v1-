var CURR_CVSS={AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'};
var MITRE_SEARCH='';

function renderFindings(el){
  var findings=APP.findings||[];
  var sevCounts={Critical:0,High:0,Medium:0,Low:0,Info:0};
  findings.forEach(function(f){sevCounts[f.severity]=(sevCounts[f.severity]||0)+1;});
  var filtered=findings.filter(function(f){
    var sevOk=APP.fFilter==='all'||f.severity===APP.fFilter;
    var statOk=APP.fStatus==='all'||f.status===APP.fStatus;
    return sevOk&&statOk;
  });

  var h='<div class="sec-hdr">';
  h+='<div><div class="sec-title">&#128300; '+t('findings_title')+'</div>';
  h+='<div class="sec-subtitle">'+findings.length+' '+t('findings_count')+' — ';
  var parts=[];
  Object.keys(sevCounts).forEach(function(s){if(sevCounts[s])parts.push('<span style="color:'+SEV_COLORS[s]+'">'+sevCounts[s]+' '+t('sev_'+s.toLowerCase())+'</span>');});
  h+=parts.join(' | ')+'</div></div>';
  h+='<button class="btn primary" onclick="openFinding(null)">'+t('add_finding')+'</button></div>';

  h+='<div style="padding:12px 20px;border-bottom:1px solid var(--bdr);flex-shrink:0;display:flex;gap:6px;flex-wrap:wrap;background:var(--s1)">';
  var sevFilters=['all','Critical','High','Medium','Low','Info'];
  sevFilters.forEach(function(s){
    var col=s==='all'?'var(--t2)':SEV_COLORS[s];
    var lbl=s==='all'?t('all_lbl'):t('sev_'+s.toLowerCase());
    h+='<button class="sev-btn'+(APP.fFilter===s?' on':'')+'" onclick="setFFilter(\''+s+'\')" style="'+(APP.fFilter===s?'border-color:'+col+';color:'+col+';background:rgba(0,0,0,.3)':'')+'">'+lbl+'</button>';
  });
  h+='<span style="margin-left:4px;color:var(--bdr)">|</span>';
  var statusKeys={'all':'all_lbl','Open':'open_lbl','Fixed':'fixed_lbl','Risk Accepted':'risk_accepted_lbl'};
  ['all','Open','Fixed','Risk Accepted'].forEach(function(s){
    h+='<button class="sev-btn'+(APP.fStatus===s?' on':'')+'" onclick="setFStatus(\''+s+'\')" style="'+(APP.fStatus===s?'border-color:var(--t2);color:var(--t1)':'')+'">'+t(statusKeys[s])+'</button>';
  });
  h+='</div>';

  h+='<div class="sec-body">';
  if(!filtered.length){
    h+='<div class="empty">&#128300; '+t('no_findings_yet')+'<br>'+t('click_add_finding')+'</div>';
  }else{
    filtered.sort(function(a,b){
      var order={Critical:0,High:1,Medium:2,Low:3,Info:4};
      return (order[a.severity]||4)-(order[b.severity]||4);
    });
    filtered.forEach(function(f){
      var col=SEV_COLORS[f.severity]||'#475569';
      var statusLbl=f.status==='Fixed'?t('fixed_lbl'):f.status==='Risk Accepted'?t('risk_accepted_lbl'):t('open_lbl');
      h+='<div class="finding-row" onclick="openFinding(\''+f.id+'\')" style="border-left-color:'+col+'">'
        +'<div class="finding-sev" style="background:'+col+'"></div>'
        +'<div class="finding-info">'
        +'<div class="finding-title">'+esc(f.title||t('untitled_finding'))+'</div>'
        +'<div class="finding-meta">'
        +(f.affected?'<span>'+esc(f.affected)+'</span>':'')
        +(f.mitre?'<span style="color:#60a5fa">'+esc(f.mitre)+'</span>':'')
        +'<span style="color:'+(f.status==='Fixed'?'#22c55e':f.status==='Risk Accepted'?'#f59e0b':'#94a3b8')+'">'+statusLbl+'</span>'
        +'</div></div>'
        +'<div style="text-align:right;flex-shrink:0">'
        +'<div class="finding-score" style="color:'+col+'">'+esc(f.cvss_score||'—')+'</div>'
        +'<div class="finding-status">CVSS</div></div>'
        +'</div>';
    });
  }

  // Summary stats
  if(findings.length){
    h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128202; '+t('summary_lbl')+'</div></div><div class="card-body" style="display:flex;gap:16px;flex-wrap:wrap">';
    Object.keys(sevCounts).forEach(function(s){
      if(sevCounts[s]){
        h+='<div style="text-align:center"><div style="font-size:24px;font-weight:800;color:'+SEV_COLORS[s]+'">'+sevCounts[s]+'</div>'
          +'<div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em">'+t('sev_'+s.toLowerCase())+'</div></div>';
      }
    });
    var openCount=findings.filter(function(f){return f.status==='Open';}).length;
    h+='<div style="text-align:center"><div style="font-size:24px;font-weight:800;color:#f87171">'+openCount+'</div>'
      +'<div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em">'+t('open_lbl')+'</div></div>';
    h+='</div></div>';
  }
  h+='</div>';
  el.innerHTML=h;
}

function setFFilter(v){APP.fFilter=v;setSection('findings');}
function setFStatus(v){APP.fStatus=v;setSection('findings');}

function openFinding(id){
  var f=null;
  if(id){f=APP.findings.find(function(x){return x.id===id;});}
  if(!f){
    f={id:genId(),title:'',severity:'High',status:'Open',affected:'',description:'',business_impact:'',evidence:'',remediation:'',mitre:'',mitre_name:'',cvss_score:'',cvss_vector:'',created:Date.now(),
      cvss:{AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'}};
  }
  APP.editFinding=JSON.parse(JSON.stringify(f));
  CURR_CVSS=Object.assign({AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'},f.cvss||{});
  MITRE_SEARCH='';
  renderFindingPanel();
}

function closeFinding(){
  APP.editFinding=null;
  document.getElementById('findingPanel').classList.remove('open');
}

function renderFindingPanel(){
  var f=APP.editFinding;
  var score=calcCVSS(CURR_CVSS);
  var sev=cvssToSev(score);
  var col=SEV_COLORS[sev]||'#475569';
  var panel=document.getElementById('findingPanel');

  var h='<div class="detail-hdr">'
    +'<div style="font-size:14px;font-weight:700;color:var(--t1)">'+(f.id&&APP.findings.find(function(x){return x.id===f.id;})?t('edit_finding'):t('new_finding'))+'</div>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="btn danger sm" onclick="deleteFindingById(\''+f.id+'\')">'+t('delete_btn')+'</button>'
    +'<button class="btn success sm" onclick="saveFindingFromPanel()">'+t('save_btn')+'</button>'
    +'<button class="btn sm" onclick="closeFinding()">&#10005;</button>'
    +'</div></div>'
    +'<div class="detail-body">';

  // Title + Status
  h+='<div><div class="field-lbl">'+t('finding_title_lbl')+'</div>'
    +'<input class="field-inp" id="fp_title" value="'+esc(f.title||'')+'" placeholder="'+esc(t('finding_title_ph'))+'"></div>';

  h+='<div class="field-row">'
    +'<div class="field-group"><div class="field-lbl">'+t('status_lbl')+'</div>'
    +'<select class="field-sel" id="fp_status">'
    +[['Open','open_lbl'],['Fixed','fixed_lbl'],['Risk Accepted','risk_accepted_lbl']].map(function(s){return '<option value="'+s[0]+'"'+(f.status===s[0]?' selected':'')+'>'+t(s[1])+'</option>';}).join('')
    +'</select></div>'
    +'<div class="field-group"><div class="field-lbl">'+t('affected_lbl')+'</div>'
    +'<input class="field-inp" id="fp_affected" value="'+esc(f.affected||'')+'" placeholder="https://target.com/login"></div>'
    +'</div>';

  // CVSS Calculator
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128200; '+t('cvss_calc_title')+'</div>'
    +'<div style="display:flex;align-items:center;gap:8px">'
    +'<span style="font-size:22px;font-weight:800;color:'+col+'">'+score+'</span>'
    +'<span class="badge" style="background:'+col+'">'+t('sev_'+sev.toLowerCase())+'</span>'
    +'</div></div>'
    +'<div class="card-body">'
    +'<div class="cvss-grid">';

  var metrics=[
    {k:'AV',lbl:t('attack_vector'),opts:[['N',t('cvss_network')],['A',t('cvss_adjacent')],['L',t('cvss_local')],['P',t('cvss_physical')]]},
    {k:'AC',lbl:t('attack_complexity'),opts:[['L',t('cvss_low')],['H',t('cvss_high')]]},
    {k:'PR',lbl:t('privileges_required'),opts:[['N',t('cvss_none')],['L',t('cvss_low')],['H',t('cvss_high')]]},
    {k:'UI',lbl:t('user_interaction'),opts:[['N',t('cvss_none')],['R',t('cvss_required')]]},
    {k:'S',lbl:t('scope_metric'),opts:[['U',t('cvss_unchanged')],['C',t('cvss_changed')]]},
    {k:'C',lbl:t('confidentiality'),opts:[['N',t('cvss_none')],['L',t('cvss_low')],['H',t('cvss_high')]]},
    {k:'I',lbl:t('integrity'),opts:[['N',t('cvss_none')],['L',t('cvss_low')],['H',t('cvss_high')]]},
    {k:'A',lbl:t('availability'),opts:[['N',t('cvss_none')],['L',t('cvss_low')],['H',t('cvss_high')]]},
  ];
  metrics.forEach(function(m){
    h+='<div class="cvss-metric"><div class="cvss-lbl">'+m.lbl+'</div>'
      +'<select class="cvss-sel" onchange="setCVSS(\''+m.k+'\',this.value)">';
    m.opts.forEach(function(o){
      h+='<option value="'+o[0]+'"'+(CURR_CVSS[m.k]===o[0]?' selected':'')+'>'+o[0]+' - '+o[1]+'</option>';
    });
    h+='</select></div>';
  });
  h+='</div>';
  var vector='CVSS:3.1/AV:'+CURR_CVSS.AV+'/AC:'+CURR_CVSS.AC+'/PR:'+CURR_CVSS.PR+'/UI:'+CURR_CVSS.UI+'/S:'+CURR_CVSS.S+'/C:'+CURR_CVSS.C+'/I:'+CURR_CVSS.I+'/A:'+CURR_CVSS.A;
  h+='<div class="cvss-vector" style="margin-top:6px;color:var(--t3);font-size:9px;font-family:monospace">'+vector+'</div>';
  h+='</div></div>';

  // MITRE ATT&CK
  h+='<div><div class="field-lbl">'+t('mitre_technique')+'</div>';
  if(f.mitre){
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      +'<span style="font-size:11px;color:#60a5fa;font-family:monospace">'+esc(f.mitre)+'</span>'
      +'<span style="font-size:11px;color:var(--t1)">'+esc(f.mitre_name||'')+'</span>'
      +'<button class="btn sm" onclick="clearMitre()" style="margin-left:auto">&#10005; '+t('clear_btn')+'</button>'
      +'</div>';
  }
  h+='<input class="mitre-search" id="mitre_search" placeholder="'+esc(t('search_techniques_ph'))+'" value="'+esc(MITRE_SEARCH)+'" oninput="filterMitre(this.value)">'
    +'<div class="mitre-list" id="mitre_list">';
  var mq=MITRE_SEARCH.toLowerCase();
  var shown=MITRE.filter(function(m){return !mq||(m.id+tx(m.name)+tx(m.tactic)).toLowerCase().indexOf(mq)>=0;}).slice(0,20);
  shown.forEach(function(m){
    h+='<div class="mitre-item'+(f.mitre===m.id?' sel':'')+'" onclick="selectMitre(\''+esc(m.id)+'\',\''+esc(tx(m.name).replace(/'/g,"\\'"))+'\')">'
      +'<span class="mitre-id">'+esc(m.id)+'</span>'
      +'<span class="mitre-name">'+esc(tx(m.name))+'</span>'
      +'<span class="mitre-tactic">'+esc(tx(m.tactic))+'</span>'
      +'</div>';
  });
  h+='</div></div>';

  // Description
  h+='<div><div class="field-lbl">'+t('technical_desc')+'</div>'
    +'<textarea class="field-ta" id="fp_desc" rows="3" placeholder="'+esc(t('technical_desc_ph'))+'">'+esc(f.description||'')+'</textarea></div>';

  // Business Impact (with AI button)
  h+='<div>'
    +'<div class="field-lbl" style="display:flex;align-items:center;justify-content:space-between">'
    +'<span>&#128184; '+t('business_impact_lbl')+'</span>'
    +'<button class="btn ai sm" onclick="aiBusinessImpact()">&#10024; '+t('ai_generate')+'</button>'
    +'</div>'
    +'<div class="ai-field">'
    +'<textarea class="field-ta" id="fp_impact" rows="4" placeholder="'+esc(t('business_impact_ph'))+'">'+esc(f.business_impact||'')+'</textarea>'
    +'<div class="ai-overlay" id="ai_impact_overlay">&#129302; '+t('generating_impact')+'</div>'
    +'</div></div>';

  // Evidence
  h+='<div><div class="field-lbl">'+t('evidence_lbl')+'</div>'
    +'<textarea class="field-ta" id="fp_evidence" rows="3" placeholder="'+esc(t('evidence_ph'))+'">'+esc(f.evidence||'')+'</textarea></div>';

  // Remediation (with AI button)
  h+='<div>'
    +'<div class="field-lbl" style="display:flex;align-items:center;justify-content:space-between">'
    +'<span>&#128295; '+t('remediation_lbl')+'</span>'
    +'<button class="btn ai sm" onclick="aiRemediation()">&#10024; '+t('ai_enhance')+'</button>'
    +'</div>'
    +'<div class="ai-field">'
    +'<textarea class="field-ta" id="fp_remediaton" rows="4" placeholder="'+esc(t('remediation_ph'))+'">'+esc(f.remediation||'')+'</textarea>'
    +'<div class="ai-overlay" id="ai_remed_overlay">&#129302; '+t('enhancing_remediation')+'</div>'
    +'</div></div>';

  h+='<div style="height:60px"></div></div>';
  panel.innerHTML=h;
  panel.classList.add('open');
}

function syncFindingFields(){
  var f=APP.editFinding;
  if(!f)return;
  var ids=[['fp_title','title'],['fp_status','status'],['fp_affected','affected'],['fp_desc','description'],['fp_impact','business_impact'],['fp_evidence','evidence'],['fp_remediaton','remediation']];
  ids.forEach(function(pair){
    var el=document.getElementById(pair[0]);
    if(el)f[pair[1]]=el.value;
  });
}

function setCVSS(k,v){
  syncFindingFields();
  CURR_CVSS[k]=v;
  var score=calcCVSS(CURR_CVSS);
  var sev=cvssToSev(score);
  var col=SEV_COLORS[sev]||'#475569';
  if(APP.editFinding){
    APP.editFinding.cvss=JSON.parse(JSON.stringify(CURR_CVSS));
    APP.editFinding.cvss_score=score;
    APP.editFinding.severity=sev;
  }
  renderFindingPanel();
}

function filterMitre(v){MITRE_SEARCH=v;syncFindingFields();renderFindingPanel();setTimeout(function(){var el=document.getElementById('mitre_search');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}},10);}

function selectMitre(id,name){
  syncFindingFields();
  if(APP.editFinding){APP.editFinding.mitre=id;APP.editFinding.mitre_name=name;}
  MITRE_SEARCH='';
  renderFindingPanel();
}

function clearMitre(){
  syncFindingFields();
  if(APP.editFinding){APP.editFinding.mitre='';APP.editFinding.mitre_name='';}
  renderFindingPanel();
}

function saveFindingFromPanel(){
  var f=APP.editFinding;
  if(!f)return;
  f.title=document.getElementById('fp_title').value||t('untitled_finding');
  f.status=document.getElementById('fp_status').value;
  f.affected=document.getElementById('fp_affected').value;
  f.description=document.getElementById('fp_desc').value;
  f.business_impact=document.getElementById('fp_impact').value;
  f.evidence=document.getElementById('fp_evidence').value;
  f.remediation=document.getElementById('fp_remediaton').value;
  f.cvss=JSON.parse(JSON.stringify(CURR_CVSS));
  f.cvss_score=calcCVSS(CURR_CVSS);
  f.severity=cvssToSev(f.cvss_score);
  var cvssV='CVSS:3.1/AV:'+CURR_CVSS.AV+'/AC:'+CURR_CVSS.AC+'/PR:'+CURR_CVSS.PR+'/UI:'+CURR_CVSS.UI+'/S:'+CURR_CVSS.S+'/C:'+CURR_CVSS.C+'/I:'+CURR_CVSS.I+'/A:'+CURR_CVSS.A;
  f.cvss_vector=cvssV;
  var idx=APP.findings.findIndex(function(x){return x.id===f.id;});
  if(idx>=0)APP.findings[idx]=f;else APP.findings.push(f);
  psave('findings',APP.findings);
  closeFinding();
  setSection('findings');
}

function deleteFindingById(id){
  if(!id)return;
  if(!confirm(t('delete_finding_confirm')))return;
  APP.findings=APP.findings.filter(function(f){return f.id!==id;});
  psave('findings',APP.findings);
  closeFinding();
  setSection('findings');
}

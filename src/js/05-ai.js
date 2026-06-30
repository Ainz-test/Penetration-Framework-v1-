function aiCall(prompt,onSuccess,onError){
  var key=APP.apiKey;
  var endpoint=APP.apiEndpoint||'/api/chat';
  if(!key&&endpoint==='/api/chat'){
    onError(t('ai_no_key_error'));
    return;
  }
  var body={prompt:prompt};
  var headers={'Content-Type':'application/json'};
  if(key&&endpoint!=='/api/chat'){
    // Direct Anthropic API
    headers['x-api-key']=key;
    headers['anthropic-version']='2023-06-01';
    body={model:'claude-sonnet-4-6',max_tokens:1024,messages:[{role:'user',content:prompt}]};
    endpoint='https://api.anthropic.com/v1/messages';
  }
  fetch(endpoint,{method:'POST',headers:headers,body:JSON.stringify(body)})
  .then(function(r){return r.json();})
  .then(function(data){
    var text='';
    if(data.content&&data.content[0])text=data.content[0].text||data.text||'';
    else if(data.text)text=data.text;
    onSuccess(text);
  })
  .catch(function(e){onError(e.toString());});
}

function aiLangInstruction(){
  return APP.lang==='ar'?'\n\nIMPORTANT: Write your entire response in formal, professional Modern Standard Arabic (Fusha) suitable for an official security report — not English, not transliterated.':'';
}

function aiBusinessImpact(){
  var f=APP.editFinding;
  if(!f)return;
  var title=document.getElementById('fp_title').value||f.title||'';
  var desc=document.getElementById('fp_desc').value||f.description||'';
  var affected=document.getElementById('fp_affected').value||f.affected||'';
  var sev=cvssToSev(calcCVSS(CURR_CVSS));
  if(!title&&!desc){alert(t('add_title_desc_first'));return;}
  var prompt='You are a senior penetration testing consultant writing a report for C-suite executives. Transform this technical security finding into clear business impact language a CEO, CFO, or Board member would understand. Focus on financial risk (breach costs, fines), operational risk (downtime, data loss), reputational risk, and compliance violations. Be specific with real-world impact. Write 3-4 concise sentences. No markdown, no headers, just the paragraph.\n\nFinding: '+title+'\nSeverity: '+sev+'\nAffected: '+affected+'\nTechnical detail: '+desc+aiLangInstruction();
  var overlay=document.getElementById('ai_impact_overlay');
  var ta=document.getElementById('fp_impact');
  if(overlay)overlay.style.display='flex';
  if(ta)ta.style.opacity='0.3';
  aiCall(prompt,function(text){
    if(overlay)overlay.style.display='none';
    if(ta){ta.style.opacity='1';ta.value=text;}
    if(APP.editFinding)APP.editFinding.business_impact=text;
  },function(err){
    if(overlay)overlay.style.display='none';
    if(ta)ta.style.opacity='1';
    alert(t('ai_error_prefix')+' '+err);
  });
}

function aiRemediation(){
  var f=APP.editFinding;
  if(!f)return;
  var title=document.getElementById('fp_title').value||f.title||'';
  var desc=document.getElementById('fp_desc').value||f.description||'';
  var basic=document.getElementById('fp_remediaton').value||f.remediation||'';
  var sev=cvssToSev(calcCVSS(CURR_CVSS));
  if(!title){alert(t('add_title_first'));return;}
  var prompt='You are a senior security engineer. Provide an elite-quality, specific, and actionable remediation plan for this security finding. Include: exact patches/versions, specific configuration changes with commands, which team is responsible (Dev/DevOps/Security/IT), realistic timeline based on severity, and verification steps. Write in clear sections. No fluff.\n\nFinding: '+title+'\nSeverity: '+sev+'\nTechnical detail: '+desc+'\nBasic fix idea: '+basic+aiLangInstruction();
  var overlay=document.getElementById('ai_remed_overlay');
  var ta=document.getElementById('fp_remediaton');
  if(overlay)overlay.style.display='flex';
  if(ta)ta.style.opacity='0.3';
  aiCall(prompt,function(text){
    if(overlay)overlay.style.display='none';
    if(ta){ta.style.opacity='1';ta.value=text;}
    if(APP.editFinding)APP.editFinding.remediation=text;
  },function(err){
    if(overlay)overlay.style.display='none';
    if(ta)ta.style.opacity='1';
    alert(t('ai_error_prefix')+' '+err);
  });
}

function aiKillChainNarrative(){
  var stages=APP.kc||[];
  if(!stages.length){alert(t('add_kc_stages_first'));return;}
  var stageText=stages.map(function(s){
    var nm=s.nameKey?t(s.nameKey):s.name;
    return nm+': '+s.items.join(', ');
  }).join(' → ');
  var client=APP.scope&&APP.scope.client?APP.scope.client:'the target organization';
  var prompt='You are a penetration tester writing an executive report. Create a compelling, concise narrative (4-6 sentences) describing this attack chain from the attacker perspective in business language. Show the full progression from initial access to impact. Make it clear WHY this matters to the board. No technical jargon — write for a CEO.\n\nClient: '+client+'\nAttack chain: '+stageText+aiLangInstruction();
  var ta=document.getElementById('kc_narr_ta');
  if(ta){ta.value=t('killchain_title')+'...';ta.style.opacity='0.5';}
  aiCall(prompt,function(text){
    APP.kcNarr=text;
    psave('kc_narr',text);
    if(ta){ta.value=text;ta.style.opacity='1';}
  },function(err){
    if(ta)ta.style.opacity='1';
    alert(t('ai_error_prefix')+' '+err);
  });
}

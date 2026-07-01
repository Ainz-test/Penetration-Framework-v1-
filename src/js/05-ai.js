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

/* ── Enhanced Translator ─────────────────────────────────────────────── */

function aiTranslateFinding(){
  var f=APP.editFinding;
  if(!f)return;
  // sync current form state first
  syncFindingFields();
  var targetLang=APP.lang==='ar'?'en':'ar';
  var targetLangName=targetLang==='ar'?'Arabic':'English';
  var sourceLang=APP.lang==='ar'?'English':'Arabic';

  // build the content to translate
  var parts=[];
  var fields=[['fp_title',t('finding_title_lbl')],['fp_desc',t('technical_desc')],
              ['fp_impact',t('business_impact_lbl')],['fp_evidence',t('evidence_lbl')],
              ['fp_remediaton',t('remediation_lbl')]];
  fields.forEach(function(pair){
    var el=document.getElementById(pair[0]);
    if(el&&el.value.trim()){
      parts.push('### '+pair[1]+'\n'+el.value.trim());
    }
  });
  if(!parts.length){alert(t('add_title_desc_first'));return;}

  var prompt='You are a professional penetration testing report translator. Translate the following security finding fields from '+sourceLang+' to '+targetLangName+'. Preserve technical terms (CVE IDs, tool names, command syntax, URLs, IP addresses, protocol names) exactly as-is. Translate prose naturally and professionally. Return ONLY the translated fields in the exact same ### Field Name structure, with no preamble or commentary.\n\n'+parts.join('\n\n');

  // show loading state on all textareas
  var allOverlays=['ai_impact_overlay','ai_remed_overlay'];
  allOverlays.forEach(function(id){var o=document.getElementById(id);if(o)o.style.display='flex';});
  // disable translate btn
  var btn=document.getElementById('ai_translate_btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ '+t('ai_translating');}

  aiCall(prompt,function(text){
    // parse response back into fields
    var lines=text.split('\n');
    var currentField=null;
    var currentContent=[];
    var fieldMap={};
    lines.forEach(function(line){
      if(line.indexOf('### ')===0){
        if(currentField&&currentContent.length){
          fieldMap[currentField]=currentContent.join('\n').trim();
        }
        currentField=line.replace('### ','').trim();
        currentContent=[];
      }else{
        currentContent.push(line);
      }
    });
    if(currentField&&currentContent.length)fieldMap[currentField]=currentContent.join('\n').trim();

    // apply back — match by field label in current language
    var labelToId={};
    fields.forEach(function(pair){labelToId[pair[1]]=pair[0];});
    Object.keys(fieldMap).forEach(function(label){
      var elId=labelToId[label];
      if(elId){
        var el=document.getElementById(elId);
        if(el)el.value=fieldMap[label];
      }
    });

    allOverlays.forEach(function(id){var o=document.getElementById(id);if(o)o.style.display='none';});
    if(btn){btn.disabled=false;btn.textContent='↔ '+t('ai_translate');}
    // flash all textareas to indicate update
    fields.forEach(function(pair){
      var el=document.getElementById(pair[0]);
      if(el){
        el.style.transition='background .4s';
        el.style.background='rgba(59,91,219,.12)';
        setTimeout(function(){el.style.background='';},800);
      }
    });
  },function(err){
    allOverlays.forEach(function(id){var o=document.getElementById(id);if(o)o.style.display='none';});
    if(btn){btn.disabled=false;btn.textContent='↔ '+t('ai_translate');}
    alert(t('ai_error_prefix')+' '+err);
  });
}

function aiBulkTranslate(){
  var findings=APP.findings||[];
  if(!findings.length){alert(t('no_findings_yet'));return;}
  var targetLang=APP.lang==='ar'?'en':'ar';
  var targetLangName=targetLang==='ar'?'Arabic':'English';
  var sourceLang=APP.lang==='ar'?'English':'Arabic';
  var total=findings.length;
  var done=0;
  var failed=0;

  // show a progress overlay
  var sb=document.getElementById('secbody');
  var progressEl=document.createElement('div');
  progressEl.style.cssText='position:fixed;bottom:20px;right:20px;background:var(--s1);border:1px solid var(--bdr);border-radius:10px;padding:14px 18px;z-index:9000;font-size:12px;color:var(--t1);min-width:220px;animation:fadeup .2s ease';
  progressEl.id='bulk_translate_progress';
  document.body.appendChild(progressEl);

  function updateProgress(){
    var el=document.getElementById('bulk_translate_progress');
    if(!el)return;
    el.textContent='↔ '+t('ai_translating')+': '+done+'/'+total+(failed?' ('+failed+' '+t('ai_error_prefix').toLowerCase()+')':'');
  }
  updateProgress();

  // translate sequentially to avoid rate limiting
  var idx=0;
  function translateNext(){
    if(idx>=findings.length){
      psave('findings',APP.findings);
      var el=document.getElementById('bulk_translate_progress');
      if(el){
        el.textContent='✅ '+t('ai_translate')+' '+done+'/'+total;
        setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},3000);
      }
      setSection('findings');
      return;
    }
    var f=findings[idx++];
    var parts=[];
    if(f.title)parts.push('### title\n'+f.title);
    if(f.description)parts.push('### description\n'+f.description);
    if(f.business_impact)parts.push('### business_impact\n'+f.business_impact);
    if(f.remediation)parts.push('### remediation\n'+f.remediation);
    if(!parts.length){done++;updateProgress();translateNext();return;}

    var prompt='Translate these penetration testing finding fields from '+sourceLang+' to '+targetLangName+'. Preserve: CVE IDs, tool names, command syntax, URLs, IP addresses, protocol names exactly as-is. Return ONLY the translated fields in the exact same ### key structure with no preamble.\n\n'+parts.join('\n\n');
    aiCall(prompt,function(text){
      var lines=text.split('\n');
      var cur=null,content=[];
      var map={};
      lines.forEach(function(line){
        if(line.indexOf('### ')===0){
          if(cur&&content.length)map[cur]=content.join('\n').trim();
          cur=line.replace('### ','').trim();content=[];
        }else content.push(line);
      });
      if(cur&&content.length)map[cur]=content.join('\n').trim();
      if(map.title)f.title=map.title;
      if(map.description)f.description=map.description;
      if(map.business_impact)f.business_impact=map.business_impact;
      if(map.remediation)f.remediation=map.remediation;
      done++;updateProgress();translateNext();
    },function(){failed++;done++;updateProgress();translateNext();});
  }
  translateNext();
}

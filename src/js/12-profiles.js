function renderProfiles(el){
  var profiles=APP.profiles||[];
  var h='<div class="sec-hdr">'
    +'<div><div class="sec-title">&#128100; '+t('profiles_title')+'</div>'
    +'<div class="sec-subtitle">'+t('profiles_subtitle')+'</div></div>'
    +'<button class="btn primary" onclick="addProfile()">'+t('new_profile')+'</button></div>';
  h+='<div class="sec-body">';
  h+='<div class="profile-list">';
  profiles.forEach(function(p){
    var isOn=p.id===APP.profile;
    var findings=JSON.parse(localStorage.getItem('apt_'+p.id+'_findings')||'[]');
    h+='<div class="profile-item'+(isOn?' on':'')+'">'
      +'<div style="flex:1">'
      +'<div class="profile-name">'+esc(p.name)+'</div>'
      +'<div class="profile-meta">'+(isOn?'&#9679; '+t('active_lbl')+' — ':'')+findings.length+' '+t('findings_count2')+' &nbsp;·&nbsp; '+t('created_lbl')+' '+fmtDate(p.created)+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:6px">'
      +(isOn?'':'<button class="btn sm primary" onclick="switchProfile(\''+p.id+'\')">'+t('switch_btn')+'</button>')
      +(profiles.length>1&&!isOn?'<button class="btn sm danger" onclick="deleteProfile(\''+p.id+'\')">'+t('delete_btn')+'</button>':'')
      +'</div>'
      +'</div>';
  });
  h+='</div>';
  h+='<div class="card"><div class="card-body" style="font-size:11px;color:var(--t2);line-height:1.8">'
    +'<strong style="color:var(--t1)">'+t('how_profiles_work')+'</strong><br>'
    +t('profiles_desc1')+'<br>'
    +t('profiles_desc2')
    +'</div></div>';
  h+='</div>';
  el.innerHTML=h;
}

function addProfile(){
  var name=prompt(t('engagement_name_prompt2'),'');
  if(!name||!name.trim())return;
  var p={id:genId(),name:name.trim(),created:Date.now()};
  APP.profiles.push(p);
  localStorage.setItem('apt_profiles',JSON.stringify(APP.profiles));
  switchProfile(p.id);
}

function switchProfile(id){
  if(APP.timerActive)stopTimer();
  APP.profile=id;
  localStorage.setItem('apt_profile',id);
  loadProfile();
  renderProfiles(document.getElementById('secbody'));
  document.getElementById('engname').textContent=APP.eng;
}

function deleteProfile(id){
  if(!confirm(t('delete_profile_confirm')))return;
  APP.profiles=APP.profiles.filter(function(p){return p.id!==id;});
  localStorage.setItem('apt_profiles',JSON.stringify(APP.profiles));
  renderProfiles(document.getElementById('secbody'));
}

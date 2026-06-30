function renderScope(el){
  var s=APP.scope;
  var h='<div class="sec-hdr">'
    +'<div><div class="sec-title">&#127919; '+t('scope_title')+'</div>'
    +'<div class="sec-subtitle">'+t('scope_subtitle')+'</div></div>'
    +'<button class="btn primary" onclick="saveScope()">&#128190; '+t('save_btn2')+'</button></div>';
  h+='<div class="sec-body">';

  // Engagement info
  var typeOpts=[['Black Box','test_type_blackbox'],['Grey Box','test_type_greybox'],['White Box','test_type_whitebox'],['Red Team','test_type_redteam'],['Physical','test_type_physical'],['Social Engineering','test_type_socialeng']];
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128196; '+t('engagement_info')+'</div></div><div class="card-body">'
    +'<div class="field-row" style="margin-bottom:8px">'
    +'<div class="field-group"><div class="field-lbl">'+t('client_name')+'</div><input class="field-inp" id="sc_client" value="'+esc(s.client||'')+'" placeholder="'+esc(t('client_name_ph'))+'" oninput="scopeField(\'client\',this.value)"></div>'
    +'<div class="field-group"><div class="field-lbl">'+t('test_type')+'</div>'
    +'<select class="field-sel" id="sc_type" onchange="scopeField(\'type\',this.value)">'
    +typeOpts.map(function(o){return '<option value="'+o[0]+'"'+(s.type===o[0]?' selected':'')+'>'+t(o[1])+'</option>';}).join('')
    +'</select></div></div>'
    +'<div class="field-row">'
    +'<div class="field-group"><div class="field-lbl">'+t('start_date')+'</div><input class="field-inp" type="date" id="sc_start" value="'+esc(s.start||'')+'" oninput="scopeField(\'start\',this.value)"></div>'
    +'<div class="field-group"><div class="field-lbl">'+t('end_date')+'</div><input class="field-inp" type="date" id="sc_end" value="'+esc(s.end||'')+'" oninput="scopeField(\'end\',this.value)"></div>'
    +'</div></div></div>';

  // In-scope + OOS grid
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';

  // In-scope
  h+='<div class="card"><div class="card-hdr"><div class="card-title" style="color:#22c55e">&#10003; '+t('in_scope')+'</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_in_list">';
  (s.targets||[]).forEach(function(t2,i){
    h+='<li class="scope-item"><span class="scope-item-text">'+esc(t2)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'in\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_in_inp" placeholder="'+esc(t('in_scope_ph'))+'" onkeydown="if(event.key===\'Enter\')addScope(\'in\')">'
    +'<button class="btn sm" onclick="addScope(\'in\')">+</button>'
    +'</div></div></div>';

  // Out-of-scope
  h+='<div class="card"><div class="card-hdr"><div class="card-title" style="color:#f87171">&#10007; '+t('out_of_scope')+'</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_oot_list">';
  (s.oot||[]).forEach(function(t2,i){
    h+='<li class="scope-item"><span class="scope-item-text" style="color:#f87171">'+esc(t2)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'oot\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_oot_inp" placeholder="'+esc(t('oos_ph'))+'" onkeydown="if(event.key===\'Enter\')addScope(\'oot\')">'
    +'<button class="btn sm danger" onclick="addScope(\'oot\')">+</button>'
    +'</div></div></div>';
  h+='</div>';

  // Testing windows
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128336; '+t('testing_windows')+'</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_win_list" style="margin-bottom:8px">';
  (s.windows||[]).forEach(function(t2,i){
    h+='<li class="scope-item"><span class="scope-item-text">'+esc(t2)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'win\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_win_inp" placeholder="'+esc(t('testing_window_ph'))+'" onkeydown="if(event.key===\'Enter\')addScope(\'win\')">'
    +'<button class="btn sm" onclick="addScope(\'win\')">+</button>'
    +'</div></div></div>';

  // Emergency contacts
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128222; '+t('emergency_contacts')+'</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">';
  (s.contacts||[]).forEach(function(c,i){
    h+='<div class="contact-card">'
      +'<div class="contact-info">'
      +'<div class="contact-name">'+esc(c.name||'')+'</div>'
      +'<div class="contact-role">'+esc(c.role||'')+'</div>'
      +'<div class="contact-phone">'+esc(c.phone||'')+'</div>'
      +'</div>'
      +'<button class="scope-del" onclick="removeScope(\'contact\','+i+')">&#10005;</button>'
      +'</div>';
  });
  h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">'
    +'<input class="field-inp" id="sc_c_name" placeholder="'+esc(t('name_ph'))+'" style="flex:1;min-width:80px">'
    +'<input class="field-inp" id="sc_c_role" placeholder="'+esc(t('role_ph'))+'" style="flex:1;min-width:80px">'
    +'<input class="field-inp" id="sc_c_phone" placeholder="+1-555-0100" style="flex:1;min-width:100px">'
    +'<button class="btn sm" onclick="addContact()">+</button>'
    +'</div>'
    +'</div></div>';

  // Quick reference box
  var qr='<div class="sos-box"><div class="sos-title">&#9888; '+t('quick_reference')+'</div>';
  if(s.targets&&s.targets.length)qr+='&#10003; '+t('scope_qr_inscope')+': '+s.targets.slice(0,3).join(', ')+(s.targets.length>3?'...':'')+' <br>';
  if(s.oot&&s.oot.length)qr+='&#10007; '+t('scope_qr_oos')+': '+s.oot.slice(0,2).join(', ')+(s.oot.length>2?'...':'')+'<br>';
  if(s.windows&&s.windows.length)qr+='&#128336; '+t('scope_qr_window')+': '+s.windows[0]+'<br>';
  if(s.contacts&&s.contacts.length)qr+='&#128222; '+t('scope_qr_emergency')+': '+s.contacts[0].name+' '+s.contacts[0].phone;
  qr+='</div>';
  h+=qr;

  h+='</div>';
  el.innerHTML=h;
}

function scopeField(k,v){APP.scope[k]=v;}

function addScope(type){
  var inp=document.getElementById(type==='in'?'sc_in_inp':type==='oot'?'sc_oot_inp':'sc_win_inp');
  if(!inp||!inp.value.trim())return;
  var v=inp.value.trim();
  if(type==='in')APP.scope.targets.push(v);
  else if(type==='oot')APP.scope.oot.push(v);
  else APP.scope.windows.push(v);
  inp.value='';
  renderScope(document.getElementById('secbody'));
}

function removeScope(type,i){
  if(type==='in')APP.scope.targets.splice(i,1);
  else if(type==='oot')APP.scope.oot.splice(i,1);
  else if(type==='win')APP.scope.windows.splice(i,1);
  else if(type==='contact')APP.scope.contacts.splice(i,1);
  renderScope(document.getElementById('secbody'));
}

function addContact(){
  var name=document.getElementById('sc_c_name').value.trim();
  var role=document.getElementById('sc_c_role').value.trim();
  var phone=document.getElementById('sc_c_phone').value.trim();
  if(!name)return;
  APP.scope.contacts.push({name:name,role:role,phone:phone});
  renderScope(document.getElementById('secbody'));
}

function saveScope(){
  psave('scope',APP.scope);
  var sb=document.getElementById('secbody');
  if(sb){renderScope(sb);}
  // flash
  var btn=document.querySelector('.sec-hdr .btn');
  if(btn){var orig=btn.textContent;btn.textContent=t('saved_flash');setTimeout(function(){btn.textContent=orig;},1000);}
}

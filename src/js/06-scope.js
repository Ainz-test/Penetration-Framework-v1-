function renderScope(el){
  var s=APP.scope;
  var h='<div class="sec-hdr">'
    +'<div><div class="sec-title">&#127919; Scope Manager</div>'
    +'<div class="sec-subtitle">Engagement scope, targets, contacts. Reference this during the test.</div></div>'
    +'<button class="btn primary" onclick="saveScope()">&#128190; Save</button></div>';
  h+='<div class="sec-body">';

  // Engagement info
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128196; Engagement Info</div></div><div class="card-body">'
    +'<div class="field-row" style="margin-bottom:8px">'
    +'<div class="field-group"><div class="field-lbl">Client Name</div><input class="field-inp" id="sc_client" value="'+esc(s.client||'')+'" placeholder="Acme Corporation" oninput="scopeField(\'client\',this.value)"></div>'
    +'<div class="field-group"><div class="field-lbl">Test Type</div>'
    +'<select class="field-sel" id="sc_type" onchange="scopeField(\'type\',this.value)">'
    +['Black Box','Grey Box','White Box','Red Team','Physical','Social Engineering'].map(function(t){return '<option value="'+t+'"'+(s.type===t?' selected':'')+'>'+t+'</option>';}).join('')
    +'</select></div></div>'
    +'<div class="field-row">'
    +'<div class="field-group"><div class="field-lbl">Start Date</div><input class="field-inp" type="date" id="sc_start" value="'+esc(s.start||'')+'" oninput="scopeField(\'start\',this.value)"></div>'
    +'<div class="field-group"><div class="field-lbl">End Date</div><input class="field-inp" type="date" id="sc_end" value="'+esc(s.end||'')+'" oninput="scopeField(\'end\',this.value)"></div>'
    +'</div></div></div>';

  // In-scope + OOS grid
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';

  // In-scope
  h+='<div class="card"><div class="card-hdr"><div class="card-title" style="color:#22c55e">&#10003; In-Scope</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_in_list">';
  (s.targets||[]).forEach(function(t,i){
    h+='<li class="scope-item"><span class="scope-item-text">'+esc(t)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'in\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_in_inp" placeholder="IP, CIDR, or domain..." onkeydown="if(event.key===\'Enter\')addScope(\'in\')">'
    +'<button class="btn sm" onclick="addScope(\'in\')">+</button>'
    +'</div></div></div>';

  // Out-of-scope
  h+='<div class="card"><div class="card-hdr"><div class="card-title" style="color:#f87171">&#10007; Out of Scope</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_oot_list">';
  (s.oot||[]).forEach(function(t,i){
    h+='<li class="scope-item"><span class="scope-item-text" style="color:#f87171">'+esc(t)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'oot\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_oot_inp" placeholder="Excluded IP, domain, system..." onkeydown="if(event.key===\'Enter\')addScope(\'oot\')">'
    +'<button class="btn sm danger" onclick="addScope(\'oot\')">+</button>'
    +'</div></div></div>';
  h+='</div>';

  // Testing windows
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128336; Testing Windows</div></div><div class="card-body">'
    +'<ul class="scope-list" id="scope_win_list" style="margin-bottom:8px">';
  (s.windows||[]).forEach(function(t,i){
    h+='<li class="scope-item"><span class="scope-item-text">'+esc(t)+'</span>'
      +'<button class="scope-del" onclick="removeScope(\'win\','+i+')">&#10005;</button></li>';
  });
  h+='</ul>'
    +'<div class="scope-add">'
    +'<input id="sc_win_inp" placeholder="e.g. Mon-Fri 18:00-06:00 UTC" onkeydown="if(event.key===\'Enter\')addScope(\'win\')">'
    +'<button class="btn sm" onclick="addScope(\'win\')">+</button>'
    +'</div></div></div>';

  // Emergency contacts
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128222; Emergency Contacts</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">';
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
    +'<input class="field-inp" id="sc_c_name" placeholder="Name" style="flex:1;min-width:80px">'
    +'<input class="field-inp" id="sc_c_role" placeholder="Role (CISO)" style="flex:1;min-width:80px">'
    +'<input class="field-inp" id="sc_c_phone" placeholder="+1-555-0100" style="flex:1;min-width:100px">'
    +'<button class="btn sm" onclick="addContact()">+</button>'
    +'</div>'
    +'</div></div>';

  // Quick reference box
  var qr='<div class="sos-box"><div class="sos-title">&#9888; Quick Reference</div>';
  if(s.targets&&s.targets.length)qr+='&#10003; IN-SCOPE: '+s.targets.slice(0,3).join(', ')+(s.targets.length>3?'...':'')+' <br>';
  if(s.oot&&s.oot.length)qr+='&#10007; OOS: '+s.oot.slice(0,2).join(', ')+(s.oot.length>2?'...':'')+'<br>';
  if(s.windows&&s.windows.length)qr+='&#128336; WINDOW: '+s.windows[0]+'<br>';
  if(s.contacts&&s.contacts.length)qr+='&#128222; EMERGENCY: '+s.contacts[0].name+' '+s.contacts[0].phone;
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
  if(btn){var orig=btn.textContent;btn.textContent='Saved!';setTimeout(function(){btn.textContent=orig;},1000);}
}

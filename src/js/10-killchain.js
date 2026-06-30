var KC_STAGES=['Reconnaissance','Weaponization','Delivery','Exploitation','Installation','Command & Control','Actions on Objectives'];

function renderKillChain(el){
  var kc=APP.kc;
  if(!kc.length){KC_STAGES.forEach(function(s){kc.push({name:s,items:[]});});APP.kc=kc;}

  var h='<div class="sec-hdr">'
    +'<div><div class="sec-title">&#128279; Attack Kill Chain</div>'
    +'<div class="sec-subtitle">Map your attack steps across the cyber kill chain — link to findings</div></div>'
    +'<button class="btn" onclick="exportKC()">&#128229; Export</button></div>';

  h+='<div class="kc-stages">';
  kc.forEach(function(stage,si){
    h+='<div class="kc-stage"><div class="kc-stage-lbl">'+esc(stage.name)+'</div>'
      +'<div class="kc-stage-items">';
    stage.items.forEach(function(item,ii){
      h+='<div class="kc-item">'
        +'<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(item)+'</span>'
        +'<button class="kc-item-del" onclick="kcDeleteItem('+si+','+ii+')">&#10005;</button>'
        +'</div>';
    });
    h+='</div>'
      +'<button class="kc-add" onclick="kcAddItem('+si+')">+ Add step</button>'
      +'</div>';
  });
  h+='</div>';

  h+='<div class="kc-narrative">'
    +'<div class="kc-nar-lbl"><span>Executive Narrative</span>'
    +'<button class="btn ai sm" onclick="aiKillChainNarrative()">&#10024; AI Generate</button></div>'
    +'<textarea class="kc-nar-ta" id="kc_narr_ta" placeholder="Describe the full attack chain in executive language...&#10;&#10;Click \'AI Generate\' to auto-create from your kill chain stages above." oninput="APP.kcNarr=this.value;psave(\'kc_narr\',APP.kcNarr)">'+esc(APP.kcNarr||'')+'</textarea>'
    +'<div style="font-size:10px;color:var(--t3)">This narrative will be included in your generated report.</div>'
    +'</div>';
  el.innerHTML=h;
}

function kcAddItem(si){
  var v=prompt('Add step to '+APP.kc[si].name+':');
  if(!v||!v.trim())return;
  APP.kc[si].items.push(v.trim());
  psave('kc',APP.kc);
  renderKillChain(document.getElementById('secbody'));
}

function kcDeleteItem(si,ii){
  APP.kc[si].items.splice(ii,1);
  psave('kc',APP.kc);
  renderKillChain(document.getElementById('secbody'));
}

function exportKC(){
  var lines=['# Kill Chain\n'];
  APP.kc.forEach(function(stage){
    if(stage.items.length){
      lines.push('## '+stage.name);
      stage.items.forEach(function(item){lines.push('- '+item);});
      lines.push('');
    }
  });
  if(APP.kcNarr)lines.push('## Narrative\n'+APP.kcNarr);
  copy(lines.join('\n'),null);
  alert('Kill chain copied to clipboard!');
}

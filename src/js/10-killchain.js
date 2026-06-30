var KC_STAGE_KEYS=['kc_stage_recon','kc_stage_weapon','kc_stage_delivery','kc_stage_exploit','kc_stage_install','kc_stage_c2','kc_stage_actions'];

function renderKillChain(el){
  var kc=APP.kc;
  if(!kc.length){KC_STAGE_KEYS.forEach(function(k){kc.push({nameKey:k,name:t(k),items:[]});});APP.kc=kc;}

  var h='<div class="sec-hdr">'
    +'<div><div class="sec-title">&#128279; '+t('killchain_title')+'</div>'
    +'<div class="sec-subtitle">'+t('killchain_subtitle')+'</div></div>'
    +'<button class="btn" onclick="exportKC()">&#128229; '+t('export_btn')+'</button></div>';

  h+='<div class="kc-stages">';
  kc.forEach(function(stage,si){
    var stageName=stage.nameKey?t(stage.nameKey):stage.name;
    h+='<div class="kc-stage"><div class="kc-stage-lbl">'+esc(stageName)+'</div>'
      +'<div class="kc-stage-items">';
    stage.items.forEach(function(item,ii){
      h+='<div class="kc-item">'
        +'<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(item)+'</span>'
        +'<button class="kc-item-del" onclick="kcDeleteItem('+si+','+ii+')">&#10005;</button>'
        +'</div>';
    });
    h+='</div>'
      +'<button class="kc-add" onclick="kcAddItem('+si+')">'+t('add_step')+'</button>'
      +'</div>';
  });
  h+='</div>';

  h+='<div class="kc-narrative">'
    +'<div class="kc-nar-lbl"><span>'+t('executive_narrative')+'</span>'
    +'<button class="btn ai sm" onclick="aiKillChainNarrative()">&#10024; '+t('ai_generate')+'</button></div>'
    +'<textarea class="kc-nar-ta" id="kc_narr_ta" placeholder="'+esc(t('killchain_narr_ph'))+'" oninput="APP.kcNarr=this.value;psave(\'kc_narr\',APP.kcNarr)">'+esc(APP.kcNarr||'')+'</textarea>'
    +'<div style="font-size:10px;color:var(--t3)">'+t('killchain_narr_footer')+'</div>'
    +'</div>';
  el.innerHTML=h;
}

function kcAddItem(si){
  var stage=APP.kc[si];
  var stageName=stage.nameKey?t(stage.nameKey):stage.name;
  var v=prompt(t('add_step_prompt')+' '+stageName+':');
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
  var lines=['# '+t('killchain_title')+'\n'];
  APP.kc.forEach(function(stage){
    if(stage.items.length){
      var stageName=stage.nameKey?t(stage.nameKey):stage.name;
      lines.push('## '+stageName);
      stage.items.forEach(function(item){lines.push('- '+item);});
      lines.push('');
    }
  });
  if(APP.kcNarr)lines.push('## '+t('executive_narrative')+'\n'+APP.kcNarr);
  copy(lines.join('\n'),null);
  alert(t('kc_copied_alert'));
}

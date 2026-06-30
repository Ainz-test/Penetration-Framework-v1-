function renderTools(el){
  var cats=TOOLS;
  var h='<div class="sec-hdr"><div><div class="sec-title">&#128295; '+t('tools_title')+'</div>'
    +'<div class="sec-subtitle">'+t('tools_subtitle')+'</div></div>'
    +'<input class="field-inp" placeholder="&#128269; '+esc(t('search_tools_ph'))+'" oninput="APP.toolsSearch=this.value;renderTools(document.getElementById(\'secbody\'))" value="'+esc(APP.toolsSearch||'')+'" style="width:180px"></div>';

  h+='<div class="tool-tabs">';
  cats.forEach(function(cat,i){
    h+='<button class="tool-tab'+(APP.toolsCat===i?' on':'')+'" onclick="APP.toolsCat='+i+';renderTools(document.getElementById(\'secbody\'))">'+cat.icon+' '+esc(tx(cat.cat))+'</button>';
  });
  h+='</div>';

  h+='<div class="sec-body">';
  var q=(APP.toolsSearch||'').toLowerCase();
  var tools=cats[APP.toolsCat]?cats[APP.toolsCat].tools:[];
  if(q){
    tools=[];
    cats.forEach(function(cat){
      cat.tools.forEach(function(tl){
        if((tl.name+' '+tx(tl.desc)+' '+(tl.kali||'')+' '+(tl.install||'')).toLowerCase().indexOf(q)>=0)tools.push(tl);
      });
    });
  }
  if(!tools.length){h+='<div class="empty">'+t('no_tools_match')+'</div></div>';el.innerHTML=h;return;}
  tools.forEach(function(tl){
    var isFree=tl.free!==false;
    h+='<div class="tool-card">'
      +'<div class="tool-hdr"><div><div class="tool-name">'+esc(tl.name)+'</div><div class="tool-desc">'+esc(tx(tl.desc))+'</div></div>'
      +'<span class="tool-free '+(isFree?'yes':'no')+'">'+(isFree?t('free_lbl'):t('paid_lbl'))+'</span></div>';
    if(!isFree&&tl.paid){
      h+='<div class="paid-note">&#128181; '+esc(tx(tl.paid))+'</div>';
    }
    var rows=[];
    if(tl.kali)rows.push({l:'Kali/APT',v:tl.kali});
    if(tl.pip)rows.push({l:'pip',v:tl.pip});
    if(tl.install)rows.push({l:'Install',v:tl.install});
    if(tl.mac)rows.push({l:'macOS',v:tl.mac});
    if(tl.verify)rows.push({l:'Verify',v:tl.verify});
    if(tl.config)rows.push({l:'Config',v:tl.config});
    rows.forEach(function(r){
      var uid='tc_'+genId();
      h+='<div class="tool-row">'
        +'<span class="tool-row-lbl">'+r.l+'</span>'
        +'<code class="tool-row-cmd">'+esc(r.v)+'</code>'
        +(r.l!=='Config'?'<button class="tool-row-copy" id="'+uid+'" onclick="copyById(\''+regCopy(r.v)+'\',document.getElementById(\''+uid+'\'))">&#9113;</button>':'')
        +'</div>';
    });
    if(tl.url&&tl.url!==''){
      h+='<div class="tool-row"><span class="tool-row-lbl">GitHub</span>'
        +'<a href="'+esc(tl.url)+'" target="_blank" rel="noopener" style="color:#60a5fa;font-size:11px;font-family:monospace">'+esc(tl.url.replace('https://',''))+'</a>'
        +'</div>';
    }
    h+='</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

function renderTools(el){
  var cats=TOOLS;
  var h='<div class="sec-hdr"><div><div class="sec-title">&#128295; Tools Guide</div>'
    +'<div class="sec-subtitle">Installation, verification & config for every tool. One-tap copy.</div></div>'
    +'<input class="field-inp" placeholder="&#128269; Search tools..." oninput="APP.toolsSearch=this.value;renderTools(document.getElementById(\'secbody\'))" value="'+esc(APP.toolsSearch||'')+'" style="width:180px"></div>';

  h+='<div class="tool-tabs">';
  cats.forEach(function(cat,i){
    h+='<button class="tool-tab'+(APP.toolsCat===i?' on':'')+'" onclick="APP.toolsCat='+i+';renderTools(document.getElementById(\'secbody\'))">'+cat.icon+' '+cat.cat+'</button>';
  });
  h+='</div>';

  h+='<div class="sec-body">';
  var q=(APP.toolsSearch||'').toLowerCase();
  var tools=cats[APP.toolsCat]?cats[APP.toolsCat].tools:[];
  if(q){
    tools=[];
    cats.forEach(function(cat){
      cat.tools.forEach(function(t){
        if((t.name+' '+t.desc+' '+(t.kali||'')+' '+(t.install||'')).toLowerCase().indexOf(q)>=0)tools.push(t);
      });
    });
  }
  if(!tools.length){h+='<div class="empty">No tools match your search.</div></div>';el.innerHTML=h;return;}
  tools.forEach(function(t){
    var isFree=t.free!==false;
    h+='<div class="tool-card">'
      +'<div class="tool-hdr"><div><div class="tool-name">'+esc(t.name)+'</div><div class="tool-desc">'+esc(t.desc)+'</div></div>'
      +'<span class="tool-free '+(isFree?'yes':'no')+'">'+(isFree?'FREE':'PAID')+'</span></div>';
    if(!isFree&&t.paid){
      h+='<div class="paid-note">&#128181; '+esc(t.paid)+'</div>';
    }
    var rows=[];
    if(t.kali)rows.push({l:'Kali/APT',v:t.kali});
    if(t.pip)rows.push({l:'pip',v:t.pip});
    if(t.install)rows.push({l:'Install',v:t.install});
    if(t.mac)rows.push({l:'macOS',v:t.mac});
    if(t.verify)rows.push({l:'Verify',v:t.verify});
    if(t.config)rows.push({l:'Config',v:t.config});
    rows.forEach(function(r){
      var uid='tc_'+genId();
      h+='<div class="tool-row">'
        +'<span class="tool-row-lbl">'+r.l+'</span>'
        +'<code class="tool-row-cmd">'+esc(r.v)+'</code>'
        +(r.l!=='Config'?'<button class="tool-row-copy" id="'+uid+'" onclick="copyById(\''+regCopy(r.v)+'\',document.getElementById(\''+uid+'\'))">&#9113;</button>':'')
        +'</div>';
    });
    if(t.url&&t.url!==''){
      h+='<div class="tool-row"><span class="tool-row-lbl">GitHub</span>'
        +'<a href="'+esc(t.url)+'" target="_blank" rel="noopener" style="color:#60a5fa;font-size:11px;font-family:monospace">'+esc(t.url.replace('https://',''))+'</a>'
        +'</div>';
    }
    h+='</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

function renderPayloads(el){
  var h='<div class="sec-hdr"><div class="sec-title">&#128299; Payload Quick-Reference</div></div>';
  h+='<div class="sec-body">';
  PAYLOADS.forEach(function(cat){
    h+='<div class="payload-cat">';
    h+='<div class="payload-cat-hdr" style="border-left:3px solid '+cat.color+'">'
      +'<span style="font-size:16px">'+cat.icon+'</span>'
      +'<span style="font-size:13px;font-weight:700;color:var(--t1)">'+esc(cat.cat)+'</span>'
      +'<span style="font-size:10px;color:var(--t3);margin-left:auto">'+cat.groups.length+' categories</span>'
      +'</div>';
    cat.groups.forEach(function(g){
      h+='<div class="payload-group">'
        +'<div class="payload-grp-name">'+esc(g.name)+'</div>'
        +'<div class="payload-notes">'+esc(g.notes)+'</div>';
      g.items.forEach(function(item){
        h+='<div class="payload-item">'
          +'<code class="payload-val">'+esc(item)+'</code>'
          +'<button class="payload-copy" onclick="copyById(\''+regCopy(item)+'\',this)" title="Copy">&#9113;</button>'
          +'</div>';
      });
      h+='</div>';
    });
    h+='</div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

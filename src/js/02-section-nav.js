function setSection(s){
  APP.section=s;
  document.querySelectorAll('.secbtn').forEach(function(b){b.classList.toggle('on',b.dataset.sec===s);});
  var isF=s==='framework';
  ['phasenav','wrap','bottomnav'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.style.display=isF?'':'none';
  });
  var sb=document.getElementById('secbody');
  var srch=document.getElementById('searchbox');
  if(isF){
    sb.style.display='none';
    if(srch)srch.style.display='';
    renderAll();
  }else{
    sb.style.display='flex';
    sb.style.flexDirection='column';
    sb.style.overflow='hidden';
    if(srch)srch.style.display='none';
    if(s==='dashboard')renderDashboard(sb);
    else if(s==='findings')renderFindings(sb);
    else if(s==='scope')renderScope(sb);
    else if(s==='tools')renderTools(sb);
    else if(s==='payloads')renderPayloads(sb);
    else if(s==='report')renderReport(sb);
    else if(s==='killchain')renderKillChain(sb);
    else if(s==='timer')renderTimer(sb);
    else if(s==='profiles')renderProfiles(sb);
    else if(s==='settings')renderSettings(sb);
  }
}

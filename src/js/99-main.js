window.addEventListener('DOMContentLoaded',function(){
  initData();
  APP.profile=localStorage.getItem('apt_profile')||'default';
  loadProfile();
  setSection('framework');
  var pnav=document.getElementById('phasenav');
  if(pnav)pnav.style.display='';
  var wrap=document.getElementById('wrap');
  if(wrap)wrap.style.display='';
  var bn=document.getElementById('bottomnav');
  if(bn)bn.style.display='';
});

window.addEventListener('DOMContentLoaded',function(){
  initData();
  APP.profile=localStorage.getItem('apt_profile')||'default';
  loadProfile();
  document.documentElement.setAttribute('lang',APP.lang);
  document.documentElement.setAttribute('dir',APP.lang==='ar'?'rtl':'ltr');
  document.body.classList.toggle('rtl',APP.lang==='ar');
  var langBtn=document.getElementById('langbtn');
  if(langBtn)langBtn.textContent=APP.lang==='ar'?'EN':'AR';
  applyStaticTranslations();
  setSection('framework');
  var pnav=document.getElementById('phasenav');
  if(pnav)pnav.style.display='';
  var wrap=document.getElementById('wrap');
  if(wrap)wrap.style.display='';
  var bn=document.getElementById('bottomnav');
  if(bn)bn.style.display='';
});

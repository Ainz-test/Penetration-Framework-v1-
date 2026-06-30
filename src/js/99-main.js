window.addEventListener('DOMContentLoaded',function(){
  initData();
  APP.profile=localStorage.getItem('apt_profile')||'default';

  // Language must be applied before the lock screen renders so a returning
  // Arabic-language user sees the lock/unlock screen in Arabic too, not a
  // flash of English followed by a switch.
  APP.lang=localStorage.getItem('apt_lang')||'en';
  document.documentElement.setAttribute('lang',APP.lang);
  document.documentElement.setAttribute('dir',APP.lang==='ar'?'rtl':'ltr');
  document.body.classList.toggle('rtl',APP.lang==='ar');

  resolveLockScreen().then(function(){
    return loadProfile();
  }).then(function(){
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
});

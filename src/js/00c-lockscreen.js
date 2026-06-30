/* ── Lock screen ──────────────────────────────────────────────────────────
   Gates app startup. Three states:
   - first run, no password ever set  -> setup-or-skip screen
   - password set, locked this load   -> unlock screen
   - unlocked / skipped                -> resolves and the normal init in
                                          99-main.js continues

   resolveLockScreen() returns a Promise that resolves once the app is
   allowed to proceed (CRYPTO_KEY + CRYPTO_ENABLED are set correctly by then,
   or CRYPTO_ENABLED stays false if the user skipped). */

function lockEl(){return document.getElementById('lockscreen');}

function resolveLockScreen(){
  return new Promise(function(resolve){
    var hasCheck = localStorage.getItem('apt_crypto_check') !== null;
    var dismissed = localStorage.getItem('apt_crypto_dismissed') === '1';
    if (hasCheck) {
      renderUnlockScreen(resolve);
    } else if (dismissed) {
      resolve();
    } else {
      renderFirstRunScreen(resolve);
    }
  });
}

function lockScreenShell(inner){
  return '<div class="lock-card">'
    + '<div class="lock-brand">🛡 ' + esc(t('lock_app_name')) + '</div>'
    + inner
    + '</div>';
}

function renderFirstRunScreen(resolve){
  var el = lockEl();
  el.style.display = 'flex';
  el.innerHTML = lockScreenShell(
    '<div class="lock-title">' + t('lock_setup_title') + '</div>'
    + '<div class="lock-body">' + t('lock_setup_body') + '</div>'
    + '<input type="password" class="lock-input" id="lp_pw1" placeholder="' + esc(t('lock_password_ph')) + '" autocomplete="new-password">'
    + '<input type="password" class="lock-input" id="lp_pw2" placeholder="' + esc(t('lock_password_confirm_ph')) + '" autocomplete="new-password">'
    + '<div class="lock-error" id="lp_err"></div>'
    + '<button class="btn primary lock-btn" id="lp_setup_btn">' + t('lock_set_password_btn') + '</button>'
    + '<button class="btn lock-btn-secondary" id="lp_skip_btn">' + t('lock_skip_btn') + '</button>'
    + '<div class="lock-note">' + t('lock_skip_note') + '</div>'
  );
  document.getElementById('lp_setup_btn').onclick = function(){ handleSetupSubmit(resolve); };
  document.getElementById('lp_skip_btn').onclick = function(){
    localStorage.setItem('apt_crypto_dismissed','1');
    el.style.display='none';
    resolve();
  };
  document.getElementById('lp_pw2').addEventListener('keydown', function(e){
    if(e.key==='Enter') handleSetupSubmit(resolve);
  });
}

function handleSetupSubmit(resolve){
  var pw1 = document.getElementById('lp_pw1').value;
  var pw2 = document.getElementById('lp_pw2').value;
  var errEl = document.getElementById('lp_err');
  errEl.textContent = '';
  if (pw1.length < 8) { errEl.textContent = t('lock_too_short_error'); return; }
  if (pw1 !== pw2) { errEl.textContent = t('lock_mismatch_error'); return; }

  var btn = document.getElementById('lp_setup_btn');
  btn.disabled = true;
  var salt = genSaltB64();
  deriveKey(pw1, salt).then(function(key){
    return encryptString(key, VERIFY_PLAINTEXT).then(function(check){
      localStorage.setItem('apt_crypto_salt', salt);
      localStorage.setItem('apt_crypto_check', check);
      localStorage.removeItem('apt_crypto_dismissed');
      CRYPTO_KEY = key;
      CRYPTO_ENABLED = true;
      lockEl().style.display = 'none';
      resolve();
    });
  }).catch(function(){
    btn.disabled = false;
    errEl.textContent = t('lock_wrong_password');
  });
}

function renderUnlockScreen(resolve){
  var el = lockEl();
  el.style.display = 'flex';
  el.innerHTML = lockScreenShell(
    '<div class="lock-title">' + t('lock_unlock_title') + '</div>'
    + '<div class="lock-body">' + t('lock_unlock_body') + '</div>'
    + '<input type="password" class="lock-input" id="lp_unlock_pw" placeholder="' + esc(t('lock_password_ph')) + '" autocomplete="current-password">'
    + '<div class="lock-error" id="lp_err"></div>'
    + '<button class="btn primary lock-btn" id="lp_unlock_btn">' + t('lock_unlock_btn') + '</button>'
    + '<button class="lock-forgot" id="lp_forgot_btn">' + t('lock_forgot_link') + '</button>'
  );
  document.getElementById('lp_unlock_btn').onclick = function(){ handleUnlockSubmit(resolve); };
  document.getElementById('lp_unlock_pw').addEventListener('keydown', function(e){
    if(e.key==='Enter') handleUnlockSubmit(resolve);
  });
  document.getElementById('lp_unlock_pw').focus();
  document.getElementById('lp_forgot_btn').onclick = function(){ renderResetConfirm(resolve); };
}

function handleUnlockSubmit(resolve){
  var pw = document.getElementById('lp_unlock_pw').value;
  var errEl = document.getElementById('lp_err');
  var btn = document.getElementById('lp_unlock_btn');
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = t('lock_unlocking');
  var salt = localStorage.getItem('apt_crypto_salt');
  var check = localStorage.getItem('apt_crypto_check');
  deriveKey(pw, salt).then(function(key){
    return decryptString(key, check).then(function(plain){
      if (plain !== VERIFY_PLAINTEXT) throw new Error('mismatch');
      CRYPTO_KEY = key;
      CRYPTO_ENABLED = true;
      lockEl().style.display = 'none';
      resolve();
    });
  }).catch(function(){
    btn.disabled = false;
    btn.textContent = t('lock_unlock_btn');
    errEl.textContent = t('lock_wrong_password');
  });
}

function renderResetConfirm(resolve){
  var el = lockEl();
  el.innerHTML = lockScreenShell(
    '<div class="lock-title">' + t('lock_forgot_link') + '</div>'
    + '<div class="lock-body lock-danger">' + t('lock_reset_confirm1') + '</div>'
    + '<input type="text" class="lock-input" id="lp_reset_confirm" placeholder="' + esc(t('lock_reset_type_confirm')) + '" autocomplete="off">'
    + '<div class="lock-error" id="lp_err"></div>'
    + '<button class="btn danger lock-btn" id="lp_reset_btn">' + t('security_reset_btn') + '</button>'
    + '<button class="btn lock-btn-secondary" id="lp_cancel_reset_btn">' + t('cancel_btn') + '</button>'
  );
  document.getElementById('lp_cancel_reset_btn').onclick = function(){ renderUnlockScreen(resolve); };
  document.getElementById('lp_reset_btn').onclick = function(){
    var typed = document.getElementById('lp_reset_confirm').value;
    if (typed !== 'RESET') {
      document.getElementById('lp_err').textContent = t('lock_mismatch_error');
      return;
    }
    document.getElementById('lp_reset_btn').textContent = t('lock_resetting');
    wipeAllEncryptedData();
    CRYPTO_KEY = null;
    CRYPTO_ENABLED = false;
    lockEl().style.display = 'none';
    resolve();
  };
}

// Removes every key this app has ever written to localStorage, across all
// profiles, plus the crypto setup itself. Used by the reset/forgot-password
// flow. Does NOT touch unrelated localStorage keys from other sites/apps
// (impossible anyway — localStorage is already origin-scoped) but is careful
// to only remove keys matching this app's own prefixes.
function wipeAllEncryptedData(){
  var toRemove = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && (k.indexOf('apt_') === 0 || k === 'api_key' || k === 'api_endpoint')) {
      toRemove.push(k);
    }
  }
  toRemove.forEach(function(k){ localStorage.removeItem(k); });
}

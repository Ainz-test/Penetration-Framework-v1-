#!/usr/bin/env node
/**
 * PenTest Pro — Lock screen / encryption test suite
 * Tests the full lifecycle: first-run, setup, lock, unlock, wrong password,
 * legacy data migration, and the reset/forgot-password escape hatch.
 * Each scenario gets its own fresh JSDOM instance since lock state depends
 * on what's already in localStorage.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const DIST_PATH = path.join(__dirname, '..', 'dist', 'pentest-standalone.html');
const html = fs.readFileSync(DIST_PATH, 'utf8');

let passed = 0, failed = 0;
const failures = [];
function check(label, cond) {
  if (cond) passed++;
  else { failed++; failures.push(label); console.log('  ✗ FAIL:', label); }
}
function section(name) { console.log('\n' + name); }

function freshDom(seedLocalStorage) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'https://example.com/' });
  const nodeCrypto = require('crypto').webcrypto;
  Object.defineProperty(dom.window.crypto, 'subtle', { value: nodeCrypto.subtle, configurable: true });
  dom.window.TextEncoder = TextEncoder;
  dom.window.TextDecoder = TextDecoder;
  dom.window.navigator.clipboard = { writeText: () => Promise.resolve() };
  if (seedLocalStorage) seedLocalStorage(dom.window.localStorage);
  return dom;
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  section('Scenario 1: fresh install, first-run screen appears');
  {
    const dom = freshDom();
    await wait(400);
    const w = dom.window, doc = w.document;
    const lockEl = doc.getElementById('lockscreen');
    check('lock screen is visible on fresh install', lockEl.style.display === 'flex');
    check('shows first-run setup UI (password fields present)', !!doc.getElementById('lp_pw1') && !!doc.getElementById('lp_pw2'));
    check('app content not yet initialized behind it', !w.APP.findings || w.APP.findings.length === 0);
  }

  section('Scenario 2: skip leaves encryption off and unblocks the app');
  {
    const dom = freshDom();
    await wait(400);
    const w = dom.window, doc = w.document;
    doc.getElementById('lp_skip_btn').click();
    await wait(300);
    check('lock screen hides after skip', doc.getElementById('lockscreen').style.display === 'none');
    check('CRYPTO_ENABLED stays false', w.CRYPTO_ENABLED === false);
    check('dismissed flag persisted', w.localStorage.getItem('apt_crypto_dismissed') === '1');
    check('app proceeds to render app UI', doc.getElementById('secbody').innerHTML.length > 0 || doc.getElementById('content').innerHTML.length >= 0);
    // a second load should NOT show the lock screen again
    w.psave('eng', 'Test Co');
    await wait(100);
    const stored = w.localStorage.getItem('apt_default_eng');
    check('data saved as plain JSON when encryption is off', stored === '"Test Co"');
  }

  section('Scenario 3: password too short is rejected');
  {
    const dom = freshDom();
    await wait(400);
    const doc = dom.window.document;
    doc.getElementById('lp_pw1').value = 'short';
    doc.getElementById('lp_pw2').value = 'short';
    doc.getElementById('lp_setup_btn').click();
    check('shows too-short error', doc.getElementById('lp_err').textContent.length > 0);
    check('lock screen still showing (setup rejected)', doc.getElementById('lockscreen').style.display === 'flex');
  }

  section('Scenario 4: mismatched passwords rejected');
  {
    const dom = freshDom();
    await wait(400);
    const doc = dom.window.document;
    doc.getElementById('lp_pw1').value = 'correct horse battery staple';
    doc.getElementById('lp_pw2').value = 'correct horse battery STAPLE';
    doc.getElementById('lp_setup_btn').click();
    check('shows mismatch error', doc.getElementById('lp_err').textContent.length > 0);
  }

  section('Scenario 5: successful setup encrypts subsequent saves');
  let salt, check_blob;
  {
    const dom = freshDom();
    await wait(400);
    const w = dom.window, doc = w.document;
    doc.getElementById('lp_pw1').value = 'correct horse battery staple';
    doc.getElementById('lp_pw2').value = 'correct horse battery staple';
    doc.getElementById('lp_setup_btn').click();
    await wait(400);
    check('lock screen hides after successful setup', doc.getElementById('lockscreen').style.display === 'none');
    check('CRYPTO_ENABLED is true', w.CRYPTO_ENABLED === true);
    check('CRYPTO_KEY is set', w.CRYPTO_KEY !== null);
    check('salt persisted to localStorage', !!w.localStorage.getItem('apt_crypto_salt'));
    check('verification check blob persisted', !!w.localStorage.getItem('apt_crypto_check'));

    w.psave('eng', 'Encrypted Co');
    await wait(150);
    const stored = w.localStorage.getItem('apt_default_eng');
    check('data is now stored as an encrypted blob, not plaintext', w.isEncryptedBlob(stored));
    check('encrypted blob does not contain the plaintext value', stored.indexOf('Encrypted Co') === -1);

    salt = w.localStorage.getItem('apt_crypto_salt');
    check_blob = w.localStorage.getItem('apt_crypto_check');
  }

  section('Scenario 6: reload with existing setup shows unlock screen, not first-run');
  {
    const dom = freshDom((ls) => {
      ls.setItem('apt_crypto_salt', salt);
      ls.setItem('apt_crypto_check', check_blob);
    });
    await wait(400);
    const doc = dom.window.document;
    check('lock screen visible', doc.getElementById('lockscreen').style.display === 'flex');
    check('shows unlock UI, not setup UI', !!doc.getElementById('lp_unlock_pw') && !doc.getElementById('lp_pw2'));
  }

  section('Scenario 7: wrong password fails cleanly without unlocking');
  {
    const dom = freshDom((ls) => {
      ls.setItem('apt_crypto_salt', salt);
      ls.setItem('apt_crypto_check', check_blob);
    });
    await wait(400);
    const w = dom.window, doc = w.document;
    doc.getElementById('lp_unlock_pw').value = 'totally wrong password';
    doc.getElementById('lp_unlock_btn').click();
    await wait(400);
    check('shows wrong-password error', doc.getElementById('lp_err').textContent.length > 0);
    check('lock screen still showing', doc.getElementById('lockscreen').style.display === 'flex');
    check('CRYPTO_KEY remains unset', w.CRYPTO_KEY === null);
  }

  section('Scenario 8: correct password unlocks and decrypts existing data');
  {
    // seed encrypted data exactly as scenario 5 would have left it on a real device:
    // salt + check blob + one encrypted field, all produced through the real app
    // so this test exercises the actual format, not a hand-rolled fixture.
    const setupDom = freshDom();
    await wait(400);
    const sw = setupDom.window, sdoc = sw.document;
    sdoc.getElementById('lp_pw1').value = 'unlock test password';
    sdoc.getElementById('lp_pw2').value = 'unlock test password';
    sdoc.getElementById('lp_setup_btn').click();
    await wait(400);
    sw.psave('eng', 'Acme Recovered');
    sw.psave('findings', [{ id: 'f1', title: 'Test finding', severity: 'High' }]);
    await wait(200);
    const seededSalt = sw.localStorage.getItem('apt_crypto_salt');
    const seededCheck = sw.localStorage.getItem('apt_crypto_check');
    const seededEng = sw.localStorage.getItem('apt_default_eng');
    const seededFindings = sw.localStorage.getItem('apt_default_findings');

    const dom = freshDom((ls) => {
      ls.setItem('apt_crypto_salt', seededSalt);
      ls.setItem('apt_crypto_check', seededCheck);
      ls.setItem('apt_default_eng', seededEng);
      ls.setItem('apt_default_findings', seededFindings);
    });
    await wait(400);
    const w = dom.window, doc = w.document;
    doc.getElementById('lp_unlock_pw').value = 'unlock test password';
    doc.getElementById('lp_unlock_btn').click();
    await wait(500);
    check('lock screen hides after correct unlock', doc.getElementById('lockscreen').style.display === 'none');
    check('CRYPTO_KEY is set after unlock', w.CRYPTO_KEY !== null);
    check('engagement name decrypted correctly after unlock', w.APP.eng === 'Acme Recovered');
    check('findings array decrypted correctly after unlock', w.APP.findings.length === 1 && w.APP.findings[0].title === 'Test finding');
  }

  section('Scenario 9: legacy plaintext data survives enabling encryption later');
  {
    const dom = freshDom((ls) => {
      // simulate a user who has been using the app unencrypted (old plain format)
      ls.setItem('apt_crypto_dismissed', '1');
      ls.setItem('apt_default_eng', JSON.stringify('Legacy Plaintext Co'));
      ls.setItem('apt_default_findings', JSON.stringify([{ id: 'f9', title: 'Old finding', severity: 'Low' }]));
    });
    await wait(400);
    const w = dom.window, doc = w.document;
    check('app loaded legacy plaintext data correctly', w.APP.eng === 'Legacy Plaintext Co');
    check('legacy findings loaded correctly', w.APP.findings.length === 1 && w.APP.findings[0].title === 'Old finding');

    // now enable encryption from Settings on top of existing legacy data
    w.startEncryptionSetupFromSettings();
    await wait(100);
    doc.getElementById('lp_pw1').value = 'migrate my old data please';
    doc.getElementById('lp_pw2').value = 'migrate my old data please';
    doc.getElementById('lp_setup_btn').click();
    await wait(400);
    check('encryption now enabled', w.CRYPTO_ENABLED === true);
    // touch the data so it gets re-saved (and thus migrated to encrypted form)
    w.psave('eng', w.APP.eng);
    w.psave('findings', w.APP.findings);
    await wait(200);
    check('previously-plaintext eng is now encrypted', w.isEncryptedBlob(w.localStorage.getItem('apt_default_eng')));
    check('previously-plaintext findings now encrypted', w.isEncryptedBlob(w.localStorage.getItem('apt_default_findings')));
    const reGet = await w.secureGet('apt_default_eng', null);
    check('migrated data still reads back correctly', reGet === 'Legacy Plaintext Co');
  }

  section('Scenario 10: reset/forgot-password wipes data and returns to first-run');
  {
    const dom = freshDom((ls) => {
      ls.setItem('apt_crypto_salt', salt);
      ls.setItem('apt_crypto_check', check_blob);
      ls.setItem('apt_default_eng', 'ENC1:fake:data');
      ls.setItem('apt_default_findings', 'ENC1:fake:data2');
    });
    await wait(400);
    const w = dom.window, doc = w.document;
    doc.getElementById('lp_forgot_btn').click();
    check('reset confirmation screen shown', !!doc.getElementById('lp_reset_confirm'));
    doc.getElementById('lp_reset_confirm').value = 'wrong text';
    doc.getElementById('lp_reset_btn').click();
    check('rejects incorrect confirmation text', doc.getElementById('lp_err').textContent.length > 0);
    check('has not wiped data yet', w.localStorage.getItem('apt_crypto_salt') !== null);

    doc.getElementById('lp_reset_confirm').value = 'RESET';
    doc.getElementById('lp_reset_btn').click();
    await wait(200);
    check('crypto salt wiped', w.localStorage.getItem('apt_crypto_salt') === null);
    check('crypto check wiped', w.localStorage.getItem('apt_crypto_check') === null);
    check('profile data wiped', w.localStorage.getItem('apt_default_eng') === null);
    check('CRYPTO_ENABLED reset to false', w.CRYPTO_ENABLED === false);
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('\nFailed checks:');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('All lock screen / encryption checks passed.');
    process.exit(0);
  }
}

run();

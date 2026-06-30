/* ── Encryption layer ─────────────────────────────────────────────────────
   Master-password-derived AES-256-GCM encryption for everything written to
   localStorage. Key lives in memory only (CRYPTO_KEY) for the session —
   never persisted, never sent anywhere. PBKDF2-SHA256 with 250k iterations
   derives the key from the password + a per-install random salt.

   Storage format for an encrypted value: "ENC1:<iv-b64>:<ciphertext-b64>"
   Legacy plaintext values (from before encryption was enabled, or while
   it's off) are detected by the absence of the ENC1: prefix and read
   through unchanged — and transparently re-saved as encrypted on next
   write, so turning encryption on later never loses existing data. */

var CRYPTO_KEY = null;        // in-memory CryptoKey, session-only
var CRYPTO_ENABLED = false;   // true once a password has been set up
var PBKDF2_ITERATIONS = 250000;
var VERIFY_PLAINTEXT = 'PENTESTPRO_VERIFY_OK';

function b64FromBytes(bytes) {
  var bin = '';
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function bytesFromB64(b64) {
  var bin = atob(b64);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function genSaltB64() {
  return b64FromBytes(crypto.getRandomValues(new Uint8Array(16)));
}

function deriveKey(password, saltB64) {
  var enc = new TextEncoder();
  var salt = bytesFromB64(saltB64);
  return crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey'])
    .then(function (baseKey) {
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    });
}

function encryptString(key, plaintext) {
  var enc = new TextEncoder();
  var iv = crypto.getRandomValues(new Uint8Array(12));
  return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(plaintext))
    .then(function (ciphertext) {
      return 'ENC1:' + b64FromBytes(iv) + ':' + b64FromBytes(new Uint8Array(ciphertext));
    });
}

function decryptString(key, blob) {
  var parts = blob.split(':');
  if (parts.length !== 3 || parts[0] !== 'ENC1') return Promise.reject(new Error('bad blob format'));
  var iv = bytesFromB64(parts[1]);
  var ciphertext = bytesFromB64(parts[2]);
  var dec = new TextDecoder();
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext)
    .then(function (buf) { return dec.decode(buf); });
}

function isEncryptedBlob(s) {
  return typeof s === 'string' && s.indexOf('ENC1:') === 0;
}

/* secureSet/secureGet operate on raw (already-prefixed) localStorage keys.
   secureSet is fire-and-forget: callers don't await it, matching the
   existing synchronous psave() call pattern used in 20+ places. The actual
   encrypt+write happens in the background — AES-GCM on a small JSON blob
   completes in low single-digit milliseconds, well within one frame. */
function secureSet(rawKey, value) {
  var json = JSON.stringify(value);
  if (CRYPTO_ENABLED && CRYPTO_KEY) {
    encryptString(CRYPTO_KEY, json).then(function (enc) {
      try { localStorage.setItem(rawKey, enc); } catch (e) {}
    });
  } else {
    try { localStorage.setItem(rawKey, json); } catch (e) {}
  }
}

function secureGet(rawKey, def) {
  var raw;
  try { raw = localStorage.getItem(rawKey); } catch (e) { return Promise.resolve(def); }
  if (raw === null) return Promise.resolve(def);
  if (isEncryptedBlob(raw)) {
    if (!CRYPTO_KEY) return Promise.resolve(def);
    return decryptString(CRYPTO_KEY, raw).then(function (json) {
      try { return JSON.parse(json); } catch (e) { return def; }
    }).catch(function () { return def; });
  }
  // legacy plaintext value — read it as-is, and migrate to encrypted form
  // on the next write so enabling encryption later never loses data.
  var val;
  try { val = JSON.parse(raw); } catch (e) { return Promise.resolve(def); }
  if (CRYPTO_ENABLED && CRYPTO_KEY) secureSet(rawKey, val);
  return Promise.resolve(val);
}

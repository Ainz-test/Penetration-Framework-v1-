#!/usr/bin/env node
/**
 * PenTest Pro — Build Script
 * Assembles src/{css,js,data,template.html} into a single deployable
 * dist/pentest-standalone.html file.
 *
 * Usage: node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function readDirSorted(dir, ext) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort(); // numeric prefixes (00-, 01-, ...) control load order
}

function concatFiles(dir, ext, label) {
  const files = readDirSorted(dir, ext);
  if (!files.length) throw new Error(`No ${ext} files found in ${dir}`);
  console.log(`  ${label}: ${files.join(', ')}`);
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n\n');
}

function jsonStringifyAscii(obj) {
  // Mirrors Python's json.dumps(..., ensure_ascii=True): escapes every character
  // above code point 0x7E to a \uXXXX sequence so the result is pure ASCII.
  // This matters because the client decodes via atob() + JSON.parse(), and atob()
  // is byte-oriented — feeding it anything outside ASCII (e.g. raw emoji bytes)
  // produces a binary string JSON.parse() can't reliably read back.
  return JSON.stringify(obj).replace(/[\u007F-\uFFFF]/g, ch =>
    '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
  );
}

function build() {
  console.log('PenTest Pro build starting...\n');

  // 1. Load and combine data files into one base64 blob (same format the app expects)
  console.log('[1/5] Loading data...');
  const dataDir = path.join(SRC, 'data');
  const dataKeys = ['phases', 'tools', 'payloads', 'mitre'];
  const allData = {};
  dataKeys.forEach(key => {
    const filePath = path.join(dataDir, `${key}.json`);
    if (!fs.existsSync(filePath)) throw new Error(`Missing data file: ${filePath}`);
    allData[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`  ${key}.json: ${allData[key].length} entries`);
  });
  const dataJson = jsonStringifyAscii(allData);
  const b64 = Buffer.from(dataJson, 'ascii').toString('base64');

  // Self-check: verify the round-trip BEFORE shipping, so a future encoding
  // regression fails the build instead of shipping silently broken data.
  const roundTrip = Buffer.from(b64, 'base64').toString('ascii');
  let parsedBack;
  try {
    parsedBack = JSON.parse(roundTrip);
  } catch (e) {
    throw new Error(`Data round-trip FAILED — base64 blob does not decode back to valid JSON: ${e.message}`);
  }
  dataKeys.forEach(key => {
    if (parsedBack[key].length !== allData[key].length) {
      throw new Error(`Data round-trip MISMATCH on "${key}": expected ${allData[key].length} entries, got ${parsedBack[key].length}`);
    }
  });
  console.log('  Round-trip verified OK\n');
  console.log(`  Combined + base64 encoded: ${b64.length} chars\n`);

  // 2. Concatenate CSS modules
  console.log('[2/5] Bundling CSS...');
  const css = concatFiles(path.join(SRC, 'css'), '.css', 'CSS modules');
  console.log(`  Total CSS: ${css.length} chars\n`);

  // 3. Concatenate JS modules (load order matters: 00-core first, 99-main last)
  console.log('[3/5] Bundling JS...');
  let js = concatFiles(path.join(SRC, 'js'), '.js', 'JS modules');
  console.log(`  Total JS (pre-data-inject): ${js.length} chars\n`);

  // 4. Inject the base64 data blob into the core module's placeholder
  console.log('[4/5] Injecting data into JS...');
  if (js.indexOf('__B64DATA_PLACEHOLDER__') === -1) {
    throw new Error('__B64DATA_PLACEHOLDER__ not found in JS bundle — check src/js/00-core.js');
  }
  js = js.replace('__B64DATA_PLACEHOLDER__', b64);
  console.log(`  Final JS: ${js.length} chars\n`);

  // 5. Assemble final HTML from template
  console.log('[5/5] Assembling final HTML...');
  const template = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
  let html = template.replace('{{CSS}}', () => css).replace('{{JS}}', () => js);

  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
  const outPath = path.join(DIST, 'pentest-standalone.html');
  fs.writeFileSync(outPath, html, 'utf8');
  // also write as index.html so this directory can be served directly (Vercel outputDirectory)
  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
  console.log(`  Written: ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
  console.log(`  Written: ${path.join(DIST, 'index.html')} (same content, for direct serving)\n`);

  console.log('Build complete. Run "node build.js && node tests/run.js" to verify.');
  return outPath;
}

if (require.main === module) {
  try {
    build();
  } catch (err) {
    console.error('\nBUILD FAILED:', err.message);
    process.exit(1);
  }
}

module.exports = { build };

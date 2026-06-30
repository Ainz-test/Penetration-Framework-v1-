#!/usr/bin/env node
/**
 * PenTest Pro — Automated Test Suite
 * Loads dist/pentest-standalone.html into a real DOM (jsdom) and exercises
 * every section + the bug-prone interaction paths found during development.
 * Run after every build: node tests/run.js
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const DIST_PATH = path.join(__dirname, '..', 'dist', 'pentest-standalone.html');

let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ FAIL: ${label}`);
  }
}

function section(name) {
  console.log(`\n${name}`);
}

if (!fs.existsSync(DIST_PATH)) {
  console.error(`dist file not found at ${DIST_PATH} — run "node build.js" first.`);
  process.exit(1);
}

const html = fs.readFileSync(DIST_PATH, 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'https://example.com/',
  virtualConsole: (() => {
    const { VirtualConsole } = require('jsdom');
    const vc = new VirtualConsole();
    vc.on('jsdomError', e => errors.push('JSDOM: ' + e.message));
    return vc;
  })()
});

let copiedText = null;
dom.window.navigator.clipboard = { writeText: t => { copiedText = t; return Promise.resolve(); } };
dom.window.URL.createObjectURL = () => 'blob:test';
dom.window.URL.revokeObjectURL = () => {};
dom.window.alert = () => {};

setTimeout(() => {
  const w = dom.window, doc = w.document;

  section('Initialization');
  check('window.APP exists', typeof w.APP !== 'undefined');
  check('PHASES loaded (9 phases)', w.PHASES && w.PHASES.length === 9);
  check('TOOLS loaded (7 categories)', w.TOOLS && w.TOOLS.length === 7);
  check('PAYLOADS loaded (6 categories)', w.PAYLOADS && w.PAYLOADS.length === 6);
  check('MITRE loaded (41 techniques)', w.MITRE && w.MITRE.length === 41);
  const errDiv = doc.getElementById('err');
  check('No JS errors on load', errDiv && errDiv.style.display !== 'block');

  section('All sections render without throwing');
  ['findings', 'scope', 'tools', 'payloads', 'report', 'killchain', 'timer', 'profiles', 'settings'].forEach(s => {
    try {
      w.setSection(s);
      const len = doc.getElementById('secbody').innerHTML.length;
      check(`section "${s}" renders content`, len > 50);
    } catch (e) {
      check(`section "${s}" renders without error (${e.message})`, false);
    }
  });

  section('Framework phase/step navigation (regression: totalring outerHTML bug)');
  try {
    w.setSection('framework');
    w.PHASES.forEach(p => {
      w.selectPhase(p.id);
      (p.steps || []).forEach(st => w.selectStep(st.id));
    });
    check('all phases/steps navigate without throwing', true);
  } catch (e) {
    check('phase/step navigation (' + e.message + ')', false);
  }
  check('totalring element survives re-render', !!doc.getElementById('totalring'));

  section('Finding CRUD + field-sync (regression: CVSS wipe bug)');
  w.openFinding(null);
  doc.getElementById('fp_title').value = 'Test SQL Injection';
  doc.getElementById('fp_affected').value = 'https://test.com/login';
  doc.getElementById('fp_desc').value = 'Test description';
  w.setCVSS('AV', 'N');
  w.setCVSS('C', 'H');
  check('title field survives CVSS dropdown interaction', doc.getElementById('fp_title').value === 'Test SQL Injection');
  doc.getElementById('fp_evidence').value = 'curl evidence';
  doc.getElementById('fp_remediaton').value = 'Patch immediately';
  w.saveFindingFromPanel();
  check('finding saved', w.APP.findings.length === 1);
  check('saved title correct', w.APP.findings[0].title === 'Test SQL Injection');
  check('CVSS auto-calculated (9.8 critical)', w.APP.findings[0].cvss_score === '9.8');
  check('severity auto-derived', w.APP.findings[0].severity === 'Critical');

  section('CVSS calculator edge cases');
  check('all-None vector = 0.0', w.calcCVSS({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'N', I: 'N', A: 'N' }) === '0.0');
  check('max severity vector = 10.0', w.calcCVSS({ AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'H', A: 'H' }) === '10.0');

  section('Report generation includes finding data');
  const report = w.generateReport();
  check('report contains finding title', report.indexOf('Test SQL Injection') >= 0);
  check('report contains CVSS score', report.indexOf('9.8') >= 0);

  section('Copy buttons (regression: JSON.stringify-in-onclick HTML injection bug)');
  w.setSection('tools');
  const toolBtn = doc.querySelector('.tool-row-copy');
  check('tool copy button exists', !!toolBtn);
  if (toolBtn) {
    check('tool copy button has no malformed attrs', toolBtn.attributes.length <= 3);
    toolBtn.click();
  }
  setTimeout(() => {}, 0);

  w.setSection('payloads');
  const payloadBtns = doc.querySelectorAll('.payload-copy');
  check('payload buttons exist (114 expected)', payloadBtns.length === 114);
  let malformed = 0;
  payloadBtns.forEach(b => { if (b.attributes.length !== 3) malformed++; });
  check('zero malformed payload copy buttons', malformed === 0);

  // find the SQLi auth-bypass payload containing literal single quotes — worst case test
  const items = doc.querySelectorAll('.payload-val');
  let quoteItem = null;
  items.forEach(el => { if (!quoteItem && el.textContent.indexOf("'") >= 0 && el.textContent.indexOf('=') >= 0) quoteItem = el; });
  if (quoteItem) {
    copiedText = null;
    quoteItem.nextElementSibling.click();
    check('payload with embedded quotes copies exactly (no corruption)', copiedText === quoteItem.textContent);
  }

  section('Bilingual support (Arabic/English)');
  check('default lang is en', w.APP.lang === 'en');
  w.setLang('ar');
  check('setLang switches APP.lang', w.APP.lang === 'ar');
  check('html dir flips to rtl', doc.documentElement.getAttribute('dir') === 'rtl');
  check('body gets rtl class', doc.body.classList.contains('rtl'));
  check('lang persists to localStorage', w.localStorage.getItem('apt_lang') === 'ar');
  check('static nav chrome translates', doc.querySelector('[data-i18n="nav_findings"]').textContent === 'النتائج');
  w.setSection('findings');
  check('findings section translates', doc.getElementById('secbody').innerHTML.indexOf('متتبع الثغرات') >= 0);
  w.setSection('killchain');
  check('killchain stage names translate', doc.getElementById('secbody').innerHTML.indexOf('الاستطلاع') >= 0);
  check('tx() falls back gracefully on plain-string data', typeof w.tx === 'function' && w.tx('plain string') === 'plain string');
  w.APP.reportLang = 'ar';
  check('Arabic report generates with Arabic header', w.generateReport().indexOf('تقرير اختبار الاختراق') >= 0);
  w.APP.reportLang = 'en';
  check('English report still generates correctly', w.generateReport().indexOf('Penetration Test Report') >= 0);
  w.setLang('en');
  check('switching back to English restores dir=ltr', doc.documentElement.getAttribute('dir') === 'ltr');
  w.setSection('findings');
  check('switching back to English restores chrome text', doc.getElementById('secbody').innerHTML.indexOf('Findings Tracker') >= 0);

  section('Scope manager');
  w.setSection('scope');
  doc.getElementById('sc_in_inp').value = '192.168.1.0/24';
  w.addScope('in');
  check('scope target added', w.APP.scope.targets.length === 1);

  section('Kill chain');
  w.setSection('killchain');
  check('7 kill chain stages initialized', w.APP.kc.length === 7);
  w.kcAddItem ? null : null; // kcAddItem uses prompt(), skip interactive test
  w.APP.kc[0].items.push('Recon step');
  check('manual kc item push works', w.APP.kc[0].items.length === 1);
  w.kcDeleteItem(0, 0);
  check('kc item delete works', w.APP.kc[0].items.length === 0);

  section('Timer');
  w.setSection('timer');
  w.APP.timerSelPhase = 'recon';
  w.startTimer();
  check('timer starts', !!w.APP.timerActive);
  w.APP.timerActive.start = Date.now() - 5000;
  w.stopTimer();
  check('timer session logged', w.APP.timerSessions.length === 1);

  section('Checklist persistence + toggle-all');
  w.setSection('framework');
  w.selectPhase('pre');
  w.selectStep('p1');
  w.toggleAll();
  const ph = w.getPhase('pre'), st = w.getStep(ph, 'p1');
  let allChecked = true;
  (st.checklist || []).forEach((c, i) => { if (!w.APP.ck['p1_' + i]) allChecked = false; });
  check('toggle-all checks everything', allChecked);
  const stored = w.localStorage.getItem('apt_default_ck');
  check('checklist persists to localStorage', stored && stored.indexOf('p1_0') >= 0);

  section('Search');
  w.handleSearch('nmap');
  check('search returns results', doc.getElementById('content').innerHTML.indexOf('srchres') >= 0 || doc.getElementById('content').innerHTML.indexOf('srchitem') >= 0);
  w.clearSearch();

  section('AI graceful failure (no API key configured)');
  let alertMsg = null;
  w.alert = m => { alertMsg = m; };
  w.openFinding(null);
  doc.getElementById('fp_title').value = 'no key test';
  w.aiBusinessImpact();
  setTimeout(() => {
    check('shows clear error instead of crashing', alertMsg && alertMsg.indexOf('API key') >= 0);

    section('Export functions (no crash)');
    try {
      w.downloadReport();
      w.exportAllData();
      check('export functions run without throwing', true);
    } catch (e) {
      check('export functions (' + e.message + ')', false);
    }

    section('No uncaught runtime errors during entire test run');
    check('zero jsdom/console errors', errors.length === 0);
    if (errors.length) errors.forEach(e => console.log('   ' + e));

    // ── SUMMARY ──
    console.log('\n' + '─'.repeat(50));
    console.log(`${passed} passed, ${failed} failed`);
    if (failed > 0) {
      console.log('\nFailed checks:');
      failures.forEach(f => console.log('  - ' + f));
      process.exit(1);
    } else {
      console.log('All checks passed. Safe to deploy dist/pentest-standalone.html');
      process.exit(0);
    }
  }, 150);
}, 500);

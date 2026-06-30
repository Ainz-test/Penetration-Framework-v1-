# PenTest Pro — Build Pipeline

Elite penetration testing reference framework. This is the source pipeline that
generates `dist/pentest-standalone.html` — the single file you actually deploy.

## Why this exists

The app used to be hand-edited as one 220KB HTML file. That made every edit
risky: a single misplaced character could silently break the whole app, and
finding the bug meant reading through everything at once. This pipeline splits
the source into focused files (one per feature), and a build script reassembles
them into the same deployable single-file output. Edit a 100-line file instead
of hunting through 1600 lines.

## Structure

```
pentest-pro/
├── build.js              run this to produce dist/pentest-standalone.html
├── package.json
├── api/
│   └── chat.js            Vercel serverless function — proxies AI calls, keep your API key server-side
├── src/
│   ├── template.html       the HTML skeleton ({{CSS}} and {{JS}} get substituted in)
│   ├── css/                one file per UI area, loaded in filename order
│   │   ├── 00-base.css
│   │   ├── 01-layout.css           topbar, drawer, phase/section nav
│   │   ├── 02-components.css       cards, command blocks, checklists (shared)
│   │   ├── 03-findings.css
│   │   ├── 04-scope.css
│   │   ├── 05-tools.css
│   │   ├── 06-payloads.css
│   │   ├── 07-report.css
│   │   ├── 08-killchain.css
│   │   ├── 09-timer.css
│   │   ├── 10-profiles-settings.css
│   │   └── 99-responsive.css       media queries + accessibility, always last
│   ├── js/                  same pattern — one file per feature, load order = filename order
│   │   ├── 00-core.js              state, helpers, storage, data loader — everything else depends on this
│   │   ├── 01-cvss.js
│   │   ├── 02-section-nav.js
│   │   ├── 03-framework.js         the original phase/step/command browser
│   │   ├── 04-findings.js
│   │   ├── 05-ai.js
│   │   ├── 06-scope.js
│   │   ├── 07-tools.js
│   │   ├── 08-payloads.js
│   │   ├── 09-report.js
│   │   ├── 10-killchain.js
│   │   ├── 11-timer.js
│   │   ├── 12-profiles.js
│   │   ├── 13-settings.js
│   │   └── 99-main.js              DOMContentLoaded init — must load last
│   └── data/                 the actual content — edit these, not code, to add commands/tools/payloads
│       ├── phases.json             the 9 phases: steps, commands, checklists
│       ├── tools.json              install guide entries
│       ├── payloads.json           payload quick-reference
│       └── mitre.json              ATT&CK technique list
├── dist/
│   └── pentest-standalone.html   ← generated. this is what you deploy.
└── tests/
    └── run.js                runs the built file through a real DOM and checks 40+ behaviors
```

## Workflow

```bash
npm install          # first time only
node build.js         # rebuild dist/pentest-standalone.html from src/
node tests/run.js      # verify nothing broke
# or both at once:
npm run verify
```

Then deploy `dist/pentest-standalone.html` exactly like before: rename to
`index.html`, put it plus `api/` in a folder, drag to vercel.com, set the
`ANTHROPIC_API_KEY` environment variable for the AI features to work.

## Bilingual support (Arabic/English)

The whole app — chrome, framework content, tools, payloads, MITRE mapping,
and the report generator — runs in English or Arabic with full RTL layout.
Toggle via the AR/EN button in the topbar, or per-section in AI + Settings.

**How it works:**
- `src/js/00a-i18n.js` holds the UI chrome dictionary (`I18N`) and two helpers:
  `t('key')` for interface strings, `tx(field)` for bilingual data fields.
- Data fields that hold prose (titles, summaries, checklist items, tool
  descriptions, payload notes, MITRE names) are stored as `{"en": "...", "ar": "..."}`
  objects in `src/data/*.json`. `tx()` picks the active language and falls
  back to `.en` (or returns a plain string unchanged) if a field hasn't been
  translated yet — nothing crashes if you add new English-only content first.
- **Executable syntax is never translated**: shell commands (`cmd`), flag
  tokens (`flags[].f`), payload strings (`items[]`), and install commands
  stay plain strings always. Translating `nmap -sV` would just break it.
- `src/css/98-rtl.css` handles the handful of things that don't auto-mirror
  under `direction:rtl` (flexbox rows mirror for free) — the drawer and
  finding-panel slide direction, and keeping code/commands/dates LTR inside
  RTL flow.
- The report generator (`09-report.js`) has its own independent language
  selector (`APP.reportLang`), separate from the UI language — a tester
  working in Arabic can still generate an English client deliverable, or
  vice versa.

**Adding a new translated UI string**: add a `key:{en:'...',ar:'...'}` entry
to `I18N` in `00a-i18n.js`, then call `t('key')` where you'd otherwise have
written the literal string.

**Adding new bilingual data** (a new phase, tool, payload, or finding-panel
field): write the field as `{"en": "...", "ar": "..."}` directly in the
JSON, and read it through `tx()` in the render function. If you only have
the English version for now, a plain string still works — just translate it
later.

## Adding things

**A new tool to the install guide** — add an entry to `src/data/tools.json`
under the right category. No code changes needed.

**A new payload category** — add to `src/data/payloads.json`.

**A new MITRE technique** — add to `src/data/mitre.json`.

**A new phase or step in the framework** (e.g. mobile testing, AD deep-dive,
wireless) — add to `src/data/phases.json` following the existing shape:
```json
{
  "id": "mobile",
  "label": "Mobile Assessment",
  "short": "Mobile",
  "icon": "📱",
  "color": "#hexcode",
  "desc": "one-line description",
  "steps": [ { "id": "...", "title": "...", "checklist": [...], "commands": [...] } ]
}
```

**A new feature section** (its own tab, like Findings or Scope) — this is
real work, not just data:
1. Add a new `src/js/NN-yourfeature.js` file with a `renderYourFeature(el)`
   function plus whatever helpers it needs.
2. Add a matching `src/css/NN-yourfeature.css`.
3. Register a button in the `#secnav` block of `src/template.html` and wire
   it into the `setSection()` dispatcher in `src/js/02-section-nav.js`.
4. Add a test block to `tests/run.js` covering the new feature's core paths.
5. `npm run verify`.

## Two bug classes this pipeline eliminates

**HTML attribute injection.** Never embed raw data (a command string, a
payload, anything that might contain a space or a quote) directly inside an
`onclick="..."` attribute via `JSON.stringify()` — the double quotes in the
stringified output terminate the attribute early and corrupt the markup. Use
the `regCopy()` / `copyById()` registry pattern already in `00-core.js`:
register the string, get back a short safe id, put the id in the attribute.

**Non-ASCII data corruption.** The data blob is base64-encoded and decoded
client-side with `atob()`, which is byte-oriented, not UTF-8-aware. Any emoji
or special character in `src/data/*.json` must stay representable in
ASCII-safe form through the pipeline. `build.js` handles this automatically
(`jsonStringifyAscii()`) — you don't need to think about it unless you're
editing the build script itself. If you ever rewrite the data-loading step,
keep this constraint or switch both the encoder and the client decoder to a
proper UTF-8-safe pair together.

## Tests

`tests/run.js` loads the built file into a real DOM (jsdom) and exercises
every section, plus the specific bugs found during development: a field-sync
bug that wiped finding titles when touching CVSS dropdowns, a progress-ring
element that destroyed itself on re-render, and the attribute-injection bug
above. Each of those has its own regression check so they can't silently come
back. Add a check here for any future bug you fix — five minutes now saves a
much worse afternoon later.

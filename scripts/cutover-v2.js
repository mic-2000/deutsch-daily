#!/usr/bin/env node
/* scripts/cutover-v2.js — Course v2 cutover (curriculum-redesign-2026-07-v2.md §7 / Gate 6).
 *
 * Swaps the GENERATED Course-v2 artifacts (data/v2/*, locales/v2/*, produced by gen-course.js from
 * authoring/) into the LIVE runtime files the app actually loads:
 *
 *   data/v2/weeks.js          → data/weeks.js          const WEEKS  (object tasks, 36 weeks / 180 days)
 *   data/v2/vocab.js          → data/vocab.js          const VOCAB + PLURALS (both from authoring/)
 *   data/v2/grammar-drills.js → data/grammar-drills.js const GRAMMAR_DRILLS (keyed by slug, verbatim)
 *   data/v2/dialogues.js      → data/dialogues.js      const DIALOGUES (keyed by slug, verbatim)
 *   locales/v2/<l>.js         → locales/<l>.js         vocab + weeks + drills + dialogues REPLACED; ui + verbs KEPT
 *
 * Idempotent: re-run after `npm run gen:course` to refresh the live course. The swap keeps the live
 * file set (which the tests target) as the single source, rather than dual-loading data/v2 at runtime.
 *
 * Usage: node scripts/cutover-v2.js   (or: npm run cutover:v2)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const LANGS = ['en', 'ru', 'ua'];
const p = (...s) => path.join(ROOT, ...s);
const read = (f) => fs.readFileSync(f, 'utf8');

/* ---- string-aware brace matcher: return [start,end) span of the {...} object value ---------- */
/* Given text and the index of an opening `{`, walk to its matching `}` while skipping over string
   literals (both " and '), so braces inside strings don't unbalance the count. Returns the index
   just past the closing brace. */
function matchBrace(text, open) {
  let depth = 0, i = open, str = null;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (str) {
      if (ch === '\\') { i++; continue; }      // skip escaped char
      if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { str = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return i + 1; }
  }
  throw new Error('unbalanced braces from index ' + open);
}

/* Ensure a top-level `  <key>: {}` slot exists so spliceValue can target it. Appends an empty
   placeholder just before the object's final `};` when the key is absent (e.g. `drills`, added for
   the grammar-drill engine after the initial cutover shipped only vocab + weeks). Idempotent. */
function ensureKey(text, key) {
  if (new RegExp('\\n  ' + key + ':[ \\t]*').test(text)) return text;
  const m = text.match(/\n\};\s*$/);
  if (!m) throw new Error('cannot locate object terminator to insert key: ' + key);
  return text.slice(0, m.index) + '\n  ' + key + ': {},' + text.slice(m.index);
}

/* Replace the object value of top-level `  <key>: { ... }` in a locale file with a serialized object,
   preserving everything before the value and the trailing comma/rest after it. */
function spliceValue(text, key, obj) {
  const m = text.match(new RegExp('\\n  ' + key + ':[ \\t]*'));
  if (!m) throw new Error('key not found: ' + key);
  const braceStart = text.indexOf('{', m.index + m[0].length);
  if (braceStart === -1) throw new Error('no object literal for key: ' + key);
  const braceEnd = matchBrace(text, braceStart);
  // JSON.stringify emits valid JS; re-indent so the block sits under the 2-space `  <key>:`.
  const literal = JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');
  return text.slice(0, braceStart) + literal + text.slice(braceEnd);
}

/* Evaluate a `window.LOCALE_<L>_V2 = {...}` overlay file and return the object. */
function loadOverlay(lang) {
  const src = read(p('locales/v2', lang + '.js'));
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window['LOCALE_' + lang.toUpperCase() + '_V2'] || {};
}

/* ---- run ------------------------------------------------------------------------------------ */
function main() {
  // 1) weeks — copy the generated v2 curriculum verbatim.
  fs.writeFileSync(p('data/weeks.js'), read(p('data/v2/weeks.js')));
  console.log('✓ data/weeks.js ← data/v2/weeks.js');

  // 2) vocab — generated VOCAB + PLURALS, verbatim (both generated from authoring/ by gen-course.js).
  fs.writeFileSync(p('data/vocab.js'), read(p('data/v2/vocab.js')));
  console.log('✓ data/vocab.js ← data/v2/vocab.js (VOCAB + PLURALS)');

  // 3) grammar drills — GRAMMAR_DRILLS keyed by slug, verbatim (the /today grammar step reads it).
  fs.writeFileSync(p('data/grammar-drills.js'), read(p('data/v2/grammar-drills.js')));
  console.log('✓ data/grammar-drills.js ← data/v2/grammar-drills.js (GRAMMAR_DRILLS)');

  // 4) dialogues — DIALOGUES keyed by slug, verbatim (the /today listen step reads it).
  fs.writeFileSync(p('data/dialogues.js'), read(p('data/v2/dialogues.js')));
  console.log('✓ data/dialogues.js ← data/v2/dialogues.js (DIALOGUES)');

  // 5) locales — replace vocab + weeks + drills + dialogues, keep ui + verbs.
  for (const lang of LANGS) {
    const overlay = loadOverlay(lang);
    let text = read(p('locales', lang + '.js'));
    text = spliceValue(text, 'vocab', overlay.vocab);
    text = spliceValue(text, 'weeks', overlay.weeks);
    text = ensureKey(text, 'drills');
    text = spliceValue(text, 'drills', overlay.drills || {});
    text = ensureKey(text, 'dialogues');
    text = spliceValue(text, 'dialogues', overlay.dialogues || {});
    fs.writeFileSync(p('locales', lang + '.js'), text);
    console.log('✓ locales/' + lang + '.js ← locales/v2/' + lang + '.js (vocab + weeks + drills + dialogues)');
  }

  console.log('\nCourse v2 cutover complete. Run `npm test` to verify.');
}

main();

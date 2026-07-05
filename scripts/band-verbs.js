#!/usr/bin/env node
/* scripts/band-verbs.js — add/refresh the `band` field on every verb in data/verbs.js.
 *
 * The band gates when the verb trainer may introduce a verb as NEW (band ≤ current course band;
 * already-seen due cards stay reviewable regardless). Course v2 requires a band on every verb
 * (Gate 4). This script is the single place that computes them, so the ~340-verb surface stays
 * consistent and re-runnable:
 *
 *   band = min(
 *     curriculum band  = CEFR level of the EARLIEST week whose verbFocus lists the verb,
 *     CEFR-map band    = authoring/verb-bands.js (hand-assigned per-verb level),
 *   )
 *
 * Taking the minimum guarantees band ≤ the level of every week that introduces the verb, so
 * tests/course-v2-align.test.js "verbFocus never above band" always holds. Verbs in neither
 * source default to B1 (reported). It rewrites each verb line in place (format-preserving) and is
 * idempotent — safe to run after adding new verbs. Usage: node scripts/band-verbs.js [--check]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');
const course = require(path.join(ROOT, 'authoring/course.js'));
const ORDER = { A1: 1, A2: 2, B1: 3 };
const lower = (a, b) => (!a ? b : !b ? a : ORDER[a] <= ORDER[b] ? a : b);

function levelOfWeek(n) {
  for (const lvl of course.BANDS) { const [lo, hi] = course.BAND_WEEKS[lvl]; if (n >= lo && n <= hi) return lvl; }
  return 'B1';
}

/* Earliest curriculum band per verb key, from the authoring weeks' verbFocus lists. */
function curriculumBands() {
  const dir = path.join(ROOT, 'authoring/weeks');
  const out = {};
  for (let n = 1; n <= course.TOTAL_WEEKS; n++) {
    const f = path.join(dir, `w${String(n).padStart(2, '0')}.js`);
    if (!fs.existsSync(f)) continue;
    const w = require(f);
    for (const k of w.verbFocus || []) out[k] = lower(out[k], levelOfWeek(n));
  }
  return out;
}

const cefr = (() => { try { return require(path.join(ROOT, 'authoring/verb-bands.js')); } catch { return {}; } })();
const curriculum = curriculumBands();

const file = path.join(ROOT, 'data/verbs.js');
const lines = fs.readFileSync(file, 'utf8').split('\n');
const LINE = /^(\s*)("(?:[^"\\]|\\.)*")\s*:\s*\{\s*(.*?)\s*\}(,?)\s*$/;

let banded = 0;
const defaulted = [];
const out = lines.map((line) => {
  const m = line.match(LINE);
  if (!m) return line;
  const [, indent, quotedKey, bodyRaw, comma] = m;
  const key = JSON.parse(quotedKey);
  const band = lower(curriculum[key], cefr[key]) || (defaulted.push(key), 'B1');
  const body = bodyRaw.replace(/band\s*:\s*"[^"]*"\s*,?\s*/, '').trim(); // idempotent: drop any existing band
  banded++;
  return `${indent}${quotedKey}: { band:"${band}", ${body} }${comma}`;
});

if (defaulted.length) console.warn(`⚠ ${defaulted.length} verb(s) had no curriculum/CEFR band, defaulted to B1:\n  ${defaulted.join(', ')}`);
console.log(`Banded ${banded} verbs (${Object.keys(curriculum).length} from curriculum verbFocus, ${Object.keys(cefr).length} in CEFR map).`);

if (CHECK) { console.log('--check: data/verbs.js not modified.'); process.exit(0); }
fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log('✓ data/verbs.js bands written.');

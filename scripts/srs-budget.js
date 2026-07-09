#!/usr/bin/env node
/* scripts/srs-budget.js — SRS daily due-pressure estimator (Plan §5, §14 Data).
 *
 * The v1 budget arithmetic undercounted the review load because it counted only words and verbs,
 * not plural cards or grammar-review cards. This script recomputes the load from the LIVE data using
 * the §5 model and reports, for each tariff (5/10/15/20+), whether the daily answer budget can
 * absorb the steady-state review load — i.e. whether that tariff can carry a learner through the
 * full 180-day Course v2. It is the tool the plan asks for so new-word rates can be sanity-checked
 * before shipping content, and its companion test (tests/srs-budget.test.js) locks in that the
 * 15-minute default path stays viable.
 *
 * Dependency-free: only Node's fs/path/vm. It reads the browser-globals data files the same way
 * scripts/gen-course.js does (eval in a vm sandbox), so it always reflects the shipped course.
 *
 *   SRS units        = word cards + verb cards + plural cards + grammar-review cards
 *   Expected answers = SRS units x required successful reviews x lapse multiplier          (§5)
 *
 * Steady-state throughput view (what the per-day numbers below use): a card passes through each
 * Leitner box exactly once on its way to mastery, so in steady state, introducing `r` new cards a
 * day produces `r x requiredReviews` graded answers a day (one per box per card), inflated by the
 * lapse multiplier for the extra re-reviews a miss causes. Turning that around: a tariff whose daily
 * answer budget is B can sustain B / (requiredReviews x lapse) NEW cards a day, and the whole course
 * of `units` cards then takes units / (that rate) days. A tariff is "viable" for Course v2 when it
 * can finish within the 180 study days with the WORST-CASE lapse multiplier.
 *
 * Usage:
 *   node scripts/srs-budget.js            # print the report table
 *   node scripts/srs-budget.js --json     # machine-readable JSON (for CI / inspection)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

/* ---- model constants (documented, adjustable knobs) --------------------------------------- */

/* Study days in the course: TOTAL_WEEKS x 5. Read from the generated manifest so it can't drift
   from the shipped curriculum; falls back to the known 36x5 if the manifest is unreadable. */
function courseDays() {
  const m = evalGlobals(path.join(ROOT, 'data/v2/manifest.js'), ['COURSE_MANIFEST']).COURSE_MANIFEST;
  return (m && m.days) || 180;
}

/* Required successful reviews to master one card = the number of Leitner boxes (box 0 -> MAX_BOX).
   Read live from leitner.js so it tracks the real box model. */
function requiredReviews() {
  const g = evalGlobals(path.join(ROOT, 'assets/js/leitner.js'), ['MAX_BOX']);
  return g.MAX_BOX || 5;
}

/* Lapse multiplier range (§5): a card is answered more than `requiredReviews` times because misses
   re-queue it. We report the point estimate and gate viability on the pessimistic upper bound. */
const LAPSE = { min: 1.25, point: 1.30, max: 1.35 };

/* Sustained answer rate a learner keeps up across a session (answers/minute). Deliberately
   conservative (12s/answer) so the viability verdicts have headroom rather than being optimistic. */
const ANSWERS_PER_MIN = 5;

/* The onboarding "minutes/day" tariffs mapped to an answering-minutes budget. "20+" is treated as
   25 min (the full-path ceiling, matching the /today 25-card session cap). */
const TARIFFS = [
  { id: '5', minutes: 5, light: true },     // light/maintenance track — NOT a full-B1 promise (§4)
  { id: '10', minutes: 10 },
  { id: '15', minutes: 15 },                // the default target path (§4)
  { id: '20+', minutes: 25 },
];

/* ---- data loading ------------------------------------------------------------------------- */

/* Evaluate a browser-globals file in a throwaway sandbox and pull the named globals out. */
function evalGlobals(file, names) {
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  const capture = names.map((n) => `try{this.${n}=${n};}catch(e){this.${n}=undefined;}`).join('');
  vm.runInContext(src + '\n;' + capture, sandbox);
  return sandbox;
}

/* Count the four SRS unit families from the live data.
   Note: some vocab words ARE verbs and share the verb trainer's Leitner card, so word+verb counts
   overlap slightly and the total is a mild OVER-count. That is deliberate: overstating the load can
   only make a "viable" verdict more conservative, never falsely optimistic. */
function loadUnits() {
  const v = evalGlobals(path.join(ROOT, 'data/vocab.js'), ['VOCAB', 'PLURALS']);
  const vb = evalGlobals(path.join(ROOT, 'data/verbs.js'), ['VERBS']);
  // grammar-review cards are keyed by drill slug; the live path isn't cut over yet (Plan item 10),
  // so read the generated v2 source as the authoritative slug count, tolerating its absence.
  let grammar = 0;
  try {
    grammar = Object.keys(evalGlobals(path.join(ROOT, 'data/v2/grammar-drills.js'), ['GRAMMAR_DRILLS']).GRAMMAR_DRILLS || {}).length;
  } catch (e) { grammar = 0; }

  let words = 0;
  for (const w of Object.keys(v.VOCAB || {})) words += (v.VOCAB[w].words || []).length;
  const verbs = Object.keys(vb.VERBS || {}).length;
  const plurals = Object.keys(v.PLURALS || {}).length;

  return { words, verbs, plurals, grammar, total: words + verbs + plurals + grammar };
}

/* ---- the budget model --------------------------------------------------------------------- */

/* Compute the full per-tariff budget. Returns everything the CLI and the test need. */
function computeBudget(opts) {
  opts = opts || {};
  const units = opts.units || loadUnits();
  const days = opts.days || courseDays();
  const reviews = opts.reviews || requiredReviews();
  const apm = opts.answersPerMin || ANSWERS_PER_MIN;
  const lapse = opts.lapse || LAPSE;

  // Answers/day the whole course demands if its `units` cards are introduced evenly over `days`.
  const dailyLoad = (mult) => (units.total / days) * reviews * mult;

  const rows = TARIFFS.map((t) => {
    const capacity = t.minutes * apm;                       // graded answers/day the tariff affords
    const sustainableNewPerDay = capacity / (reviews * lapse.max);   // new cards/day (worst-case lapse)
    const daysToFull = sustainableNewPerDay > 0 ? units.total / sustainableNewPerDay : Infinity;
    // Viable = can absorb the worst-case steady-state load within the course length.
    const viable = capacity >= dailyLoad(lapse.max);
    return {
      id: t.id,
      minutes: t.minutes,
      light: !!t.light,
      capacity,
      sustainableNewPerDay,
      daysToFull,
      viable,
    };
  });

  return {
    units,
    days,
    reviews,
    answersPerMin: apm,
    lapse,
    load: { min: dailyLoad(lapse.min), point: dailyLoad(lapse.point), max: dailyLoad(lapse.max) },
    tariffs: rows,
  };
}

/* ---- reporting ---------------------------------------------------------------------------- */

function fmt(n, d) { return Number(n).toFixed(d === undefined ? 1 : d); }

function report(b) {
  const u = b.units;
  const lines = [];
  lines.push('SRS due-pressure estimate — Course v2 (Plan §5)');
  lines.push('');
  lines.push(`  SRS units: ${u.total}  =  ${u.words} words + ${u.verbs} verbs + ${u.plurals} plurals + ${u.grammar} grammar`);
  lines.push(`  Model: ${b.reviews} successful reviews/card · lapse x${b.lapse.min}–${b.lapse.max} · ${b.answersPerMin} answers/min · ${b.days} study days`);
  lines.push(`  Steady-state load: ${fmt(b.load.point)} answers/day (point) · ${fmt(b.load.max)} worst-case`);
  lines.push('');
  lines.push('  tariff  min   answers/day   new cards/day   days→full B1   viable(180d)');
  lines.push('  ' + '-'.repeat(70));
  for (const r of b.tariffs) {
    const verdict = r.viable ? 'yes' : (r.light ? 'no (light track)' : 'no');
    lines.push(
      '  ' +
      r.id.padEnd(7) +
      String(r.minutes).padEnd(6) +
      String(r.capacity).padEnd(14) +
      fmt(r.sustainableNewPerDay).padEnd(16) +
      fmt(r.daysToFull, 0).padEnd(15) +
      verdict
    );
  }
  lines.push('');
  lines.push('  "viable" = the daily answer budget absorbs the worst-case steady-state load within');
  lines.push('  the 180 study days. The 5-min tariff is a light/maintenance track by design (§4).');
  return lines.join('\n');
}

/* ---- CLI ---------------------------------------------------------------------------------- */

if (require.main === module) {
  const b = computeBudget();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(b, null, 2));
  } else {
    console.log(report(b));
  }
}

module.exports = { loadUnits, computeBudget, report, TARIFFS, LAPSE, ANSWERS_PER_MIN };

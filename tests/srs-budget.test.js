/* tests/srs-budget.test.js — SRS due-pressure model (Plan §5, §14 Data).
 *
 * Guards scripts/srs-budget.js, the estimator that recomputes the daily review load from the LIVE
 * course data across all four card families (words + verbs + plurals + grammar) and decides which
 * tariffs can carry a learner through the full 180-day Course v2. The load-bearing assertion the
 * plan asks for is that the 15-minute default path stays viable; we also lock in that the 5-minute
 * tariff is NOT treated as a full-B1 path (it's a light track — Plan §4/§13) so nobody quietly
 * promises B1 in 5 minutes/day, and that the unit accounting stays in a sane range.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadUnits, computeBudget } = require('../scripts/srs-budget');

const byId = (b, id) => b.tariffs.find((t) => t.id === id);

test('units: all four families counted and total is their sum', () => {
  const u = loadUnits();
  for (const k of ['words', 'verbs', 'plurals', 'grammar']) {
    assert.ok(u[k] > 0, `${k} card family must be counted (got ${u[k]})`);
  }
  assert.equal(u.total, u.words + u.verbs + u.plurals + u.grammar);
});

test('units: total SRS load is in the expected Course v2 range (§5)', () => {
  // §5 estimated ~1,365–1,435; keep a wide band so content edits do not flap this test, but a gross
  // regression (e.g. plurals or grammar dropping out of the count) is still caught.
  const { total } = loadUnits();
  assert.ok(total >= 1200 && total <= 1600, `SRS units ${total} outside the expected 1200–1600 band`);
});

test('model: required reviews = the Leitner box count, load uses the §5 formula', () => {
  const b = computeBudget();
  assert.equal(b.reviews, 5, 'box 0 → MAX_BOX = 5 successful reviews to master');
  // Expected answers/day = units/days × reviews × lapse (point estimate).
  const expectPoint = (b.units.total / b.days) * b.reviews * b.lapse.point;
  assert.ok(Math.abs(b.load.point - expectPoint) < 1e-9, 'point load matches the §5 model');
  assert.ok(b.load.max > b.load.point, 'worst-case lapse load exceeds the point estimate');
});

test('15-minute mode stays viable for the full 180-day course', () => {
  const b = computeBudget();
  const m15 = byId(b, '15');
  assert.ok(m15, '15-minute tariff present');
  assert.equal(m15.viable, true, '15-minute default path must remain viable');
  // Viability is gated on the WORST-CASE lapse multiplier, not the optimistic one.
  assert.ok(m15.capacity >= b.load.max, `15-min capacity ${m15.capacity} must cover worst-case load ${b.load.max.toFixed(1)}`);
  assert.ok(m15.daysToFull <= b.days, `15-min finishes within the course (${m15.daysToFull.toFixed(0)}d ≤ ${b.days}d)`);
});

test('20+ mode is comfortably viable', () => {
  const b = computeBudget();
  const m = byId(b, '20+');
  assert.equal(m.viable, true);
  assert.ok(m.daysToFull < byId(b, '15').daysToFull, 'more minutes → finishes sooner');
});

test('5-minute mode is a light track, not a full-B1 path (§4/§13)', () => {
  const b = computeBudget();
  const m5 = byId(b, '5');
  assert.equal(m5.light, true, '5-min is flagged as a light/maintenance track');
  assert.equal(m5.viable, false, '5-min must NOT be reported as a full-course path');
});

test('viability is monotonic in the time budget', () => {
  const b = computeBudget();
  // Once a tariff is viable, every larger tariff must be too (capacity is monotonic in minutes).
  const viables = b.tariffs.map((t) => t.viable);
  let seenViable = false;
  for (const v of viables) {
    if (v) seenViable = true;
    else assert.ok(!seenViable, 'a non-viable tariff must not follow a viable one');
  }
});

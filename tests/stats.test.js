/* tests/stats.test.js — statistics-page aggregation + B1 forecast math (DEV-8).
 *
 * Guards the PURE derivations in assets/js/stats.js that power the /stats screen:
 *   activeCountInWindow — active-day counters for the 7- / 30-day windows
 *   weeklyAccuracy      — per-week answer accuracy from the dayStats completion ledger
 *   masteryBreakdown    — mastered / in-progress / due(+by-tomorrow) totals from Leitner records
 *   forecastFinish      — projects the B1-completion date from the learner's realised pace
 *
 * stats.js is dual-mode (browser global + CommonJS); we require it directly and build every
 * date-relative fixture through the module's own streakShiftDay, so the assertions hold whenever
 * and wherever the suite runs (no Date mocking).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  streakShiftDay,
  activeCountInWindow, weeklyAccuracy, masteryBreakdown, forecastFinish,
} = require('../assets/js/stats');

const TODAY = '2026-07-15';
const setAt = (base, offsets) => new Set(offsets.map((o) => streakShiftDay(base, o)));

/* ---- activeCountInWindow ---- */

test('activeCountInWindow: counts active days inside the trailing window (inclusive of today)', () => {
  const set = setAt(TODAY, [0, -1, -3, -8, -29]);
  assert.equal(activeCountInWindow(set, TODAY, 7), 3, 'today, -1, -3 fall in the last 7 days');
  assert.equal(activeCountInWindow(set, TODAY, 30), 5, 'all five fall in the last 30 days');
  assert.equal(activeCountInWindow(new Set(), TODAY, 30), 0, 'empty history → 0');
});

/* ---- weeklyAccuracy ---- */

test('weeklyAccuracy: sums right/total per curriculum week (5 days = 1 week) across trainers', () => {
  const dayStats = {
    1: { counts: { vocab: { right: 8, total: 10 }, verbs: { right: 4, total: 5 }, listen: null } },
    3: { counts: { vocab: { right: 9, total: 10 } } },
    6: { counts: { vocab: { right: 5, total: 10 } } },
    7: { counts: {} },        // day with no gradeable score → no contribution, no day count
    8: {},                    // day with no counts at all → skipped
  };
  const rows = weeklyAccuracy(dayStats);
  assert.equal(rows.length, 2, 'two weeks have gradeable data');
  assert.deepEqual(rows[0], { week: 1, right: 21, total: 25, days: 2, pct: 84 });
  assert.deepEqual(rows[1], { week: 2, right: 5, total: 10, days: 1, pct: 50 });
});

test('weeklyAccuracy: tolerates missing/empty dayStats', () => {
  assert.deepEqual(weeklyAccuracy(undefined), []);
  assert.deepEqual(weeklyAccuracy({}), []);
});

/* ---- masteryBreakdown ---- */

test('masteryBreakdown: buckets seen cards; due-now vs due-by-tomorrow split', () => {
  const now = 1_000_000;
  const DAY = 86400000;
  const cards = [
    { box: 5, seen: 3, due: 0 },                 // mastered
    { box: 2, seen: 2, due: now - 10 },          // learning + due now
    { box: 3, seen: 1, due: now + DAY / 2 },     // learning + due within 24h (soon)
    { box: 1, seen: 1, due: now + 3 * DAY },     // learning, not due for a while
    { box: 0, seen: 0, due: 0 },                 // unseen → ignored
    null,                                        // ignored
  ];
  const b = masteryBreakdown(cards, now);
  assert.equal(b.mastered, 1);
  assert.equal(b.learning, 3);
  assert.equal(b.due, 1);
  assert.equal(b.dueSoon, 1);
  assert.equal(b.dueByTomorrow, 2, 'due-now + due-within-24h');
});

test('masteryBreakdown: empty input → all zeros', () => {
  assert.deepEqual(masteryBreakdown([], 0), { mastered: 0, learning: 0, due: 0, dueSoon: 0, dueByTomorrow: 0 });
  assert.deepEqual(masteryBreakdown(undefined, 0), { mastered: 0, learning: 0, due: 0, dueSoon: 0, dueByTomorrow: 0 });
});

/* ---- forecastFinish ---- */

test('forecastFinish: no completions yet → no pace, honest daysLeft', () => {
  const f = forecastFinish({ completions: [], currentDay: 1, totalDays: 180, todayKey: TODAY });
  assert.equal(f.daysLeft, 180);
  assert.equal(f.done, false);
  assert.equal(f.hasPace, false);
  assert.equal(f.etaKey, null);
});

test('forecastFinish: finished course → done, no pace needed', () => {
  const f = forecastFinish({ completions: [TODAY], currentDay: 181, totalDays: 180, todayKey: TODAY });
  assert.equal(f.daysLeft, 0);
  assert.equal(f.done, true);
  assert.equal(f.hasPace, false);
});

test('forecastFinish: daysLeft measures from the current curriculum position (placement start)', () => {
  // A B1 learner who started on day 121 and has reached day 121 has 60 days of course ahead.
  const f = forecastFinish({ completions: [TODAY], currentDay: 121, totalDays: 180, todayKey: TODAY });
  assert.equal(f.daysLeft, 60);
});

test('forecastFinish: a steady 5-days/week pace projects a finish date', () => {
  // 5 completions in the last 5 consecutive days.
  const completions = [0, -1, -2, -3, -4].map((o) => streakShiftDay(TODAY, o));
  const f = forecastFinish({ completions, currentDay: 11, totalDays: 180, todayKey: TODAY });
  // span = 5 days → effective window floored at 7; 5 completions in a 7-day window → 5/week.
  assert.equal(f.hasPace, true);
  assert.equal(f.perWeek, 5);
  assert.equal(f.daysLeft, 170);                 // 180 - (11 - 1)
  assert.equal(f.weeksLeft, 34);                 // 170 / 5
  assert.equal(f.etaKey, streakShiftDay(TODAY, Math.ceil(34 * 7)));
});

test('forecastFinish: pace is capped at 7/week and measured over ≤ 4 weeks', () => {
  // Active every single day for 28 days → 7/week, not more.
  const completions = [];
  for (let o = 0; o > -28; o--) completions.push(streakShiftDay(TODAY, o));
  const f = forecastFinish({ completions, currentDay: 29, totalDays: 180, todayKey: TODAY });
  assert.equal(f.perWeek, 7);
  assert.equal(f.daysLeft, 152);                 // 180 - 28
  assert.ok(Math.abs(f.weeksLeft - 152 / 7) < 1e-9);
  assert.equal(f.etaKey, streakShiftDay(TODAY, Math.ceil((152 / 7) * 7)));
});

test('forecastFinish: a sparse pace stretches the projected finish', () => {
  // 4 study days spread across the last 28 → ~1/week.
  const completions = [0, -9, -18, -27].map((o) => streakShiftDay(TODAY, o));
  const f = forecastFinish({ completions, currentDay: 5, totalDays: 180, todayKey: TODAY });
  assert.equal(f.perWeek, 1);
  assert.equal(f.daysLeft, 176);                 // 180 - 4
  assert.equal(f.weeksLeft, 176);
});

test('forecastFinish: recent-pace window does not dilute a keen first few days', () => {
  // 3 completions in the learner's only 3 days of history → measured over a 7-day floor, not 28.
  const completions = [0, -1, -2].map((o) => streakShiftDay(TODAY, o));
  const f = forecastFinish({ completions, currentDay: 4, totalDays: 180, todayKey: TODAY });
  assert.equal(f.perWeek, 3, 'span floored at one week, not spread over four');
});

/* Integration: dayStats completions feed the forecast via activeDatesSet's sibling signal. */
test('forecastFinish: consumes raw dayStats.completedAt timestamps', () => {
  // Local-time strings (no trailing Z) keep the date key TZ-stable in any test environment, while
  // still exercising the ISO-string → local-date-key normalisation the real completedAt relies on.
  const iso = (o) => streakShiftDay(TODAY, o) + 'T12:00:00';
  const completions = [iso(0), iso(-1), iso(-2), iso(-3), iso(-4)];
  const f = forecastFinish({ completions, currentDay: 11, totalDays: 180, todayKey: TODAY });
  assert.equal(f.hasPace, true);
  assert.equal(f.perWeek, 5, 'ISO timestamps are normalised to local date keys');
});

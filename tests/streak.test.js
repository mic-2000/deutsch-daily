/* tests/streak.test.js — streak + activity-calendar math (DEV-7).
 *
 * Guards assets/js/stats.js, the PURE derivation of the learner's streak from their active local
 * dates (planner_data.dayStats completions + the lastActiveDate stamp). The load-bearing properties
 * the plan asks for: the streak is correct across day/month/year boundaries (local-date convention),
 * the once-per-7-days streak freeze forgives a single missed day (but not two in a row, and not two
 * inside the same window), and the 5-week calendar grid renders Monday-first ending in today's week.
 *
 * stats.js is dual-mode (browser global script + CommonJS), so we require it directly and build all
 * fixtures relative to a fixed "today" via the module's own streakShiftDay — no Date mocking, and the
 * assertions stay correct wherever/whenever the suite runs.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  streakDayKey, streakShiftDay, streakDaysBetween, streakWeekdayMon,
  activeDatesSet, streakInfo, activityCalendar, STREAK_FREEZE_WINDOW,
} = require('../assets/js/stats');

const TODAY = '2026-07-15';
// A Set of active date keys at the given day offsets from a base key (0 = base, -1 = the day before).
const setAt = (base, offsets) => new Set(offsets.map((o) => streakShiftDay(base, o)));

/* ---- date-key helpers (local-date convention, incl. boundaries) ---- */

test('streakDayKey: passes a bare YYYY-MM-DD through, formats a local Date', () => {
  assert.equal(streakDayKey('2026-07-15'), '2026-07-15', 'a key is not re-parsed (no UTC shift)');
  assert.equal(streakDayKey(new Date(2026, 6, 3)), '2026-07-03', 'local Date → zero-padded key (July = month 6)');
  assert.equal(streakDayKey(new Date(2026, 11, 9)), '2026-12-09');
});

test('streakShiftDay: rolls across month and year boundaries', () => {
  assert.equal(streakShiftDay('2026-08-01', -1), '2026-07-31', 'month boundary back');
  assert.equal(streakShiftDay('2026-07-31', 1), '2026-08-01', 'month boundary forward');
  assert.equal(streakShiftDay('2026-01-01', -1), '2025-12-31', 'year boundary back');
  assert.equal(streakShiftDay('2025-12-31', 1), '2026-01-01', 'year boundary forward');
  assert.equal(streakShiftDay('2026-03-01', -1), '2026-02-28', 'non-leap February');
});

test('streakDaysBetween: signed whole-day difference across boundaries', () => {
  assert.equal(streakDaysBetween('2026-07-31', '2026-08-01'), 1);
  assert.equal(streakDaysBetween('2025-12-31', '2026-01-01'), 1);
  assert.equal(streakDaysBetween('2026-07-15', '2026-07-15'), 0);
  assert.equal(streakDaysBetween('2026-08-01', '2026-07-31'), -1);
  assert.equal(streakDaysBetween('2026-07-01', '2026-07-31'), 30);
});

/* ---- active-date set ---- */

test('activeDatesSet: unions dayStats completions with lastActiveDate', () => {
  const set = activeDatesSet(
    { 1: { completedAt: '2026-07-06' }, 2: { completedAt: '2026-07-07' } },
    '2026-07-08'
  );
  assert.deepEqual([...set].sort(), ['2026-07-06', '2026-07-07', '2026-07-08']);
});

test('activeDatesSet: reads the LOCAL date of an ISO completedAt, tolerates gaps', () => {
  const set = activeDatesSet(
    { 1: { completedAt: new Date(2026, 6, 6, 10, 30) }, 2: {}, 3: null, 4: { completedAt: '2026-07-09' } },
    null
  );
  assert.ok(set.has('2026-07-06'), 'local date of a timestamp');
  assert.ok(set.has('2026-07-09'));
  assert.equal(set.size, 2, 'entries without completedAt are skipped');
});

test('activeDatesSet: empty inputs → empty set', () => {
  assert.equal(activeDatesSet(null, null).size, 0);
  assert.equal(activeDatesSet({}, undefined).size, 0);
});

/* ---- streak: basic runs ---- */

test('streakInfo: empty history → no streak', () => {
  const s = streakInfo(new Set(), TODAY);
  assert.deepEqual(
    { current: s.current, best: s.best, alive: s.alive, activeToday: s.activeToday, freezeActive: s.freezeActive },
    { current: 0, best: 0, alive: false, activeToday: false, freezeActive: false }
  );
});

test('streakInfo: only today active → 1-day streak', () => {
  const s = streakInfo(setAt(TODAY, [0]), TODAY);
  assert.equal(s.current, 1);
  assert.equal(s.best, 1);
  assert.equal(s.activeToday, true);
  assert.equal(s.alive, true);
});

test('streakInfo: consecutive run including today', () => {
  const s = streakInfo(setAt(TODAY, [0, -1, -2, -3]), TODAY);
  assert.equal(s.current, 4);
  assert.equal(s.best, 4);
  assert.equal(s.freezeActive, false);
});

test('streakInfo: today not active yet, but yesterday was → streak still alive (unchanged)', () => {
  const s = streakInfo(setAt(TODAY, [-1, -2, -3]), TODAY);
  assert.equal(s.current, 3, 'an inactive today does not break the streak — the day is not over');
  assert.equal(s.activeToday, false);
  assert.equal(s.alive, true);
});

test('streakInfo: two missed days with no freeze credit → broken', () => {
  // active only 3+ days ago; today and the two prior days are all missed.
  const s = streakInfo(setAt(TODAY, [-3, -4]), TODAY);
  assert.equal(s.current, 0, 'today + yesterday missed = a real 2-day gap that a single freeze cannot bridge');
  assert.equal(s.alive, false);
});

/* ---- streak: the freeze (one per 7 days) ---- */

test('streakInfo: a single missed day inside a run is auto-frozen', () => {
  // missed the day before yesterday (-3), everything else active.
  const s = streakInfo(setAt(TODAY, [0, -1, -2, -4, -5]), TODAY);
  assert.equal(s.current, 5, 'the one gap is bridged by a freeze; all 5 active days count');
  assert.equal(s.freezeActive, true);
});

test('streakInfo: one missed day forgiven when today is inactive too', () => {
  // today inactive (day not over), yesterday missed (frozen), then a run.
  const s = streakInfo(setAt(TODAY, [-2, -3, -4]), TODAY);
  assert.equal(s.current, 3, 'yesterday is frozen; the run behind it survives');
  assert.equal(s.alive, true);
  assert.equal(s.freezeActive, true);
});

test('streakInfo: two missed days INSIDE one 7-day window → the second breaks the streak', () => {
  // gaps at -2 and -4 (only 2 days apart, well within the freeze window).
  const s = streakInfo(setAt(TODAY, [0, -1, -3, -5], []), TODAY);
  assert.equal(s.current, 3, 'first gap frozen (0,-1,-3 count); the second gap at -4 ends the run');
});

test('streakInfo: two single-day gaps MORE than a week apart are both frozen', () => {
  // active every day for 21 days except two isolated misses at -7 and -15 (8 days apart).
  const offsets = [];
  for (let o = 0; o >= -20; o--) if (o !== -7 && o !== -15) offsets.push(o);
  const s = streakInfo(setAt(TODAY, offsets), TODAY);
  assert.equal(s.current, offsets.length, 'both gaps are ≥7 days apart, so each earns its own freeze');
  assert.equal(offsets.length, 19);
});

test('streakInfo: best is the longest historical run, current the run up to today', () => {
  // a long past block (10 days, ending 30 days ago) then a fresh 3-day run up to today.
  const offsets = [0, -1, -2];
  for (let o = -30; o >= -39; o--) offsets.push(o);
  const s = streakInfo(setAt(TODAY, offsets), TODAY);
  assert.equal(s.current, 3, 'the recent run');
  assert.equal(s.best, 10, 'the longest block anywhere in history');
});

test('streakInfo: freeze window constant is 7', () => {
  assert.equal(STREAK_FREEZE_WINDOW, 7);
});

/* ---- streak: boundary-crossing runs ---- */

test('streakInfo: a run crossing a month boundary is counted correctly', () => {
  const today = '2026-08-02';
  const s = streakInfo(setAt(today, [0, -1, -2, -3]), today); // Aug 2,1 + Jul 31,30
  assert.equal(s.current, 4);
});

test('streakInfo: a run crossing a year boundary is counted correctly', () => {
  const today = '2026-01-02';
  const s = streakInfo(setAt(today, [0, -1, -2]), today); // Jan 2,1 + Dec 31
  assert.equal(s.current, 3);
});

/* ---- activity calendar ---- */

test('activityCalendar: 5 Monday-first weeks × 7 days ending in today\'s week', () => {
  const set = setAt(TODAY, [0, -1, -7]);
  const weeks = activityCalendar(TODAY, 5, set);
  assert.equal(weeks.length, 5, '5 weeks');
  weeks.forEach((row) => {
    assert.equal(row.length, 7, 'each week has 7 days');
    assert.equal(streakWeekdayMon(row[0].key), 0, 'each row starts on a Monday');
    assert.equal(streakWeekdayMon(row[6].key), 6, 'each row ends on a Sunday');
  });
  const cells = weeks.flat();
  assert.equal(cells.length, 35);
  // dates are strictly consecutive across the whole grid
  for (let i = 1; i < cells.length; i++) {
    assert.equal(streakDaysBetween(cells[i - 1].key, cells[i].key), 1, 'consecutive days, no gaps between weeks');
  }
});

test('activityCalendar: today lands in the last row, flagged exactly once', () => {
  const weeks = activityCalendar(TODAY, 5, new Set());
  const cells = weeks.flat();
  const todays = cells.filter((c) => c.today);
  assert.equal(todays.length, 1, 'exactly one today cell');
  assert.equal(todays[0].key, TODAY);
  assert.ok(weeks[4].some((c) => c.today), 'today is in the final (current) week');
});

test('activityCalendar: active/future flags match the set and the calendar', () => {
  const set = setAt(TODAY, [0, -1, -3]);
  const cells = activityCalendar(TODAY, 5, set).flat();
  const byKey = Object.fromEntries(cells.map((c) => [c.key, c]));
  assert.equal(byKey[TODAY].active, true);
  assert.equal(byKey[streakShiftDay(TODAY, -1)].active, true);
  assert.equal(byKey[streakShiftDay(TODAY, -2)].active, false, 'a non-active day has no dot');
  // days after today (rest of the current week) are marked future
  const future = cells.filter((c) => c.future);
  future.forEach((c) => assert.ok(streakDaysBetween(TODAY, c.key) > 0, 'future = strictly after today'));
  assert.equal(cells.find((c) => c.key === TODAY).future, false, 'today is not future');
});

/* ---- source guard: the pages actually wire the streak (integration can't silently drop) ---- */

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

test('today.html loads stats.js and stamps activity on every session end', () => {
  const html = read('views/today.html');
  assert.match(html, /assets\/js\/stats\.js/, 'stats.js is loaded');
  assert.match(html, /function markActive\(\)/, 'markActive() exists');
  // it stamps the streak into the OWNED planner_data column (not a stray write)
  assert.match(html, /planner\.lastActiveDate = today/, 'markActive writes lastActiveDate');
  // markActive fires from the three embedded engines' session ends
  const sessionEnds = html.match(/onSessionEnd:/g) || [];
  assert.ok(sessionEnds.length >= 3, 'all three embedded engines have onSessionEnd');
  const markCalls = html.match(/markActive\(\)/g) || [];
  assert.ok(markCalls.length >= 4, 'markActive is called from each session end (+ its definition)');
  assert.match(html, /streakChip\(\)/, 'intro renders the streak chip');
  assert.match(html, /streakDoneBlock\(\)/, 'done screen renders the streak block');
});

test('planner.html loads stats.js and renders the streak + calendar', () => {
  const html = read('views/planner.html');
  assert.match(html, /assets\/js\/stats\.js/, 'stats.js is loaded');
  assert.match(html, /function renderStreak\(\)/, 'renderStreak() exists');
  assert.match(html, /activityCalendar\(todayKey, 5, set\)/, '5-week calendar');
  assert.match(html, /\$\{renderStreak\(\)\}/, 'renderStreak is composed into the page');
});

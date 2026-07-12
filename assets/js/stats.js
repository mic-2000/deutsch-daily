/* stats.js — streak + activity-calendar math (DEV-7). Shared by /today and /planner.

   The streak is DERIVED, never stored: it is recomputed each render from the set of the learner's
   active local dates. That set is `planner_data.dayStats[*].completedAt` (one per COMPLETED day) plus
   the single `planner_data.lastActiveDate` stamp `/today` writes on any session end — so a day where
   the learner only ran a trainer (didn't finish the whole day) still counts. No streak counters and
   no new cloud column: only `lastActiveDate` is added to planner_data, carried through by every
   owner page's unknown-key preservation (ARCHITECTURE.md §8). Dates use the local-midnight
   convention (leitner.js `leitnerToday()`), so the streak rolls over at the learner's own midnight
   and is correct across month/year boundaries.

   Pure and dependency-free (operates on 'YYYY-MM-DD' local date-key strings), so /today and /planner
   compute identical numbers and tests/streak.test.js can exercise it in isolation. Top-level
   const/function share the page's global lexical scope (same pattern as leitner.js). */

const STREAK_DAY_MS = 86400000;
/* Streak-freeze policy (Plan DEV-7): one missed day is auto-forgiven, at most once per this many
   calendar days. A single skipped day never breaks the streak; a second skip inside the window does. */
const STREAK_FREEZE_WINDOW = 7;

/* Normalize a Date, an ISO timestamp, or an already-formatted key to a local 'YYYY-MM-DD' key.
   A bare key is returned verbatim: `new Date('2026-07-12')` would parse as UTC midnight and could
   shift a day in negative-offset zones, so key strings must NOT be re-parsed. */
function streakDayKey(d) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const t = (d instanceof Date) ? d : new Date(d);
  const p = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

/* Shift a date key by `n` whole days (local), returning a new key. Local Date arithmetic handles
   month/year rollover (and DST) for us. */
function streakShiftDay(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return streakDayKey(new Date(y, m - 1, d + n));
}

/* Whole days from key `a` to key `b` (b - a); negative when b precedes a. */
function streakDaysBetween(a, b) {
  const at = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
  return Math.round((at(b) - at(a)) / STREAK_DAY_MS);
}

/* Monday-based weekday index for a key: Mon → 0 … Sun → 6 (the app is Europe/Germany-facing). */
function streakWeekdayMon(key) {
  const [y, m, d] = key.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

/* Build the Set of active local date keys from a planner_data payload: every completed day's
   `completedAt` plus the lastActiveDate stamp (a trainer-only day that never reached completion). */
function activeDatesSet(dayStats, lastActiveDate) {
  const set = new Set();
  if (dayStats && typeof dayStats === 'object') {
    for (const k in dayStats) {
      const s = dayStats[k];
      if (s && s.completedAt) set.add(streakDayKey(s.completedAt));
    }
  }
  if (lastActiveDate) set.add(streakDayKey(lastActiveDate));
  return set;
}

/* Count the run of active days ending at (and walking back from) `startKey`, forgiving at most one
   missed day per STREAK_FREEZE_WINDOW calendar days. Returns { count, freezeUsed } where freezeUsed
   flags that a freeze was spent within the most recent window (drives the "freeze active" UI hint).
   A non-active start is allowed (the caller passes yesterday when today isn't active yet): its first
   step may itself spend a freeze. */
function _streakScanBack(set, startKey) {
  const W = STREAK_FREEZE_WINDOW;
  let cursor = startKey, count = 0, sinceFreeze = W, walked = 0;
  let freezeUsed = false;    // a freeze near the anchor that actually bridged to another active day
  let pending = false;       // a freeze was just spent within the window, awaiting an active day to confirm
  while (true) {
    if (set.has(cursor)) {
      count++;
      if (pending) { freezeUsed = true; pending = false; }   // the freeze bridged to a real active day
    } else if (sinceFreeze >= W) {   // a gap we can forgive with a freeze
      sinceFreeze = 0;
      pending = (walked < W);         // provisional — a trailing freeze that bridges nothing doesn't count
    } else {
      break;                          // second miss inside the window → streak ends
    }
    cursor = streakShiftDay(cursor, -1);
    walked++;
    sinceFreeze++;
  }
  return { count, freezeUsed };
}

/* The learner's streak as of `todayKey`, from the active-date Set:
     current      — length of the run leading up to today (includes today when active; an inactive
                    today doesn't break it — the day isn't over — it's counted as still "alive")
     best         — longest such run anywhere in the history (same freeze rule)
     activeToday  — did any activity land today
     alive        — current > 0 (today either active, or yesterday was and the streak can continue)
     freezeActive — a freeze is currently bridging a recent missed day */
function streakInfo(set, todayKey) {
  const from = set.has(todayKey) ? todayKey : streakShiftDay(todayKey, -1);
  const r = _streakScanBack(set, from);
  let best = r.count;
  set.forEach((k) => { const c = _streakScanBack(set, k).count; if (c > best) best = c; });
  return {
    current: r.count,
    best,
    activeToday: set.has(todayKey),
    alive: r.count > 0,
    freezeActive: r.count > 0 && r.freezeUsed,
  };
}

/* A `numWeeks × 7` Monday-first activity grid ending in today's week. Each cell:
     { key, dom, active, today, future } — dom = day-of-month, future = beyond today (rendered muted).
   Pure display data; the page paints the dots. */
function activityCalendar(todayKey, numWeeks, set) {
  const startMon = streakShiftDay(todayKey, -streakWeekdayMon(todayKey) - (numWeeks - 1) * 7);
  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      const key = streakShiftDay(startMon, w * 7 + i);
      row.push({
        key,
        dom: Number(key.slice(8, 10)),
        active: set.has(key),
        today: key === todayKey,
        future: streakDaysBetween(todayKey, key) > 0,
      });
    }
    weeks.push(row);
  }
  return weeks;
}

/* Node/test entry point — harmless in the browser (no module global there). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STREAK_FREEZE_WINDOW, streakDayKey, streakShiftDay, streakDaysBetween, streakWeekdayMon,
    activeDatesSet, streakInfo, activityCalendar,
  };
}

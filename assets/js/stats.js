/* stats.js — streak + activity-calendar math (DEV-7) + statistics-page aggregation & B1 forecast
   (DEV-8). Shared by /today, /planner and /stats.

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

/* ==========================================================================
   STATISTICS PAGE (DEV-8) — pure aggregation + B1 forecast

   These derive the /stats screen from the SAME cloud data the app already stores: the completion
   ledger in planner_data.dayStats (per-day { completedAt, blocks, counts }) and the Leitner card
   records the trainers persist. Everything here is pure and dependency-free (operates on plain
   records / date-key strings), so /stats renders identical numbers offline and tests/stats.test.js
   exercises it in isolation. The MAX-box / day constants are inlined (mirroring leitner.js MAX_BOX=5)
   to keep this module standalone.
   ========================================================================== */
const STATS_MAX_BOX = 5;

/* How many of the last `days` calendar days (ending at, and including, todayKey) were active. Drives
   the "active this week / this month" counters (7- and 30-day windows). */
function activeCountInWindow(set, todayKey, days) {
  let n = 0;
  for (let i = 0; i < days; i++) if (set.has(streakShiftDay(todayKey, -i))) n++;
  return n;
}

/* Per-week accuracy from the dayStats completion ledger. Each completed day records `counts` =
   { vocab, verbs, listen } trainer scores ({ right, total } | null); we sum right/total per
   curriculum week (5 study days = 1 week, matching recordDayStats' `Math.ceil(day/5)`). Returns one
   row per week that has graded data, ascending by week:
     { week, right, total, pct, days }   (pct = null when nothing gradeable was recorded that week)
   This is the learner's realised answer accuracy — the honest signal behind the landing's
   "Statistics". */
function weeklyAccuracy(dayStats) {
  const byWeek = {};
  if (dayStats && typeof dayStats === 'object') {
    for (const dayKey in dayStats) {
      const day = Number(dayKey);
      if (!day) continue;
      const counts = dayStats[dayKey] && dayStats[dayKey].counts;
      if (!counts || typeof counts !== 'object') continue;
      const week = Math.ceil(day / 5);
      const w = byWeek[week] || (byWeek[week] = { week: week, right: 0, total: 0, days: 0 });
      let graded = false;
      for (const kind of ['vocab', 'verbs', 'listen']) {
        const c = counts[kind];
        if (c && typeof c.total === 'number' && c.total > 0) {
          w.right += (c.right || 0);
          w.total += c.total;
          graded = true;
        }
      }
      if (graded) w.days++;
    }
  }
  return Object.keys(byWeek)
    .map((k) => byWeek[k])
    .map((w) => ({ week: w.week, right: w.right, total: w.total, days: w.days,
                   pct: w.total > 0 ? Math.round((w.right / w.total) * 100) : null }))
    .sort((a, b) => a.week - b.week);
}

/* Bucket an array of Leitner card records ({ box, due, seen, right, wrong }) into a totals summary.
   Only SEEN cards count (an unseen card is a not-yet-started card, not "in progress"). `now` is the
   reference epoch-ms (Date.now() on the page; a fixed value in tests):
     mastered      — box at MAX
     learning      — seen, not yet mastered
     due           — learning AND due now (due <= now)
     dueSoon        — learning AND falling due within the next 24h (now < due <= now+1d)
     dueByTomorrow — due + dueSoon  (the review load coming up by this time tomorrow) */
function masteryBreakdown(records, now) {
  const DAY = STREAK_DAY_MS;
  const soon = now + DAY;
  let mastered = 0, learning = 0, due = 0, dueSoon = 0;
  (records || []).forEach((c) => {
    if (!c || !(c.seen > 0)) return;
    if ((c.box || 0) >= STATS_MAX_BOX) { mastered++; return; }
    learning++;
    const d = c.due || 0;
    if (d <= now) due++;
    else if (d <= soon) dueSoon++;
  });
  return { mastered: mastered, learning: learning, due: due, dueSoon: dueSoon, dueByTomorrow: due + dueSoon };
}

/* B1-completion forecast (DEV-8 "Прогноз B1"). Projects, from the learner's realised pace, the
   calendar date they'll reach the end of the 180-day course.
     completions — array of completion date signals (ISO ts or date keys), one per completed day
                   (planner_data.dayStats[*].completedAt)
     currentDay  — the curriculum day the learner is on (1-based); currentDay-1 days are behind them
                   (whether done or skipped by a placement start), so daysLeft = totalDays-(currentDay-1)
     todayKey    — local 'YYYY-MM-DD' anchor
     windowDays  — trailing window the pace is measured over (default 28 ≈ 4 weeks)
   Pace = distinct completion days within the trailing window ÷ that window's weeks, capped at 7/wk
   and measured over an effective window no shorter than the learner's own history (so a keen first
   week isn't diluted by dividing across four). Returns:
     { daysLeft, done, hasPace, perWeek, weeksLeft, etaKey }
   hasPace is false (etaKey/weeksLeft null) until there's at least one completion to extrapolate from —
   the page then asks for a few days of activity rather than printing a fantasy date. */
function forecastFinish(opts) {
  opts = opts || {};
  const totalDays = opts.totalDays || 0;
  const currentDay = opts.currentDay || 1;
  const todayKey = opts.todayKey;
  const windowDays = opts.windowDays || 28;
  const daysLeft = Math.max(0, totalDays - (currentDay - 1));
  const done = daysLeft === 0;

  const uniq = Array.from(new Set((opts.completions || []).filter(Boolean).map(streakDayKey))).sort();
  if (!uniq.length || done) {
    return { daysLeft: daysLeft, done: done, hasPace: false, perWeek: 0, weeksLeft: null, etaKey: null };
  }
  // Effective window: never shorter than a week, never longer than the learner's own span so far.
  const span = streakDaysBetween(uniq[0], todayKey) + 1;
  const win = Math.max(7, Math.min(windowDays, span));
  const cutoff = streakShiftDay(todayKey, -(win - 1));
  const inWin = uniq.filter((k) => k >= cutoff && k <= todayKey).length;
  const perWeek = Math.min(7, inWin / (win / 7));
  if (perWeek <= 0) {
    return { daysLeft: daysLeft, done: false, hasPace: false, perWeek: 0, weeksLeft: null, etaKey: null };
  }
  const weeksLeft = daysLeft / perWeek;
  const etaKey = streakShiftDay(todayKey, Math.ceil(weeksLeft * 7));
  return { daysLeft: daysLeft, done: false, hasPace: true, perWeek: perWeek, weeksLeft: weeksLeft, etaKey: etaKey };
}

/* Node/test entry point — harmless in the browser (no module global there). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STREAK_FREEZE_WINDOW, streakDayKey, streakShiftDay, streakDaysBetween, streakWeekdayMon,
    activeDatesSet, streakInfo, activityCalendar,
    activeCountInWindow, weeklyAccuracy, masteryBreakdown, forecastFinish,
  };
}

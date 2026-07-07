/* course-consts.js — single source of truth for the course's shape: its version, the week span of
 * each CEFR band, and the onboarding level -> start-week map. Dependency-free and deliberately
 * independent from weeks.js, so the vocab/verbs trainer pages (which don't load the curriculum) can
 * still reason about levels. Keep it lightweight: no DAYS flattening, no weeks.js references.
 *
 * These describe the LIVE 36-week Course v2 (COURSE_VERSION 2, see
 * private/curriculum-redesign-2026-07-v2.md §7). The band spans and the onboarding start-week map
 * must stay in lockstep with the shipped curriculum (data/weeks.js — 36 weeks / 180 days): with the
 * 36-week weeks.js, WEEK_FOR_LEVEL.B1 = 25 is the first B1 week, so onboarding starts a B1 learner on
 * the right day. Do not change these without the matching curriculum data.
 */
const COURSE_VERSION = 2;
const TOTAL_WEEKS = 36;

/* Inclusive [firstWeek, lastWeek] span of each CEFR band across the course. */
const BAND_WEEKS = { A1: [1, 12], A2: [13, 24], B1: [25, 36] };

/* Onboarding start week per self-declared level (the first week of that level's band). */
const WEEK_FOR_LEVEL = { A1: BAND_WEEKS.A1[0], A2: BAND_WEEKS.A2[0], B1: BAND_WEEKS.B1[0] };

/* CEFR band a given course week belongs to (falls back to the top band past the last span). */
function levelOfWeek(week) {
  week = +week;
  for (const level in BAND_WEEKS) {
    const span = BAND_WEEKS[level];
    if (week >= span[0] && week <= span[1]) return level;
  }
  return 'B1';
}

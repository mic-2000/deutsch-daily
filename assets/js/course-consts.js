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

/* ---- mixed-cache-version guard (Gate 3, curriculum-redesign-2026-07-v2.md §12) --------------
 * The PWA caches each <script src> independently (data/weeks.js and data/vocab.js are
 * stale-while-revalidate). After a COURSE_VERSION bump, a half-updated cache can serve some
 * course assets from the old version and some from the new — which renders a broken, drifted
 * course (weeks / vocab / locale are index-matched). Each generated, index-matched data file
 * self-registers the COURSE_VERSION it was built for into window.__courseAssets (see gen-course.js
 * assetReg); this guard compares those to the app's own COURSE_VERSION so a page can prompt a full
 * reload instead of painting a mismatched course. Locales are network-first in sw.js (freshest of
 * the three), so weeks + vocab are the assets that carry the marker. */
function courseAssetVersions() {
  const g = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
  return g.__courseAssets || {};
}
/* Names of loaded course assets whose registered version disagrees with this build's COURSE_VERSION. */
function courseVersionMismatches() {
  const a = courseAssetVersions();
  return Object.keys(a).filter((k) => a[k] !== COURSE_VERSION);
}
function courseVersionConsistent() { return courseVersionMismatches().length === 0; }

/* Wipe every cache + service-worker registration, then hard-reload — so the reload actually refetches
   fresh assets instead of re-serving the same mismatched cache. Best-effort with a timeout fallback. */
function bustCachesAndReload() {
  let done = false;
  const go = () => { if (done) return; done = true; try { location.reload(); } catch (e) {} };
  try {
    const tasks = [];
    if (typeof caches !== 'undefined' && caches.keys) {
      tasks.push(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))));
    }
    if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      tasks.push(navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister()))));
    }
    if (tasks.length) { Promise.all(tasks).then(go, go); setTimeout(go, 1500); } else { go(); }
  } catch (e) { go(); }
}

/* Paint the reload prompt into #app. Localized via T() (loaded before this file on every page that
   loads course-consts). Returns true when it painted, so callers can skip their normal render. */
function mountCourseVersionPrompt() {
  if (typeof document === 'undefined') return false;
  const app = document.getElementById('app');
  if (!app) return false;
  const t = (typeof T === 'function') ? T : (k) => k;
  app.innerHTML =
    '<main class="container version-reload">' +
      '<h1>' + t('version_reload_title') + '</h1>' +
      '<p>' + t('version_reload_msg') + '</p>' +
      '<button class="btn accent big" onclick="bustCachesAndReload()">' + t('version_reload_btn') + '</button>' +
    '</main>';
  return true;
}

/* Bootstrap helper: when the loaded course assets disagree on version, show the reload prompt and
   return true so the page skips its normal render/init. Call inside the loadLocale().then() (needs T). */
function courseVersionBlocked() {
  if (courseVersionConsistent()) return false;
  mountCourseVersionPrompt();
  return true;
}

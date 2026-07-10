/* tests/version-guard.test.js — the mixed-cache-version guard (Gate 3).
 *
 * The PWA caches each course data file independently, so a half-updated cache can serve some assets
 * from an older COURSE_VERSION and some from the new one — an index-matched drift that renders a
 * broken course. Each generated, index-matched data file (data/weeks.js, data/vocab.js) self-
 * registers the COURSE_VERSION it was built for into window.__courseAssets; course-consts.js
 * compares those to its own COURSE_VERSION and, on a mismatch, prompts a full reload.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* today.html loads course-consts.js + data/weeks.js + data/vocab.js — the full guard surface. */
function fresh() {
  return loadPage({
    page: 'today.html',
    extraFiles: ['locales/en.js'],
    exports: [
      'COURSE_VERSION', 'courseVersionConsistent', 'courseVersionMismatches',
      'mountCourseVersionPrompt', 'courseVersionBlocked',
    ],
  });
}

test('the shipped data files self-register their course version', () => {
  const t = fresh();
  const reg = t.sandbox.__courseAssets || {};
  assert.equal(reg.weeks, t.COURSE_VERSION, 'data/weeks.js registered its version');
  assert.equal(reg.vocab, t.COURSE_VERSION, 'data/vocab.js registered its version');
});

test('a consistent cache reports no mismatch', () => {
  const t = fresh();
  assert.deepEqual([...t.courseVersionMismatches()], [], 'all registered assets match COURSE_VERSION');
  assert.equal(t.courseVersionConsistent(), true);
});

test('an asset from a different course version is flagged as a mismatch', () => {
  const t = fresh();
  t.sandbox.__courseAssets = { weeks: t.COURSE_VERSION, vocab: t.COURSE_VERSION + 1 };
  assert.deepEqual([...t.courseVersionMismatches()], ['vocab'], 'the stale asset is named');
  assert.equal(t.courseVersionConsistent(), false);
});

test('mountCourseVersionPrompt paints a localized reload prompt (no raw keys)', () => {
  const t = fresh();
  assert.equal(t.mountCourseVersionPrompt(), true, 'reports it painted');
  const html = t.app.innerHTML;
  assert.match(html, /version-reload/, 'the prompt container is rendered');
  assert.match(html, /Update available/, 'localized title');
  assert.match(html, /Reload the app/, 'localized button label');
  assert.match(html, /onclick="bustCachesAndReload\(\)"/, 'the reload button busts caches');
  assert.doesNotMatch(html, /version_reload_[a-z]+/, 'no raw i18n key leaks');
});

test('courseVersionBlocked: false + no prompt when consistent, true + prompt when not', () => {
  const t = fresh();
  t.app.innerHTML = 'ORIGINAL';
  assert.equal(t.courseVersionBlocked(), false, 'consistent → not blocked');
  assert.equal(t.app.innerHTML, 'ORIGINAL', 'the page is left to render normally');

  t.sandbox.__courseAssets = { weeks: t.COURSE_VERSION, vocab: t.COURSE_VERSION + 1 };
  assert.equal(t.courseVersionBlocked(), true, 'mismatch → blocked');
  assert.match(t.app.innerHTML, /version-reload/, 'the reload prompt replaced the page');
});

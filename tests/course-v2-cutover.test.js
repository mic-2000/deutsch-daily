/* tests/course-v2-cutover.test.js — Course v2 cutover (curriculum-redesign-2026-07-v2.md §7 / Gate 6).
 *
 * Verifies the LIVE runtime state after `npm run cutover:v2` swapped the generated 36-week course in:
 *   • course-consts.js is on COURSE_VERSION 2 with the 36-week band map;
 *   • the shipped data/weeks.js flattens to 36 weeks / 180 days via planner-data.js (object tasks);
 *   • planner-data.js still tolerates legacy v1 [type, text] tuple tasks (one-release-window overlap);
 *   • cloud-sync.js resets a pre-v2 planner_data to a clean v2 course state, keyed off the level, and
 *     leaves an already-v2 payload untouched.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadPage, ROOT } = require('./harness');

/* Objects built inside a vm sandbox carry that realm's prototype, tripping deepStrictEqual's
   prototype check. Re-hydrate in this realm before structural comparison (as outbox.test.js does). */
const plain = (o) => JSON.parse(JSON.stringify(o));

/* ---- course-consts.js ---------------------------------------------------------------------- */
function loadConsts() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/course-consts.js'), 'utf8');
  const sb = {};
  vm.createContext(sb);
  vm.runInContext(src + '\n;this.C = { COURSE_VERSION, TOTAL_WEEKS, BAND_WEEKS, WEEK_FOR_LEVEL, levelOfWeek };', sb);
  return sb.C;
}

test('course-consts is on COURSE_VERSION 2 with the 36-week band map', () => {
  const C = loadConsts();
  assert.equal(C.COURSE_VERSION, 2);
  assert.equal(C.TOTAL_WEEKS, 36);
  assert.deepEqual(plain(C.BAND_WEEKS), { A1: [1, 12], A2: [13, 24], B1: [25, 36] });
  assert.deepEqual(plain(C.WEEK_FOR_LEVEL), { A1: 1, A2: 13, B1: 25 });
  assert.equal(C.levelOfWeek(1), 'A1');
  assert.equal(C.levelOfWeek(13), 'A2');
  assert.equal(C.levelOfWeek(36), 'B1');
});

/* ---- live curriculum → planner-data.js ----------------------------------------------------- */
test('the shipped curriculum flattens to 36 weeks / 180 days (object tasks)', () => {
  const p = loadPage({
    extraFiles: ['data/weeks.js', 'assets/js/planner-data.js'],
    exports: ['WEEKS', 'DAYS', 'TOTAL_DAYS'],
  });
  assert.equal(p.WEEKS.length, 36, '36 weeks');
  assert.equal(p.TOTAL_DAYS, 180, '180 days');
  assert.equal(p.DAYS.length, 180);
  // v2 tasks are objects; planner-data still exposes { type, text } per day.
  assert.ok(p.DAYS.every((d) => typeof d.type === 'string' && typeof d.text === 'string'));
});

test('planner-data taskFields tolerates both v1 tuple and v2 object tasks', () => {
  const p = loadPage({
    extraFiles: ['data/weeks.js', 'assets/js/planner-data.js'],
    exports: ['taskFields'],
  });
  assert.deepEqual(plain(p.taskFields(['grammar', 'Do X'])), { type: 'grammar', text: 'Do X' });
  assert.deepEqual(plain(p.taskFields({ type: 'write', text: 'Do Y', drill: 'z' })), { type: 'write', text: 'Do Y' });
});

test('live data/vocab.js ships the generated VOCAB + PLURALS verbatim (cutover ran)', () => {
  function evalConsts(rel) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const sb = {};
    vm.createContext(sb);
    vm.runInContext(src + '\n;this.O = { VOCAB, PLURALS };', sb);
    return plain(sb.O);
  }
  const live = evalConsts('data/vocab.js');
  const gen = evalConsts('data/v2/vocab.js');
  assert.deepEqual(live.VOCAB, gen.VOCAB, 'live VOCAB != generated — re-run `npm run cutover:v2`');
  assert.deepEqual(live.PLURALS, gen.PLURALS, 'live PLURALS != generated — re-run `npm run cutover:v2`');
  assert.ok(Object.keys(live.PLURALS).length > 200, 'PLURALS should cover the v2 nouns');
});

/* ---- cloud-sync.js migration --------------------------------------------------------------- */
function loadMigration() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/cloud-sync.js'), 'utf8');
  const sb = {
    window: { addEventListener() {} },
    document: { addEventListener() {} },
    navigator: { onLine: true },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout() {}, clearTimeout() {},
    sb: { auth: {}, from() { return {}; } },
    showToast() {},
  };
  vm.createContext(sb);
  vm.runInContext(src + '\n;this.__mig = _migratePlannerV2; this.__setOnb = (o) => { userOnboarding = o; };', sb);
  return sb;
}

test('a pre-v2 planner_data is reset to a clean v2 course state (start day by level)', () => {
  const env = loadMigration();
  env.__setOnb({ level: 'A2' });
  const out = env.__mig({ currentDay: 40, viewingDay: 40, completed: { 1: true, 2: true, 3: false } });
  assert.equal(out.courseVersion, 2);
  assert.equal(out.currentDay, 61, 'A2 starts on day 61');
  assert.equal(out.viewingDay, 61);
  assert.deepEqual(plain(out.completed), {});
  assert.deepEqual(plain(out.dayStats), {});
  assert.deepEqual(plain(out.grammarReview), {});
  assert.equal(out.migratedFrom.courseVersion, 1);
  assert.equal(out.migratedFrom.oldCurrentDay, 40);
  assert.equal(out.migratedFrom.oldCompletedCount, 2, 'only truthy completed entries counted');
});

test('migration defaults to A1 (day 1) when onboarding has no level', () => {
  const env = loadMigration();
  env.__setOnb({});
  const out = env.__mig({ currentDay: 5, completed: {} });
  assert.equal(out.currentDay, 1);
  assert.equal(out.migratedFrom.oldCurrentDay, 5);
});

test('an already-v2 planner_data is returned untouched (idempotent)', () => {
  const env = loadMigration();
  env.__setOnb({ level: 'B1' });
  const v2 = { courseVersion: 2, currentDay: 130, viewingDay: 130, completed: { 121: true } };
  assert.equal(env.__mig(v2), v2, 'same object reference back — no re-migration');
});

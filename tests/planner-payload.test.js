/* tests/planner-payload.test.js — planner_data payload safety (Gate 2).
 *
 * Three pages own the `planner_data` column: /planner, /today, /welcome. Each one only
 * *owns* currentDay/viewingDay/completed, but the column also carries keys written by
 * OTHER pages or future course versions (dayStats & grammarReview from /today, a future
 * courseVersion / migratedFrom). A save that reconstructs the payload from local state
 * would silently drop those foreign keys, so every owner must pass them through untouched.
 *
 * These tests drive the real getCloudPayload()/applyCloudData() of each page through a
 * load → save round trip and assert the foreign keys survive while the owned keys are
 * still normalized correctly.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

// The state holder differs by page (`state` on the planner, `planner` on today/welcome);
// we capture it so a test can simulate an in-place mutation (marking a day complete).
const OWNERS = [
  { page: 'planner.html', hold: 'state' },
  { page: 'today.html', hold: 'planner' },
  { page: 'welcome.html', hold: 'planner' },
];

function loadOwner(page) {
  return loadPage({
    page,
    extraFiles: ['locales/en.js'],
    exports: ['getCloudPayload', 'applyCloudData', 'state', 'planner'],
  });
}

// getCloudPayload() returns a live object created inside the vm sandbox (a different realm),
// and it is JSON-serialized before it hits the network/cache. Snapshot it through JSON so the
// assertions are realm-safe (no cross-realm prototype mismatch) and match what actually persists.
const snap = (p) => JSON.parse(JSON.stringify(p.getCloudPayload()));

// A cloud row carrying the three owned keys AND foreign keys the page must not touch.
const cloudRow = () => ({
  currentDay: 5,
  viewingDay: 3,
  completed: { 2: true, 3: true, 4: true },
  dayStats: { 4: { seconds: 120, correct: 8 } },
  grammarReview: { 'akk-artikel': { box: 2, due: 0 } },
  courseVersion: 2,
  migratedFrom: { courseVersion: 1, oldCurrentDay: 40 },
});

for (const { page } of OWNERS) {
  test(`${page}: unknown planner_data keys survive a save round trip`, () => {
    const p = loadOwner(page);
    p.applyCloudData(cloudRow());
    const out = snap(p);
    assert.deepEqual(out.dayStats, { 4: { seconds: 120, correct: 8 } }, 'dayStats preserved');
    assert.deepEqual(out.grammarReview, { 'akk-artikel': { box: 2, due: 0 } }, 'grammarReview preserved');
    assert.equal(out.courseVersion, 2, 'courseVersion preserved');
    assert.deepEqual(out.migratedFrom, { courseVersion: 1, oldCurrentDay: 40 }, 'migratedFrom preserved');
  });

  test(`${page}: still normalizes the three owned keys on load`, () => {
    const p = loadOwner(page);
    p.applyCloudData(cloudRow());
    const out = snap(p);
    assert.equal(out.currentDay, 5, 'currentDay loaded');
    assert.equal(out.viewingDay, 3, 'viewingDay loaded');
    assert.deepEqual(out.completed, { 2: true, 3: true, 4: true }, 'completed loaded');
  });
}

test('planner.html: foreign keys survive an in-place completion mutation + re-save', () => {
  const p = loadOwner('planner.html');
  p.applyCloudData(cloudRow());
  // simulate toggleDay(): mark another day complete + advance, then save
  p.state.completed[5] = true;
  p.state.currentDay = 6;
  p.state.viewingDay = 6;
  const out = snap(p);
  assert.equal(out.completed[5], true, 'new completion recorded');
  assert.equal(out.currentDay, 6, 'currentDay advanced');
  assert.deepEqual(out.dayStats, { 4: { seconds: 120, correct: 8 } }, 'dayStats still present after mutation');
  assert.deepEqual(out.grammarReview, { 'akk-artikel': { box: 2, due: 0 } }, 'grammarReview still present after mutation');
});

test('planner.html: tolerates null/garbage payload without crashing', () => {
  const p = loadOwner('planner.html');
  p.applyCloudData(null);
  assert.deepEqual(snap(p), { currentDay: 1, viewingDay: 1, completed: {} }, 'null → safe defaults');
  p.applyCloudData({ completed: 'not-an-object', currentDay: 0 });
  const out = snap(p);
  assert.deepEqual(out.completed, {}, 'non-object completed coerced to {}');
  assert.equal(out.currentDay, 1, 'falsy currentDay coerced to 1');
});

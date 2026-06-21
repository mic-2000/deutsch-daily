/* tests/today-flow.test.js — the /today daily-flow wizard.
 *
 * /today is a thin host that drives the SHARED engines (vocab-trainer.js / verbs-trainer.js) in
 * `embedded` mode and walks one study day in order: grammar → words → verbs → AI → done.
 * Guards:
 *   • the engines are extracted as namespaces (VocabTrainer / VerbsTrainer) and present on the page;
 *   • the intro renders with the shared header and no raw i18n keys;
 *   • starting the flow shows the grammar card, then advances into a vocab session;
 *   • the two engines share ONE verbs_data mastery map (verb progress counts once);
 *   • finishing a vocab session advances to the verb session (embedded onSessionEnd);
 *   • the done step closes the day and advances currentDay.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function fresh(exports) {
  return loadPage({ page: 'today.html', extraFiles: ['locales/en.js'], exports });
}

test('the vocab + verb engines are extracted as namespaces and loaded on /today', () => {
  const t = fresh(['VocabTrainer', 'VerbsTrainer']);
  assert.equal(typeof t.VocabTrainer, 'object');
  assert.equal(typeof t.VerbsTrainer, 'object');
  assert.equal(typeof t.VocabTrainer.startSession, 'function');
  assert.equal(typeof t.VerbsTrainer.startSession, 'function');
});

test('intro renders the checklist + shared header with no raw keys', () => {
  const t = fresh(['render']);
  t.render();
  const html = t.app.innerHTML;
  assert.ok(html.length > 500);
  assert.match(html, /steps-list/);
  assert.match(html, /nav-tab/);
  assert.doesNotMatch(html, /today_[a-z_]+/);
  assert.doesNotMatch(html, /type_[a-z]+/);
});

test('startFlow shows the grammar card, then nextStep opens a vocab session', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer']);
  t.startFlow();
  assert.match(t.app.innerHTML, /grammar-card/, 'grammar step first');
  t.nextStep();
  assert.ok(t.VocabTrainer.state.session, 'vocab session started');
  assert.match(t.app.innerHTML, /session-bg/, 'vocab session painted');
});

test('both engines share ONE verbs_data mastery map', () => {
  const t = fresh(['VocabTrainer', 'VerbsTrainer', 'wireSharedVerbStore']);
  t.wireSharedVerbStore();
  assert.strictEqual(
    t.VocabTrainer.verbStore.mastery,
    t.VerbsTrainer.state.mastery,
    'vocab verbStore.mastery and verbs state.mastery must be the SAME object',
  );
});

test('finishing the vocab session advances to the verb session', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer']);
  t.startFlow();           // grammar
  t.nextStep();            // vocab session
  assert.ok(t.VocabTrainer.state.session);
  t.VocabTrainer.closeSession();   // embedded → onSessionEnd advances the flow
  assert.ok(t.VerbsTrainer.state.session, 'verb session started after vocab finished');
});

test('the done step closes the day and advances currentDay', () => {
  const t = fresh(['startFlow', 'renderDone', 'planner']);
  t.startFlow();           // flow.day = currentDay (1 by default)
  const before = t.planner.currentDay;
  t.renderDone();
  assert.equal(t.planner.completed[before], true, 'today marked complete');
  assert.equal(t.planner.currentDay, before + 1, 'currentDay advanced');
  assert.match(t.app.innerHTML, /flow-done/);
});

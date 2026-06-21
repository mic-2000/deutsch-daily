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

/* A localStorage that reports a saved Gemini key, so the AI panel renders (not the no-key nudge). */
function keyStore() {
  const m = new Map([['gemini_key', 'testkey'], ['ui_lang', 'en']]);
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() };
}

test('a saved lesson loads with the explanation pinned on top and the seed hidden', async () => {
  const rows = [{ day: 1, messages: [
    { role: 'user', text: 'HIDDEN_SEED_PROMPT', seed: true },
    { role: 'model', text: 'THE EXPLANATION', pinned: true },
    { role: 'user', text: 'my follow-up question' },
    { role: 'model', text: 'a follow-up answer' },
  ] }];
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'], exports: ['startFlow'],
    shims: { localStorage: keyStore(), loadLessonsFromCloud: async () => rows, saveLessonToCloud: async () => {} },
  });
  t.startFlow();                                   // kicks off the async loadDayLesson(1)
  await new Promise((r) => setImmediate(r));        // let the load + re-render settle
  const html = t.app.innerHTML;
  assert.match(html, /ai-rule-wrap/, 'pinned explanation block rendered');
  assert.match(html, /THE EXPLANATION/, 'explanation text shown');
  assert.match(html, /my follow-up question/, 'follow-up chat shown');
  assert.match(html, /a follow-up answer/);
  assert.ok(!html.includes('HIDDEN_SEED_PROMPT'), 'seed prompt is NOT displayed');
});

test('the AI step shows the day summary pinned (own label) alongside the topic breakdown', async () => {
  const rows = [{ day: 1, messages: [
    { role: 'user', text: 'seedA', seed: true },
    { role: 'model', text: 'GRAMMAR EXPLANATION', pinned: true, kind: 'explanation' },
    { role: 'user', text: 'seedB', seed: true },
    { role: 'model', text: 'DAY SUMMARY TEXT', pinned: true, kind: 'summary' },
  ] }];
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer'],
    shims: { localStorage: keyStore(), loadLessonsFromCloud: async () => rows, saveLessonToCloud: async () => {} },
  });
  t.startFlow();
  await new Promise((r) => setImmediate(r));   // loadDayLesson settles
  t.nextStep();                                // grammar → vocab session
  t.VocabTrainer.closeSession();               // → verb session (onSessionEnd advances)
  t.VerbsTrainer.closeSession();               // → AI step (renderAi + maybeSummarize)
  await new Promise((r) => setImmediate(r));
  const html = t.app.innerHTML;
  assert.match(html, /Day summary/, 'summary block uses its own label');
  assert.match(html, /DAY SUMMARY TEXT/);
  assert.match(html, /Topic breakdown/, 'the topic breakdown is still pinned too');
  assert.match(html, /GRAMMAR EXPLANATION/);
  // a saved summary must NOT be regenerated (no thinking indicator left hanging)
  assert.ok(!html.includes('seedA') && !html.includes('seedB'), 'seed prompts hidden');
});

test('planner: a pinned reply renders highlighted and the seed prompt is hidden', () => {
  const p = loadPage({
    page: 'planner.html', extraFiles: ['locales/en.js'], exports: ['render', 'state', 'lessonsCache'],
    shims: { localStorage: keyStore() },
  });
  p.state.currentDay = 1; p.state.viewingDay = 1;
  p.lessonsCache[1] = [
    { role: 'user', text: 'HIDDEN_DAY_PLAN', seed: true },
    { role: 'model', text: 'PINNED RULE', pinned: true },
    { role: 'user', text: 'student question' },
    { role: 'model', text: 'tutor answer' },
  ];
  p.render();
  const html = p.app.innerHTML;
  assert.match(html, /ai-rule-wrap/, 'pinned block rendered in the planner too');
  assert.match(html, /PINNED RULE/);
  assert.match(html, /student question/);
  assert.ok(!html.includes('HIDDEN_DAY_PLAN'), 'seed day-plan is hidden');
});

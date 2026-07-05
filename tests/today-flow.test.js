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
 *   • the flow is descriptor-driven (buildSteps → id/required/enabled/run/isComplete);
 *   • the done step closes the day ONLY when every required block is complete, and advances
 *     currentDay — closing a required trainer early leaves the day unchecked.
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
  assert.match(html, /today-daynum/, 'a "Day N of …" indicator is shown on entry');
  assert.match(html, /Day 1 of \d+/, 'the current day number is explicit');
  assert.doesNotMatch(html, /today_[a-z_]+/);
  assert.doesNotMatch(html, /type_[a-z]+/);
});

test('startFlow shows the grammar card, then nextStep opens a vocab session', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer']);
  t.startFlow();
  assert.match(t.app.innerHTML, /grammar-card/, 'grammar step first');
  t.nextStep();
  assert.ok(t.VocabTrainer.state.session, 'vocab session started');
  assert.equal(t.VocabTrainer.state.session.scope.type, 'daily', 'the daily-review scope drives /today');
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

/* Work a trainer session to its end screen, then close it (embedded → onSessionEnd advances). */
function finishSession(engine) {
  const s = engine.state.session;
  s.pos = s.queue.length;   // reach the end screen → closeSession reports completed: true
  engine.closeSession();
}

test('buildSteps returns descriptor objects for the current blocks', () => {
  const t = fresh(['buildSteps']);
  const steps = t.buildSteps(1, {});
  assert.equal(steps.map((s) => s.id).join(','), 'grammar,vocab,verbs,ai,done', 'the current five blocks, in order');
  for (const s of steps) {
    assert.equal(typeof s.run, 'function', `${s.id}.run is a function`);
    assert.equal(typeof s.isComplete, 'function', `${s.id}.isComplete is a function`);
    assert.equal(typeof s.required, 'boolean');
    assert.equal(s.enabled, true, 'buildSteps only returns enabled steps');
  }
  assert.equal(steps.find((s) => s.id === 'ai').required, false, 'AI never blocks the day');
  assert.equal(steps.find((s) => s.id === 'grammar').required, true);
});

test('finishing every required block completes the day and advances currentDay', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'planner']);
  t.startFlow();               // grammar (flow.day = currentDay, 1 by default)
  const before = t.planner.currentDay;
  t.nextStep();                // → vocab session
  finishSession(t.VocabTrainer); // → verb session (onSessionEnd advances)
  finishSession(t.VerbsTrainer); // → AI step
  t.nextStep();                // AI → done (renderDone)
  assert.equal(t.planner.completed[before], true, 'today marked complete');
  assert.equal(t.planner.currentDay, before + 1, 'currentDay advanced');
  assert.match(t.app.innerHTML, /flow-done/);
  assert.match(t.app.innerHTML, new RegExp('You completed Day ' + before), 'states which day was finished');
});

test('closing a required trainer early leaves the day incomplete (not checked off)', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'planner', 'dayComplete']);
  t.startFlow();
  const before = t.planner.currentDay;
  t.nextStep();                  // → vocab session
  t.VocabTrainer.closeSession(); // closed early (pos 0 < queue length) → verb session
  finishSession(t.VerbsTrainer); // verbs finished → AI step
  t.nextStep();                  // AI → done
  assert.equal(t.dayComplete(), false, 'a required block was closed early');
  assert.notEqual(t.planner.completed[before], true, 'day NOT marked complete');
  assert.equal(t.planner.currentDay, before, 'currentDay did not advance');
  assert.match(t.app.innerHTML, /Almost there/, 'partial-done screen shown');
  assert.doesNotMatch(t.app.innerHTML, /You completed Day/, 'no false completion claim');
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
  // on the AI step: the summary is expanded, the breakdown is collapsed, and a separator divides
  // the pinned blocks from the chat.
  assert.match(html, /<details class="ai-rule-wrap" open><summary class="ai-rule-label">Day summary/, 'summary open');
  assert.ok(!/<details class="ai-rule-wrap" open><summary class="ai-rule-label">Topic breakdown/.test(html), 'breakdown collapsed');
  assert.match(html, /ai-sep/, 'pinned blocks separated from the chat');
});

test('renderStep persists the position and resumeFlow restores it (refresh → same step)', async () => {
  const rows = [{ day: 1, messages: [{ role: 'model', text: 'SUMM', pinned: true, kind: 'summary' }] }];
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['startFlow', 'nextStep', 'resumeFlow'],
    shims: { localStorage: keyStore(), loadLessonsFromCloud: async () => rows, saveLessonToCloud: async () => {}, saveToCloud: () => {} },
  });
  // Drive into the flow, then read what was persisted for a refresh.
  t.startFlow();           // grammar (step 0)
  t.nextStep();            // vocab (step 1)
  const saved = JSON.parse(t.sandbox.sessionStorage.getItem('today_flow'));
  assert.equal(saved.step, 1, 'current step persisted');
  assert.equal(saved.day, 1);

  // Simulate a fresh page that resumes from the saved position (AI step here).
  t.resumeFlow({ step: 3, day: 1 });
  await new Promise((r) => setImmediate(r));
  const html = t.app.innerHTML;
  assert.match(html, /flow-top/, 'resumed into a flow step, not the intro');
  assert.match(html, /Step 4 of 5/, 'resumed onto the AI step');
  assert.match(html, /Day summary/, 'the saved summary is shown');
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

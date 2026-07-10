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

test('buildSteps returns descriptor objects; the default tariff has no AI step', () => {
  const t = fresh(['buildSteps']);
  // no minutes → default 15-min path: both trainers + the week's listen block (day 1 = week 1 has a
  // dialogue and the harness provides speechSynthesis), no AI.
  const steps = t.buildSteps(1, {});
  assert.equal(steps.map((s) => s.id).join(','), 'grammar,vocab,verbs,listen,done', 'default path blocks, in order');
  for (const s of steps) {
    assert.equal(typeof s.run, 'function', `${s.id}.run is a function`);
    assert.equal(typeof s.isComplete, 'function', `${s.id}.isComplete is a function`);
    assert.equal(typeof s.required, 'boolean');
    assert.equal(s.enabled, true, 'buildSteps only returns enabled steps');
  }
  assert.equal(steps.find((s) => s.id === 'grammar').required, true);
});

test('the 20+ tariff adds the inline AI step, and AI never blocks the day', () => {
  const t = fresh(['buildSteps']);
  const steps = t.buildSteps(1, { minutes: '20+' });
  assert.equal(steps.map((s) => s.id).join(','), 'grammar,vocab,verbs,listen,ai,done', 'full path includes listen + AI');
  assert.equal(steps.find((s) => s.id === 'ai').required, false, 'AI never blocks the day');
});

test('the 5-min light track runs exactly one trainer, alternating by day parity, with no AI', () => {
  const t = fresh(['buildSteps']);
  const odd = t.buildSteps(1, { minutes: '5' });   // odd day → verbs only
  assert.equal(odd.map((s) => s.id).join(','), 'grammar,verbs,done', 'odd day: verbs, not vocab');
  const even = t.buildSteps(2, { minutes: '5' });  // even day → vocab only
  assert.equal(even.map((s) => s.id).join(','), 'grammar,vocab,done', 'even day: vocab, not verbs');
  assert.equal(odd.find((s) => s.id === 'verbs').required, true, "the day's single trainer is still required");
});

test('finishing every required block completes the day and advances currentDay', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner']);
  t.startFlow();               // grammar (flow.day = currentDay, 1 by default)
  const before = t.planner.currentDay;
  t.nextStep();                // → vocab session
  finishSession(t.VocabTrainer); // → verb session (onSessionEnd advances)
  finishSession(t.VerbsTrainer); // → listen block (day 1 has a dialogue + TTS)
  t.finishListen();            // listen worked to the end → done step (renderDone)
  assert.equal(t.planner.completed[before], true, 'today marked complete');
  assert.equal(t.planner.currentDay, before + 1, 'currentDay advanced');
  assert.match(t.app.innerHTML, /flow-done/);
  assert.match(t.app.innerHTML, new RegExp('You completed Day ' + before), 'states which day was finished');
});

test('completing the day records a dayStats entry (completedAt + blocks + counts)', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner']);
  t.startFlow();
  const day = t.planner.currentDay;
  t.nextStep();                    // → vocab session
  finishSession(t.VocabTrainer);   // → verb session
  finishSession(t.VerbsTrainer);   // → listen block
  t.finishListen();                // → done step (records stats)
  const st = t.planner.dayStats[day];
  assert.ok(st, 'a dayStats entry was written for the finished day');
  assert.match(st.completedAt, /^\d{4}-\d{2}-\d{2}T/, 'completedAt is an ISO timestamp');
  const ids = st.blocks.map((b) => b.id).join(',');
  assert.equal(ids, 'grammar,vocab,verbs,listen', 'records the enabled non-done blocks in order');
  assert.ok(st.blocks.every((b) => typeof b.completed === 'boolean' && typeof b.required === 'boolean'));
  assert.ok('vocab' in st.counts && 'verbs' in st.counts, 'trainer scores captured under counts');
});

test('the done screen renders the current week\'s can-do list (localized, read-only)', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen']);
  t.startFlow();               // day 1 → week 1
  t.nextStep();
  finishSession(t.VocabTrainer);
  finishSession(t.VerbsTrainer);
  t.finishListen();            // → done
  const html = t.app.innerHTML;
  assert.match(html, /done-cando-list/, 'a can-do list is rendered on the done screen');
  assert.match(html, /This week you can/, 'the localized section title is shown');
  assert.match(html, /I can greet people and say my name\./, 'week-1 can-do statement present');
  assert.doesNotMatch(html, /today_cando_title/, 'no raw i18n key leaks');
});

test('dayStats is not overwritten when re-entering the done step of an already-complete day', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner']);
  t.startFlow();
  const day = t.planner.currentDay;
  t.nextStep();
  finishSession(t.VocabTrainer);
  finishSession(t.VerbsTrainer);
  t.finishListen();                // done → writes dayStats
  const first = t.planner.dayStats[day];
  t.startFlow();                   // restart the (now-complete) day
  t.nextStep();
  finishSession(t.VocabTrainer);
  finishSession(t.VerbsTrainer);
  t.finishListen();                // done again — completed[day] already true → no re-record
  assert.strictEqual(t.planner.dayStats[day], first, 'the original dayStats entry is preserved');
});

test('closing a required trainer early leaves the day incomplete (not checked off)', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'planner', 'dayComplete']);
  t.startFlow();
  const before = t.planner.currentDay;
  t.nextStep();                  // → vocab session
  t.VocabTrainer.closeSession(); // closed early (pos 0 < queue length) → verb session
  finishSession(t.VerbsTrainer); // verbs finished → listen block
  t.nextStep();                  // listen (left unfinished) → done
  assert.equal(t.dayComplete(), false, 'a required block was closed early');
  assert.notEqual(t.planner.completed[before], true, 'day NOT marked complete');
  assert.equal(t.planner.currentDay, before, 'currentDay did not advance');
  assert.match(t.app.innerHTML, /Almost there/, 'partial-done screen shown');
  assert.doesNotMatch(t.app.innerHTML, /You completed Day/, 'no false completion claim');
});

test('5-min light track: one trainer carries the day, with a light-pace note on done', () => {
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'planner'],
    shims: { userOnboarding: { minutes: '5' } },
  });
  t.startFlow();                   // day 1 (odd) → grammar
  assert.match(t.app.innerHTML, /grammar-card/, 'grammar step first');
  t.nextStep();                    // → the single trainer (verbs on odd days)
  assert.ok(t.VerbsTrainer.state.session, 'the verbs trainer started on an odd day');
  assert.ok(!t.VocabTrainer.state.session, 'the vocab trainer does NOT run on an odd light-track day');
  finishSession(t.VerbsTrainer);   // → done (no AI on the light track)
  const html = t.app.innerHTML;
  assert.equal(t.planner.completed[1], true, 'the day completes on the single required trainer');
  assert.match(html, /done-light/, 'a light-pace note is rendered');
  assert.match(html, /Light pace/, 'the localized light-pace copy is shown');
  assert.doesNotMatch(html, /today_light_pace/, 'no raw i18n key leaks');
});

/* ---- listen block (renderListen; Plan §3/§4, Gate 5) ---- */

test('the listen block is required on a dialogue week when TTS is available', () => {
  const t = fresh(['buildSteps', 'dialogueForDay']);
  assert.ok(t.dialogueForDay(1), 'day 1 (week 1) has a dialogue');
  const listen = t.buildSteps(1, {}).find((s) => s.id === 'listen');
  assert.ok(listen, 'the listen block is enabled');
  assert.equal(listen.required, true, 'an enabled listen block is required');
});

test('no listen block when TTS is unavailable (never deadlocks the day) — Gate 5', () => {
  // With no utterance ctor, ttsAvailable() is false → the listen block is filtered out entirely.
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['buildSteps', 'ttsAvailable', 'startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'planner'],
    shims: { SpeechSynthesisUtterance: undefined },
  });
  assert.equal(t.ttsAvailable(), false, 'no TTS in this environment');
  assert.equal(t.buildSteps(1, {}).map((s) => s.id).join(','), 'grammar,vocab,verbs,done', 'no listen block without TTS');
  // and the day still completes end-to-end with the trainers alone
  t.startFlow();
  const day = t.planner.currentDay;
  t.nextStep();
  finishSession(t.VocabTrainer);
  finishSession(t.VerbsTrainer);   // → done directly (no listen block)
  t.nextStep();
  assert.equal(t.planner.completed[day], true, 'the day completes without a listen block');
});

test('no listen block on a week that has no dialogue', () => {
  const t = fresh(['buildSteps', 'dialogueForDay']);
  assert.equal(t.dialogueForDay(6), null, 'week 2 (day 6) has no dialogue');
  assert.ok(!t.buildSteps(6, {}).some((s) => s.id === 'listen'), 'no listen block for a dialogue-less week');
});

test('the listen step plays the dialogue, grades the true/false checks, and advances', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer',
    'dialogueForDay', 'playDialogue', 'listenPick', 'listenCheck', 'finishListen']);
  t.startFlow();                   // grammar
  t.nextStep();                    // → vocab session
  finishSession(t.VocabTrainer);   // → verb session
  finishSession(t.VerbsTrainer);   // → listen block
  assert.match(t.app.innerHTML, /listen-wrap/, 'the listen card is shown');
  assert.match(t.app.innerHTML, /listen-title/, 'the localized dialogue title is shown');

  const dia = t.dialogueForDay();
  t.playDialogue(false);           // queue the German lines for TTS
  assert.equal(t.speech.spoken.length, dia.lines.length, 'every dialogue line was queued for TTS');
  assert.equal(t.speech.spoken[0].lang, 'de-DE', 'spoken in German');

  dia.questions.forEach((q, i) => t.listenPick(i, q.answer));   // answer every check correctly
  t.listenCheck();
  const checked = t.app.innerHTML;
  assert.match(checked, new RegExp(`${dia.questions.length} of ${dia.questions.length} correct`), 'the score reflects all-correct');
  assert.match(checked, /listen-tf[^"]*correct/, 'the correct answers are marked');

  t.finishListen();                // → done (default tariff)
  assert.match(t.app.innerHTML, /flow-done/, 'finishing the listen block advances the flow to done');
});

test('the 5-min light track skips listening unless listening is the hardest part', () => {
  const t = fresh(['buildSteps']);
  // day 2 (even) on the light track runs vocab; listening is off by default…
  assert.ok(!t.buildSteps(2, { minutes: '5' }).some((s) => s.id === 'listen'), 'no listen on the light track by default');
  // …but turns on when the learner flagged listening as their weak spot.
  assert.ok(t.buildSteps(2, { minutes: '5', hardest: 'listening' }).some((s) => s.id === 'listen'),
    'listen runs on the light track when hardest === listening');
});

/* ---- produce block (renderProduce; Plan §3/§4/§10, Gate 5) ---- */

test('the produce block is required on a write/speak day, absent otherwise, and sits after listen', () => {
  const t = fresh(['buildSteps', 'isProduceDay']);
  assert.ok(t.isProduceDay(4), 'day 4 (week 1) is a write day');
  assert.ok(!t.isProduceDay(1), 'day 1 is a grammar day');
  const prod = t.buildSteps(4, {}).find((s) => s.id === 'produce');
  assert.ok(prod, 'the produce block is enabled on a produce day');
  assert.equal(prod.required, true, 'an enabled produce block is required');
  assert.ok(!t.buildSteps(1, {}).some((s) => s.id === 'produce'), 'no produce block on a non-produce day');
  assert.equal(t.buildSteps(4, { minutes: '20+' }).map((s) => s.id).join(','),
    'grammar,vocab,verbs,listen,produce,ai,done', 'produce sits between listen and the AI step');
});

/* Drive the flow to the produce step of a write day (finishing the blocks before it). */
function driveToProduce(t, day) {
  t.planner.currentDay = day;
  t.startFlow();                   // grammar
  t.nextStep();                    // → vocab session
  finishSession(t.VocabTrainer);   // → verb session
  finishSession(t.VerbsTrainer);   // → listen block (week 1 has a dialogue + TTS)
  t.finishListen();                // → produce block
}

test('produce shows the prompt + static self-check; ticking it unlocks continue and completes the day', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen',
    'produceToggle', 'finishProduce', 'planner']);
  driveToProduce(t, 4);
  const html = t.app.innerHTML;
  assert.match(html, /produce-wrap/, 'the produce card is shown');
  assert.match(html, /Write a Steckbrief/, 'the localized production prompt is shown');
  assert.match(html, /produce-selfcheck/, 'a self-check is shown');
  assert.match(html, /produce-input/, 'a draft box is offered');
  assert.doesNotMatch(html, /produce-ai/, 'no AI feedback on the static (non-20+) path');
  assert.match(html, /disabled onclick="finishProduce/, 'continue is gated on the self-check');
  assert.doesNotMatch(html, /produce_[a-z_]+/, 'no raw produce i18n keys leak');
  assert.doesNotMatch(html, /today_[a-z_]+/);

  const before = t.planner.currentDay;
  [0, 1, 2].forEach((i) => t.produceToggle(i));   // default tariff → three self-check items
  assert.doesNotMatch(t.app.innerHTML, /disabled onclick="finishProduce/, 'continue unlocks once self-checked');
  t.finishProduce();               // → done
  assert.match(t.app.innerHTML, /flow-done/, 'finishing the produce block advances to done');
  assert.equal(t.planner.completed[before], true, 'the produce day completes on the self-check (never on quality)');
  assert.equal(t.planner.currentDay, before + 1, 'currentDay advanced');
});

test('5-min light track: produce is micro-output with a single self-check, and completes (Gate 5)', () => {
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['buildSteps', 'startFlow', 'nextStep', 'VocabTrainer', 'produceToggle', 'finishProduce', 'planner'],
    shims: { userOnboarding: { minutes: '5' } },
  });
  // day 4 (even) light track: grammar + the one trainer (vocab) + produce — no verbs, no listen, no AI
  assert.equal(t.buildSteps(4, { minutes: '5' }).map((s) => s.id).join(','),
    'grammar,vocab,produce,done', 'light-track produce day: one trainer + produce');
  t.planner.currentDay = 4;
  t.startFlow();                   // grammar
  t.nextStep();                    // → vocab (even day)
  finishSession(t.VocabTrainer);   // → produce
  const html = t.app.innerHTML;
  assert.match(html, /produce-wrap/, 'produce runs on the light track too');
  assert.match(html, /Keep it short/, 'the micro-output hint is shown');
  assert.match(html, /disabled onclick="finishProduce/, 'continue gated until the single self-check');
  t.produceToggle(0);              // one self-check on the light track
  assert.doesNotMatch(t.app.innerHTML, /disabled onclick="finishProduce/, 'one tick unlocks continue');
  t.finishProduce();               // → done
  assert.equal(t.planner.completed[4], true, 'the light-track produce day completes with no key and no TTS');
});

test('20+ produce day offers optional AI feedback that renders inline', async () => {
  const t = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen',
      'produceType', 'produceFeedback', 'planner'],
    shims: { localStorage: keyStore(), userOnboarding: { minutes: '20+' } },
  });
  // geminiRequest is a loaded function declaration — override the global post-load for a deterministic reply.
  let sawMessages = null;
  t.sandbox.geminiRequest = async (_model, _sys, msgs) => { sawMessages = msgs; return 'Good start! Fix: **Ich bin** …'; };
  driveToProduce(t, 4);            // 20+ path: produce shows the AI-feedback control
  assert.match(t.app.innerHTML, /produce-ai/, 'the AI-feedback control appears on the 20+ path with a key');

  t.produceType('Ich heiße Anna. Ich komme aus der Ukraine. Ich spreche Ukrainisch.');
  await t.produceFeedback();
  const html = t.app.innerHTML;
  assert.match(html, /produce-ai-out/, 'the feedback panel is rendered');
  assert.match(html, /Good start/, 'the AI reply is shown inline');
  assert.ok(Array.isArray(sawMessages) && /Ich heiße Anna/.test(sawMessages[0].text), 'the learner draft is sent to the model');
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
    exports: ['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen'],
    // the AI step only exists on the full (20+) tariff
    shims: { localStorage: keyStore(), userOnboarding: { minutes: '20+' }, loadLessonsFromCloud: async () => rows, saveLessonToCloud: async () => {} },
  });
  t.startFlow();
  await new Promise((r) => setImmediate(r));   // loadDayLesson settles
  t.nextStep();                                // grammar → vocab session
  t.VocabTrainer.closeSession();               // → verb session (onSessionEnd advances)
  t.VerbsTrainer.closeSession();               // → listen block
  t.finishListen();                            // → AI step (renderAi + maybeSummarize)
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
    // resume lands on the AI step (step index 4 now that listen sits before it), full (20+) tariff:
    // grammar,vocab,verbs,listen,ai,done
    shims: { localStorage: keyStore(), userOnboarding: { minutes: '20+' }, loadLessonsFromCloud: async () => rows, saveLessonToCloud: async () => {}, saveToCloud: () => {} },
  });
  // Drive into the flow, then read what was persisted for a refresh.
  t.startFlow();           // grammar (step 0)
  t.nextStep();            // vocab (step 1)
  const saved = JSON.parse(t.sandbox.sessionStorage.getItem('today_flow'));
  assert.equal(saved.step, 1, 'current step persisted');
  assert.equal(saved.day, 1);

  // Simulate a fresh page that resumes from the saved position (AI step here).
  t.resumeFlow({ step: 4, day: 1 });
  await new Promise((r) => setImmediate(r));
  const html = t.app.innerHTML;
  assert.match(html, /flow-top/, 'resumed into a flow step, not the intro');
  assert.match(html, /Step 5 of 6/, 'resumed onto the AI step');
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

/* tests/listen.test.js — the /today LISTEN block + its dialogue data (DEV-17, Course Phase 6b).
 *
 * The listen block is a short listening-comprehension task on the current WEEK's dialogue: play the
 * German lines via TTS (speech.js speakLines), read a collapsible transcript, then answer true/false
 * comprehension checks. It is rendered INLINE by the page (not a shared engine) and driven through the
 * descriptor flow like the trainer blocks. This file guards the parts specific to listening:
 *   • the generated + cut-live dialogue data (data/dialogues.js) is well-formed and resolvable;
 *   • dialogueForWeek / dialogueForDay / dialogueLocale look the week's dialogue up correctly;
 *   • shouldRunListening() honours the full per-tariff × per-day matrix (Plan §4);
 *   • the block never deadlocks the day — filtered out with no TTS / no dialogue (Gate 5);
 *   • grading (listenPick → listenCheck → finishListen) reports the true/false score;
 *   • dayStats records the listen block AND its score (acceptance: "dayStats записывает их");
 *   • the listen UI keys exist in all three locales.
 *
 * End-to-end flow ordering (grammar → … → listen → produce → …) is covered in today-flow.test.js;
 * here the emphasis is the listen unit and its data.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage, read } = require('./harness');

const BANDS = ['A1', 'A2', 'B1'];

function fresh(exports, opts) {
  return loadPage(Object.assign({ page: 'today.html', extraFiles: ['locales/en.js'], exports }, opts || {}));
}

/* Work a trainer session to its end screen, then close it (embedded → onSessionEnd advances). */
function finishSession(engine) {
  const s = engine.state.session;
  s.pos = s.queue.length;
  engine.closeSession();
}

/* Drive the default (15-min) flow to the listen step of day 1 (week 1 has a dialogue + the harness
   provides speechSynthesis, so listen is enabled). */
function driveToListen(t) {
  t.startFlow();                   // grammar
  t.nextStep();                    // → vocab session
  finishSession(t.VocabTrainer);   // → verb session
  finishSession(t.VerbsTrainer);   // → listen block
}

/* ---- dialogue data integrity (data/dialogues.js — generated from authoring/, cut live by cutover-v2) ---- */

test('every DIALOGUES entry is well-formed (week, level, lines, true/false questions)', () => {
  const t = fresh(['DIALOGUES']);
  const D = t.DIALOGUES;
  assert.equal(typeof D, 'object', 'DIALOGUES is loaded on /today');
  const slugs = Object.keys(D);
  assert.ok(slugs.length >= 20, 'the course ships a substantial dialogue set');
  const weeksSeen = new Set();
  for (const slug of slugs) {
    const d = D[slug];
    assert.equal(typeof d.week, 'number', `${slug}: numeric week`);
    assert.ok(d.week >= 1 && d.week <= 36, `${slug}: week in course range`);
    assert.ok(!weeksSeen.has(d.week), `${slug}: at most one dialogue per week (lookup is by week)`);
    weeksSeen.add(d.week);
    assert.ok(BANDS.includes(d.level), `${slug}: valid CEFR level`);
    assert.ok(Array.isArray(d.lines) && d.lines.length > 0, `${slug}: has dialogue lines`);
    d.lines.forEach((ln, i) => {
      assert.equal(typeof ln.de, 'string', `${slug}.lines[${i}]: German text`);
      assert.ok(ln.de.trim().length > 0, `${slug}.lines[${i}]: non-empty`);
    });
    assert.ok(Array.isArray(d.questions) && d.questions.length > 0, `${slug}: has comprehension checks`);
    d.questions.forEach((q, i) => {
      assert.equal(typeof q.de, 'string', `${slug}.questions[${i}]: German statement`);
      assert.equal(typeof q.answer, 'boolean', `${slug}.questions[${i}]: boolean answer (true/false check)`);
    });
    assert.equal(d.checks, d.questions.length, `${slug}: checks count matches the questions`);
  }
});

test('data/dialogues.js is cut live verbatim from data/v2/dialogues.js (cutover-v2)', () => {
  // DEV-17: "cut data/v2/dialogues.js живой" — the live file the app loads is the generated one.
  assert.equal(read('data/dialogues.js'), read('data/v2/dialogues.js'), 'live DIALOGUES == generated v2');
});

/* ---- lookup: dialogueForWeek / dialogueForDay / dialogueLocale ---- */

test('dialogueForDay returns the week dialogue (tagged with its slug); null on a dialogue-less week', () => {
  const t = fresh(['dialogueForDay', 'dialogueForWeek', 'DIALOGUES']);
  const d1 = t.dialogueForDay(1);
  assert.ok(d1, 'day 1 (week 1) has a dialogue');
  assert.equal(d1.week, 1, 'it is the week-1 dialogue');
  assert.equal(typeof d1.slug, 'string', 'the returned object carries its slug');
  assert.strictEqual(t.DIALOGUES[d1.slug].week, 1, 'the slug resolves back in DIALOGUES');
  // every day of a dialogue week resolves to the SAME dialogue (re-listening across the week is fine)
  assert.equal(t.dialogueForDay(5).slug, d1.slug, 'day 5 (same week) → same dialogue');
  assert.equal(t.dialogueForDay(6), null, 'week 2 (day 6) has no dialogue');
});

test('dialogueLocale returns a localized, non-empty title (EN fallback)', () => {
  const t = fresh(['dialogueForDay', 'dialogueLocale']);
  const slug = t.dialogueForDay(1).slug;
  const loc = t.dialogueLocale(slug);
  assert.equal(typeof loc.title, 'string');
  assert.ok(loc.title.trim().length > 0, 'the week-1 dialogue has a localized title');
  const miss = t.dialogueLocale('__no-such-slug__');
  assert.equal(typeof miss, 'object', 'an unknown slug returns an object (no throw)');
  assert.equal(Object.keys(miss).length, 0, 'an unknown slug returns an empty object');
});

/* ---- shouldRunListening: the per-tariff × per-day matrix (Plan §4) ---- */

test('shouldRunListening: 15-min and 20+ always run listening on a dialogue day', () => {
  const t = fresh(['shouldRunListening']);
  assert.equal(t.shouldRunListening(1, { minutes: '15' }), true, '15-min: always');
  assert.equal(t.shouldRunListening(1, { minutes: '20+' }), true, '20+: always');
  assert.equal(t.shouldRunListening(1, {}), true, 'default (no minutes) → 15-min path: always');
});

test('shouldRunListening: 10-min runs every other day, or when listening is the hardest part', () => {
  const t = fresh(['shouldRunListening']);
  assert.equal(t.shouldRunListening(2, { minutes: '10' }), true, 'even day → runs');
  assert.equal(t.shouldRunListening(4, { minutes: '10' }), true, 'even day → runs');
  assert.equal(t.shouldRunListening(1, { minutes: '10' }), false, 'odd day → skipped by default');
  assert.equal(t.shouldRunListening(3, { minutes: '10', hardest: 'listening' }), true,
    'odd day still runs when hardest === listening');
});

test('shouldRunListening: 5-min light track skips listening unless it is the hardest part', () => {
  const t = fresh(['shouldRunListening']);
  assert.equal(t.shouldRunListening(2, { minutes: '5' }), false, 'light track: off by default');
  assert.equal(t.shouldRunListening(2, { minutes: '5', hardest: 'listening' }), true,
    'light track: on when hardest === listening');
});

test('shouldRunListening: never runs on a dialogue-less week, at any tariff', () => {
  const t = fresh(['shouldRunListening']);
  for (const m of ['5', '10', '15', '20+']) {
    assert.equal(t.shouldRunListening(6, { minutes: m, hardest: 'listening' }), false,
      `week 2 (day 6) has no dialogue → no listening on the ${m} tariff`);
  }
});

/* ---- never-deadlock (Gate 5) ---- */

test('the listen block is enabled + required on a dialogue day, and its gate opens once finished', () => {
  const t = fresh(['buildSteps', 'flow']);
  const step = t.buildSteps(1, {}).find((s) => s.id === 'listen');
  assert.ok(step, 'listen is enabled on a dialogue day with TTS');
  assert.equal(step.required, true, 'an enabled listen block is required');
  assert.equal(step.isComplete(), false, 'not complete before the block is worked');
  t.flow.results.listen = { completed: true };
  assert.equal(step.isComplete(), true, 'complete once the block reports done');
});

test('no TTS → listen is filtered out entirely, so it can never block the day (Gate 5)', () => {
  const t = fresh(['buildSteps', 'ttsAvailable'], { shims: { SpeechSynthesisUtterance: undefined } });
  assert.equal(t.ttsAvailable(), false, 'no utterance ctor → TTS unavailable');
  assert.ok(!t.buildSteps(1, {}).some((s) => s.id === 'listen'), 'listen is not in the flow without TTS');
});

/* ---- grading: listenPick → listenCheck → finishListen ---- */

test('grading marks a wrong pick, shows the score, and finishing advances the flow', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer',
    'dialogueForDay', 'listenPick', 'listenCheck', 'finishListen']);
  driveToListen(t);
  assert.match(t.app.innerHTML, /listen-wrap/, 'the listen card is shown');
  const qs = t.dialogueForDay().questions;

  // answer the first check WRONG and the rest right → score = total - 1
  t.listenPick(0, !qs[0].answer);
  for (let i = 1; i < qs.length; i++) t.listenPick(i, qs[i].answer);
  t.listenCheck();
  assert.match(t.app.innerHTML, new RegExp(`${qs.length - 1} of ${qs.length} correct`), 'score shown after check');
  assert.match(t.app.innerHTML, /listen-tf[^"]*wrong/, 'the wrong pick is marked');

  t.finishListen();
  assert.match(t.app.innerHTML, /flow-done/, 'finishing the listen block advances the flow to done');
  // the filed right/total surface through dayStats.counts.listen (asserted below).
});

test('playDialogue queues every German line for TTS, in German', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'dialogueForDay', 'playDialogue']);
  driveToListen(t);
  const dia = t.dialogueForDay();
  t.playDialogue(false);
  assert.equal(t.speech.spoken.length, dia.lines.length, 'one utterance per dialogue line');
  assert.ok(t.speech.spoken.every((u) => u.lang === 'de-DE'), 'every line is spoken in German');
});

/* ---- dayStats records the listen block AND its score (DEV-17 acceptance) ---- */

test('completing a listen day records the block and its score under dayStats.counts.listen', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer',
    'dialogueForDay', 'listenPick', 'listenCheck', 'finishListen', 'planner']);
  const day = t.planner.currentDay;
  driveToListen(t);
  const qs = t.dialogueForDay().questions;
  qs.forEach((q, i) => t.listenPick(i, q.answer));   // all correct
  t.listenCheck();
  t.finishListen();                                   // → done → recordDayStats

  const st = t.planner.dayStats[day];
  assert.ok(st, 'a dayStats entry was written');
  const listenBlock = st.blocks.find((b) => b.id === 'listen');
  assert.ok(listenBlock, 'the listen block is recorded in dayStats.blocks');
  assert.equal(listenBlock.completed, true, 'recorded as completed');
  assert.ok(st.counts.listen, 'a listen score is captured under counts');
  assert.equal(st.counts.listen.right, qs.length, 'listen right count recorded');
  assert.equal(st.counts.listen.total, qs.length, 'listen total recorded');
});

/* ---- locale parity: the listen UI keys exist in en / ru / ua ---- */

test('the listen UI keys are present in all three locales', () => {
  const t = loadPage({ page: 'today.html', extraFiles: ['locales/en.js', 'locales/ru.js', 'locales/ua.js'], exports: [] });
  const KEYS = ['today_step_listen', 'today_step_listen_sub', 'listen_true', 'listen_false',
    'listen_hint', 'listen_play', 'listen_play_slow', 'listen_transcript', 'listen_check', 'listen_score'];
  for (const L of ['EN', 'RU', 'UA']) {
    const ui = (t.sandbox['LOCALE_' + L] || {}).ui || {};
    for (const k of KEYS) assert.ok(k in ui, `${k} present in LOCALE_${L}`);
  }
});

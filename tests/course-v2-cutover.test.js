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
  // v1 tuples carry no drill (null); v2 objects surface their keyed grammar-drill slug.
  assert.deepEqual(plain(p.taskFields(['grammar', 'Do X'])), { type: 'grammar', text: 'Do X', drill: null });
  assert.deepEqual(plain(p.taskFields({ type: 'write', text: 'Do Y', drill: 'z' })), { type: 'write', text: 'Do Y', drill: 'z' });
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

test('live data/grammar-drills.js ships the generated GRAMMAR_DRILLS verbatim (cutover ran)', () => {
  function evalDrills(rel) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const sb = {};
    vm.createContext(sb);
    vm.runInContext(src + '\n;this.O = GRAMMAR_DRILLS;', sb);
    return plain(sb.O);
  }
  const live = evalDrills('data/grammar-drills.js');
  const gen = evalDrills('data/v2/grammar-drills.js');
  assert.deepEqual(live, gen, 'live GRAMMAR_DRILLS != generated — re-run `npm run cutover:v2`');
  assert.ok(Object.keys(live).length > 50, 'the course should ship many keyed drills');
  // every task.drill slug in the live curriculum must resolve in the live drills map
  const w = fs.readFileSync(path.join(ROOT, 'data/weeks.js'), 'utf8');
  const sb = {}; vm.createContext(sb); vm.runInContext(w + '\n;this.W = WEEKS;', sb);
  const unresolved = new Set();
  sb.W.forEach((wk) => wk.tasks.forEach((t) => { if (t.drill && !(t.drill in live)) unresolved.add(t.drill); }));
  assert.deepEqual([...unresolved], [], 'every task.drill resolves in GRAMMAR_DRILLS');
});

test('the live locales carry the keyed drills block (concept + prompt) in all three languages', () => {
  for (const lang of ['en', 'ru', 'ua']) {
    const src = fs.readFileSync(path.join(ROOT, `locales/${lang}.js`), 'utf8');
    const sb = { window: {} }; vm.createContext(sb); vm.runInContext(src, sb);
    const loc = sb.window['LOCALE_' + lang.toUpperCase()];
    assert.ok(loc.drills && Object.keys(loc.drills).length > 50, `${lang}: a populated drills block`);
    const d = loc.drills['praesens-endungen'];
    assert.ok(d && d.concept && d.prompt, `${lang}: a known drill has concept + prompt`);
  }
});

test('live data/dialogues.js ships the generated DIALOGUES verbatim (cutover ran)', () => {
  function evalDialogues(rel) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const sb = {};
    vm.createContext(sb);
    vm.runInContext(src + '\n;this.O = DIALOGUES;', sb);
    return plain(sb.O);
  }
  const live = evalDialogues('data/dialogues.js');
  const gen = evalDialogues('data/v2/dialogues.js');
  assert.deepEqual(live, gen, 'live DIALOGUES != generated — re-run `npm run cutover:v2`');
  assert.ok(Object.keys(live).length > 20, 'the course should ship many keyed dialogues');
  // every dialogue is keyed by slug, tagged with a week, and carries German lines + comprehension checks
  for (const slug of Object.keys(live)) {
    const d = live[slug];
    assert.equal(typeof d.week, 'number', `${slug}: has a week`);
    assert.ok(Array.isArray(d.lines) && d.lines.length, `${slug}: has dialogue lines`);
    assert.ok(Array.isArray(d.questions) && d.questions.length, `${slug}: has comprehension checks`);
    assert.ok(d.questions.every((q) => typeof q.de === 'string' && typeof q.answer === 'boolean'), `${slug}: checks are German true/false`);
  }
});

test('the live locales carry the keyed dialogues block (title) in all three languages', () => {
  for (const lang of ['en', 'ru', 'ua']) {
    const src = fs.readFileSync(path.join(ROOT, `locales/${lang}.js`), 'utf8');
    const sb = { window: {} }; vm.createContext(sb); vm.runInContext(src, sb);
    const loc = sb.window['LOCALE_' + lang.toUpperCase()];
    assert.ok(loc.dialogues && Object.keys(loc.dialogues).length > 20, `${lang}: a populated dialogues block`);
    const d = loc.dialogues['w01-vorstellung'];
    assert.ok(d && d.title, `${lang}: a known dialogue has a localized title`);
    // ui + verbs blocks must survive the splice (drills/dialogues are inserted alongside, not over them)
    assert.ok(loc.ui && Object.keys(loc.ui).length > 100, `${lang}: ui block preserved`);
    assert.ok(loc.verbs && Object.keys(loc.verbs).length > 100, `${lang}: verbs block preserved`);
  }
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

test('a freshly-migrated planner_data has no ack yet (the reset notice must show — §2)', () => {
  const env = loadMigration();
  env.__setOnb({ level: 'A1' });
  const out = env.__mig({ currentDay: 5, completed: {} });
  assert.ok(out.migratedFrom && out.migratedFrom.at, 'migratedFrom.at marks the reset event');
  assert.equal(out.migratedFrom.ackAt, undefined, 'no ack yet — the notice is pending');
});

/* ---- one-time reset notice on /today (curriculum-redesign-2026-07-v2.md §2 "Do not hide the reset") ---- */
test('the three locales carry the v1→v2 reset-notice keys (title, message, dismiss)', () => {
  for (const lang of ['en', 'ru', 'ua']) {
    const src = fs.readFileSync(path.join(ROOT, `locales/${lang}.js`), 'utf8');
    const sb = { window: {} }; vm.createContext(sb); vm.runInContext(src, sb);
    const ui = sb.window['LOCALE_' + lang.toUpperCase()].ui;
    for (const k of ['today_migrated_title', 'today_migrated_msg', 'today_migrated_dismiss']) {
      assert.ok(ui[k] && typeof ui[k] === 'string' && ui[k].trim(), `${lang}: ${k} present`);
    }
  }
});

test('the /today intro shows the reset notice for a migrated account, and dismissing it persists the ack', () => {
  const { loadPage } = require('./harness');
  const p = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['applyCloudData', 'migrationPending', 'ackMigration', 'getCloudPayload', 'render'],
  });
  // a freshly-migrated planner_data, exactly as cloud-sync._migratePlannerV2 writes it (no ack yet)
  p.applyCloudData({
    courseVersion: 2, currentDay: 1, viewingDay: 1, completed: {}, dayStats: {}, grammarReview: {},
    migratedFrom: { courseVersion: 1, at: '2026-07-10T00:00:00.000Z', oldCurrentDay: 40, oldCompletedCount: 2 },
  });
  assert.equal(p.migrationPending(), true, 'the notice is pending before ack');
  p.render();
  assert.match(p.app.innerHTML, /today-migrated/, 'the reset notice is rendered on the intro');
  assert.match(p.app.innerHTML, /Your course was rebuilt/, 'the localized notice copy is shown');
  assert.doesNotMatch(p.app.innerHTML, /today_migrated_/, 'no raw i18n key leaks');

  p.ackMigration();
  const payload = p.getCloudPayload();
  assert.ok(payload.migratedFrom.ackAt, 'the ack timestamp is written back into planner_data.migratedFrom');
  assert.equal(p.migrationPending(), false, 'the notice is no longer pending after ack');
  assert.doesNotMatch(p.app.innerHTML, /today-migrated/, 're-render after ack drops the notice');
});

test('the /today intro shows no reset notice for a native v2 account (never migrated)', () => {
  const { loadPage } = require('./harness');
  const p = loadPage({
    page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['applyCloudData', 'migrationPending', 'render'],
  });
  p.applyCloudData({ courseVersion: 2, currentDay: 1, viewingDay: 1, completed: {} });
  assert.equal(p.migrationPending(), false, 'no migratedFrom → nothing to notify');
  p.render();
  assert.doesNotMatch(p.app.innerHTML, /today-migrated/, 'no reset notice for a native v2 account');
});

/* ---- stale v1 vocab mastery reset (redesign §2/§6, §17 item 7) ------------------------------
 * vocab_data's mastery/pluralMastery are index-keyed ("week-idx") against VOCAB, so cards earned
 * on the pre-v2 word lists point at unrelated v2 words. VocabTrainer.applyData drops both maps
 * (keeping modes/levels/newLog) when the payload lacks the courseVersion stamp AND the account was
 * migrated (courseMigratedAt() — cloud-sync is shimmed in the harness, so the tests inject it) or
 * the payload's savedAt predates the v2 cutover. serialize() stamps courseVersion on every save,
 * so the reset can never repeat. */
function freshVocabFor(shims) {
  return loadPage({
    page: 'vocab.html', extraFiles: ['locales/en.js'],
    exports: ['applyData', 'serialize', 'state'],
    shims,
  });
}
const v1VocabPayload = (over) => Object.assign({
  app: 'deutsch-vokabeltrainer', version: 2,
  mastery: { '1-0': { box: 3, due: 1, right: 3, wrong: 0, seen: 3 } },
  pluralMastery: { '1-1': { box: 2, due: 1, right: 2, wrong: 1, seen: 3 } },
  modes: { flashcard: false, article: true, spelling: false, plural: true },
  levels: { A1: true, A2: false, B1: false },
  selectedWeek: 4,
}, over);

test('a migrated account\'s unstamped vocab payload is reset: cards dropped, settings kept', () => {
  const v = freshVocabFor({ courseMigratedAt: () => '2026-07-10T12:00:00.000Z' });
  // saved AFTER the cutover (the user already trained on v2) but the stale v1 keys are still inside
  v.applyData(v1VocabPayload({ savedAt: '2026-07-11T09:00:00.000Z' }));
  assert.deepEqual(plain(v.state.mastery), {}, 'index-keyed word mastery dropped');
  assert.deepEqual(plain(v.state.pluralMastery), {}, 'index-keyed plural mastery dropped');
  assert.equal(v.state.modes.plural, true, 'modes carried over (§2)');
  assert.equal(v.state.modes.flashcard, false, 'modes carried over verbatim');
  assert.equal(v.state.levels.A1, true, 'levels carried over (§2)');
  assert.equal(v.state.selectedWeek, 4, 'selectedWeek carried over');
  assert.equal(v.serialize().courseVersion, 2, 'the next save stamps courseVersion');
});

test('a pre-cutover vocab payload is reset even without a planner migration (v1 vocab-only account)', () => {
  const v = freshVocabFor({}); // no courseMigratedAt in the sandbox (cloud-sync is shimmed out)
  v.applyData(v1VocabPayload({ savedAt: '2026-06-20T10:00:00.000Z' }));
  assert.deepEqual(plain(v.state.mastery), {}, 'pre-cutover cards dropped');
  assert.deepEqual(plain(v.state.pluralMastery), {}, 'pre-cutover plural cards dropped');
});

test('a v2-native unstamped payload is kept (saved after the cutover, never migrated)', () => {
  const v = freshVocabFor({ courseMigratedAt: () => null });
  v.applyData(v1VocabPayload({ savedAt: '2026-07-10T18:00:00.000Z' }));
  assert.equal(v.state.mastery['1-0'].box, 3, 'post-cutover native mastery kept');
  assert.equal(v.state.pluralMastery['1-1'].box, 2, 'post-cutover native plural mastery kept');
  assert.equal(v.serialize().courseVersion, 2, 'stamped on the next save anyway');
});

test('a stamped payload is never reset, even for a migrated account (idempotent round trip)', () => {
  const v = freshVocabFor({ courseMigratedAt: () => '2026-07-10T12:00:00.000Z' });
  // ancient savedAt but already stamped — e.g. re-applied cloud data after the one-time reset ran
  v.applyData(v1VocabPayload({ courseVersion: 2, savedAt: '2026-06-01T00:00:00.000Z' }));
  assert.equal(v.state.mastery['1-0'].box, 3, 'stamped payload is trusted');
  const round = plain(v.serialize());
  const v2 = freshVocabFor({ courseMigratedAt: () => '2026-07-10T12:00:00.000Z' });
  v2.applyData(round);
  assert.equal(v2.state.mastery['1-0'].box, 3, 'the serialized round trip survives the reset check');
});

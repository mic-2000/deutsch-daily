/* tests/newlog.test.js — per-day new-card budget (Plan §11 Phase 2 / §5, item 7).
 *
 * Both trainers keep a local-date-keyed ledger (state.newLog) of how many BRAND-NEW cards were
 * introduced today, and cap new introductions per day when a scope opts in with `scope.dailyNew`
 * (the /today guided flow does; the free-explore /vocab & /verbs pages don't). Guards:
 *   • leitnerToday() is a local YYYY-MM-DD key;
 *   • no opt-in → uncapped (unchanged free-explore behaviour);
 *   • opt-in → the cap limits how many new cards a session introduces, counting across sessions;
 *   • the ledger is bumped once per new card on FIRST grading (not on requeue, not for seen cards);
 *   • a capped-out day yields no fresh new cards (→ the /today host auto-skips);
 *   • newLog round-trips through serialize()/applyData().
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function vocab() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['startSession', 'answer', 'state', 'VOCAB', 'verbKeyForWord', 'key', 'isSeen',
              'newLogToday', 'newRemaining', 'newDailyCap', 'bumpNewLog', 'serialize', 'applyData', 'leitnerToday'],
  });
}
function verbs() {
  return loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['startSession', 'answer', 'state', 'VERBS', 'isSeen',
              'newLogToday', 'newRemaining', 'newDailyCap', 'bumpNewLog', 'serialize', 'applyData'],
  });
}

const seenDueRec = (over) => Object.assign({ box: 2, due: 0, right: 1, wrong: 0, seen: 2 }, over);
function nonVerbIdx(v, week, n) {
  const out = [];
  const words = v.VOCAB[week].words;
  for (let i = 0; i < words.length && out.length < n; i++) if (!v.verbKeyForWord(words[i])) out.push(i);
  return out;
}
const newWordCount = (v) => v.state.session.queue.filter((c) => c.kind === 'word' && !v.isSeen(c.week, c.idx)).length;

/* ---- shared helper ---- */

test('leitnerToday() is a local YYYY-MM-DD key', () => {
  const v = vocab();
  assert.match(v.leitnerToday(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(v.leitnerToday(new Date(2026, 6, 3)), '2026-07-03'); // month is 0-based → July
});

/* ---- vocab trainer ---- */

test('vocab: no opt-in → uncapped (Infinity), unchanged free-explore behaviour', () => {
  const v = vocab();
  assert.equal(v.newDailyCap({ type: 'daily', week: 2 }), Infinity);
  assert.equal(v.newRemaining({ type: 'daily', week: 2 }), Infinity);
});

test('vocab: dailyNew:true → default cap, remaining shrinks as the ledger fills', () => {
  const v = vocab();
  const scope = { type: 'daily', week: 2, dailyNew: true };
  assert.equal(v.newDailyCap(scope), 12);
  assert.equal(v.newRemaining(scope), 12);
  for (let i = 0; i < 5; i++) v.bumpNewLog();
  assert.equal(v.newLogToday(), 5);
  assert.equal(v.newRemaining(scope), 7);
});

test('vocab: dailyNew number overrides the default cap', () => {
  const v = vocab();
  assert.equal(v.newDailyCap({ type: 'daily', week: 2, dailyNew: 4 }), 4);
  assert.equal(v.newDailyCap({ type: 'daily', week: 2, dailyNew: 0 }), 0);
});

test('vocab: opted-in session introduces at most the remaining daily budget of new words', () => {
  const v = vocab();
  const scope = { type: 'daily', week: 2, dailyNew: true };
  for (let i = 0; i < 10; i++) v.bumpNewLog();            // 10 used → 2 left today
  v.startSession(scope);
  assert.ok(v.state.session, 'a session started (2 new words still allowed)');
  assert.ok(newWordCount(v) <= 2, `new words in queue (${newWordCount(v)}) must not exceed remaining budget 2`);
});

test('vocab: without opt-in the same fresh week is NOT capped', () => {
  const v = vocab();
  for (let i = 0; i < 10; i++) v.bumpNewLog();            // ledger full, but this scope ignores it
  v.startSession({ type: 'daily', week: 2 });
  assert.ok(newWordCount(v) > 2, 'uncapped daily scope still introduces its full per-session slice');
});

test('vocab: capped-out day with nothing due → no session (host auto-skips)', () => {
  const v = vocab();
  const scope = { type: 'daily', week: 2, dailyNew: true };
  for (let i = 0; i < 12; i++) v.bumpNewLog();            // budget exhausted, nothing is due
  v.startSession(scope);
  assert.equal(v.state.session, null, 'no new budget + no due cards → empty, no session');
});

test('vocab: grading a NEW word bumps the ledger once; a seen card does not', () => {
  const v = vocab();
  const now = Date.now();
  const [seenIdx] = nonVerbIdx(v, 1, 1);
  v.state.mastery[v.key(1, seenIdx)] = seenDueRec({ due: now - 1000 });   // an old seen+due card
  v.startSession({ type: 'daily', week: 2, dailyNew: true });
  const q = v.state.session.queue;

  // answer the seen card → no bump
  const seenPos = q.findIndex((c) => c.week === 1 && c.idx === seenIdx);
  assert.ok(seenPos >= 0, 'seen due card is in the queue');
  v.state.session.pos = seenPos;
  v.answer(true);
  assert.equal(v.newLogToday(), 0, 'grading a previously-seen card must not count as a new introduction');

  // answer a genuinely-new word card → exactly one bump
  const newPos = q.findIndex((c) => c.kind === 'word' && !v.isSeen(c.week, c.idx));
  assert.ok(newPos >= 0, 'a new word card is in the queue');
  v.state.session.pos = newPos;
  v.answer(true);
  assert.equal(v.newLogToday(), 1, 'grading a new word bumps the ledger exactly once');
});

test('vocab: newLog round-trips through serialize()/applyData()', () => {
  const v = vocab();
  v.bumpNewLog(); v.bumpNewLog();
  const blob = JSON.parse(JSON.stringify(v.serialize()));
  assert.equal(blob.newLog[v.leitnerToday()], 2);
  const v2 = vocab();
  v2.applyData(blob);
  assert.equal(v2.newLogToday(), 2, 'ledger survives a cloud round-trip');
});

/* ---- verbs trainer ---- */

test('verbs: dailyNew:true caps new verbs; free-explore is uncapped', () => {
  const t = verbs();
  assert.equal(t.newDailyCap({ type: 'filter', filter: 'all' }), Infinity);
  const scope = { type: 'filter', filter: 'all', week: 25, dailyNew: true };   // B1 week → any band
  assert.equal(t.newDailyCap(scope), 15);
  for (let i = 0; i < 13; i++) t.bumpNewLog();
  t.startSession(scope);
  assert.ok(t.state.session, 'a session started (2 new verbs still allowed)');
  const newInQueue = t.state.session.queue.filter((c) => !t.isSeen(c.key)).length;
  assert.ok(newInQueue <= 2, `new verbs in queue (${newInQueue}) must not exceed remaining budget 2`);
});

test('verbs: grading a new verb bumps the ledger; round-trips through serialize', () => {
  const t = verbs();
  t.startSession({ type: 'filter', filter: 'all', week: 25, dailyNew: true });
  assert.ok(t.state.session);
  const newPos = t.state.session.queue.findIndex((c) => !t.isSeen(c.key));
  t.state.session.pos = newPos;
  t.answer(true);
  assert.equal(t.newLogToday(), 1);
  const blob = JSON.parse(JSON.stringify(t.serialize()));
  const t2 = verbs();
  t2.applyData(blob);
  assert.equal(t2.newLogToday(), 1);
});

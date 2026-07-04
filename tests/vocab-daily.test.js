/* tests/vocab-daily.test.js — the vocab trainer's { type: 'daily' } session scope.
 *
 * This is the scope /today drives for its guided daily flow. Unlike 'week' (one week) or
 * 'review-all' (all weeks, mastered dropped), 'daily' selects:
 *   • DUE cards from every week reached so far (weeks 1..scope.week), INCLUDING mastered-but-due
 *     cards, so long-interval words still resurface for review;
 *   • NEW (unseen) words only from the current week (scope.week), capped.
 * Cards for verb-words route through the shared verb store, so the fixtures below use plain
 * (non-verb) words and write directly to state.mastery under the "week-idx" key.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function fresh() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['startSession', 'state', 'VOCAB', 'verbKeyForWord', 'key', 'isSeen', 'isDue'],
  });
}

/* First `n` indices in `week` whose word is NOT a known verb (so mastery lives in state.mastery,
   not the shared verb store) — keeps the fixtures deterministic. */
function nonVerbIdx(v, week, n) {
  const out = [];
  const words = v.VOCAB[week].words;
  for (let i = 0; i < words.length && out.length < n; i++) if (!v.verbKeyForWord(words[i])) out.push(i);
  return out;
}
const rec = (over) => Object.assign({ box: 1, due: 0, right: 0, wrong: 0, seen: 1 }, over);
const inQueue = (v, week, idx) => v.state.session.queue.some((c) => c.week === week && c.idx === idx);

test('daily scope pulls old due cards AND current-week new cards', () => {
  const v = fresh();
  const now = Date.now();
  const [dueIdx] = nonVerbIdx(v, 1, 1);
  // an old (week 1) card that is seen and past-due → belongs in the daily backlog
  v.state.mastery[v.key(1, dueIdx)] = rec({ box: 2, due: now - 1000, seen: 3 });

  v.startSession({ type: 'daily', week: 2 });
  assert.ok(v.state.session, 'a daily session started');

  assert.ok(inQueue(v, 1, dueIdx), 'old due card from an earlier week is included');
  // week 2 words are all unseen here → new cards from the current week must appear
  assert.ok(v.state.session.queue.some((c) => c.week === 2 && c.kind === 'word'), 'current-week new words included');
});

test('daily scope includes mastered-but-due cards (unlike review-all)', () => {
  const v = fresh();
  const now = Date.now();
  const [mastIdx] = nonVerbIdx(v, 1, 1);
  // mastered (box 5) but past-due → must still be eligible for daily review
  v.state.mastery[v.key(1, mastIdx)] = rec({ box: 5, due: now - 1000, right: 5, seen: 5 });

  v.startSession({ type: 'daily', week: 2 });
  assert.ok(inQueue(v, 1, mastIdx), 'a mastered-but-due card is reviewed in the daily scope');
});

test('daily scope excludes mastered cards that are not yet due', () => {
  const v = fresh();
  const now = Date.now();
  const [mastIdx] = nonVerbIdx(v, 1, 1);
  // mastered and scheduled far in the future → not due → skipped
  v.state.mastery[v.key(1, mastIdx)] = rec({ box: 5, due: now + 30 * 86400000, right: 5, seen: 5 });

  v.startSession({ type: 'daily', week: 2 });
  assert.ok(v.state.session, 'session started (week 2 new words keep it non-empty)');
  assert.ok(!inQueue(v, 1, mastIdx), 'a mastered, not-due card is not reviewed');
});

test('daily scope introduces new words only from the current week, not earlier ones', () => {
  const v = fresh();
  // nothing seen anywhere; current week = 2
  v.startSession({ type: 'daily', week: 2 });
  assert.ok(v.state.session);
  const weeks = new Set(v.state.session.queue.map((c) => c.week));
  assert.ok(weeks.has(2), 'new words come from the current week');
  assert.ok(!weeks.has(1), 'unseen words from earlier weeks are not introduced as new');
});

test('daily scope clamps an out-of-range week and still yields a session', () => {
  const v = fresh();
  const maxWeek = Math.max(...Object.keys(v.VOCAB).map(Number));
  v.startSession({ type: 'daily', week: maxWeek + 50 }); // clamped to the last real week
  assert.ok(v.state.session, 'clamped week still starts a session');
  assert.ok(v.state.session.queue.length > 0);
});

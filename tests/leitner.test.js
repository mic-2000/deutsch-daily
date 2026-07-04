/* tests/leitner.test.js — Leitner spaced-repetition box logic.
 * This is the shared model the plan extracts into assets/js/leitner.js. The tests drive
 * it through each page's public card functions (which the refactor keeps as thin wrappers
 * over the shared core), so they stay valid before and after extraction.
 *
 * Behaviour locked here (incl. ARCHITECTURE.md §13 already-fixed bugs):
 *   - new word (no record) is always due; isMastered === false
 *   - correct  → box = min(5, box+1)   (first correct is 0→1, NOT 0→2  — §13 bug #4)
 *   - wrong    → configurable via leitnerApply(card, correct, { wrongPolicy }):
 *                 'reset' (default) → box = 1              (a miss sends it back to box 1)
 *                 'soft'            → box = max(1, box-2)  (a miss drops two boxes)
 *                 the trainers (vocab/plural/verbs) opt into 'soft'; collections keeps 'reset'.
 *   - due = now + BOX_INTERVAL[box]
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* Normalise cross-realm sandbox objects before structural comparison. */
const plain = (x) => JSON.parse(JSON.stringify(x));
const DAY = 86400000;

function freshVerbs() {
  return loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['updateCard', 'isDue', 'isSeen', 'cardBox', 'isMastered', 'getCard', 'BOX_INTERVAL', 'MAX_BOX', 'state', 'leitnerApply', 'leitnerBlank'],
  });
}

test('constants: 5 boxes with doubling intervals 1/2/4/8/16 days', () => {
  const v = freshVerbs();
  assert.equal(v.MAX_BOX, 5);
  assert.deepEqual(plain(v.BOX_INTERVAL), { 1: 1 * DAY, 2: 2 * DAY, 3: 4 * DAY, 4: 8 * DAY, 5: 16 * DAY });
});

test('new card: always due, never seen, box 0, not mastered', () => {
  const v = freshVerbs();
  assert.equal(v.isDue('gehen', Date.now()), true);
  assert.ok(!v.isSeen('gehen'));
  assert.equal(v.cardBox('gehen'), 0);
  assert.equal(v.isMastered('gehen'), false);
});

test('first correct answer moves box 0 → 1 (not 0 → 2)', () => {
  const v = freshVerbs();
  v.updateCard('gehen', true);
  assert.equal(v.cardBox('gehen'), 1);
  assert.equal(v.state.mastery['gehen'].right, 1);
  assert.equal(v.state.mastery['gehen'].seen, 1);
});

test('consecutive correct answers advance one box each, capped at MAX_BOX', () => {
  const v = freshVerbs();
  for (let i = 0; i < 7; i++) v.updateCard('gehen', true);
  assert.equal(v.cardBox('gehen'), 5);
  assert.equal(v.isMastered('gehen'), true);
});

test('verbs trainer soft-demotes: a wrong answer drops two boxes (floored at 1)', () => {
  const v = freshVerbs();
  for (let i = 0; i < 4; i++) v.updateCard('gehen', true); // box 4
  assert.equal(v.cardBox('gehen'), 4);
  v.updateCard('gehen', false);                            // soft: 4 → 2
  assert.equal(v.cardBox('gehen'), 2);
  assert.equal(v.state.mastery['gehen'].wrong, 1);
});

/* ---------------- configurable wrong-answer policy (leitnerApply opts) ---------------- */
test('leitnerApply default policy resets the box to 1 on a miss', () => {
  const v = freshVerbs();
  const card = v.leitnerBlank();
  for (let i = 0; i < 4; i++) v.leitnerApply(card, true); // box 4
  assert.equal(card.box, 4);
  v.leitnerApply(card, false);                            // no opts → 'reset'
  assert.equal(card.box, 1);
});

test("leitnerApply { wrongPolicy: 'reset' } resets the box to 1 from any box", () => {
  const v = freshVerbs();
  const card = v.leitnerBlank();
  for (let i = 0; i < 5; i++) v.leitnerApply(card, true); // box 5 (mastered)
  v.leitnerApply(card, false, { wrongPolicy: 'reset' });
  assert.equal(card.box, 1);
});

test("leitnerApply { wrongPolicy: 'soft' } drops two boxes, floored at 1", () => {
  const v = freshVerbs();
  const atBox = (n) => { const c = v.leitnerBlank(); for (let i = 0; i < n; i++) v.leitnerApply(c, true); return c; };
  const cases = [[5, 3], [4, 2], [3, 1], [2, 1], [1, 1]]; // [startBox, boxAfterMiss]
  for (const [start, after] of cases) {
    const c = atBox(start);
    assert.equal(c.box, start, `precondition: card at box ${start}`);
    v.leitnerApply(c, false, { wrongPolicy: 'soft' });
    assert.equal(c.box, after, `soft demotion ${start} → ${after}`);
  }
});

test('soft demotion still counts the miss and reschedules due to the new box interval', () => {
  const v = freshVerbs();
  const card = v.leitnerBlank();
  for (let i = 0; i < 4; i++) v.leitnerApply(card, true); // box 4
  const before = Date.now();
  v.leitnerApply(card, false, { wrongPolicy: 'soft' });   // box 4 → 2
  assert.equal(card.box, 2);
  assert.equal(card.wrong, 1);
  assert.ok(card.due >= before + 2 * DAY && card.due <= Date.now() + 2 * DAY + 50, 'due = now + interval(box 2)');
});

test('due date is set to now + interval of the new box', () => {
  const v = freshVerbs();
  const before = Date.now();
  v.updateCard('gehen', true); // → box 1, interval 1 day
  const c = v.state.mastery['gehen'];
  assert.ok(c.due >= before + DAY && c.due <= Date.now() + DAY + 50);
});

test('isDue: a card scheduled in the future is not due, past is due', () => {
  const v = freshVerbs();
  v.updateCard('gehen', true);
  const now = v.state.mastery['gehen'].due;
  assert.equal(v.isDue('gehen', now - 1000), false);
  assert.equal(v.isDue('gehen', now + 1000), true);
});

/* The vocab trainer shares the model but keys by "week-idx"; verb-resolving words route
 * their mastery into the shared verb store. Both paths exercised here. */
test('vocab: non-verb word stores mastery under "week-idx" key', () => {
  const v = loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['updateCard', 'cardBox', 'state', 'verbKeyForWord', 'VOCAB'],
  });
  // find a non-verb word in week 1
  const idx = v.VOCAB[1].words.findIndex((w) => !v.verbKeyForWord(w));
  assert.ok(idx >= 0);
  v.updateCard(1, idx, true);
  assert.equal(v.cardBox(1, idx), 1);
  assert.ok(v.state.mastery['1-' + idx], 'mastery stored under composite key');
});

/* tests/requeue.test.js — in-session re-queue must NOT grade the same card twice.
 *
 * All four trainers (vocab words, vocab plurals, verbs, collections) re-queue a card once after a
 * wrong first answer, as an easier reveal card, so the learner sees it again before the session
 * ends. That second appearance is reinforcement, not a fresh review: it must not touch the stored
 * Leitner record again. Before the guard, a wrong-then-right card was graded twice (seen++ twice,
 * box bumped back up), inflating mastery. Each test drives answer(false) then answer(true) on the
 * re-queued clone and asserts the record was graded exactly once (on the first, wrong answer).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* ---------------- vocab: word track ---------------- */
test('vocab word: a re-queued card is not graded a second time', () => {
  const v = loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['answer', 'state', 'VOCAB', 'verbKeyForWord'],
  });
  // a plain (non-verb) word → mastery stored under the "week-idx" key
  const idx = v.VOCAB[1].words.findIndex((w) => !v.verbKeyForWord(w));
  assert.ok(idx >= 0);
  const card = { week: 1, idx, kind: 'word', de: v.VOCAB[1].words[idx], ru: '', mode: 'flashcard', requeued: false, firstTry: null };
  v.state.session = {
    scope: { type: 'week', week: 1 }, queue: [card], pos: 0,
    revealed: false, answered: false, lastCorrect: null, uniqueRight: 0, uniqueTotal: 1, spellValue: '',
  };
  v.answer(false); // grade the miss once → soft-demote 0 → box 1; card re-queued at pos 1
  v.answer(true);  // the re-queued clone: must NOT grade again (would otherwise bump box 1 → 2)

  const rec = v.state.mastery['1-' + idx];
  assert.equal(rec.seen, 1, 'graded exactly once');
  assert.equal(rec.wrong, 1);
  assert.equal(rec.right, 0);
  assert.equal(rec.box, 1, 'box reflects the single (wrong) grade, not the later correct re-queue');
});

/* ---------------- vocab: plural track ---------------- */
test('vocab plural: a re-queued plural card is not graded a second time', () => {
  const v = loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['answer', 'state', 'VOCAB', 'PLURALS', 'makePluralCard', 'key'],
  });
  let slot = null;
  for (const w of Object.keys(v.VOCAB)) {
    const words = v.VOCAB[w].words;
    for (let i = 0; i < words.length; i++) if (v.PLURALS[words[i]]) { slot = { week: +w, idx: i }; break; }
    if (slot) break;
  }
  assert.ok(slot, 'a word with a plural exists');
  const card = v.makePluralCard(slot.week, slot.idx);
  card.mode = 'pl_flash';
  v.state.session = {
    scope: { type: 'week', week: slot.week }, queue: [card], pos: 0,
    revealed: false, answered: false, lastCorrect: null, uniqueRight: 0, uniqueTotal: 1, spellValue: '',
  };
  v.answer(false); // soft-demote 0 → box 1 on the plural track; re-queued
  v.answer(true);  // re-queued clone must not grade again

  const k = v.key(slot.week, slot.idx);
  assert.equal(v.state.pluralMastery[k].seen, 1, 'plural graded exactly once');
  assert.equal(v.state.pluralMastery[k].box, 1);
  assert.equal(v.state.mastery[k], undefined, 'meaning track untouched');
});

/* ---------------- verbs ---------------- */
test('verbs: a re-queued card is not graded a second time', () => {
  const v = loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['answer', 'state', 'makeCard'],
  });
  const card = { key: 'gehen', mode: 'triad', clozeField: null, person: null, requeued: false, firstTry: null, val: '', aux: null };
  v.state.session = {
    queue: [card], pos: 0, revealed: false, answered: false, lastCorrect: null, uniqueRight: 0, uniqueTotal: 1,
  };
  v.answer(false); // soft-demote 0 → box 1; re-queued as easy triad
  v.answer(true);  // re-queued clone must not grade again

  const rec = v.state.mastery['gehen'];
  assert.equal(rec.seen, 1, 'graded exactly once');
  assert.equal(rec.wrong, 1);
  assert.equal(rec.right, 0);
  assert.equal(rec.box, 1);
});

/* ---------------- collections (keeps the default reset policy) ---------------- */
test('collections: a re-queued card is not graded a second time', () => {
  const p = loadPage({
    page: 'collections.html',
    extraFiles: ['locales/en.js'],
    exports: ['answer', 'state'],
  });
  const col = { id: 'c1', name: 'Test', words: [{ id: 'w1', de: 'der Tisch', tr: 'table' }], mastery: {} };
  const card = { wid: 'w1', de: 'der Tisch', ru: 'table', mode: 'flashcard', requeued: false, firstTry: null };
  p.state.collections = [col];
  p.state.session = {
    col, scope: 'due', queue: [card], pos: 0,
    revealed: false, answered: false, lastCorrect: null, uniqueRight: 0, uniqueTotal: 1, spellValue: '',
  };
  p.answer(false); // reset policy → box 1; re-queued
  p.answer(true);  // re-queued clone must not grade again

  assert.equal(col.mastery['w1'].seen, 1, 'graded exactly once');
  assert.equal(col.mastery['w1'].wrong, 1);
  assert.equal(col.mastery['w1'].box, 1);
});

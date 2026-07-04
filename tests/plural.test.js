/* tests/plural.test.js — the plural trainer added to the vocabulary section.
 *
 * Covers the new, INDEPENDENT plural track (state.pluralMastery) that sits next to the
 * existing meaning/article/spelling track:
 *   • PLURALS data: German-only map keyed by the EXACT singular string in VOCAB; every key
 *     is a real VOCAB word, every value carries a "die" plural article (so no orphans/typos).
 *   • plural Leitner helpers (plBox/plIsSeen/plIsMastered/updatePlural) reuse the shared box
 *     model but write to state.pluralMastery — learning a plural must NOT touch state.mastery.
 *   • card builders: makePluralCard tags kind:'plural', carries the plural form, and the
 *     multiple-choice options always include the correct answer.
 *   • cloud round-trip: serialize()/applyData() persist pluralMastery.
 *   • render: every plural mode renders into #app without throwing.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

const plain = (x) => JSON.parse(JSON.stringify(x));

function fresh() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: [
      'VOCAB', 'PLURALS', 'state', 'render',
      'plHasPlural', 'plBox', 'plIsSeen', 'plIsMastered', 'plIsDue', 'updatePlural',
      'makePluralCard', 'makePluralOptions', 'pluralDistractors', 'umlautify',
      'collectPluralCards', 'allPluralCards', 'pickPluralMode',
      'serialize', 'applyData', 'key',
    ],
  });
}

/* Find the first VOCAB slot whose word has a plural entry, for track-isolation tests. */
function firstPluralSlot(v) {
  for (const w of Object.keys(v.VOCAB)) {
    const words = v.VOCAB[w].words;
    for (let i = 0; i < words.length; i++) {
      if (v.PLURALS[words[i]]) return { week: +w, idx: i, de: words[i] };
    }
  }
  throw new Error('no PLURALS entries found');
}

/* ---------------- data integrity ---------------- */
test('PLURALS keys are all real VOCAB words (no orphan/typo keys)', () => {
  const v = fresh();
  const vocabWords = new Set();
  for (const w of Object.keys(v.VOCAB)) v.VOCAB[w].words.forEach((x) => vocabWords.add(x));
  const orphans = Object.keys(v.PLURALS).filter((k) => !vocabWords.has(k));
  assert.deepEqual(orphans, [], 'every PLURALS key must match a VOCAB word exactly');
});

test('every PLURALS value is a non-empty "die …" plural form', () => {
  const v = fresh();
  for (const [sg, pl] of Object.entries(v.PLURALS)) {
    assert.ok(typeof pl === 'string' && pl.trim() !== '', `${sg} → blank plural`);
    assert.match(pl, /^die\s+\S/, `${sg} → "${pl}" should start with the plural article "die "`);
  }
});

test('plHasPlural reflects the PLURALS table for a known noun and a known non-noun', () => {
  const v = fresh();
  const slot = firstPluralSlot(v);
  assert.equal(v.plHasPlural(slot.week, slot.idx), true);
  // week 1 index 0 is "Hallo" — a greeting, never a countable noun → no plural card
  assert.equal(v.plHasPlural(1, 0), false);
});

/* ---------------- track isolation ---------------- */
test('updatePlural writes to pluralMastery and leaves the meaning track untouched', () => {
  const v = fresh();
  const { week, idx } = firstPluralSlot(v);
  const k = v.key(week, idx);
  v.updatePlural(week, idx, true);
  assert.ok(v.state.pluralMastery[k], 'plural record created');
  assert.equal(v.plBox(week, idx), 1, 'first correct → box 1');
  assert.ok(v.plIsSeen(week, idx));
  assert.equal(v.state.mastery[k], undefined, 'meaning track must stay empty');
});

test('plural box advances to mastery on 5 correct, soft-demotes two boxes on a miss', () => {
  const v = fresh();
  const { week, idx } = firstPluralSlot(v);
  for (let i = 0; i < 5; i++) v.updatePlural(week, idx, true);
  assert.equal(v.plBox(week, idx), 5);
  assert.equal(v.plIsMastered(week, idx), true);
  v.updatePlural(week, idx, false);              // soft demotion: 5 → 3 (not a full reset to 1)
  assert.equal(v.plBox(week, idx), 3);
  assert.equal(v.plIsMastered(week, idx), false);
});

/* ---------------- card builders ---------------- */
test('makePluralCard carries the plural form and tags kind="plural"', () => {
  const v = fresh();
  const { week, idx, de } = firstPluralSlot(v);
  const card = v.makePluralCard(week, idx);
  assert.equal(card.kind, 'plural');
  assert.equal(card.de, de);
  assert.equal(card.pl, v.PLURALS[de]);
  assert.ok(['pl_flash', 'pl_choose', 'pl_input'].includes(card.mode));
});

test('multiple-choice options always include the correct plural and are unique', () => {
  const v = fresh();
  for (const w of Object.keys(v.VOCAB)) {
    v.VOCAB[w].words.forEach((de, i) => {
      if (!v.PLURALS[de]) return;
      const opts = v.makePluralOptions(de, v.PLURALS[de]);
      assert.ok(opts.includes(v.PLURALS[de]), `${de}: options must contain the correct plural`);
      assert.equal(new Set(opts).size, opts.length, `${de}: options must be unique`);
      assert.ok(opts.length >= 2, `${de}: need at least 2 options`);
    });
  }
});

test('pluralDistractors never returns the correct plural core', () => {
  const v = fresh();
  const ds = v.pluralDistractors('Kind', 'Kinder');
  assert.ok(!ds.includes('Kinder'));
});

test('umlautify fronts the last back-vowel (au→äu, a→ä, o→ö, u→ü)', () => {
  const v = fresh();
  assert.equal(v.umlautify('Haus'), 'Häus');
  assert.equal(v.umlautify('Vater'), 'Väter');
  assert.equal(v.umlautify('Sohn'), 'Söhn');
  assert.equal(v.umlautify('Mutter'), 'Mütter');
});

/* ---------------- session collection respects the plural track ---------------- */
test('collectPluralCards only yields slots that have a plural and are due/new', () => {
  const v = fresh();
  const cards = v.collectPluralCards(Object.keys(v.VOCAB), Date.now(), 5);
  assert.ok(cards.length > 0);
  for (const c of cards) {
    assert.equal(c.kind, 'plural');
    assert.ok(v.plHasPlural(c.week, c.idx));
  }
});

test('mastered (not-due) plurals are excluded from a fresh collection', () => {
  const v = fresh();
  const { week, idx } = firstPluralSlot(v);
  for (let i = 0; i < 5; i++) v.updatePlural(week, idx, true); // master it, due far in the future
  const cards = v.collectPluralCards([week], Date.now(), 50);
  assert.ok(!cards.some((c) => c.week === week && c.idx === idx), 'mastered+not-due plural should be skipped');
});

/* ---------------- cloud round-trip ---------------- */
test('serialize/applyData persist the plural track', () => {
  const v = fresh();
  const { week, idx } = firstPluralSlot(v);
  v.updatePlural(week, idx, true);
  const snapshot = plain(v.serialize());
  assert.ok(snapshot.pluralMastery && Object.keys(snapshot.pluralMastery).length === 1);

  // wipe, then restore from the snapshot
  v.state.pluralMastery = {};
  v.applyData(snapshot);
  assert.equal(v.plBox(week, idx), 1, 'plural progress restored from cloud payload');
});

test('applyData tolerates an old payload with no pluralMastery field', () => {
  const v = fresh();
  assert.doesNotThrow(() => v.applyData({ mastery: {}, modes: {}, levels: {} }));
  assert.deepEqual(plain(v.state.pluralMastery), {});
});

/* ---------------- render smoke ---------------- */
test('render() draws each plural mode into #app without throwing', () => {
  for (const mode of ['pl_flash', 'pl_choose', 'pl_input']) {
    const v = fresh();
    const { week, idx } = firstPluralSlot(v);
    const card = v.makePluralCard(week, idx);
    card.mode = mode;
    v.state.session = {
      scope: { type: 'week', week }, queue: [card], pos: 0,
      revealed: false, answered: false, lastCorrect: null,
      uniqueRight: 0, uniqueTotal: 1, spellValue: '',
    };
    assert.doesNotThrow(() => v.render(), `mode ${mode} should render`);
    assert.ok(v.app.innerHTML.length > 300, `mode ${mode} produced markup`);
  }
});

test('plural chip is OFF by default so existing sessions are unchanged', () => {
  const v = fresh();
  assert.equal(v.state.modes.plural, false);
});

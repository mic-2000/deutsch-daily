/* tests/verb-forms.test.js — known verbs show all THREE principal parts, in EVERY week.
 *
 * verbForms() expands any word that is a key in VERBS to
 * "Infinitiv — Präteritum — Partizip II (+ sein)" live from the dictionary. Week-5 entries are
 * stored as "Infinitiv — Partizip II" (dash dropped before lookup); plain infinitives elsewhere
 * are matched directly. Guards:
 *   • week-5 dashed verbs gain the Präteritum, with "(sein)" only for sein-auxiliary verbs;
 *   • plain infinitives in OTHER weeks also expand to 3 forms;
 *   • non-verbs (nouns/adverbs/phrases) and unknown verbs pass through unchanged;
 *   • the stored VOCAB string is NOT mutated (verbKeyForWord/speakWord still read the infinitive).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function fresh() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['verbForms', 'VERBS', 'VOCAB', 'verbKeyForWord'],
  });
}

test('a haben-verb expands to 3 forms without a (sein) tag', () => {
  const v = fresh();
  assert.equal(v.verbForms('arbeiten — gearbeitet'), 'arbeiten — arbeitete — gearbeitet');
});

test('a sein-verb expands to 3 forms WITH the (sein) tag', () => {
  const v = fresh();
  assert.equal(v.verbForms('aufstehen — aufgestanden'), 'aufstehen — stand auf — aufgestanden (sein)');
});

test('an irregular sein-verb that already carried (sein) keeps a single tag', () => {
  const v = fresh();
  assert.equal(v.verbForms('fahren — gefahren (sein)'), 'fahren — fuhr — gefahren (sein)');
});

test('a plain infinitive in another week (no dash) expands to 3 forms', () => {
  const v = fresh();
  assert.equal(v.verbForms('spielen'), 'spielen — spielte — gespielt');     // week 3, haben
  assert.equal(v.verbForms('nehmen'), 'nehmen — nahm — genommen');           // week 2, irregular
  assert.equal(v.verbForms('schwimmen'), 'schwimmen — schwamm — geschwommen'); // week 3, haben
  assert.equal(v.verbForms('wandern'), 'wandern — wanderte — gewandert (sein)'); // week 3, sein
});

test('non-verbs (nouns/adverbs) pass through unchanged', () => {
  const v = fresh();
  assert.equal(v.verbForms('der Morgen'), 'der Morgen');
  assert.equal(v.verbForms('gestern'), 'gestern');
  assert.equal(v.verbForms('das Brot'), 'das Brot');
});

test('an unknown verb is left as-is', () => {
  const v = fresh();
  assert.equal(v.verbForms('quietschen'), 'quietschen');
  assert.equal(v.verbForms('quietschen — gequietscht'), 'quietschen — gequietscht');
});

test('every dashed week-5 entry that maps to a known verb yields exactly 3 dash-separated parts', () => {
  const v = fresh();
  for (const de of v.VOCAB[5].words) {
    if (!/—/.test(de)) continue;
    const inf = de.split('—')[0].trim();
    if (!v.VERBS[inf]) continue;
    const parts = v.verbForms(de).split('—').map((s) => s.trim());
    assert.equal(parts.length, 3, `${de} → should render 3 forms`);
    assert.equal(parts[0], inf);
    assert.equal(parts[1], v.VERBS[inf].praet);
  }
});

test('across ALL weeks, every word that is a known verb renders 3 forms', () => {
  const v = fresh();
  let checked = 0;
  for (const w of Object.keys(v.VOCAB)) {
    for (const de of v.VOCAB[w].words) {
      const inf = de.split('—')[0].trim();
      if (!v.VERBS[inf]) continue;
      const parts = v.verbForms(de).split('—').map((s) => s.trim());
      assert.equal(parts.length, 3, `week ${w}: ${de} → should render 3 forms`);
      assert.equal(parts[0], inf);
      assert.equal(parts[1], v.VERBS[inf].praet);
      checked++;
    }
  }
  assert.ok(checked > 30, `expected many verbs across weeks, only matched ${checked}`);
});

test('verbForms does not mutate VOCAB, so verbKeyForWord still resolves the infinitive', () => {
  const v = fresh();
  const original = v.VOCAB[5].words[0];
  v.verbForms(original);
  assert.equal(v.VOCAB[5].words[0], original, 'stored VOCAB string unchanged');
  assert.equal(v.verbKeyForWord(original), original.split('—')[0].trim());
});

/* ---------------- wiring: verbForms is actually used by the rendered UI ---------------- */
function freshRender() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['render', 'state', 'VOCAB', 'VERBS', 'makeCard'],
  });
}

test('the word list (week 3) renders the Präteritum for its verbs, not just 2 forms', () => {
  const v = freshRender();
  v.state.selectedWeek = 3;
  v.state.session = null;
  v.render();
  const html = v.app.innerHTML;
  // "spielen" is a plain infinitive in week 3 → its Präteritum must reach the screen
  assert.ok(html.includes('spielte'), 'list should show the Präteritum "spielte" for spielen');
  assert.ok(html.includes('geschwommen'), 'list should show the Partizip II for schwimmen');
});

test('the flashcard shows all 3 forms for a known verb', () => {
  const v = freshRender();
  const card = v.makeCard(3, v.VOCAB[3].words.indexOf('spielen'));
  card.mode = 'flashcard';
  v.state.session = {
    scope: { type: 'week', week: 3 }, queue: [card], pos: 0,
    revealed: false, answered: false, lastCorrect: null,
    uniqueRight: 0, uniqueTotal: 1, spellValue: '',
  };
  v.render();
  assert.ok(v.app.innerHTML.includes('spielte'), 'flashcard should expand to Inf — Prät — PII');
});

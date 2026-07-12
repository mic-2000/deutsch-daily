/* tests/hints.test.js — DEV-15 error explanations in the trainers.
 *
 * data/hints.js (window.HINTS) is a pure rule engine: given a missed card it returns which grammar
 * rule explains the right answer (+ German examples), or null when no rule confidently applies. The
 * localized prose lives in locales/*.ui as hint_article / hint_plural / hint_verb. Guards:
 *   • the matchers classify the common article/plural/verb cases and return null on rule-less input;
 *   • article rules are gender-gated (a suffix exception never mis-teaches);
 *   • a wrong answer in the article / plural / verb-conjug session paints a localized .rule-hint;
 *   • a correct answer, and a rule-less word, paint NO hint (no layout jump, no shaky guess).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* ---------- unit: the pure rule engine (data/hints.js) ---------- */
const HINTS = loadPage({ extraFiles: ['data/hints.js'], exports: ['HINTS'] }).HINTS;

test('HINTS exposes the three matchers', () => {
  assert.equal(typeof HINTS.articleHint, 'function');
  assert.equal(typeof HINTS.pluralHint, 'function');
  assert.equal(typeof HINTS.verbStemHint, 'function');
});

test('articleHint: matches teachable suffixes, gender-gated', () => {
  const h = HINTS.articleHint('Wohnung', 'die');
  assert.equal(h.key, 'hint_article');
  assert.deepEqual([...h.args], ['ung', 'die']);
  assert.deepEqual([...h.examples], ['die Zeitung', 'die Wohnung']);
  assert.equal(HINTS.articleHint('Mädchen', 'das').args[0], 'chen');
  assert.equal(HINTS.articleHint('Motor', 'der').args[0], 'or');
  assert.equal(HINTS.articleHint('Freiheit', 'die').args[0], 'heit');
  assert.equal(HINTS.articleHint('Universität', 'die').args[0], 'tät');
});

test('articleHint: a gender mismatch or a rule-less word yields no hint', () => {
  assert.equal(HINTS.articleHint('Labor', 'das'), null, 'das Labor: -or is a der-rule → skip, no mis-teach');
  assert.equal(HINTS.articleHint('Tor', 'das'), null, 'das Tor: -or der-rule skipped');
  assert.equal(HINTS.articleHint('Tisch', 'der'), null, 'no matching suffix → null');
  assert.equal(HINTS.articleHint('Ei', 'das'), null, 'core not longer than the suffix → null');
});

test('pluralHint: classifies ending ± umlaut', () => {
  assert.equal(HINTS.pluralHint('der Tag', 'die Tage').args[0], 'e');
  assert.equal(HINTS.pluralHint('der Stuhl', 'die Stühle').args[0], 'e_umlaut');
  assert.equal(HINTS.pluralHint('das Kind', 'die Kinder').args[0], 'er');
  assert.equal(HINTS.pluralHint('das Buch', 'die Bücher').args[0], 'er_umlaut');
  assert.equal(HINTS.pluralHint('die Frau', 'die Frauen').args[0], 'n');
  assert.equal(HINTS.pluralHint('die Blume', 'die Blumen').args[0], 'n');
  assert.equal(HINTS.pluralHint('die Lehrerin', 'die Lehrerinnen').args[0], 'nen');
  assert.equal(HINTS.pluralHint('das Auto', 'die Autos').args[0], 's');
  assert.equal(HINTS.pluralHint('der Vater', 'die Väter').args[0], 'umlaut');
  assert.equal(HINTS.pluralHint('das Fenster', 'die Fenster').args[0], 'same');
});

test('pluralHint: an unclassifiable (Latin/irregular) plural yields no hint', () => {
  assert.equal(HINTS.pluralHint('die Firma', 'die Firmen'), null);
  assert.equal(HINTS.pluralHint('das Thema', 'die Themen'), null);
});

test('verbStemHint: classifies present-tense stem-vowel changes', () => {
  assert.equal(HINTS.verbStemHint('fahren', 'fährt').args[0], 'a → ä');
  assert.equal(HINTS.verbStemHint('schlafen', 'schläft').args[0], 'a → ä');
  assert.equal(HINTS.verbStemHint('laufen', 'läuft').args[0], 'au → äu');
  assert.equal(HINTS.verbStemHint('sehen', 'sieht').args[0], 'e → ie');
  assert.equal(HINTS.verbStemHint('lesen', 'liest').args[0], 'e → ie');
  assert.equal(HINTS.verbStemHint('geben', 'gibt').args[0], 'e → i');
  assert.equal(HINTS.verbStemHint('nehmen', 'nimmt').args[0], 'e → i');
  assert.equal(HINTS.verbStemHint('sprechen', 'spricht').args[0], 'e → i');
});

test('verbStemHint: regular / missing present → no hint', () => {
  assert.equal(HINTS.verbStemHint('machen', 'macht'), null);
  assert.equal(HINTS.verbStemHint('arbeiten', 'arbeitet'), null);
  assert.equal(HINTS.verbStemHint('lernen', undefined), null);
  assert.equal(HINTS.verbStemHint('wissen', 'weiß'), null, 'stem already has i → not a du/er vowel shift');
});

/* ---------- locale: the three keys render localized strings in every language ---------- */
test('hint_* keys produce localized strings in en/ru/ua', () => {
  const r = loadPage({ extraFiles: ['locales/en.js', 'locales/ru.js', 'locales/ua.js'], exports: ['LOCALE_EN', 'LOCALE_RU', 'LOCALE_UA'] });
  for (const loc of [r.LOCALE_EN, r.LOCALE_RU, r.LOCALE_UA]) {
    assert.match(loc.ui.hint_article('ung', 'die', 'die Wohnung'), /ung[\s\S]*die Wohnung/);
    assert.equal(typeof loc.ui.hint_plural('er', 'das Kind → die Kinder'), 'string');
    assert.ok(loc.ui.hint_plural('er_umlaut', 'x').length > 0, 'every plural class renders');
    assert.match(loc.ui.hint_verb('a → ä', 'fahren → er fährt'), /a → ä/);
  }
});

/* ---------- integration: the trainers show the hint on a miss (and only then) ---------- */
function vocab() { return loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['VocabTrainer'] }); }

/* Replace the current session with a single crafted card so the assertion is deterministic. */
function stageCard(VT, card) {
  VT.startSession({ type: 'week', week: 1 });
  const s = VT.state.session;
  s.pos = 0; s.queue = [card]; s.uniqueTotal = 1;
  return s;
}

test('article miss paints a localized rule hint; a hit does not', () => {
  const t = vocab();
  stageCard(t.VocabTrainer, { week: 1, idx: 0, kind: 'word', de: 'die Wohnung', ru: 'flat', mode: 'article', requeued: false, firstTry: null });
  t.VocabTrainer.chooseArticle('der');   // wrong (correct: die)
  let html = t.app.innerHTML;
  assert.match(html, /rule-hint/, 'a hint block is painted on a miss');
  assert.match(html, /-ung/, 'the matched suffix is named');
  assert.match(html, /die Wohnung/, 'a German example is shown');

  const t2 = vocab();
  stageCard(t2.VocabTrainer, { week: 1, idx: 0, kind: 'word', de: 'die Wohnung', ru: 'flat', mode: 'article', requeued: false, firstTry: null });
  t2.VocabTrainer.chooseArticle('die');  // correct
  assert.doesNotMatch(t2.app.innerHTML, /rule-hint/, 'no hint on a correct answer');
});

test('a rule-less article miss paints NO hint', () => {
  const t = vocab();
  stageCard(t.VocabTrainer, { week: 1, idx: 0, kind: 'word', de: 'der Tisch', ru: 'table', mode: 'article', requeued: false, firstTry: null });
  t.VocabTrainer.chooseArticle('die');   // wrong, but "Tisch" has no teachable suffix
  assert.doesNotMatch(t.app.innerHTML, /rule-hint/);
});

test('plural miss paints the plural-formation rule', () => {
  const t = vocab();
  stageCard(t.VocabTrainer, { week: 1, idx: 0, kind: 'plural', de: 'das Kind', ru: 'child', pl: 'die Kinder', mode: 'pl_choose', options: ['die Kinds', 'die Kinder', 'die Kinden'], requeued: false, firstTry: null });
  t.VocabTrainer.choosePlural(0);        // 'die Kinds' — wrong
  const html = t.app.innerHTML;
  assert.match(html, /rule-hint/);
  assert.match(html, /-er/);
  assert.match(html, /das Kind → die Kinder/);
});

test('verb conjug miss paints the present-tense stem-change rule', () => {
  const t = loadPage({ page: 'verbs.html', extraFiles: ['locales/en.js'], exports: ['VerbsTrainer'] });
  t.VerbsTrainer.startSession({ type: 'filter', filter: 'all' });
  const s = t.VerbsTrainer.state.session;
  s.pos = 0; s.uniqueTotal = 1;
  s.queue = [{ key: 'fahren', mode: 'conjug', clozeField: null, person: 'er', requeued: false, firstTry: null, val: '', aux: null }];
  t.VerbsTrainer.answer(false);          // missed the du/er form
  const html = t.app.innerHTML;
  assert.match(html, /rule-hint/);
  assert.match(html, /a → ä/);
  assert.match(html, /fahren → er fährt/);
});

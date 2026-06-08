/* tests/helpers.test.js — pure string/word helpers used by the vocab trainer.
 * Covers: normalize(), diffChars(), esc(), parseArticle(), availableModes(),
 * deColored(), verbKeyForWord().  These are loaded from vocab.html (today they are
 * inline; after the refactor they move to assets/js/utils.js / leitner.js — the
 * harness loads whichever module defines them, so this test is refactor-stable).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* Values returned from the vm sandbox carry a different realm's prototypes, so deepStrictEqual
 * would reject structurally-identical objects. Normalise plain data with a JSON round-trip. */
const plain = (x) => JSON.parse(JSON.stringify(x));

const v = loadPage({
  page: 'vocab.html',
  extraFiles: ['locales/en.js'],
  exports: ['normalize', 'diffChars', 'esc', 'parseArticle', 'availableModes', 'deColored', 'verbKeyForWord'],
});

test('normalize: lowercases, trims, folds umlauts/ß, collapses spaces', () => {
  assert.equal(v.normalize('  Straße '), 'strasse');
  assert.equal(v.normalize('ÄÖÜ'), 'aeoeue');
  assert.equal(v.normalize('der   Vater'), 'der vater');
  assert.equal(v.normalize('groß'), 'gross');
});

test('esc: escapes the five HTML-sensitive characters', () => {
  assert.equal(v.esc(`<a href="x" id='y'>&`), '&lt;a href=&quot;x&quot; id=&#39;y&#39;&gt;&amp;');
});

test('diffChars: identical strings produce no diff spans', () => {
  const d = v.diffChars('Katze', 'Katze');
  assert.ok(!/diff-bad|diff-miss/.test(d.aHtml));
  assert.ok(!/diff-bad|diff-miss/.test(d.bHtml));
  assert.equal(d.aHtml, 'Katze');
});

test('diffChars: missing chars in b are flagged diff-miss', () => {
  const d = v.diffChars('kat', 'katze');
  assert.match(d.bHtml, /<span class="diff-miss">z<\/span>/);
  assert.match(d.bHtml, /<span class="diff-miss">e<\/span>/);
});

test('diffChars: extra/wrong chars in a are flagged diff-bad', () => {
  const d = v.diffChars('katzee', 'katze');
  assert.match(d.aHtml, /diff-bad/);
});

test('diffChars: case differences are NOT flagged as errors', () => {
  const d = v.diffChars('katze', 'Katze');
  assert.ok(!/diff-bad|diff-miss/.test(d.aHtml));
  assert.ok(!/diff-bad|diff-miss/.test(d.bHtml));
});

test('parseArticle: splits article + core, or null', () => {
  assert.deepEqual(plain(v.parseArticle('die Katze')), { article: 'die', core: 'Katze' });
  assert.deepEqual(plain(v.parseArticle('das große Haus')), { article: 'das', core: 'große Haus' });
  assert.equal(v.parseArticle('gehen'), null);
  assert.equal(v.parseArticle('Hallo'), null);
});

test('availableModes: flashcard always; article only with der/die/das', () => {
  assert.deepEqual(plain(v.availableModes('der Vater')), ['flashcard', 'article', 'spelling']);
  assert.deepEqual(plain(v.availableModes('Hallo')), ['flashcard', 'spelling']);
});

test('availableModes: spelling excluded for multi-word / special-char cores', () => {
  assert.ok(!v.availableModes('die alte Frau').includes('spelling')); // space in core
  assert.ok(!v.availableModes('gehen — gegangen').includes('spelling')); // em dash
  assert.ok(!v.availableModes('a').includes('spelling')); // length < 2
});

test('deColored: wraps the article in a colored span', () => {
  assert.match(v.deColored('der Vater'), /<span class="art der">der<\/span> Vater/);
  assert.equal(v.deColored('Hallo'), 'Hallo');
});

test('verbKeyForWord: resolves vocab words to a master verb key (strips Perfekt)', () => {
  assert.equal(v.verbKeyForWord('gehen — gegangen (sein)'), 'gehen');
  assert.equal(v.verbKeyForWord('Hallo'), null);
});

/* tests/collections.test.js — the Collections page.
 *  • parseDelimited / parseTranslations are pure helpers (CSV / Excel-paste / AI reply parsing).
 *  • render-smoke: the list (empty + populated) and the import editor render without throwing.
 * cloud-sync / ai-config / supabase are shimmed by the harness; the trainer engine and parsers
 * are the real code from collections.html.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* Values built inside the vm sandbox carry the sandbox realm's prototype → re-hydrate before
   structural comparison (deepStrictEqual checks prototype identity). */
const plain = (o) => JSON.parse(JSON.stringify(o));

const p = loadPage({
  page: 'collections.html',
  extraFiles: ['locales/en.js'],
  exports: ['parseDelimited', 'parseTranslations', 'colAvailableModes', 'renderFlashcard', 'render', 'state'],
});

test('parseDelimited: comma CSV with header + blank lines', () => {
  const rows = p.parseDelimited('German,Translation\nder Tisch,table\n\ndie Lampe,lamp\n');
  assert.deepEqual(plain(rows), [
    { de: 'der Tisch', tr: 'table', note: '' },
    { de: 'die Lampe', tr: 'lamp', note: '' },
  ]);
});

test('parseDelimited: semicolon CSV (no translation column)', () => {
  const rows = p.parseDelimited('das Haus;\nder Hund');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].de, 'das Haus');
  assert.equal(rows[0].tr, '');
  assert.equal(rows[1].de, 'der Hund');
});

test('parseDelimited: tab-separated (Excel paste)', () => {
  const rows = p.parseDelimited('der Tisch\ttable\ndie Katze\tcat');
  assert.deepEqual(plain(rows.map(r => [r.de, r.tr])), [['der Tisch', 'table'], ['die Katze', 'cat']]);
});

test('parseDelimited: quoted comma inside a CSV field', () => {
  const rows = p.parseDelimited('"der Wagen","car, auto"');
  assert.equal(rows[0].de, 'der Wagen');
  assert.equal(rows[0].tr, 'car, auto');
});

test('parseTranslations: JSON array, fenced JSON, and line-split fallback', () => {
  assert.deepEqual(plain(p.parseTranslations('["table","lamp"]', 2)), ['table', 'lamp']);
  assert.deepEqual(plain(p.parseTranslations('```json\n["a","b"]\n```', 2)), ['a', 'b']);
  assert.deepEqual(plain(p.parseTranslations('1. table\n2. lamp', 2)), ['table', 'lamp']);
});

test('colAvailableModes: spelling only with a translation; article only with der/die/das', () => {
  assert.deepEqual(plain(p.colAvailableModes({ de: 'der Tisch', tr: 'table' }).sort()), ['article', 'flashcard', 'spelling']);
  assert.deepEqual(plain(p.colAvailableModes({ de: 'der Tisch', tr: '' }).sort()), ['article', 'flashcard']); // no tr → no spelling
  assert.deepEqual(plain(p.colAvailableModes({ de: 'gehen', tr: 'to go' }).sort()), ['flashcard', 'spelling']); // no article
});

test('render: empty list shows the empty state', () => {
  p.state.collections = [];
  p.state.view = 'list';
  p.state.session = null;
  p.render();
  assert.ok(p.app.innerHTML.length > 300);
  assert.match(p.app.innerHTML, /col-empty/);
});

test('render: a populated list shows the collection name and train buttons', () => {
  p.state.collections = [{ id: 'c1', name: 'Kitchen', words: [{ id: 'w1', de: 'der Tisch', tr: 'table' }], mastery: {} }];
  p.state.view = 'list';
  p.state.session = null;
  p.render();
  assert.match(p.app.innerHTML, /Kitchen/);
  assert.match(p.app.innerHTML, /startSession\('c1','due'\)/);
});

test('flashcard audio onclick escapes the German string (no attribute-breaking quote)', () => {
  const html = p.renderFlashcard({ de: 'der Tisch', ru: 'table', mode: 'flashcard' }, { revealed: false });
  assert.match(html, /speakDe\(&quot;/);          // string passed via &quot;-escaped quotes
  assert.doesNotMatch(html, /onclick="speakDe\("/); // never a raw " that would terminate the attribute
});

test('render: import editor shows the paste area', () => {
  p.state.draft = { id: 'd1', name: '', rows: [] };
  p.state.view = 'import';
  p.state.session = null;
  p.render();
  assert.match(p.app.innerHTML, /pasteArea/);
});

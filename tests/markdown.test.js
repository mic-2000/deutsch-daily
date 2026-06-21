/* tests/markdown.test.js — the AI-chat markdown renderer (assets/js/markdown.js, shared by the
 * planner's AI Lehrer chat and the /today wizard). Covers escHtml(), inlineMd(), renderMdTable(),
 * renderMd(). Loaded here via planner.html (which loads the module); the harness picks up the
 * top-level functions either way. Security-relevant: all content must be HTML-escaped before inline
 * markup is applied.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

const p = loadPage({
  page: 'planner.html',
  extraFiles: ['locales/en.js'],
  exports: ['escHtml', 'inlineMd', 'renderMdTable', 'renderMd'],
});

test('escHtml: escapes &, <, >, "', () => {
  assert.equal(p.escHtml('<b> & "x"'), '&lt;b&gt; &amp; &quot;x&quot;');
});

test('inlineMd: bold / italic / code, with content escaped first', () => {
  assert.equal(p.inlineMd('**bold**'), '<strong>bold</strong>');
  assert.equal(p.inlineMd('*it*'), '<em>it</em>');
  assert.equal(p.inlineMd('`code`'), '<code>code</code>');
  // injection attempt is neutralised
  assert.equal(p.inlineMd('<script>'), '&lt;script&gt;');
});

test('inlineMd: markdown links become clickable anchors (new tab, noopener)', () => {
  const h = p.inlineMd('see [the docs](https://example.com/a)');
  assert.match(h, /<a href="https:\/\/example\.com\/a" target="_blank" rel="noopener noreferrer">the docs<\/a>/);
});

test('inlineMd: bare URLs are auto-linked, trailing punctuation kept outside', () => {
  const h = p.inlineMd('visit https://example.com.');
  assert.match(h, /<a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">https:\/\/example\.com<\/a>\./);
});

test('inlineMd: unsafe link protocols are not turned into anchors', () => {
  const h = p.inlineMd('[x](javascript:alert(1))');
  assert.ok(!/<a /.test(h), 'javascript: link must not produce an anchor');
});

test('renderMd: headings map #..#### to <h3>..<h6>', () => {
  assert.match(p.renderMd('# Title'), /<h3 class="ai-h">Title<\/h3>/);
  assert.match(p.renderMd('#### Deep'), /<h6 class="ai-h">Deep<\/h6>/);
});

test('renderMd: horizontal rule', () => {
  assert.match(p.renderMd('---'), /<hr class="ai-hr">/);
});

test('renderMd: unordered and ordered lists', () => {
  assert.match(p.renderMd('- one\n- two'), /<ul class="ai-ul"><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(p.renderMd('1. a\n2. b'), /<li>a<\/li>/);
});

test('renderMd: GFM table → ai-table with th header row', () => {
  const html = p.renderMd('| A | B |\n| --- | --- |\n| 1 | 2 |');
  assert.match(html, /<table class="ai-table">/);
  assert.match(html, /<th>A<\/th><th>B<\/th>/);
  assert.match(html, /<td>1<\/td><td>2<\/td>/);
  // the separator row is dropped
  assert.ok(!/<td>---<\/td>/.test(html));
});

test('renderMdTable: returns empty string when there are no data rows', () => {
  assert.equal(p.renderMdTable(['| --- | --- |']), '');
});

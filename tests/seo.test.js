/* tests/seo.test.js — source-level guards for the SEO technical baseline (DEV-11).
 *
 * Acceptance criteria encoded here:
 *   • index.html carries canonical/OG/Twitter/JSON-LD tags for rich link previews
 *   • robots.txt allows the public site and disallows the authenticated app views
 *   • sitemap.xml lists the indexable public routes
 *   • manifest.webmanifest start_url points at the primary CTA (/today)
 *   • sw.js precaches the new social-preview asset
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('index.html has canonical + OG + Twitter card tags', () => {
  const src = read('index.html');
  assert.match(src, /<link rel="canonical" href="https:\/\/[^"]+\/">/, 'canonical link present');
  assert.match(src, /<meta property="og:title" content="[^"]+">/, 'og:title present');
  assert.match(src, /<meta property="og:description" content="[^"]+">/, 'og:description present');
  assert.match(src, /<meta property="og:url" content="https:\/\/[^"]+">/, 'og:url present');
  assert.match(src, /<meta property="og:image" content="https:\/\/[^"]+\/assets\/social-preview\.png">/, 'og:image points at the published preview');
  assert.match(src, /<meta name="twitter:card" content="summary_large_image">/, 'twitter:card present');
  assert.match(src, /<meta name="twitter:image" content="https:\/\/[^"]+">/, 'twitter:image present');
});

test('index.html has a valid JSON-LD block with WebApplication + FAQPage', () => {
  const src = read('index.html');
  const m = src.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(m, 'JSON-LD script block present');
  const data = JSON.parse(m[1]);
  const types = data['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('WebApplication'), 'graph includes WebApplication');
  assert.ok(types.includes('FAQPage'), 'graph includes FAQPage');
  const faq = data['@graph'].find((n) => n['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 8, 'FAQPage mirrors all 8 landing FAQ entries');
  for (const q of faq.mainEntity) {
    assert.equal(q['@type'], 'Question');
    assert.ok(q.name, 'question has a name');
    assert.ok(q.acceptedAnswer && q.acceptedAnswer.text, 'question has an answer');
  }
});

test('social-preview.png is published under /assets (not just docs/)', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'assets/social-preview.png')), 'assets/social-preview.png exists');
});

test('robots.txt allows the public site and blocks the authenticated app views', () => {
  const src = read('robots.txt');
  assert.match(src, /Allow: \//, 'allows the root');
  for (const view of ['/login', '/welcome', '/today', '/planner', '/vocab', '/verbs', '/collections', '/settings']) {
    assert.match(src, new RegExp('Disallow: ' + view.replace('/', '\\/') + '\\b'), `disallows ${view}`);
  }
  assert.match(src, /Sitemap: https:\/\/[^\s]+\/sitemap\.xml/, 'points at the sitemap');
});

test('sitemap.xml lists the indexable public routes', () => {
  const src = read('sitemap.xml');
  assert.match(src, /<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/, 'valid sitemap namespace');
  assert.match(src, /<loc>https:\/\/[^<]+\/<\/loc>/, 'lists the landing page');
  assert.match(src, /<loc>https:\/\/[^<]+\/privacy<\/loc>/, 'lists /privacy');
  assert.match(src, /<loc>https:\/\/[^<]+\/terms<\/loc>/, 'lists /terms');
});

test('authenticated app views carry noindex (robots.txt is defense-in-depth, not the only guard)', () => {
  for (const view of ['today', 'planner', 'vocab', 'verbs', 'collections', 'settings', 'welcome', 'login']) {
    const src = read(`views/${view}.html`);
    assert.match(src, /<meta name="robots" content="noindex">/, `views/${view}.html has noindex`);
  }
});

test('manifest start_url points at the primary CTA (/today)', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.start_url, '/today');
});

test('sw.js precaches the new social-preview asset', () => {
  const sw = read('sw.js');
  assert.ok(sw.includes("'/assets/social-preview.png'"), 'SHELL_ASSETS includes the social preview image');
});

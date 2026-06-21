/* tests/ui-refactor.test.js — source-level guards for the single-site UI refactor.
 *
 * Acceptance criteria encoded here:
 *   • app pages live in views/ (only the login index.html stays at the repo root)
 *   • every page references assets/data/locales with ROOT-ABSOLUTE paths (so they work
 *     from /views/* and from the pretty-URL rewrites alike)
 *   • each page sets data-theme synchronously in <head> BEFORE the blocking Supabase CDN
 *     script — this is what kills the dark-theme flash (FOUC)
 *   • the header is a single shared builder (appHeader) and navigation uses pretty URLs
 *     (no *.html inter-page links anywhere)
 *   • vercel.json maps the pretty URLs to views/*.html; i18n loads locales root-absolute
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadPage } = require('./harness');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const APP_PAGES = ['views/planner.html', 'views/vocab.html', 'views/verbs.html', 'views/collections.html'];

test('app pages live in views/ and only index.html remains at the repo root', () => {
  for (const p of APP_PAGES) assert.ok(fs.existsSync(path.join(ROOT, p)), `${p} should exist`);
  assert.ok(fs.existsSync(path.join(ROOT, 'index.html')), 'index.html stays at root');
  for (const stray of ['planner.html', 'vocab.html', 'verbs.html', 'collections.html', 'auth.html']) {
    assert.ok(!fs.existsSync(path.join(ROOT, stray)), `${stray} should no longer be at the root`);
  }
});

test('every app page references assets/data with root-absolute paths', () => {
  for (const p of APP_PAGES) {
    const src = read(p);
    assert.ok(!/(src|href)="assets\//.test(src), `${p} still has a relative assets/ path`);
    assert.ok(!/(src|href)="data\//.test(src), `${p} still has a relative data/ path`);
    assert.match(src, /src="\/assets\/js\/header\.js"/, `${p} should load the shared header module`);
  }
});

test('index.html references assets with root-absolute paths', () => {
  const src = read('index.html');
  assert.ok(!/(src|href)="assets\//.test(src), 'index.html still has a relative assets/ path');
});

test('[FOUC] each page sets data-theme in <head> before the Supabase CDN script', () => {
  for (const p of [...APP_PAGES, 'index.html']) {
    const src = read(p);
    const themeIdx = src.indexOf("setAttribute('data-theme'");
    const cdnIdx = src.indexOf('cdn.jsdelivr.net/npm/@supabase');
    assert.ok(themeIdx > -1, `${p} is missing the inline data-theme bootstrap`);
    assert.ok(cdnIdx > -1, `${p} should load the Supabase CDN`);
    assert.ok(themeIdx < cdnIdx, `${p} must set data-theme before the blocking CDN script`);
  }
});

test('navigation uses pretty URLs — no *.html inter-page links anywhere', () => {
  const files = [...APP_PAGES, 'index.html', 'assets/js/header.js', 'assets/js/cloud-sync.js'];
  for (const f of files) {
    const src = read(f);
    for (const page of ['planner', 'vocab', 'verbs', 'collections']) {
      assert.ok(!src.includes(`href="${page}.html"`), `${f} links to ${page}.html`);
      assert.ok(!src.includes(`'${page}.html'`), `${f} navigates to ${page}.html`);
    }
    assert.ok(!src.includes("'index.html'"), `${f} navigates to index.html (should be '/')`);
  }
});

test('header is shared: appHeader renders the nav tabs with pretty URLs', () => {
  const v = loadPage({ page: 'views/vocab.html', extraFiles: ['locales/en.js'], exports: ['appHeader'] });
  assert.equal(typeof v.appHeader, 'function', 'appHeader should be a global from header.js');
  const html = v.appHeader('vocab', { cat: 'vocab_title_cat', h1: 'X', subtitle: 'vocab_subtitle' });
  for (const href of ['/today', '/planner', '/vocab', '/verbs', '/collections']) {
    assert.ok(html.includes(`href="${href}"`), `header should link to ${href}`);
  }
  assert.match(html, /nav-tab active" href="\/vocab"/, 'active tab marks the current page');
});

test('vercel.json maps the pretty URLs to views/*.html', () => {
  const cfg = JSON.parse(read('vercel.json'));
  const map = Object.fromEntries((cfg.rewrites || []).map((r) => [r.source, r.destination]));
  assert.equal(map['/today'], '/views/today.html');
  assert.equal(map['/planner'], '/views/planner.html');
  assert.equal(map['/vocab'], '/views/vocab.html');
  assert.equal(map['/verbs'], '/views/verbs.html');
  assert.equal(map['/collections'], '/views/collections.html');
});

test('i18n loadLocale fetches locales with a root-absolute path', () => {
  assert.match(read('assets/js/i18n.js'), /s\.src = '\/locales\/'/);
});

test('unified width: planner no longer overrides the shared container width', () => {
  const planner = read('assets/css/planner.css');
  assert.ok(!/\.container\s*\{\s*max-width:\s*820px/.test(planner), 'planner.css should not pin a 820px container');
  const base = read('assets/css/base.css');
  assert.match(base, /--page-max:\s*920px/, 'base.css defines the shared --page-max token');
  assert.match(base, /\.container\s*\{[^}]*max-width:\s*var\(--page-max\)/, '.container uses --page-max');
});

test('app pages paint the shell early so the header does not blank on section switch', () => {
  for (const page of ['views/planner.html', 'views/vocab.html', 'views/verbs.html', 'views/collections.html']) {
    assert.match(
      read(page),
      /loadLocale\(getLang\(\)\)\.then\(\s*\(\)\s*=>\s*\{[^}]*render\(\)/,
      `${page} should early-render the shell before initApp()`,
    );
  }
});

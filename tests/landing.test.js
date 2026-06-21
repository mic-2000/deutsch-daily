/* tests/landing.test.js — guards the public landing page + the landing/login split.
 *
 * Acceptance criteria encoded here:
 *   • index.html is the PUBLIC LANDING (its own landing.css; no cloud-sync/header/data)
 *   • guests are routed to /login (register CTAs deep-link ?mode=register; no *.html links)
 *   • the FOUC theme bootstrap still runs before the Supabase CDN on the landing
 *   • the login form moved to views/login.html (mapped at /login) and supports ?mode/?email
 *   • protected pages bounce guests to /login; the SW precaches the new routes/asset
 *   • every lp_* copy key exists in all three locales
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadPage } = require('./harness');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('index.html is the public landing (landing.css; no cloud-sync/header/data)', () => {
  const src = read('index.html');
  assert.match(src, /href="\/assets\/css\/landing\.css"/, 'loads landing.css');
  assert.ok(!src.includes('/assets/js/cloud-sync.js'), 'landing should not load cloud-sync.js');
  assert.ok(!src.includes('/assets/js/header.js'), 'landing should not load header.js');
  assert.ok(!/src="\/data\//.test(src), 'landing should not load data/ files');
  assert.match(src, /T\('lp_hero_title'\)/, 'marketing copy comes from T(lp_*) keys');
});

test('landing routes guests to /login (login + register CTAs, no *.html links)', () => {
  const src = read('index.html');
  assert.ok(src.includes('href="/login"'), 'has a "Log in" link to /login');
  assert.ok(src.includes('/login?mode=register'), 'register CTA deep-links to register mode');
  for (const page of ['planner', 'vocab', 'verbs', 'collections']) {
    assert.ok(!src.includes(`${page}.html`), `landing should not link to ${page}.html`);
  }
  assert.ok(!src.includes("'index.html'"), 'landing should not navigate to index.html');
});

test('[FOUC] landing sets data-theme before the Supabase CDN script', () => {
  const src = read('index.html');
  const themeIdx = src.indexOf("setAttribute('data-theme'");
  const cdnIdx = src.indexOf('cdn.jsdelivr.net/npm/@supabase');
  assert.ok(themeIdx > -1, 'landing is missing the inline data-theme bootstrap');
  assert.ok(cdnIdx > -1, 'landing should load the Supabase CDN');
  assert.ok(themeIdx < cdnIdx, 'data-theme must be set before the blocking CDN script');
});

test('login form moved to views/login.html, mapped at /login, supports ?mode/?email', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'views/login.html')), 'views/login.html exists');
  const cfg = JSON.parse(read('vercel.json'));
  const map = Object.fromEntries((cfg.rewrites || []).map((r) => [r.source, r.destination]));
  assert.equal(map['/login'], '/views/login.html', 'vercel.json maps /login → views/login.html');
  const src = read('views/login.html');
  assert.match(src, /URLSearchParams/, 'reads query params');
  assert.match(src, /mode.*register/, 'supports ?mode=register');
  assert.match(src, /prefillEmail/, 'supports ?email prefill');
  assert.match(src, /href="\/"/, 'has a back-to-home link');
});

test('protected pages bounce guests to /login', () => {
  assert.match(read('assets/js/cloud-sync.js'), /location\.href = '\/login'/, 'initApp redirects to /login');
});

test('service worker precaches the landing + /login route and landing.css (version bumped)', () => {
  const sw = read('sw.js');
  assert.ok(sw.includes("'/login'"), 'precache the /login route');
  assert.ok(sw.includes('/assets/css/landing.css'), 'precache landing.css');
  assert.ok(!/const VERSION = 'v2'/.test(sw), 'VERSION must be bumped past v2 so caches refresh');
});

test('landing copy keys exist in every locale', () => {
  const r = loadPage({
    extraFiles: ['locales/en.js', 'locales/ru.js', 'locales/ua.js'],
    exports: ['LOCALE_EN', 'LOCALE_RU', 'LOCALE_UA'],
  });
  const sample = ['lp_login', 'lp_register', 'lp_hero_title', 'lp_faq_8_a', 'lp_foot_btn', 'auth_back_home'];
  for (const [lang, loc] of [['en', r.LOCALE_EN], ['ru', r.LOCALE_RU], ['ua', r.LOCALE_UA]]) {
    for (const k of sample) assert.ok(k in loc.ui, `${lang}.ui.${k} is missing`);
  }
});

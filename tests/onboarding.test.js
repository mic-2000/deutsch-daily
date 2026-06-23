/* tests/onboarding.test.js — the first-run onboarding wizard (/welcome) + the cloud-sync gate.
 *
 * Part A (page harness): /welcome renders the questions screen with the chip groups and no raw keys.
 * Part B (cloud-sync eval, like outbox.test.js): initApp() gates a BRAND-NEW account (no progress
 *   row) to /welcome, leaves existing users alone, never loops on /welcome, and never gates on an
 *   offline read; it also loads the `onboarding` column into the `userOnboarding` global.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadPage } = require('./harness');

/* ---------------- Part A: /welcome render-smoke ---------------- */
test('welcome: renders the question chips with translations resolved, no raw keys', () => {
  const w = loadPage({ page: 'welcome.html', extraFiles: ['locales/en.js'], exports: ['render'] });
  w.render();
  const html = w.app.innerHTML;
  assert.ok(html.length > 500, 'markup is substantial');
  assert.match(html, /onb-chips/, 'chip groups rendered');
  assert.match(html, /Goethe B1 exam/, 'goal option label resolved');
  assert.match(html, /A1/, 'level option present');
  assert.doesNotMatch(html, /onb_[a-z_]+/, 'no raw onb_* keys leaked into markup');
});

/* ---------------- Part B: the new-user gate in cloud-sync.initApp ---------------- */
const SRC = fs.readFileSync(path.join(__dirname, '..', 'assets/js/cloud-sync.js'), 'utf8');

// Run initApp() with a mock Supabase whose main read (maybeSingle) returns `mainData`, on a page at
// `pathname`. Returns the captured redirect target (location.href) and the userOnboarding global.
async function runInit({ mainData, pathname }) {
  const store = new Map();
  const session = { user: { id: 'user-1' } };
  const proto = {
    select() { return this; }, eq() { return this; },
    maybeSingle() { return Promise.resolve({ data: mainData, error: null }); },
    single() { return Promise.resolve({ data: null, error: null }); },
    upsert() { return Promise.resolve({ error: null }); },
  };
  const sb = { from() { return Object.create(proto); }, auth: { getSession: async () => ({ data: { session } }) } };
  const location = { pathname, _href: '', get href() { return this._href; }, set href(v) { this._href = v; } };
  const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };

  const sandbox = {
    console, sb, localStorage, location, Date, JSON, Object,
    LANG_NAMES: { en: 'EN', ua: 'UA', ru: 'RU' },
    getLang: () => 'en', setLang: async () => {}, loadLocale: async () => {},
    render: () => {}, showToast: () => {}, T: (k) => k,
    CLOUD_FIELD: 'planner_data', getCloudPayload: () => ({}), applyCloudData: () => {},
    window: { addEventListener() {} }, document: { addEventListener() {}, hidden: false },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const epilogue = '\n;globalThis.__initApp = initApp; globalThis.__getOnb = () => userOnboarding;';
  vm.runInContext(SRC + epilogue, sandbox, { filename: 'cloud-sync.js' });
  await sandbox.__initApp();
  return { redirect: location._href, onboarding: sandbox.__getOnb() };
}

test('a brand-new account (no progress row) is gated to /welcome', async () => {
  const r = await runInit({ mainData: null, pathname: '/planner' });
  assert.equal(r.redirect, '/welcome');
});

test('an existing user (row present) is NOT gated, and userOnboarding is loaded', async () => {
  const r = await runInit({ mainData: { planner_data: { currentDay: 3 }, lang: 'en', onboarding: { done: true, goal: 'work' } }, pathname: '/planner' });
  assert.equal(r.redirect, '', 'no redirect for an existing user');
  assert.equal(r.onboarding.done, true, 'onboarding column loaded into the global');
  assert.equal(r.onboarding.goal, 'work');
});

test('/welcome itself is never gated (no redirect loop)', async () => {
  const r = await runInit({ mainData: null, pathname: '/welcome' });
  assert.equal(r.redirect, '', 'the wizard page is excluded from the gate');
});

test('an existing user with an empty onboarding column is not gated (grandfathered)', async () => {
  const r = await runInit({ mainData: { planner_data: {}, lang: 'en', onboarding: {} }, pathname: '/vocab' });
  assert.equal(r.redirect, '', 'a row exists → never gated, regardless of onboarding flag');
});

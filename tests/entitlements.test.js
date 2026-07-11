/* tests/entitlements.test.js — the `entitlements` table + client-side plan flag (DEV-2).
 *
 * cloud-sync.js is network/auth-bound, so the page harness shims it (like outbox.test.js /
 * onboarding.test.js). Here we eval the REAL module in a sandbox and assert:
 *   Part A — hasPremium() pure logic: lifetime always true, premium true until current_period_end,
 *            free/missing-plan false, expired premium false.
 *   Part B — initApp() loads the `entitlements` row into userPlan (no row → stays free; a read
 *            error, e.g. offline or a pre-DEV-2 database without the table, never throws).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'assets/js/cloud-sync.js'), 'utf8');

/* Objects built inside the vm sandbox carry the sandbox realm's prototype, which trips
 * deepStrictEqual's prototype check (like outbox.test.js). Re-hydrate in this realm first. */
const plain = (o) => JSON.parse(JSON.stringify(o));

/* ---------------- Part A: hasPremium() pure logic ---------------- */
function makePlanEnv() {
  const sandbox = { console, Date };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const epilogue = '\n;globalThis.__setPlan = (p) => { userPlan = p; }; globalThis.__hasPremium = hasPremium;';
  vm.runInContext(SRC + epilogue, sandbox, { filename: 'cloud-sync.js' });
  return { setPlan: sandbox.__setPlan, hasPremium: sandbox.__hasPremium };
}

test('hasPremium: default (no purchase) is free', () => {
  const env = makePlanEnv();
  assert.equal(env.hasPremium(), false);
});

test('hasPremium: lifetime is always true, regardless of current_period_end', () => {
  const env = makePlanEnv();
  env.setPlan({ plan: 'lifetime', status: 'active', currentPeriodEnd: null });
  assert.equal(env.hasPremium(), true);
  env.setPlan({ plan: 'lifetime', status: 'cancelled', currentPeriodEnd: '2020-01-01T00:00:00Z' });
  assert.equal(env.hasPremium(), true, 'a past current_period_end never demotes lifetime');
});

test('hasPremium: premium with a future current_period_end is true', () => {
  const env = makePlanEnv();
  const future = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  env.setPlan({ plan: 'premium', status: 'active', currentPeriodEnd: future });
  assert.equal(env.hasPremium(), true);
});

test('hasPremium: premium with no current_period_end (mid-cycle / not yet stamped) is true', () => {
  const env = makePlanEnv();
  env.setPlan({ plan: 'premium', status: 'active', currentPeriodEnd: null });
  assert.equal(env.hasPremium(), true);
});

test('hasPremium: premium whose current_period_end has passed is false (expired → free)', () => {
  const env = makePlanEnv();
  const past = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  env.setPlan({ plan: 'premium', status: 'active', currentPeriodEnd: past });
  assert.equal(env.hasPremium(), false);
});

test('hasPremium: plan "free" is false even with a (nonsensical) future current_period_end', () => {
  const env = makePlanEnv();
  const future = new Date(Date.now() + 1000).toISOString();
  env.setPlan({ plan: 'free', status: 'active', currentPeriodEnd: future });
  assert.equal(env.hasPremium(), false);
});

/* ---------------- Part B: initApp() loads the entitlements row into userPlan ---------------- */
// An existing, already-onboarded user (onbVersion way ahead of any real bump) so cloud-sync's
// new-user / re-onboarding gate never fires and redirects before the entitlements query runs.
const EXISTING_USER = {
  planner_data: { courseVersion: 2, currentDay: 1, completed: {} },
  lang: 'en',
  onboarding: { done: true, onbVersion: 999999 },
};

// Run initApp() with a mock Supabase whose `entitlements` row (or read error) is configurable.
// Mirrors tests/onboarding.test.js's runInit, branching sb.from(table) by table name so the
// `entitlements` .single() can return data independently of the `progress` .maybeSingle() read.
async function runInit({ entitlementsData = null, entitlementsError = null, mainData = EXISTING_USER } = {}) {
  const session = { user: { id: 'user-1' } };
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const location = { pathname: '/planner', _href: '', get href() { return this._href; }, set href(v) { this._href = v; } };

  const sb = {
    from(table) {
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: () => Promise.resolve({ data: table === 'progress' ? mainData : null, error: null }),
        single: () => {
          if (table === 'entitlements') {
            return Promise.resolve(entitlementsError
              ? { data: null, error: entitlementsError }
              : { data: entitlementsData, error: null });
          }
          return Promise.resolve({ data: null, error: null }); // theme / deletion_requested_at — untested here
        },
        upsert: () => Promise.resolve({ error: null }),
      };
    },
    auth: { getSession: async () => ({ data: { session } }) },
  };

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
  const epilogue = '\n;globalThis.__initApp = initApp; globalThis.__getPlan = () => userPlan; globalThis.__hasPremium = hasPremium;';
  vm.runInContext(SRC + epilogue, sandbox, { filename: 'cloud-sync.js' });
  await sandbox.__initApp();
  return { plan: sandbox.__getPlan(), hasPremium: sandbox.__hasPremium };
}

test('initApp: no entitlements row → userPlan stays at the free default', async () => {
  const r = await runInit({ entitlementsData: null });
  assert.deepEqual(plain(r.plan), { plan: 'free', status: 'active', currentPeriodEnd: null });
  assert.equal(r.hasPremium(), false);
});

test('initApp: an active premium row is loaded into userPlan and hasPremium() flips true', async () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const r = await runInit({ entitlementsData: { plan: 'premium', status: 'active', current_period_end: future } });
  assert.equal(r.plan.plan, 'premium');
  assert.equal(r.plan.currentPeriodEnd, future);
  assert.equal(r.hasPremium(), true);
});

test('initApp: an expired premium row loads but hasPremium() reads it as free', async () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  const r = await runInit({ entitlementsData: { plan: 'premium', status: 'active', current_period_end: past } });
  assert.equal(r.plan.plan, 'premium', 'the raw row is still loaded (e.g. for a "renew" UI)');
  assert.equal(r.hasPremium(), false, 'but hasPremium() treats the lapsed period as free');
});

test('initApp: a lifetime row never expires regardless of current_period_end', async () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  const r = await runInit({ entitlementsData: { plan: 'lifetime', status: 'active', current_period_end: past } });
  assert.equal(r.hasPremium(), true);
});

test('initApp: an entitlements read error (offline, or a pre-DEV-2 db with no table) never throws — stays free', async () => {
  const r = await runInit({ entitlementsError: { message: 'relation "entitlements" does not exist' } });
  assert.deepEqual(plain(r.plan), { plan: 'free', status: 'active', currentPeriodEnd: null });
  assert.equal(r.hasPremium(), false);
});

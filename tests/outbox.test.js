/* tests/outbox.test.js — offline write queue in cloud-sync.js.
 *
 * cloud-sync.js is network/auth-bound, so the page harness shims it. Here we eval the REAL module
 * in a sandbox with a toggleable mock Supabase client (`state.online`) and assert the outbox:
 *   • online write → goes straight to cloud, nothing parked
 *   • offline write → parked in localStorage['cloud_outbox'] (+ one "offline" toast)
 *   • multiple offline progress writes MERGE into one row
 *   • flushOutbox() replays the merged row / lesson ops when back online, then clears
 *   • lesson upsert-then-delete (same day, offline) collapses to a single delete
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'assets/js/cloud-sync.js'), 'utf8');

/* Objects built inside the vm sandbox carry the sandbox realm's prototype, which trips
 * deepStrictEqual's prototype check. Re-hydrate in this realm before structural comparison. */
const plain = (o) => JSON.parse(JSON.stringify(o));

/* Build a fresh sandbox with the module loaded. `currentUser` is assigned via an epilogue so it
 * binds the module's own `let currentUser` (a sandbox property can't reach a lexical `let`). */
function makeEnv({ online = true } = {}) {
  const store = new Map();
  const calls = [];
  const toasts = [];
  const state = { online };
  const reply = () => (state.online ? { error: null } : { error: { message: 'offline' } });

  const proto = {
    upsert(row, opts) { calls.push({ table: this._t, op: 'upsert', row, opts }); return Promise.resolve(reply()); },
    delete() {
      const self = this;
      const d = { _eqs: {}, eq(k, v) { this._eqs[k] = v; return this; },
        then(res, rej) { calls.push({ table: self._t, op: 'delete', eqs: this._eqs }); return Promise.resolve(reply()).then(res, rej); } };
      return d;
    },
    select() { return this; }, eq() { return this; }, single() { return Promise.resolve({ data: null }); },
  };
  const sb = { from(t) { const b = Object.create(proto); b._t = t; return b; } };

  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };

  const sandbox = {
    console, sb, localStorage, Date,
    CLOUD_FIELD: 'vocab_data',
    getCloudPayload: () => ({ mastery: { a: 1 } }),
    showToast: (m) => toasts.push(m),
    T: (k) => k,
    window: { addEventListener() {} },
    document: { addEventListener() {}, hidden: false },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const epilogue = `\n;currentUser = { id: 'user-1' };
    globalThis.__fns = { saveToCloud, saveLangToCloud, saveThemeToCloud, saveVerbsToCloud,
                         saveGeminiKeyToCloud, saveLessonToCloud, deleteLessonFromCloud, flushOutbox };`;
  vm.runInContext(SRC + epilogue, sandbox, { filename: 'cloud-sync.js' });
  const outbox = () => { const s = store.get('cloud_outbox'); return s ? JSON.parse(s) : null; };
  const seedOutbox = (obj) => store.set('cloud_outbox', JSON.stringify(obj));
  return { fns: sandbox.__fns, calls, toasts, state, outbox, seedOutbox };
}

test('online write goes straight to cloud and parks nothing', async () => {
  const env = makeEnv({ online: true });
  await env.fns.saveToCloud();
  const ups = env.calls.filter((c) => c.table === 'progress' && c.op === 'upsert');
  assert.equal(ups.length, 1);
  assert.deepEqual(ups[0].row.vocab_data, { mastery: { a: 1 } });
  assert.equal(env.outbox(), null, 'outbox stays empty when online');
});

test('offline write is parked in the outbox with one offline toast', async () => {
  const env = makeEnv({ online: false });
  await env.fns.saveToCloud();
  const o = env.outbox();
  assert.ok(o && o.progress, 'progress parked');
  assert.deepEqual(o.progress.vocab_data, { mastery: { a: 1 } });
  assert.equal(o.uid, 'user-1');
  assert.deepEqual(env.toasts, ['toast_offline_saved']);
});

test('multiple offline progress writes merge into one row', async () => {
  const env = makeEnv({ online: false });
  await env.fns.saveToCloud();          // vocab_data
  await env.fns.saveLangToCloud('ua');  // lang
  await env.fns.saveThemeToCloud('dark'); // theme
  const p = env.outbox().progress;
  assert.deepEqual(p.vocab_data, { mastery: { a: 1 } });
  assert.equal(p.lang, 'ua');
  assert.equal(p.theme, 'dark');
  assert.equal(env.toasts.filter((t) => t === 'toast_offline_saved').length, 1, 'offline toast shown once');
});

test('flushOutbox replays the merged row when back online, then clears + restored toast', async () => {
  const env = makeEnv({ online: false });
  await env.fns.saveToCloud();
  await env.fns.saveLangToCloud('ua');
  env.calls.length = 0;
  env.state.online = true;
  await env.fns.flushOutbox();
  const ups = env.calls.filter((c) => c.table === 'progress' && c.op === 'upsert');
  assert.equal(ups.length, 1, 'one merged upsert');
  assert.deepEqual(plain(ups[0].row.vocab_data), { mastery: { a: 1 } });
  assert.equal(ups[0].row.lang, 'ua');
  assert.equal(env.outbox(), null, 'outbox cleared after flush');
  assert.ok(env.toasts.includes('toast_sync_restored'));
});

test('lesson upsert then delete (same day, offline) collapses to a single delete', async () => {
  const env = makeEnv({ online: false });
  await env.fns.saveLessonToCloud(3, [{ role: 'user', text: 'hi' }]);
  await env.fns.deleteLessonFromCloud(3);
  assert.deepEqual(env.outbox().lessons['3'], { op: 'delete' });

  env.calls.length = 0;
  env.state.online = true;
  await env.fns.flushOutbox();
  const lessonCalls = env.calls.filter((c) => c.table === 'lessons');
  assert.equal(lessonCalls.length, 1);
  assert.equal(lessonCalls[0].op, 'delete');
  assert.equal(lessonCalls[0].eqs.day, 3);
  assert.equal(env.outbox(), null);
});

test('gemini key: offline save parks it and merges with other progress fields', async () => {
  const env = makeEnv({ online: false });
  await env.fns.saveGeminiKeyToCloud('AIza-secret');
  await env.fns.saveLangToCloud('en');
  const p = env.outbox().progress;
  assert.equal(p.gemini_key, 'AIza-secret');
  assert.equal(p.lang, 'en');

  env.calls.length = 0;
  env.state.online = true;
  await env.fns.flushOutbox();
  const ups = env.calls.filter((c) => c.table === 'progress' && c.op === 'upsert');
  assert.equal(ups.length, 1);
  assert.equal(ups[0].row.gemini_key, 'AIza-secret');
  assert.equal(env.outbox(), null);
});

test('gemini key: clearing (empty string) is stored as null', async () => {
  const env = makeEnv({ online: true });
  await env.fns.saveGeminiKeyToCloud('');
  const ups = env.calls.filter((c) => c.table === 'progress' && c.op === 'upsert');
  assert.equal(ups.length, 1);
  assert.equal(ups[0].row.gemini_key, null);
});

test('a foreign queue (different uid) is discarded on flush, never written to cloud', async () => {
  const env = makeEnv({ online: true });
  env.seedOutbox({ uid: 'someone-else', progress: { user_id: 'someone-else', lang: 'ru' } });
  await env.fns.flushOutbox();
  assert.equal(env.calls.length, 0, 'no cloud write for a foreign queue');
  assert.equal(env.outbox(), null, 'foreign queue is dropped');
});

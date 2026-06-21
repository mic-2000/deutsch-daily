/* tests/render-smoke.test.js — guards the planner render() decomposition (Phase 3) and the
 * general page wiring. We don't assert exact HTML (it's a full re-render from templates);
 * we assert render() runs without throwing and produces non-empty markup with stable
 * landmarks. After the refactor splits render() into section builders, these must still hold.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

test('planner: render() fills #app with the day card + progress + nav', () => {
  const p = loadPage({ page: 'planner.html', extraFiles: ['locales/en.js'], exports: ['render', 'state', 'DAYS', 'TOTAL_DAYS'] });
  p.render();
  const html = p.app.innerHTML;
  assert.ok(html.length > 500, 'app markup is substantial');
  assert.match(html, /class="/);
  assert.ok(p.TOTAL_DAYS > 0 && Array.isArray(p.DAYS));
});

test('planner: render() at a later day still succeeds', () => {
  const p = loadPage({ page: 'planner.html', extraFiles: ['locales/en.js'], exports: ['render', 'state', 'TOTAL_DAYS'] });
  p.state.viewingDay = Math.min(10, p.TOTAL_DAYS);
  p.state.currentDay = p.state.viewingDay;
  assert.doesNotThrow(() => p.render());
  assert.ok(p.app.innerHTML.length > 500);
});

test('vocab: render() shows the home screen without an active session', () => {
  const v = loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['render', 'state'] });
  v.state.session = null;
  v.render();
  assert.ok(v.app.innerHTML.length > 500);
});

test('verbs: render() shows the home screen without an active session', () => {
  const vb = loadPage({ page: 'verbs.html', extraFiles: ['locales/en.js'], exports: ['render', 'state'] });
  vb.state.session = null;
  vb.render();
  assert.ok(vb.app.innerHTML.length > 500);
});

test('today: render() shows the intro checklist with translations resolved', () => {
  const t = loadPage({ page: 'today.html', extraFiles: ['locales/en.js'], exports: ['render'] });
  t.render();
  const html = t.app.innerHTML;
  assert.ok(html.length > 500, 'app markup is substantial');
  assert.match(html, /nav-tab/, 'shared header/nav rendered');
  assert.doesNotMatch(html, /today_[a-z_]+/, 'no raw today_* keys leaked into markup');
});

test('settings: render() shows the account screen with translations resolved', () => {
  const s = loadPage({ page: 'settings.html', extraFiles: ['locales/en.js'], exports: ['render', 'state'] });
  s.render();
  const html = s.app.innerHTML;
  assert.ok(html.length > 500, 'app markup is substantial');
  // Regression guard: a global-name clash (e.g. redefining i18n's _locale) breaks T()
  // and leaves raw i18n keys in the markup instead of translated text.
  assert.doesNotMatch(html, /settings_[a-z_]+/, 'no raw settings_* keys leaked into markup');
  assert.doesNotMatch(html, /\bauth_[a-z_]+/, 'no raw auth_* keys leaked into markup');
  // The change-password form must expose a current-password input.
  assert.match(html, /id="curPw"/, 'current-password field is rendered');
});

test('settings: changePassword re-authenticates with the current password before updating', async () => {
  // A document whose inputs carry real values, so the handler runs past its guards.
  const fields = {
    curPw: { value: 'oldpass' },
    newPw: { value: 'newpass1' },
    confPw: { value: 'newpass1' },
    pwBtn: { disabled: false },
  };

  function run(signInError) {
    const calls = { signIn: 0, update: 0 };
    const s = loadPage({
      page: 'settings.html',
      extraFiles: ['locales/en.js'],
      exports: ['changePassword'],
      shims: {
        currentUser: { email: 'a@b.c' },
        sb: {
          auth: {
            getSession: async () => ({ data: { session: null } }),
            signInWithPassword: async () => { calls.signIn++; return { error: signInError }; },
            updateUser: async () => { calls.update++; return { error: null }; },
          },
        },
      },
    });
    const origGet = s.sandbox.document.getElementById;
    s.sandbox.document.getElementById = (id) => fields[id] || origGet(id);
    return { s, calls };
  }

  // Wrong current password → re-auth attempted, but the update is blocked.
  const bad = run({ message: 'invalid' });
  await bad.s.changePassword();
  assert.equal(bad.calls.signIn, 1, 're-auth is attempted');
  assert.equal(bad.calls.update, 0, 'password is NOT updated when current password is wrong');

  // Correct current password → re-auth succeeds, then the update runs.
  const ok = run(null);
  await ok.s.changePassword();
  assert.equal(ok.calls.signIn, 1, 're-auth is attempted');
  assert.equal(ok.calls.update, 1, 'password is updated after successful re-auth');
});

test('settings: changePassword blocks the update when the current password is empty', async () => {
  const calls = { signIn: 0, update: 0 };
  const s = loadPage({
    page: 'settings.html',
    extraFiles: ['locales/en.js'],
    exports: ['changePassword'],
    shims: {
      currentUser: { email: 'a@b.c' },
      sb: {
        auth: {
          getSession: async () => ({ data: { session: null } }),
          signInWithPassword: async () => { calls.signIn++; return { error: null }; },
          updateUser: async () => { calls.update++; return { error: null }; },
        },
      },
    },
  });
  const empty = { curPw: { value: '' }, newPw: { value: 'newpass1' }, confPw: { value: 'newpass1' } };
  const origGet = s.sandbox.document.getElementById;
  s.sandbox.document.getElementById = (id) => empty[id] || origGet(id);
  await s.changePassword();
  assert.equal(calls.signIn, 0, 're-auth not attempted without current password');
  assert.equal(calls.update, 0, 'password not updated without current password');
});

test('vocab: confirm modal markup is appended when state.confirm is set', () => {
  const v = loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['render', 'askConfirm', 'state'] });
  v.askConfirm('Reset all?', 'all'); // also calls render()
  assert.match(v.app.innerHTML, /Reset all\?/);
});

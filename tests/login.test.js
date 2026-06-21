/* tests/login.test.js — the sign-in / sign-up / password-recovery form (views/login.html).
 *
 * The page harness shims supabase.js/cloud-sync.js and only persists a #app element, so it
 * can't exercise the login form (which renders into #auth-form and calls sb.auth.*). Like
 * outbox.test.js, this evaluates the page's i18n + inline script directly in a vm with a
 * controllable DOM / Supabase / location, so we can drive render(), toggleMode(), the
 * client-side validation of submit(), and the password-recovery flow.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* All inline <script> blocks of login.html, with the async bootstrap stripped so render()
   only runs when we call it. */
function loginInline() {
  const html = read('views/login.html');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return blocks.join('\n;\n').replace(/loadLocale\(getLang\(\)\)[\s\S]*?\.catch\([^;]*\);/, ';');
}

function build({ search = '', hash = '', store = {} } = {}) {
  const els = {};
  const getEl = (id) =>
    els[id] || (els[id] = { innerHTML: '', value: '', textContent: '', disabled: false, style: {}, focus() {}, addEventListener() {} });
  const toasts = [];
  const calls = { reset: [], update: [], signIn: [], signUp: [] };
  const authCbs = [];
  const map = Object.assign({}, store);
  const sandbox = {
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    URLSearchParams,
    navigator: { language: 'en' },
    location: { href: '', origin: 'https://app.test', search, hash, replace() {}, assign() {} },
    localStorage: {
      getItem: (k) => (k in map ? map[k] : null),
      setItem: (k, v) => { map[k] = String(v); },
      removeItem: (k) => { delete map[k]; },
    },
    document: {
      getElementById: getEl,
      documentElement: { setAttribute() {}, lang: '' },
      createElement: () => ({ onload: null, onerror: null }),
      head: { appendChild() {} },
      addEventListener() {},
    },
    showToast: (m) => toasts.push(m),
    renderThemeToggle: () => '',
    sb: { auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async (a) => { calls.signIn.push(a); return { error: null }; },
      signUp: async (a) => { calls.signUp.push(a); return { error: null }; },
      signInWithOAuth: async () => ({ error: null }),
      resetPasswordForEmail: async (email, opts) => { calls.reset.push({ email, opts }); return { error: null }; },
      updateUser: async (attrs) => { calls.update.push(attrs); return { error: null }; },
      onAuthStateChange: (cb) => { authCbs.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    } },
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

  const code =
    [read('assets/js/i18n.js'), read('locales/en.js'), loginInline()].join('\n;\n') +
    '\n;globalThis.__api={render,toggleMode,submit,showReset,showLogin,sendReset,updatePassword,' +
    'getMode:()=>mode,getPrefill:()=>prefillEmail,T};';
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { api: sandbox.__api, els, toasts, calls, getEl, fireAuth: (ev) => authCbs.forEach((cb) => cb(ev)) };
}

test('render() builds the sign-in form (email + password + submit + Google + register toggle + forgot link)', () => {
  const b = build();
  b.api.render();
  const html = b.els['auth-form'].innerHTML;
  assert.match(html, /id="f-email"/, 'email field');
  assert.match(html, /id="f-password"/, 'password field');
  assert.match(html, /onclick="submit\(\)"/, 'submit handler');
  assert.match(html, /onclick="loginGoogle\(\)"/, 'Google OAuth handler');
  assert.match(html, /onclick="toggleMode\(\)"/, 'mode toggle');
  assert.match(html, /onclick="showReset\(\)"/, 'forgot-password link');
  assert.ok(html.includes(b.api.T('auth_title_login')), 'shows the sign-in title');
  assert.match(html, /href="\/"/, 'has a back-to-home link');
  assert.equal(b.els['auth-subtitle'].textContent, b.api.T('auth_subtitle'), 'localizes the header subtitle');
});

test('?mode=register opens the register form and ?email= prefills the field', () => {
  const b = build({ search: '?mode=register&email=neu@beispiel.de' });
  assert.equal(b.api.getMode(), 'register', 'mode parsed from the query string');
  assert.equal(b.api.getPrefill(), 'neu@beispiel.de', 'email parsed from the query string');
  b.api.render();
  const html = b.els['auth-form'].innerHTML;
  assert.ok(html.includes(b.api.T('auth_title_register')), 'shows the register title');
  assert.ok(html.includes(b.api.T('auth_notice')), 'register mode shows the confirm-email notice');
  assert.equal(b.els['f-email'].value, 'neu@beispiel.de', 'email field is prefilled');
});

test('toggleMode() flips sign-in ↔ register', () => {
  const b = build();
  assert.equal(b.api.getMode(), 'login');
  b.api.toggleMode();
  assert.equal(b.api.getMode(), 'register');
  assert.ok(b.els['auth-form'].innerHTML.includes(b.api.T('auth_title_register')));
  b.api.toggleMode();
  assert.equal(b.api.getMode(), 'login');
});

test('submit() validates empty fields and short passwords before hitting the network', async () => {
  const b = build();
  b.getEl('f-email').value = '';
  b.getEl('f-password').value = '';
  await b.api.submit();
  assert.ok(b.toasts.includes(b.api.T('auth_err_fill')), 'empty fields → fill-in error');

  b.getEl('f-email').value = 'user@example.com';
  b.getEl('f-password').value = '123'; // < 6 chars
  await b.api.submit();
  assert.ok(b.toasts.includes(b.api.T('auth_err_password')), 'short password → password error');
  assert.equal(b.calls.signIn.length, 0, 'never reached the network');
});

/* ---------- password recovery ---------- */

test('showReset() opens the reset form and sendReset() emails a recovery link', async () => {
  const b = build();
  b.api.showReset();
  assert.equal(b.api.getMode(), 'reset');
  const html = b.els['auth-form'].innerHTML;
  assert.match(html, /onclick="sendReset\(\)"/, 'reset submit handler');
  assert.match(html, /id="f-email"/, 'email field');
  assert.ok(html.includes(b.api.T('auth_reset_title')), 'shows the reset title');

  b.getEl('f-email').value = 'me@example.com';
  await b.api.sendReset();
  assert.equal(b.calls.reset.length, 1, 'called resetPasswordForEmail once');
  assert.equal(b.calls.reset[0].email, 'me@example.com', 'with the entered email');
  assert.match(b.calls.reset[0].opts.redirectTo, /\/login$/, 'redirect lands back on /login');
  assert.ok(b.toasts.includes(b.api.T('auth_reset_sent')), 'confirms the email was sent');
  assert.ok(b.els['auth-form'].innerHTML.includes(b.api.T('auth_reset_sent')), 'shows the sent notice');
});

test('sendReset() requires an email', async () => {
  const b = build();
  b.api.showReset();
  b.getEl('f-email').value = '';
  await b.api.sendReset();
  assert.ok(b.toasts.includes(b.api.T('auth_err_fill')), 'empty email → fill-in error');
  assert.equal(b.calls.reset.length, 0, 'no email sent');
});

test('a PASSWORD_RECOVERY event shows the set-new-password form', () => {
  const b = build({ hash: '#access_token=x&type=recovery' });
  b.fireAuth('PASSWORD_RECOVERY');
  assert.equal(b.api.getMode(), 'update');
  const html = b.els['auth-form'].innerHTML;
  assert.match(html, /onclick="updatePassword\(\)"/, 'update submit handler');
  assert.match(html, /id="f-password"/, 'new-password field');
  assert.ok(html.includes(b.api.T('auth_update_title')), 'shows the new-password title');
});

test('updatePassword() validates length, then calls updateUser', async () => {
  const b = build();
  b.fireAuth('PASSWORD_RECOVERY');
  b.getEl('f-password').value = '123'; // < 6
  await b.api.updatePassword();
  assert.ok(b.toasts.includes(b.api.T('auth_err_password')), 'short password rejected');
  assert.equal(b.calls.update.length, 0, 'updateUser not called yet');

  b.getEl('f-password').value = 'brandnew1';
  await b.api.updatePassword();
  assert.equal(b.calls.update.length, 1, 'updateUser called once');
  assert.equal(b.calls.update[0].password, 'brandnew1', 'with the new password');
  assert.ok(b.toasts.includes(b.api.T('auth_pw_updated')), 'confirms the update');
});

test('the login header is a link back to the landing page', () => {
  const src = read('views/login.html');
  assert.match(src, /<a href="\/" class="auth-home"[\s\S]*?<h1>Mein<em>kurs<\/em><\/h1>[\s\S]*?<\/a>/,
    'the brand/header block links to /');
});

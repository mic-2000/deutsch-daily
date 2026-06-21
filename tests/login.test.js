/* tests/login.test.js — the sign-in / sign-up form (views/login.html).
 *
 * The page harness shims supabase.js/cloud-sync.js and only persists a #app element, so it
 * can't exercise the login form (which renders into #auth-form and calls sb.auth.*). Like
 * outbox.test.js, this evaluates the page's i18n + inline script directly in a vm with a
 * controllable DOM / Supabase / location, so we can drive render(), toggleMode() and the
 * client-side validation branches of submit().
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

function build({ search = '', store = {} } = {}) {
  const els = {};
  const getEl = (id) =>
    els[id] || (els[id] = { innerHTML: '', value: '', textContent: '', disabled: false, style: {}, focus() {}, addEventListener() {} });
  const toasts = [];
  const map = Object.assign({}, store);
  const sandbox = {
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    URLSearchParams,
    navigator: { language: 'en' },
    location: { href: '', origin: 'https://app.test', search, replace() {}, assign() {} },
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
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signInWithOAuth: async () => ({ error: null }),
    } },
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

  const code =
    [read('assets/js/i18n.js'), read('locales/en.js'), loginInline()].join('\n;\n') +
    '\n;globalThis.__api={render,toggleMode,submit,getMode:()=>mode,getPrefill:()=>prefillEmail,T};';
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { api: sandbox.__api, els, toasts, getEl };
}

test('render() builds the sign-in form (email + password + submit + Google + register toggle)', () => {
  const b = build();
  b.api.render();
  const html = b.els['auth-form'].innerHTML;
  assert.match(html, /id="f-email"/, 'email field');
  assert.match(html, /id="f-password"/, 'password field');
  assert.match(html, /onclick="submit\(\)"/, 'submit handler');
  assert.match(html, /onclick="loginGoogle\(\)"/, 'Google OAuth handler');
  assert.match(html, /onclick="toggleMode\(\)"/, 'mode toggle');
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
});

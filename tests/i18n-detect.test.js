/* tests/i18n-detect.test.js — first-run language detection (i18n.js detectLang()).
 *
 * A saved ui_lang always wins; otherwise the browser's preferred language decides
 * (Ukrainian 'uk' → the app's 'ua'); anything unsupported falls back to English.
 * Driven through the harness so the real i18n.js runs with an overridden navigator /
 * localStorage (shims are spread after the defaults, so they take effect).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function detected({ navigator, store }) {
  const shims = { navigator };
  if (store) {
    shims.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem() {}, removeItem() {},
    };
  }
  const r = loadPage({ page: 'login.html', extraFiles: ['locales/en.js'], exports: ['getLang'], shims });
  return r.getLang();
}

test('a saved ui_lang wins over the browser language', () => {
  assert.equal(detected({ navigator: { languages: ['en-US'] }, store: { ui_lang: 'ru' } }), 'ru');
});

test('browser Ukrainian (uk) maps to the app language ua', () => {
  assert.equal(detected({ navigator: { languages: ['uk-UA', 'ru'] } }), 'ua');
  assert.equal(detected({ navigator: { language: 'uk' } }), 'ua');
});

test('browser Russian / English map directly', () => {
  assert.equal(detected({ navigator: { languages: ['ru-RU'] } }), 'ru');
  assert.equal(detected({ navigator: { languages: ['en-GB'] } }), 'en');
});

test('an unsupported browser language falls back to English', () => {
  assert.equal(detected({ navigator: { languages: ['de-DE', 'fr-FR'] } }), 'en');
  assert.equal(detected({ navigator: {} }), 'en'); // no language info at all
});

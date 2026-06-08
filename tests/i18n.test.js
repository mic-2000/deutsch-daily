/* tests/i18n.test.js — locale integrity. Guards the i18n-correctness work in the plan
 * (Phase 2 wires the trainer end/spelling screens to T(); all keys must exist in every
 * locale because EN is only the fallback). Locales are lazy-loaded in the app; here we
 * load all three directly and compare.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

const r = loadPage({
  extraFiles: ['locales/en.js', 'locales/ru.js', 'locales/ua.js'],
  exports: ['LOCALE_EN', 'LOCALE_RU', 'LOCALE_UA'],
});
const UI = { en: r.LOCALE_EN.ui, ru: r.LOCALE_RU.ui, ua: r.LOCALE_UA.ui };

test('all three locales expose the SAME set of ui keys', () => {
  const en = new Set(Object.keys(UI.en));
  const ru = new Set(Object.keys(UI.ru));
  const ua = new Set(Object.keys(UI.ua));
  const diff = (a, b) => [...a].filter((k) => !b.has(k));
  assert.deepEqual(diff(en, ru), [], 'keys missing from ru');
  assert.deepEqual(diff(ru, en), [], 'extra keys in ru');
  assert.deepEqual(diff(en, ua), [], 'keys missing from ua');
  assert.deepEqual(diff(ua, en), [], 'extra keys in ua');
});

test('keys used by the end/spelling screens exist in every locale', () => {
  const needed = [
    'spelling_prompt', 'spelling_check', 'spelling_next', 'spelling_hint',
    'end_title', 'end_score', 'end_back', 'end_again',
  ];
  for (const lang of Object.keys(UI)) {
    for (const k of needed) {
      assert.ok(k in UI[lang], `${lang}.ui.${k} is missing`);
    }
  }
});

test('function-valued keys (end_score) produce a string when called', () => {
  for (const lang of Object.keys(UI)) {
    const f = UI[lang].end_score;
    assert.equal(typeof f, 'function', `${lang}.end_score should be a function`);
    assert.equal(typeof f(3, 5), 'string');
  }
});

test('every locale value is a string or a function (no nulls/objects)', () => {
  for (const lang of Object.keys(UI)) {
    for (const [k, val] of Object.entries(UI[lang])) {
      const t = typeof val;
      assert.ok(t === 'string' || t === 'function', `${lang}.ui.${k} has bad type ${t}`);
    }
  }
});

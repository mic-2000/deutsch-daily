/* i18n.js — language switching core with LAZY locale loading.
   Locale files (locales/en.js · ua.js · ru.js) set window.LOCALE_EN / _UA / _RU = { ui, vocab, verbs, weeks }.
   They are NOT preloaded: loadLocale(code) injects only the needed one on demand and caches it,
   so a user fetches just the active language (and only fetches another when switching).
   Access translations via T('key', ...args). Pages must `await loadLocale(getLang())` before the first render.
*/

const LANG_NAMES = { en: 'EN', ua: 'UA', ru: 'RU' };
const DEFAULT_LANG = 'en';

let _lang = localStorage.getItem('ui_lang') || DEFAULT_LANG;
if (!LANG_NAMES[_lang]) _lang = DEFAULT_LANG;
if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = _lang;

const _localeLoads = {}; // code -> Promise (dedupes repeat/concurrent loads)

/* Inject locales/<code>.js once; resolves when window.LOCALE_<CODE> is defined. */
function loadLocale(code) {
  if (!LANG_NAMES[code]) code = DEFAULT_LANG;
  if (window['LOCALE_' + code.toUpperCase()]) return Promise.resolve();
  if (_localeLoads[code]) return _localeLoads[code];
  _localeLoads[code] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'locales/' + code + '.js';
    s.onload = () => resolve();
    s.onerror = () => { delete _localeLoads[code]; reject(new Error('locale load failed: ' + code)); };
    document.head.appendChild(s);
  });
  return _localeLoads[code];
}

function _locale(code) {
  return window['LOCALE_' + code.toUpperCase()] || window['LOCALE_' + DEFAULT_LANG.toUpperCase()] || null;
}

function T(key, ...args) {
  const loc = _locale(_lang);
  const ui = (loc && loc.ui) || {};
  let val = ui[key];
  if (val === undefined) { const d = _locale(DEFAULT_LANG); val = (d && d.ui) ? d.ui[key] : undefined; }
  if (val === undefined) return key;
  return typeof val === 'function' ? val(...args) : val;
}

/* Switch language: load its locale on demand, persist, sync to cloud, re-render. */
async function setLang(code, skipSave) {
  if (!LANG_NAMES[code]) return;
  try { await loadLocale(code); } catch (e) { if (typeof showToast === 'function') showToast('Localization failed to load'); return; }
  _lang = code;
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = code;
  localStorage.setItem('ui_lang', code);
  if (!skipSave && typeof saveLangToCloud === 'function') saveLangToCloud(code);
  if (typeof render === 'function') render();
}

function getLang() { return _lang; }

function renderLangSwitcher() {
  return Object.keys(LANG_NAMES).map(code =>
    `<button class="lang-btn${code === _lang ? ' active' : ''}" onclick="setLang('${code}')">${LANG_NAMES[code]}</button>`
  ).join('');
}

/* i18n.js — language switching core with LAZY locale loading.
   Locale files (locales/en.js · ua.js · ru.js) set window.LOCALE_EN / _UA / _RU = { ui, vocab, verbs, weeks }.
   They are NOT preloaded: loadLocale(code) injects only the needed one on demand and caches it,
   so a user fetches just the active language (and only fetches another when switching).
   Access translations via T('key', ...args). Pages must `await loadLocale(getLang())` before the first render.
*/

const LANG_NAMES = { en: 'EN', ua: 'UA', ru: 'RU' };
const DEFAULT_LANG = 'en';

/* First-run language: a previously saved choice always wins; otherwise fall back to the
   browser's preferred language (Ukrainian's ISO code 'uk' maps to the app's 'ua'), and
   finally to DEFAULT_LANG (en). The choice is only persisted once the user explicitly
   switches (setLang) or it is synced from the cloud — detection never writes localStorage. */
function detectLang() {
  const saved = localStorage.getItem('ui_lang');
  if (saved && LANG_NAMES[saved]) return saved;
  const navs = (typeof navigator !== 'undefined')
    ? (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])
    : [];
  for (const raw of navs) {
    const code = String(raw || '').toLowerCase().slice(0, 2);
    if (code === 'uk') return 'ua';     // Ukrainian ISO 639-1 is 'uk'; the app uses 'ua'
    if (LANG_NAMES[code]) return code;  // 'en' / 'ru' map directly
  }
  return DEFAULT_LANG;
}

let _lang = detectLang();
if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = _lang;

const _localeLoads = {}; // code -> Promise (dedupes repeat/concurrent loads)

/* Inject locales/<code>.js once; resolves when window.LOCALE_<CODE> is defined. */
function loadLocale(code) {
  if (!LANG_NAMES[code]) code = DEFAULT_LANG;
  if (window['LOCALE_' + code.toUpperCase()]) return Promise.resolve();
  if (_localeLoads[code]) return _localeLoads[code];
  _localeLoads[code] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/locales/' + code + '.js';
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

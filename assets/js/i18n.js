/* i18n.js — language switching core
   Requires locales/en.js, locales/ua.js, locales/ru.js loaded before this file.
   Each locale file sets window.LOCALE_EN / LOCALE_UA / LOCALE_RU = { ui: {...}, vocab?: {...} }
   Access translations via: T('key') or T('key', arg1, arg2)
*/

const LANG_NAMES = { en: 'EN', ua: 'UA', ru: 'RU' };
const DEFAULT_LANG = 'en';

let _lang = localStorage.getItem('ui_lang') || DEFAULT_LANG;
if (!LANG_NAMES[_lang]) _lang = DEFAULT_LANG;

function _locale(code) {
  return (window['LOCALE_' + code.toUpperCase()] || window['LOCALE_' + DEFAULT_LANG.toUpperCase()]);
}

function T(key, ...args) {
  const ui = _locale(_lang).ui || {};
  const val = ui[key] !== undefined ? ui[key] : (_locale(DEFAULT_LANG).ui || {})[key];
  if (val === undefined) return key;
  if (typeof val === 'function') return val(...args);
  return val;
}

function setLang(code, skipSave) {
  if (!LANG_NAMES[code]) return;
  _lang = code;
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

/* theme.js — light/dark theme switching. Mirrors the i18n.js pattern.
   Applies data-theme on <html>; persists in localStorage and (via saveThemeToCloud) in the cloud.
*/
const THEMES = { light: 1, dark: 1 };
const DEFAULT_THEME = 'light';

let _theme = localStorage.getItem('ui_theme') || DEFAULT_THEME;
if (!THEMES[_theme]) _theme = DEFAULT_THEME;
applyTheme();

function applyTheme() {
  document.documentElement.setAttribute('data-theme', _theme);
}

function setTheme(code, skipSave) {
  if (!THEMES[code]) return;
  _theme = code;
  localStorage.setItem('ui_theme', code);
  applyTheme();
  if (!skipSave && typeof saveThemeToCloud === 'function') saveThemeToCloud(code);
  if (typeof render === 'function') render();
}

function toggleTheme() { setTheme(_theme === 'dark' ? 'light' : 'dark'); }
function getTheme() { return _theme; }

function renderThemeToggle() {
  const next = _theme === 'dark' ? 'light' : 'dark';
  return `<button class="theme-toggle" onclick="toggleTheme()" title="${next}" aria-label="theme">${_theme === 'dark' ? '☀' : '☾'}</button>`;
}

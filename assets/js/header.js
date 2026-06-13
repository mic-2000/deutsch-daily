/* header.js — single source of truth for the app chrome (header + nav tabs).
   Loaded by planner/vocab/verbs/collections so every section renders an IDENTICAL header
   (same markup, same width, same nav) — the app reads as one site, not four pages.

   appHeader(active, { cat, h1, subtitle })
     active   — nav key of the current page ('planner' | 'vocab' | 'verbs' | 'collections')
     cat      — T() key for the small uppercase category line
     h1       — raw HTML for the page title (may contain <em>…</em>)
     subtitle — T() key for the italic subtitle

   Depends on globals from the shared modules: T / renderLangSwitcher (i18n.js),
   renderThemeToggle (theme.js), esc (utils.js), currentUser / logout (cloud-sync.js).
*/
const NAV_ITEMS = [
  { key: 'planner',     href: '/planner',     label: 'nav_planner' },
  { key: 'vocab',       href: '/vocab',       label: 'nav_vocab' },
  { key: 'verbs',       href: '/verbs',       label: 'nav_verbs' },
  { key: 'collections', href: '/collections', label: 'nav_collections' },
];

function appHeader(active, opts) {
  const o = opts || {};
  const tabs = NAV_ITEMS.map(it =>
    `<a class="nav-tab${it.key === active ? ' active' : ''}" href="${it.href}">${T(it.label)}</a>`
  ).join('');
  return `
<header><div class="container">
  <div class="title-cat">${T(o.cat)}</div>
  <h1>${o.h1}</h1>
  <div class="subtitle">${T(o.subtitle)}</div>
  <div class="user-bar">
    <div class="nav-tabs">${tabs}</div>
    <div class="user-bar-right">
      <div class="lang-switcher">${renderLangSwitcher()}</div>
      ${typeof renderThemeToggle === 'function' ? renderThemeToggle() : ''}
      <span class="user-email">${esc(currentUser ? currentUser.email : '')}</span>
      <button class="btn-logout" onclick="logout()">${T('logout')}</button>
    </div>
  </div>
</div></header>`;
}

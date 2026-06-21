/* header.js — single source of truth for the app chrome (header + nav tabs + footer).
   Loaded by planner/vocab/verbs/collections so every section renders an IDENTICAL header
   (same markup, same width, same nav) — the app reads as one site, not four pages.

   appHeader(active, { cat, h1, subtitle })
     active   — nav key of the current page ('planner' | 'vocab' | 'verbs' | 'collections' | 'settings')
     cat      — T() key for the small uppercase category line
     h1       — raw HTML for the page title (may contain <em>…</em>)
     subtitle — T() key for the italic subtitle

   appFooter({ text, showEmail, right })
     text      — T() key for the footer note (defaults to 'vocab_footer')
     showEmail — append the signed-in email after the note (planner)
     right     — raw HTML for the right-hand slot (e.g. a "reset all" button or a tagline)

   Depends on globals from the shared modules: T (i18n.js), esc (utils.js),
   currentUser / logout (cloud-sync.js). Language + theme switching now live on
   the Settings page (/settings), not in the header.
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
    <div class="nav-group">
      <div class="nav-tabs">${tabs}</div>
      <a class="settings-link${active === 'settings' ? ' active' : ''}" href="/settings" title="${T('settings_title')}" aria-label="${T('settings_title')}">⚙</a>
    </div>
    <div class="user-bar-right">
      <span class="user-email">${esc(currentUser ? currentUser.email : '')}</span>
      <button class="btn-logout" onclick="logout()">${T('logout')}</button>
    </div>
  </div>
</div></header>`;
}

function appFooter(opts) {
  const o = opts || {};
  const note = T(o.text || 'vocab_footer') +
    (o.showEmail && currentUser ? ' · ' + esc(currentUser.email) : '');
  return `
<footer><div class="container f-row">
  <span>${note} · <a class="gh-link" href="https://github.com/mic-2000/deutsch-daily" target="_blank" rel="noopener">GitHub</a> · <a class="gh-link" href="/privacy">${T('lp_foot_privacy')}</a> · <a class="gh-link" href="/terms">${T('lp_foot_terms')}</a></span>
  ${o.right || ''}
</div></footer>`;
}

/* header.js — single source of truth for the app chrome (header + nav tabs + footer).
   Loaded by planner/vocab/verbs/collections so every section renders an IDENTICAL header
   (same markup, same width, same nav) — the app reads as one site, not four pages.

   appHeader(active, { cat, h1, subtitle })
     active   — nav key of the current page ('today' | 'planner' | 'vocab' | 'verbs' | 'collections' | 'stats' | 'settings')
     cat      — T() key for the small uppercase category line
     h1       — raw HTML for the page title (may contain <em>…</em>)
     subtitle — T() key for the italic subtitle

   appFooter({ text, showEmail, right })
     text      — T() key for the footer note (defaults to 'vocab_footer')
     showEmail — append the signed-in email after the note (planner)
     right     — raw HTML for the right-hand slot (e.g. a tagline)

   Depends on globals from the shared modules: T (i18n.js), esc (utils.js),
   currentUser / logout (cloud-sync.js). Language + theme switching now live on
   the Settings page (/settings), not in the header.
*/
const NAV_ITEMS = [
  { key: 'today',       href: '/today',       label: 'nav_today' },
  { key: 'planner',     href: '/planner',     label: 'nav_planner' },
  { key: 'vocab',       href: '/vocab',       label: 'nav_vocab' },
  { key: 'verbs',       href: '/verbs',       label: 'nav_verbs' },
  { key: 'collections', href: '/collections', label: 'nav_collections' },
  { key: 'stats',       href: '/stats',       label: 'nav_stats' },
];

// The daily lesson ('today') is rendered as the header's primary CTA button, not a
// plain nav tab — split so the remaining sections render as the text-link nav strip.
const CTA_ITEM = NAV_ITEMS[0];
const TAB_ITEMS = NAV_ITEMS.slice(1);

// Feather "log-out" icon (inline so it themes via currentColor, no extra asset).
const LOGOUT_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';

function appHeader(active, opts) {
  const o = opts || {};
  const tabs = TAB_ITEMS.map(it =>
    `<a class="nav-tab${it.key === active ? ' active' : ''}" href="${it.href}">${T(it.label)}</a>`
  ).join('');
  return `
<header><div class="container">
  <div class="title-cat">${T(o.cat)}</div>
  <h1>${o.h1}</h1>
  <div class="subtitle">${T(o.subtitle)}</div>
  <div class="user-bar">
    <a class="nav-cta" href="${CTA_ITEM.href}"><span class="nav-cta-icon" aria-hidden="true">▶</span>${T(CTA_ITEM.label)}</a>
    <span class="nav-divider" aria-hidden="true"></span>
    <nav class="nav-tabs">${tabs}</nav>
    <div class="user-bar-right">
      <a class="settings-link${active === 'settings' ? ' active' : ''}" href="/settings" title="${T('settings_title')}" aria-label="${T('settings_title')}">⚙</a>
      <button class="btn-logout" onclick="logout()" title="${T('logout')}" aria-label="${T('logout')}">${LOGOUT_ICON}</button>
    </div>
  </div>
</div></header>`;
}

function appFooter(opts) {
  const o = opts || {};
  const note = T(o.text || 'vocab_footer') +
    (o.showEmail && currentUser ? ' · ' + esc(currentUser.email) : '');
  // "💬 Feedback" entry point (feedback.js). Guarded so the footer still renders if that module
  // isn't loaded on some page.
  const fb = (typeof feedbackButton === 'function') ? feedbackButton() : '';
  return `
<footer><div class="container f-row">
  <span>${note} · <a class="gh-link" href="https://github.com/mic-2000/deutsch-daily" target="_blank" rel="noopener">GitHub</a> · <a class="gh-link" href="/privacy">${T('lp_foot_privacy')}</a> · <a class="gh-link" href="/terms">${T('lp_foot_terms')}</a></span>
  <span class="f-right">${fb}${o.right || ''}</span>
</div></footer>`;
}

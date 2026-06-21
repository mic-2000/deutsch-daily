/* legal.js — shared renderer for the static legal pages (privacy.html / terms.html).
   Each page defines a per-language content object ({ title, intro, sections:[{h, items:[]}] })
   and a LEGAL_UPDATED date, then calls renderLegal(active, doc). This file owns the chrome
   (landing-style header + footer) so both pages stay identical.

   Depends on globals: T / getLang / renderLangSwitcher / setLang (i18n.js),
   renderThemeToggle (theme.js), esc (utils.js). Re-rendered on language/theme switch. */

function legalHeader() {
  return `
  <header class="lp-header">
    <div class="lp-header-inner">
      <a href="/" class="lp-brand">Deutsch <em>Daily</em></a>
      <div class="lp-header-actions">
        <div class="lang-switcher">${renderLangSwitcher()}</div>
        ${typeof renderThemeToggle === 'function' ? renderThemeToggle() : ''}
        <a href="/" class="lp-btn lp-btn-outline lp-btn-sm">${T('auth_back_home')}</a>
      </div>
    </div>
  </header>`;
}

/* Footer shared with the app/landing: GitHub + Privacy + Terms. The current page is marked
   aria-current so it reads as the active document. */
function legalFooter(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`;
  return `
    <footer class="lp-footer">
      <span>© 2026 Deutsch Daily</span>
      <div class="lp-footer-links">
        <a href="https://github.com/mic-2000/deutsch-daily" target="_blank" rel="noopener">GitHub</a>
        ${link('/privacy', T('lp_foot_privacy'), 'privacy')}
        ${link('/terms', T('lp_foot_terms'), 'terms')}
      </div>
    </footer>`;
}

function renderLegal(active, doc) {
  const updated = (typeof LEGAL_UPDATED !== 'undefined') ? LEGAL_UPDATED : '';
  const body = doc.sections.map(sec => `
      <h2>${esc(sec.h)}</h2>
      <ul>${sec.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>`).join('');

  document.getElementById('app').innerHTML =
    legalHeader() +
    `<main class="lp-main">
      <section class="lp-section legal">
        <h1>${esc(doc.title)}</h1>
        ${updated ? `<div class="legal-updated">${esc(T('legal_updated', updated))}</div>` : ''}
        <p class="legal-intro">${esc(doc.intro)}</p>
        ${body}
      </section>` +
    legalFooter(active) +
    `</main>`;
}

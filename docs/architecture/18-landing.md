# 18. `index.html` — public landing page

> Section §18 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The repo-root `index.html` is the **marketing landing page** shown to unauthenticated visitors at
`/`. It is intentionally self-contained and lighter than the app pages: it loads the Supabase CDN +
`i18n.js` / `theme.js` / `utils.js` / `pwa.js` / `supabase.js`, but **not** `cloud-sync.js`,
`header.js`, or any `data/` file (there is no progress to sync and no app chrome to share).

**Render model** — same convention as the app pages: a global `render()` rebuilds `#app` from
`T()`-keyed template strings, with the page broken into section builders (`header`, `hero`, `pain`,
`how`, `features`, `forWhom`, `pricing`, `faq`, `footerCta`). Inline `onclick`/`onsubmit` handlers
(`onLandingSubmit`) are therefore globals. The shared `renderLangSwitcher()` / `renderThemeToggle()`
drive the in-header language + theme controls, so switching either re-renders the landing in place
(no cloud write — `saveLangToCloud`/`saveThemeToCloud` are simply absent here).

**Auth routing** (see also §5):
- On load: `loadLocale(getLang())` → `sb.auth.getSession()`. A signed-in visitor is forwarded by
  `redirect()` (`auth_redirect` or `/planner`); a guest gets the rendered landing. Any error falls
  through to rendering the landing (so it still works offline / if Supabase is unreachable).
- Header "Log in" → `/login`; "Sign up" and every section CTA → `/login?mode=register`. The footer
  email field submits to `/login?mode=register&email=…` (prefills the register form).

**Copy & i18n** — every visible string is a `T('lp_*')` key present in all three locales
(`lp_login` … `lp_foot_terms`, ~106 keys); `auth_back_home` (the login page's "← Home" link) is added
alongside them. RU is the original source copy; EN/UA are translations. Brand name "Deutsch Daily",
the German demo words (der Weg / das Ziel / die Sprache) and price numerals (`€0` / `€5,99` / `€39`)
are literals in the markup; only the surrounding words/suffixes are translated.

**Styling** — `landing.css` only (plus `base.css` tokens + `components.css` switcher/toggle). No new
color or type system is introduced (§11). The decorative animations are `lp*`-prefixed keyframes and
are disabled under `prefers-reduced-motion`; the hero artwork is `aria-hidden` and hidden below 720px.

> **Pricing is presentational.** The Free/Monthly/Yearly tiers and the "early supporter" line are
> marketing copy from the source design — there is **no billing integration**. Every pricing CTA just
> routes to registration. Wire a real checkout (and gate features) before treating the tiers as live.

# CLAUDE.md — working rules for this repo

Full reference: **[ARCHITECTURE.md](ARCHITECTURE.md)**. This file is **rules only** — for any
"how it works" detail, read the referenced section (§) there.

Orientation: vanilla HTML/CSS/JS, no framework/bundler; Supabase auth + cloud progress; deployed
on Vercel (HTTPS). `index.html` (repo root) = the **public landing page** for guests (its own
`render()` + `landing.css`, no cloud-sync); login/register lives at `views/login.html` (`/login`);
the authenticated pages live in `views/` and are served via `vercel.json` pretty-URL rewrites —
`views/planner.html` (`/planner`) / `views/vocab.html` (`/vocab`) / `views/verbs.html` (`/verbs`) /
`views/collections.html` (`/collections`). The four app pages share one header via
`assets/js/header.js` (`appHeader()`) and one `--page-max` width (the landing and login have their
own chrome). In-page asset/data/locale paths are root-absolute (`/assets`, `/data`, `/locales`).
(Details: ARCHITECTURE.md §1–§3, landing = §18, collections = §16.)

## Build
- `npm run build` (`node build.js`) injects `NEXT_PUBLIC_SUPABASE_*` into
  `assets/js/supabase.js`. Never commit real credentials. (§2)

## Rules
- **Render = full re-render of `#app`** from template strings; handlers are inline `onclick`, so
  every handler function must be **global** in the page `<script>`. (§8–§10)
- **`esc()` every dynamic value** before it enters `innerHTML`. (§4)
- **User-facing text only via `T('key', …)`**, and add the key to **all three** locales
  (`ru`/`ua`/`en`; EN is the default + `T()` fallback). (§6)
- **Locales are lazy-loaded** (`i18n.loadLocale`): only the active language is fetched. Don't
  re-add static `<script src="locales/*.js">` tags; `await loadLocale(getLang())` before the first
  render. (§4)
- **Keep index-match alignment:** adding/removing/reordering a word or task means editing the
  German base in `data/` **and** the same index in all three `locales/*.{vocab,weeks}`. Verb forms
  live in `data/verbs.js` (`VERBS`); verb glosses live in `locales/*.verbs[key]`, keyed by the same
  verb key (not index-matched). (§6–§7)
- **Cloud is the source of truth.** Before calling `initApp()`, a page must define `render()` and —
  if it owns a `progress` column — `CLOUD_FIELD`, `getCloudPayload()`, `applyCloudData(d)`. A page
  with its **own table** (`collections.html` → `collections`) omits `CLOUD_FIELD` and loads via its
  own CRUD after `initApp` (like the planner's lessons). Never use `localStorage` as a progress
  *store* — only `ui_lang` / `ui_theme` / `auth_redirect` / `gemini_key` / `gemini_key_sync` are
  persistent app state (`gemini_key_sync` = the "remember key on my account" opt-in flag).
  The only exceptions are two **transient** buffers `cloud-sync.js` owns: `cloud_outbox` (offline
  write queue — written when a cloud write fails, cleared when it replays) and `cloud_cache` (offline
  read mirror — a copy of the last successful read, used only as a cold-start fallback, overwritten
  by the cloud, wiped on logout). Neither is a source of truth; don't read them as state or
  repurpose them. (§4–§5, §13)
- **Reuse the design tokens** in `assets/css/base.css`; don't introduce a new color/type system.
  (§11)
- **Bump the vocab `version`/`KEY` only on an incompatible format change — and write a migration.**
  (§9)
- **Preserve the defensive patterns:** clipboard fallback, `onvoiceschanged` listener, in-page
  confirm modal (never native `confirm()`), and never swallow handler errors (surface via
  `showToast`). (§12)
- **PWA shell:** the app is installable — `manifest.webmanifest` + `sw.js` (root) + `assets/js/pwa.js`
  in every `<head>`. When you **add/rename/remove a shell asset** (CSS/JS/data/locale/icon or a page),
  update `SHELL_ASSETS` in `sw.js` **and bump its `VERSION`** so caches refresh. Keep `*.supabase.co`
  uncached (JS owns offline data); icon PNGs are rendered from the `assets/icon*.svg` sources. (§17)
- **Don't reintroduce the already-fixed bugs in ARCHITECTURE.md §14.**

## Before finishing
- Syntax-check: extract the inline `<script>` and run `node --check`. (Running the app locally
  needs Supabase creds + a session — it's an HTTPS app, not `file://`.)

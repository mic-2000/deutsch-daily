# CLAUDE.md — working rules for this repo

Full reference: **[ARCHITECTURE.md](ARCHITECTURE.md)**. This file is **rules only** — for any
"how it works" detail, read the referenced section (§) there.

Orientation: vanilla HTML/CSS/JS, no framework/bundler; Supabase auth + cloud progress; deployed
on Vercel (HTTPS). `index.html` = login, `auth.html` = redirect stub, `planner.html` /
`vocab.html` = the app pages. (Details: ARCHITECTURE.md §1–§3.)

## Build
- `npm run build` (`node build.js`) injects `NEXT_PUBLIC_SUPABASE_*` into
  `assets/js/supabase.js`. Never commit real credentials. (§2)

## Rules
- **Render = full re-render of `#app`** from template strings; handlers are inline `onclick`, so
  every handler function must be **global** in the page `<script>`. (§8–§9)
- **`esc()` every dynamic value** before it enters `innerHTML`. (§4)
- **User-facing text only via `T('key', …)`**, and add the key to **all three** locales
  (`ru`/`ua`/`en`; EN is the default + `T()` fallback). (§6)
- **Keep index-match alignment:** adding/removing/reordering a word or task means editing the
  German base in `data/` **and** the same index in all three `locales/*.{vocab,weeks}`. (§6–§7)
- **Cloud is the source of truth.** Before calling `initApp()`, a page must define `CLOUD_FIELD`,
  `getCloudPayload()`, `applyCloudData(d)`, `render()`. Never store progress in `localStorage`
  (only `ui_lang` / `auth_redirect` belong there). (§4–§5)
- **Reuse the design tokens** in `assets/css/base.css`; don't introduce a new color/type system.
  (§10)
- **Bump the vocab `version`/`KEY` only on an incompatible format change — and write a migration.**
  (§9)
- **Preserve the defensive patterns:** clipboard fallback, `onvoiceschanged` listener, in-page
  confirm modal (never native `confirm()`), and never swallow handler errors (surface via
  `showToast`). (§11)
- **Don't reintroduce the already-fixed bugs in ARCHITECTURE.md §13.**

## Before finishing
- Syntax-check: extract the inline `<script>` and run `node --check`. (Running the app locally
  needs Supabase creds + a session — it's an HTTPS app, not `file://`.)

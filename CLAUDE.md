# CLAUDE.md — working rules for this repo

Full reference: **[ARCHITECTURE.md](ARCHITECTURE.md)**. This file is **rules only** — for any
"how it works" detail, read the referenced section (§) there.

Orientation: vanilla HTML/CSS/JS, no framework/bundler; Supabase auth + cloud progress; deployed
on Vercel (HTTPS). `index.html` (repo root) = the **public landing page** for guests (its own
`render()` + `landing.css`, no cloud-sync); login/register lives at `views/login.html` (`/login`);
the authenticated pages live in `views/` and are served via `vercel.json` pretty-URL rewrites —
`views/today.html` (`/today`) / `views/planner.html` (`/planner`) / `views/vocab.html` (`/vocab`) /
`views/verbs.html` (`/verbs`) / `views/collections.html` (`/collections`) / `views/stats.html`
(`/stats`). The app pages share one header via `assets/js/header.js` (`appHeader()` + `NAV_ITEMS`) and
one `--page-max` width (the landing and login have their own chrome). In-page asset/data/locale paths
are root-absolute (`/assets`, `/data`, `/locales`). (Details: ARCHITECTURE.md §1–§3, landing = §18,
collections = §16, today = §19, onboarding = §20, stats = §22.)

**Onboarding:** `cloud-sync.initApp` gates users to `views/welcome.html` (`/welcome`) — 5 tap
questions (nothing pre-selected; Start disabled until all answered) → a no-key mini-lesson → `/today`.
The answers have real effects (level → start day + vocab levels; language → `setLang`; minutes →
`/today` session size + a live daily-load explainer; goal/hardest → AI prompt via the `userOnboarding`
global; hardest → default modes). Stored in the `progress.onboarding` jsonb column. The gate fires for
(a) row *absence* (brand-new account) OR (b) a stale `onboarding.onbVersion` (below `ONBOARDING_VERSION`)
— the latter re-onboards every existing user **once** after a course rebuild; `saveOnboardingToCloud`
stamps the current version, so it fires at most once per bump. Never gate on an offline/errored read.
Bump `ONBOARDING_VERSION` only when a course change should force everyone to re-pick preferences. (§20.)

The vocab + verb **trainer engines are shared modules** (`assets/js/vocab-trainer.js` =
`window.VocabTrainer`, `verbs-trainer.js` = `window.VerbsTrainer`). `/vocab` and `/verbs` are thin
hosts (home + sessions, `embedded:false`); `/today` is a guided wizard that drives both engines in
`embedded:true` mode (sessions only; the end screen advances the flow). Template handlers are
namespaced (`VocabTrainer.answer(true)`) so both engines coexist on `/today`. The grammar step also
hosts a third shared engine, `grammar-drill.js` = `window.GrammarDrill` — a keyed-drill trainer for
the day's `drill` slug (`cloze`/`choice`/`order` items; `embedded:true`, same
`onSessionEnd → advance` contract). The same engine also drives the `/today` **review step** (a
multi-slug `startSession({ slugs, review:true })` session over the grammar topics whose Leitner card in
`planner_data.grammarReview` has come due — soft-demotion, topic-level grading; the state lives in
`planner_data`, owned by `/today`, not the engine). The curriculum day model (`DAYS` / `TOTAL_DAYS` /
`getLocalizedDay`, now carrying each day's `drill` slug) is `assets/js/planner-data.js`, shared by
`/planner` and `/today`. The **streak + activity-calendar** math (DEV-7) is a second shared module,
`assets/js/stats.js` (`streakInfo` / `activityCalendar`) — pure, derived each render from
`planner_data.dayStats` completions + a single `lastActiveDate` stamp `/today` writes on any embedded
session end (no counters, no new column). `stats.js` also owns the **statistics-page** aggregation +
**B1 forecast** (DEV-8: `weeklyAccuracy` / `masteryBreakdown` / `activeCountInWindow` /
`forecastFinish`) that drive the read-only `/stats` screen (`views/stats.html`) — the landing's
"Statistics" and "B1 forecast". `/stats` reuses the trainer engines' read-only stats API so its
numbers match `/vocab`+`/verbs`, writes nothing back, and premium-gates the forecast / accuracy /
weakest-items sections via `hasPremium()` (no in-app price/checkout — that's DEV-3/4). (Details:
ARCHITECTURE.md §9–§10, §19, §22.)

The **feedback loop** (DEV-10) is a third small shared module, `assets/js/feedback.js` — a "💬
Feedback" footer entry point (via `appFooter`) + an in-page modal (note + optional 1–5 mood) that
writes to the INSERT-only `feedback` table (§5): attributed on app pages, anonymous from the landing.
The modal is a `<body>`-appended overlay (not part of any page's `#app` re-render), loaded on the
landing + every app page. `/today` auto-opens it once after 3 completed days (pure
`feedbackShouldPrompt(planner)` → one-time `planner_data.feedbackPrompted` flag). (Details:
ARCHITECTURE.md §4 `feedback.js`, §5.)

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
- **Keep index-match alignment.** The live curriculum — `data/weeks.js` (`WEEKS`, object tasks),
  `data/vocab.js` (`VOCAB`), and the `vocab` + `weeks` blocks of `locales/*.js` — is now **generated
  Course v2**: don't hand-edit it. Change `authoring/weeks/wNN.js` (each string co-locates
  `de/en/ru/ua`, so alignment is structural), then `npm run gen:course && npm run cutover:v2`. Verbs
  are still hand-maintained: forms in `data/verbs.js` (`VERBS`), glosses in `locales/*.verbs[key]`
  (keyed by the same verb key, not index-matched) — keep them aligned by hand. `PLURALS` (in
  `data/vocab.js`) is now **generated too** — authored in `authoring/plurals.js` (a German-only
  `PLURALS` map + `NO_PLURAL` list; every noun-shaped vocab word must be in one of them or
  `gen:course` fails) and emitted into `data/v2/vocab.js`. (§6–§7, §21)
- **Course v2 is generated, and LIVE.** `data/v2/*` and `locales/v2/*` are emitted by
  `scripts/gen-course.js` from the single source in `authoring/` — never edit them (or the generated
  blocks in the live `data/`/`locales/`) directly. `scripts/cutover-v2.js` (`npm run cutover:v2`)
  swaps the generated artifacts into the live files (`VOCAB` + `PLURALS` + `GRAMMAR_DRILLS` verbatim;
  the locales' `vocab`/`weeks`/`drills` blocks are replaced while `ui`/`verbs` are preserved). The
  live `data/grammar-drills.js` (keyed by slug) is what `/today`'s grammar step reads.
  Every `data/verbs.js` entry carries a `band` (A1/A2/B1) written by `scripts/band-verbs.js` — after
  adding a verb, run it (never hand-type `band`). `tests/course-v2-align.test.js` (Gate 4, generated
  output) and `tests/course-v2-cutover.test.js` (Gate 6, live state + migration) guard it. A pre-v2
  `planner_data` row is reset to a clean v2 state by `cloud-sync.initApp` (on every field page), and
  `VocabTrainer.applyData` drops pre-v2 index-keyed `mastery`/`pluralMastery` (the `courseVersion`
  stamp in `vocab_data` makes the reset one-time). (§5, §21)
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
- **Preserve the defensive patterns:** `onvoiceschanged` listener, in-page
  confirm modal (never native `confirm()`), and never swallow handler errors (surface via
  `showToast`). (§12)
- **PWA shell:** the app is installable — `manifest.webmanifest` + `sw.js` (root) + `assets/js/pwa.js`
  in every `<head>`. When you **add/rename/remove a shell asset** (CSS/JS/data/locale/icon or a page),
  update `SHELL_ASSETS` in `sw.js`. You **don't** need to hand-bump `VERSION` — `build.js` re-stamps it
  on every deploy so caches refresh automatically (§2); the committed `VERSION` is only the local-dev
  default. Keep `*.supabase.co` uncached (JS owns offline data); icon PNGs are rendered from the
  `assets/icon*.svg` sources. (§17)
- **Don't reintroduce the already-fixed bugs in ARCHITECTURE.md §14.**

## Before finishing
- Syntax-check: extract the inline `<script>` and run `node --check`. (Running the app locally
  needs Supabase creds + a session — it's an HTTPS app, not `file://`.)

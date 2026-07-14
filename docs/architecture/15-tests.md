# 15. Tests (`tests/`)

> Section §15 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The app has **no build step**, so the test harness reproduces what a browser loads. `npm test`
runs `node --test tests/`; `npm run test:regression` runs the curated subset.

- **`harness.js`** — `loadPage({ page, extraFiles, exports, voices, shims })` reads a page's local
  `<script src>` deps (skipping a denylist of side-effectful modules — `supabase.js`,
  `cloud-sync.js`, `theme.js`, `ai-config.js` — which are shimmed), concatenates them with the
  page's inline `<script>` (bootstrap neutralised), evaluates it all as **one script** in a fresh
  `vm` sandbox seeded with browser shims (`document`, `localStorage`, `speechSynthesis`, …), and
  returns the captured globals. Because it follows the real `<script src>` list, it keeps working as
  helpers move between modules — top-level `const`/`function` from `assets/js/*` are in scope for the
  inline page code, exactly as in the browser. When the trainer engines were extracted into
  **namespaces** (`vocab-trainer.js` → `window.VocabTrainer`, `verbs-trainer.js` → `window.VerbsTrainer`),
  the capture step gained a fallback: a requested name not bound at top level is looked up on those
  namespaces — so the existing trainer tests kept their flat `exports` lists (`updateCard`, `state`,
  `render`, …) and read the engine through its current home unchanged. `resolvePage(page)` lets a test pass a bare page name
  (e.g. `'verbs.html'`) and resolves it to the repo root **or** `views/`; root-absolute `<script
  src="/assets/…">` paths are normalised before the denylist/dir filters run.
- **What's covered:** `leitner.test.js` (box transitions/scheduling), `helpers.test.js`
  (`esc`/`normalize`/`diffChars`/article parsing), `speech.test.js` (voice pick + per-page utterance
  text/rate), `confirm.test.js` (in-page confirm staging), `markdown.test.js` (`renderMd`),
  `render-smoke.test.js` (each page's `render()` runs and fills `#app`; also guards the Settings
  account screen against raw-i18n-key leaks and asserts `changePassword()` re-authenticates with
  the current password — `signInWithPassword` — before calling `updateUser`), `i18n.test.js` (identical
  `ui` key sets across locales + function-valued keys), `data-align.test.js` (base-data ↔ locale
  index/key alignment — see §13), `refactor-guards.test.js` (source-level guards: no hardcoded
  Russian in the trainer session UI, no orphaned/dead locale keys, no hardcoded `<html lang="ru">`),
  `outbox.test.js` (the offline write queue — see §4 — eval'd directly with a toggleable mock
  Supabase client, since the page harness shims `cloud-sync.js`; covers progress/lessons/collections
  queueing), and `collections.test.js` (`parseDelimited`/`parseTranslations` parsers, `colAvailableModes`,
  and list/import render-smoke — see §16), and `today-flow.test.js` (the `/today` wizard — engines
  present as namespaces, intro/grammar render, flow advance grammar→vocab→verbs, the shared
  `verbs_data` mastery map is one object across both engines, and the done step closes the day +
  advances `currentDay`; see §19), and `onboarding.test.js` (the `/welcome` wizard render-smoke + the
  onboarding gate: a missing row **or** a stale `onbVersion` → redirect to `/welcome`; an up-to-date
  stamp → no redirect; `/welcome` never loops; an offline read never gates; `userOnboarding` is
  loaded — see §20). `ui-refactor.test.js` guards the move to `views/` +
  unified chrome: app pages live in `views/` with `index.html` alone at root, pages use
  root-absolute `/assets`/`/data`/`/locales` paths and load `header.js`, the inline theme snippet
  runs before the Supabase CDN (FOUC guard), no `*.html` inter-page links remain, `appHeader()`
  renders four pretty-URL nav tabs with the active one marked, `vercel.json` rewrites map the pretty
  URLs, and the width is unified (`--page-max: 920px`, no 820px planner override).
- **What it can't cover:** anything requiring a live Supabase session / network against the real
  backend (auth, end-to-end cloud sync, real Gemini calls). Verify those manually in the deployed
  HTTPS app.

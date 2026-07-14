# 22. `stats.html` — statistics screen + B1 forecast (`/stats`, DEV-8)

> Section §22 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The progress screen the landing sells as **"Statistics"** and **"B1 forecast"**. A nav tab
(`NAV_ITEMS` → `/stats`, rewritten by `vercel.json`, precached in `sw.js`). It is **read-only**:
everything is derived at render time from cloud data the app already stores — it defines
`CLOUD_FIELD = 'planner_data'` only to receive `currentDay` / `dayStats` / `lastActiveDate`, but never
calls `saveToCloud` (`getCloudPayload` exists solely to satisfy the contract).

**Data sources.** `planner_data` (via `applyCloudData`); `verbs_data` (via `applyVerbProgress`, loaded
by `initApp`); `vocab_data` (a `loadVocabData()` after `initApp`, mirroring `/today`). The
`VocabTrainer` / `VerbsTrainer` engines are loaded **only for their read-only stats API**
(`globalStats` / `stats` / `collectWeakCards` / `collectWeakKeys` / `getCard` …), so `/stats` reports
the **same** mastery numbers as `/vocab` and `/verbs`. Both engines are `init`-ed with **no-op save
hooks** so loading data (`VocabTrainer.applyData` calls `save()`) can never write back, and
`wireSharedVerbStore()` points them at one `verbs_data.mastery` map (the `/today` wiring) so a
verb-WORD isn't double-counted.

**Sections** (all math is pure in `stats.js` §4): course position (day N/180 + band + % + streak
chip); totals (word/verb `mastered · learning · due` tiles + a combined review look-ahead via
`masteryBreakdown`); activity (`activityCalendar` grid + `activeCountInWindow` 7-/30-day counters);
per-week accuracy bars (`weeklyAccuracy`); the **B1 forecast** (`forecastFinish` → a projected finish
date from the learner's realised pace, explicitly framed as an estimate, never a guarantee — §1
positioning); and the weakest-cards list (each engine's weak scope, worst-first, with a "practise in
today's lesson" link to `/today`). A no-progress account gets a friendly empty state instead.

**Gating** (DEV-8 matrix, via `hasPremium()` — DEV-2). FREE: course position, totals, streak and a
7-day activity view. PREMIUM/LIFETIME: full activity history, per-week accuracy, the B1 forecast and
the weakest-items list. Free users see a calm `stats-locked` card (a "Premium" badge + a "See plans"
link to the landing) — **no in-app price or checkout** lives here; that is DEV-3/4 and needs human
sign-off, so the copy makes no purchase promise. `isPremium()` degrades to `false` when `hasPremium`
is absent (e.g. the test sandbox), so the page always renders.

**Styling** — `stats.css` (stat tiles, accuracy bars, forecast, weakest list, lock card), reusing the
`base.css` tokens and the `planner.css` `.cal-*` / `.prog-*` / `.btn` primitives (both linked first).

**Tests** — `tests/stats.test.js` (the pure aggregation + forecast math) and a `/stats` entry in
`tests/render-smoke.test.js`.

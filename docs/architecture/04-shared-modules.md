# 4. Shared modules (`assets/js/`)

> Section §4 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

### `i18n.js` — translation core (lazy locale loading)
- `_lang` initialised by `detectLang()` (valid: `en`, `ua`, `ru`): a saved `localStorage['ui_lang']`
  always wins; otherwise the browser's preferred language is used (`navigator.languages` /
  `navigator.language`, with Ukrainian's ISO code `uk` mapped to the app's `ua`); anything else
  falls back to `'en'` (`DEFAULT_LANG`). Detection is read-only — it never writes `localStorage`; the
  choice is persisted only when the user explicitly switches (`setLang`) or it is synced from the
  cloud. (Guarded by `tests/i18n-detect.test.js`.)
- `loadLocale(code)` — injects `/locales/<code>.js` once (root-absolute, so it resolves from
  `/views/*` too) and returns a cached Promise that resolves when `window.LOCALE_<CODE>` is set.
  This is how only the active language is fetched; nothing preloads all three. Pages **must
  `await loadLocale(getLang())` before the first render**.
- `T(key, ...args)` — look up `LOCALE_<lang>.ui[key]`, fall back to the `DEFAULT_LANG` (EN) value,
  then to the raw key (and tolerates a not-yet-loaded locale by returning the key). If the value is
  a **function**, it's called with `args` (e.g. `planner_progress: (done, total) => ...`).
- `setLang(code, skipSave)` — **async**: `await loadLocale(code)`, then set language, persist to
  `localStorage`, push to cloud via `saveLangToCloud` (unless `skipSave`), then re-`render()`.
  `skipSave` is used when applying the language loaded *from* the cloud, to avoid a write-back loop.
- `getLang()`, `renderLangSwitcher()` (renders the EN/UA/RU buttons).

### `theme.js` — light/dark theme (mirrors the i18n pattern)
Loaded by every page. `_theme` is initialised from `localStorage['ui_theme']` (default `'light'`;
valid `light`/`dark`) and applied as `data-theme` on `<html>` immediately on load.
- `setTheme(code, skipSave)` — set + persist to `localStorage`, apply `data-theme`, push to cloud
  via `saveThemeToCloud` (unless `skipSave`), then `render()`. `skipSave` is used when applying the
  theme loaded *from* the cloud (during `initApp`), to avoid a write-back loop — same contract as
  `setLang`.
- `toggleTheme()`, `getTheme()`, `renderThemeToggle()` (the ☾/☀ button in the user bar).

> **Theme FOUC fix.** `theme.js` is an external script loaded *after* the blocking Supabase CDN
> `<script>`, so on its own the browser could paint the light default before `theme.js` runs. To
> prevent the dark→light flash, every page (incl. `index.html`) carries a tiny **inline** `<script>`
> as the first thing in `<head>` that reads `localStorage['ui_theme']` and sets `data-theme`
> synchronously — before any CSS paints. `theme.js` keeps the same API; the inline snippet just wins
> the first paint. (Guarded by `tests/ui-refactor.test.js`.)

### `header.js` — shared app chrome (planner / vocab / verbs / collections / stats)
The single source of truth for the header + nav, so all sections render an **identical** header
(same markup, same 920px width, same nav tabs) — the app reads as one site, not separate pages.
- `appHeader(active, { cat, h1, subtitle })` — returns the full `<header>` markup: category line,
  `<h1>` (raw HTML), italic subtitle, the nav tabs (with `active` marking the current page), the
  language switcher, theme toggle, user email and logout. Nav hrefs are the **pretty URLs**
  (`/planner` `/vocab` `/verbs` `/collections` `/stats`) defined once in `NAV_ITEMS`.
- Each page calls it from its own render: planner's `renderHeader()` and collections' `header()`
  delegate to it; vocab/verbs interpolate `${appHeader(…)}` directly. Depends on `T` /
  `renderLangSwitcher` (i18n), `renderThemeToggle` (theme, guarded by `typeof`), `esc` (utils),
  `currentUser` / `logout` (cloud-sync).
- `appFooter({ text, showEmail, right })` — the matching shared **footer** for the four app pages
  (note text via `T()`, GitHub + Privacy + Terms links, and an optional `right` slot for a tagline).
  planner passes `planner_footer` + `showEmail` + a `«Schritt für Schritt»` tagline; vocab/verbs and
  collections call it bare. Privacy/Terms point to the `/privacy` `/terms` pages.

### `planner-data.js` — curriculum day model (planner + today)
The flattening of `WEEKS` into `DAYS` (one task = one day), `TOTAL_DAYS`, and `getLocalizedDay(d)`
(the active-locale overlay) — extracted from `planner.html` so `/planner` and the `/today` wizard
share one day model. A task is either a Course-v2 object `{ type, text, grammarFocus?, drill?,
checklist? }` or a legacy v1 `[type, text]` tuple; `taskFields(task)` normalizes both, so a mixed
dataset works during a cutover window. It also owns the pure **course-readiness** helper
`dayReadiness(blocks)` (over `SRS_FAMILIES = ['grammar','vocab','verbs']`): the share of a day's core
SRS families worked, read from the `dayStats[day].blocks` summary `/today` records — used by both the
`/today` done screen and the `/planner` day card to report the 5-min light track's partial coverage
distinct from the streak (redesign-v2 §17 item 5). Top-level `const`/`function` in a classic script
live in the shared global lexical scope (same pattern as `leitner.js` `MAX_BOX`), so both pages see
these directly. Depends on `WEEKS` (must load first) and `getLang`.

### `stats.js` — streak + activity-calendar math (planner + today; DEV-7) + statistics-page aggregation & B1 forecast (stats; DEV-8)
Pure, dependency-free helpers (operate on `'YYYY-MM-DD'` local date-key strings) so `/planner` and
`/today` compute identical numbers. The streak is **derived, never stored**: `activeDatesSet(dayStats,
lastActiveDate)` builds the set of the learner's active local dates from every completed day's
`dayStats[*].completedAt` **plus** the single `planner_data.lastActiveDate` stamp (so a trainer-only
day — a session run without finishing the whole day, which never writes `dayStats` — still counts);
`streakInfo(set, todayKey)` walks that set back from today to return `{ current, best, activeToday,
alive, freezeActive }`. Dates follow the `leitnerToday()` local-midnight convention, so the streak
rolls over at the learner's own midnight and is correct across month/year boundaries. **Streak freeze:**
one missed day is auto-forgiven at most once per `STREAK_FREEZE_WINDOW` (7) days — a single skip never
breaks the streak, a second skip inside the window does. `activityCalendar(todayKey, numWeeks, set)`
returns a Monday-first `numWeeks × 7` grid ending in today's week for the `/planner` mini-calendar.
Only `lastActiveDate` is added to `planner_data` (no counters, no new column); `/today` stamps it via
`markActive()` on any embedded session end. `module.exports` makes it dual-mode (browser global +
`require` for `tests/streak.test.js`). Guarded by `tests/streak.test.js`.

**DEV-8 statistics additions** (same purity/dual-mode contract, guarded by `tests/stats.test.js`):
`activeCountInWindow(set, todayKey, days)` (active days in a trailing window — the 7-/30-day
counters); `weeklyAccuracy(dayStats)` (per-curriculum-week `{ week, right, total, days, pct }` summed
from the `dayStats[*].counts` trainer scores — 5 study days = one week); `masteryBreakdown(records,
now)` (buckets an array of Leitner records into `{ mastered, learning, due, dueSoon, dueByTomorrow }`);
and `forecastFinish({ completions, currentDay, totalDays, todayKey, windowDays? })` — the **B1
forecast**: projects the course-completion date from the learner's realised pace (distinct completion
days per week over a trailing window ≤ 4 weeks, floored at the learner's own history and capped at
7/week), returning `{ daysLeft, done, hasPace, perWeek, weeksLeft, etaKey }`. All consumed by `/stats`
(§22).

### `vocab-trainer.js` / `verbs-trainer.js` — the shared trainer engines (`window.VocabTrainer` / `window.VerbsTrainer`)
Each is a single namespace object holding the **entire** trainer: helpers, Leitner routing, the
session state machine, every sub-renderer, and the keyboard handler — extracted from the old inline
scripts so the **same engine runs on both the standalone page and the `/today` wizard**. Template
`onclick`/`onkeydown` strings are namespaced (`VocabTrainer.answer(true)`) so the two engines coexist
on `/today` without colliding on global names. The host wires them via `init(opts)`:
- `embedded` — `false` on `/vocab` `/verbs` (home screen + sessions); `true` on `/today` (sessions
  only — `render()` is a no-op between sessions, and the end screen's primary button + the session
  `×` call `onSessionEnd` to advance the flow instead of returning home).
- `onSaveVocab` / `onSaveVerbs` (vocab) / `onSave` (verbs) — persistence callbacks. Default to the
  globals (`saveToCloud` / `saveVerbsToCloud`), so the standalone pages need no overrides; `/today`
  routes each to a single-column writer (`saveVocabToCloud` / `saveVerbsToCloud`).
- `onSessionEnd(summary)` — embedded only; called when a session finishes/closes, with
  `summary = { right, total }` (the session's first-try score) so the host can record the result —
  `/today` stores it in `flow.vocabResult` / `flow.verbResult` for the day summary, then advances.
Cloud-contract helpers live on the engine (`serialize`, `applyData`, `applyVerbProgress`/`setVerbStore`
on vocab; `serialize`, `applyData`, `setMasteryStore` on verbs); the thin host's
`getCloudPayload`/`applyCloudData` delegate to them. `setVerbStore`/`setMasteryStore` let `/today`
point BOTH engines at one shared `verbs_data.mastery` map (see §19). The engines depend on the same
globals the inline code used (`T`/`getLang`, `esc`/`showToast`/`normalize`/`diffChars`/`track`/
`stageConfirm`, `leitner*`/`MAX_BOX`, `speak`, `VOCAB`/`PLURALS`/`VERBS`). Tests reach engine
internals through the namespace via a small `harness.js` bridge (top-level lookup falls back to
`window.VocabTrainer`/`VerbsTrainer`), so the existing trainer tests kept their `exports` lists.

**Error explanations (DEV-15).** On a MISS, the article / plural / verb-conjug modes show a one-line
localized grammar rule under the feedback (never on a hit → no layout jump). The matching is a pure,
language-agnostic engine in `data/hints.js` (`window.HINTS`, see §7); the localized prose is three
parametric locale keys (`hint_article` / `hint_plural` / `hint_verb`). Each engine keeps a tiny
`hintHtml(h)` helper that renders `T(h.key, ...h.args, esc(examples))`, and calls `HINTS` guarded by
`typeof HINTS !== 'undefined'` so a page that doesn't load `data/hints.js` simply shows no hint. A
`null` return (no rule confidently applies) also shows nothing.

### `legal.js` — shared renderer for the static legal pages (`/privacy` · `/terms`)
`renderLegal(active, doc)` builds the landing-style chrome (header + footer) around a per-language
content object (`{ title, intro, sections:[{h, items:[]}] }`) defined inline in each page (precedent:
`ai-config.js` prompt objects). The pages (`views/privacy.html` / `views/terms.html`, served via the
`/privacy` `/terms` rewrites) load only `i18n.js` / `theme.js` / `utils.js` / `pwa.js` / `legal.js` —
no Supabase/cloud-sync. The footer's GitHub/Privacy/Terms links are shared with the landing and the
app `appFooter`.

### `ai-config.js` — Gemini configuration (planner + collections)
Loaded by `planner.html` and `collections.html`. Exports two model-id constants and three prompt
getters:
- `AI_MODEL_ID` — model for daily lessons + collection translation (currently `gemini-3.1-flash-lite`).
- `AI_PRO_MODEL_ID` — model for weekly summaries (currently `gemini-3.5-flash`).
- `getAiSystemPrompt()` — returns the tutor system prompt for the active UI language (RU/UA/EN).
  The prompt sets the persona, student context (A1→B1, lives in Berlin), output format (theory +
  examples + exercises + answer key), formatting rules for German (nouns with article/plural,
  verb conjugation tables), per-task-type adaptation rules, a "this app" rule (don't recommend
  third-party apps like Anki/Quizlet for flashcards/SRS/articles — point to the built-in trainers),
  and an external-resource rule (only for unique material not in the app, always with a direct
  markdown link, no invented URLs — rendered clickable by `markdown.js`). It also appends a short
  localized line built from the global `userOnboarding` (goal + "hardest" → `AI_GOAL_PHRASES` /
  `AI_HARDEST_PHRASES`), so lessons target the student's stated goal and weakest area (§20).
- `getAiSummaryPrompt()` — returns the weekly-summary system prompt (also per language), with the
  same `userOnboarding` goal/hardest suffix appended.
- `getCollectionsTranslatePrompt()` — returns the batch-translation prompt (per language): translate
  a JSON array of German terms into the active UI language, returning ONLY a same-order JSON array.

All prompts are pure string constants — edit this file to change models or tune the personas without
touching the pages.

### `gemini.js` — minimal Gemini client (planner + collections)
The two functions extracted so both AI features share one implementation:
- `getGeminiKey()` — reads the user's key from `localStorage['gemini_key']` (key *management* /
  cloud-sync stays in `planner.html`; see §8).
- `geminiRequest(model, systemPrompt, messages)` — one `generateContent` fetch; maps
  `role:'model'|'user'`, throws on `data.error`, returns the reply text. No app-specific globals, so
  it's safe to load anywhere.

### `markdown.js` — inline Markdown renderer for AI replies (planner + today)
`escHtml` / `inlineMd` / `renderMdTable` / `renderMd` — extracted from `planner.html` so the planner's
AI Lehrer chat and the `/today` wizard render model output identically (headings, lists, GFM tables,
bold/italic/code, safe http(s)/mailto links). Security-relevant: content is HTML-escaped **before**
inline markup is applied; the link autolinker parks markdown links behind a NUL sentinel so bare-URL
detection can't double-wrap them. Guarded by `tests/markdown.test.js` (loaded via `planner.html`).

### `leitner.js` — spaced-repetition core (shared by vocab + verbs)
A small pure-logic library; no DOM access.

Card shape: `{ box:0..5, due:ms, right:count, wrong:count, seen:count }`.
- `leitnerBlank()` → zeroed card.
- `leitnerIsDue(card, now)` → `card.due <= now` (unseen card always due).
- `leitnerIsSeen(card)` → `card.seen > 0`.
- `leitnerIsMastered(card)` → `card.box >= 5`.
- `leitnerBoxOf(card)` → `card.box`.
- `leitnerIsWeak(card)` → is this a **weak spot**? `seen>0 && wrong>0 && box<5` (seen + missed + not
  mastered). `leitnerWeakness(card)` → a ranking score (higher = weaker: miss count, then miss ratio,
  then distance from mastery; `-Infinity` for non-weak). Drive `/today`'s cross-track weak-spots round
  (§19); due date is intentionally ignored (shore up shaky cards now, not when they fall due).
- `leitnerApply(card, correct, opts)` — mutates the card:
  - `seen++`; correct → `box = min(5, box+1)`.
  - wrong → configurable via `opts.wrongPolicy`: `'reset'` (default) → `box = 1`;
    `'soft'` → `box = max(1, box-2)` (a miss drops two boxes instead of wiping all progress).
    The trainers (vocab/plural/verbs) and the `/today` grammar-review track (§19) pass
    `{ wrongPolicy: 'soft' }`; **collections keeps the default reset** (omits `opts`).
  - `due = now + BOX_INTERVAL[box]` where `BOX_INTERVAL = {1:1d, 2:2d, 3:4d, 4:8d, 5:16d}`.

### `speech.js` — Web Speech API wrapper (German TTS)
- Caches a `de-*` voice in `GERMAN_VOICE`. Re-picks on `speechSynthesis.onvoiceschanged`.
  Priority: voice.lang matches `/de[-_]/i`, fallback `/german|deutsch/i` on voice.name.
- `pickVoice()` — run on page load and on `onvoiceschanged`.
- `speak(text, btnEl?, rate?)` — speaks with `lang='de-DE'`, default `rate=0.9`; adds/removes
  `.speaking` class on `btnEl` while speaking.
- `ttsAvailable()` — is the Web Speech API + its utterance ctor present? (`/today`'s listen block gates
  on it, so missing TTS skips the block instead of deadlocking.)
- `speakLines(lines, {btnEl?, rate?, onEnd?})` — speaks several German lines in sequence (one utterance
  per line, a single `cancel()` up front so repeat presses don't pile up); `.speaking` on `btnEl` for
  the whole run, `onEnd` after the last line. Used by the `/today` listen step to play a dialogue.

### `utils.js` — tiny shared helpers
- `esc(s)` — HTML-escape `& < > " '`. **Every** dynamic value interpolated into `innerHTML` must
  go through this.
- `showToast(msg, duration?)` — bottom toast; default 2600 ms. Requires a `#toast` element.
- `normalize(s)` — lowercase, trim, ä→ae / ö→oe / ü→ue / ß→ss, collapse spaces.
  Used for spelling comparison: `normalize(userInput) === normalize(target)`.
- `diffChars(a, b)` → `{ aHtml, bHtml }` — LCS character diff, case-insensitive.
  `aHtml` wraps extra/wrong chars in `<span class="diff-bad">`;
  `bHtml` wraps missing chars in `<span class="diff-miss">`.
- `stageConfirm(state, message, action)` / `clearConfirm(state)` — helpers to set/clear the
  `state.confirm` object that drives the in-page confirm modal.

### `feedback.js` — feedback loop (landing + every app page; DEV-10)
The "💬 Feedback" footer entry point + its in-page modal (a free-text note + an optional 1–5 mood),
writing to the `feedback` table (§5). The modal is a **self-managed overlay appended to `<body>`** —
deliberately NOT part of any page's `#app` re-render — so one module serves the landing and all seven
app pages without threading markup/handlers through each `render()`; a page re-render can't wipe it.
- `feedbackButton(cls?)` — the footer link markup (`onclick="openFeedback()"`). `appFooter` (header.js)
  appends it on app pages; the landing footer calls it directly.
- `openFeedback(isPrompt?)` / `closeFeedback()` / `setFeedbackMood(n)` / `submitFeedback()` — global
  handlers (classic-script globals, for inline `onclick`). `isPrompt` swaps in the softer auto-prompt
  copy. Mood is optional; tapping the selected mood clears it. Errors render inline (not a toast, which
  the overlay would cover); success closes the modal + toasts thanks.
- `submitFeedbackToCloud({page,text,mood})` → `boolean` — inserts the row (anonymous when there's no
  `currentUser`); never throws.
- `feedbackShouldPrompt(planner)` → `boolean` — **pure**: true once ≥3 days are completed
  (`planner_data.dayStats`) and `planner_data.feedbackPrompted` isn't set. `/today`'s `renderDone`
  calls it via `maybePromptFeedback`, which sets the flag + `saveToCloud()` so it fires at most once.
- Dual-mode (browser global script + CommonJS) so the pure helpers are unit-testable
  (`tests/feedback.test.js`), mirroring `stats.js`.

### `supabase.js` — client
- Creates `sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`. URL/key are
  build-time placeholders (see §2).

### `cloud-sync.js` — session + progress sync (the per-page contract)
Each page must define these globals **before** calling `initApp()`:

| Global | Purpose |
| --- | --- |
| `CLOUD_FIELD` | column on the `progress` table: `'planner_data'`, `'vocab_data'`, or `'verbs_data'`. **Optional** — a page that owns a *separate* table (`collections.html`) omits it (and `getCloudPayload`/`applyCloudData`); `initApp` then just enforces the session and loads `lang`/`theme`. |
| `applyCloudData(d)` | apply the loaded JSON payload into local `state` (omit if no `CLOUD_FIELD`) |
| `getCloudPayload()` | return the object to persist into `CLOUD_FIELD` (omit if no `CLOUD_FIELD`) |
| `render()` | (re)draw the UI |

**Collections CRUD (separate `collections` table, §5):** `loadCollectionsFromCloud()` (all rows for
the user), `saveCollectionToCloud(c)` (full-row upsert on create/edit), `saveCollectionMastery(id,
mastery)` (partial upsert of just the `mastery` column — the per-answer hot path),
`deleteCollectionFromCloud(id)`. All ride the offline outbox like the lessons functions; queued
collection upserts **merge per id** so a create + later mastery update collapse into one row.

`cloud-sync.js` provides:
- `currentUser` (global, set after auth). `userOnboarding` (global) — the `onboarding` column,
  loaded by `initApp`; read by `ai-config` (goal/hardest → AI prompt, §4) and `/today` (minutes →
  session length, §20).
- `initApp()` — `sb.auth.getSession()`. **No session →** store `location.href` in
  `localStorage['auth_redirect']` and redirect to `/login`. **Session →** set `currentUser`,
  `SELECT <CLOUD_FIELD>, lang, onboarding` from `progress` (via **`.maybeSingle()`** so a missing row
  is `data:null` rather than a throw), apply the payload (only when non-empty — the `{}` column
  default is skipped). **Onboarding gate:** redirect to `/welcome` (unless already on `/welcome`/`/login`)
  when either (a) there is **no progress row** (brand-new account, `isNewUser`), or (b) the row's
  `onboarding.onbVersion` predates the current `ONBOARDING_VERSION` (`needsReonboarding`) — the v2
  rebuild re-onboards every existing user **once** so they re-pick their preferences for the new
  180-day plan; completing/skipping stamps a fresh `onbVersion`, so the gate never fires again (§20).
  Both signals are set **only on a successful read**, so an offline read (which lands in the `catch`,
  where both stay false) never traps anyone. Otherwise it resolves the language **before** the first render, then
  `await setLang(lang, true)` loads that one locale and renders **once** — no language flash.
- **Course v2 migration.** `initApp` fetches `planner_data` on **every** field page (added to the
  select when it isn't the page's own column) and runs `_migratePlannerV2` on it, so the reset fires
  on whichever page a v1 account loads first: a **pre-v2** row (no `courseVersion`, day numbers keyed
  to the old 24-week order) is reset to a **clean v2 course state** — `{ courseVersion:2,
  currentDay/viewingDay = start day for the onboarding level (A1→1, A2→61, B1→121), completed:{},
  dayStats:{}, grammarReview:{}, migratedFrom }` — and immediately persisted (`_pushProgress`) so it
  sticks. Old day numbers / `completed` / `lessons` are **not** remapped (redesign §2); `verbs_data`
  (keyed by infinitive) and vocab `modes`/`levels` are kept, while stale index-keyed vocab mastery is
  reset by the vocab engine (see the bullet below). An already-v2 payload is returned untouched
  (idempotent). New accounts get `courseVersion:2` stamped by `/welcome`. Because the reset is
  silent otherwise (redesign §2 "Do not hide the reset"), `/today`'s intro shows a **one-time
  dismissible notice** whenever `planner.migratedFrom` exists without an ack (`migrationPending()`);
  dismissing it (`ackMigration()`) writes `migratedFrom.ackAt` back into `planner_data` and re-renders,
  so it never re-appears and the ack round-trips like any other planner key. (Guarded by
  `tests/course-v2-cutover.test.js`.)
- **Legacy lessons stay hidden after the reset.** A v1→v2 reset leaves the account's old `lessons`
  rows in the DB, but they are keyed to the OLD day numbers (weekly summaries live under negative
  days), so they must not surface under the unrelated new days (redesign §2 Lessons Policy, Gate 6).
  `initApp` records the reset timestamp (`_noteMigratedAt` ← `planner_data.migratedFrom.at`, online
  and offline), and `loadLessonsFromCloud` drops every row written **before** it
  (`updated_at < migratedFrom.at`; ISO-8601 sorts chronologically). Rows are **ignored, not deleted**
  (a future "legacy notes" viewer could still surface them); native / never-migrated accounts keep
  everything. Both readers — `/planner`'s `loadLessonsThenRender` and `/today`'s `loadDayLesson` —
  go through `loadLessonsFromCloud`, so both are covered. (Guarded by `tests/legacy-lessons.test.js`.)
- **Stale v1 vocab mastery is reset on first v2 load.** `vocab_data`'s `mastery`/`pluralMastery` are
  index-keyed (`"week-idx"`) against `VOCAB`, so cards graded on the pre-v2 word lists would silently
  re-attach to unrelated v2 words (redesign §2/§6). `VocabTrainer.applyData` drops both maps —
  keeping `modes`/`levels`/`newLog` — when the payload lacks the `courseVersion` stamp AND either the
  account was migrated (`courseMigratedAt()`, the getter over `_noteMigratedAt`'s timestamp) or the
  payload's `savedAt` predates the v2 cutover (a v1 vocab-only account that never opened the
  planner). `VocabTrainer.serialize()` stamps `courseVersion` on every save, so the reset runs at
  most once per account; v2-native accounts are never touched. The verb store needs no reset — it is
  keyed by infinitive. (Guarded by `tests/course-v2-cutover.test.js`.)
- `saveToCloud()` / `saveLangToCloud(code)` / `saveThemeToCloud(theme)` / `saveVerbsToCloud(payload)`
  / `saveVocabToCloud(payload)` / `saveOnboardingToCloud(payload)` — all route through the internal `_pushProgress(fields)`, which
  `upsert`s `{ user_id, …fields, updated_at }` on the `progress` row (`onConflict: 'user_id'`). They
  write only their own column(s), so they compose without clobbering each other. `saveVocabToCloud`
  is used by the `/today` wizard, which drives the vocab engine without owning `vocab_data` as its
  `CLOUD_FIELD` (it owns `planner_data`); the `/vocab` page still writes `vocab_data` via `saveToCloud`.
- During `initApp`, if the page defines `applyVerbProgress(d)`, the shared `verbs_data` is loaded
  into it (separate query, before render) — this is how the vocabulary page gets cross-cutting verb
  mastery without changing its own `CLOUD_FIELD`.
- `logout()` — `sb.auth.signOut()` then go to `/`.

**Offline outbox (write resilience).** Every write goes to Supabase directly; cloud stays the
source of truth. If a write **fails** (offline / transient), the payload is parked in
`localStorage['cloud_outbox']` instead of being lost, and a one-time `T('toast_offline_saved')`
fires. `flushOutbox()` replays the queue and clears it (firing `T('toast_sync_restored')`) when
connectivity returns — it's wired to the `window` `online` event, `document` `visibilitychange`
(tab refocus), the next `initApp`, and the next successful write. The outbox is a **transient
retry buffer, not a progress store** (§12/§13):
- *Shape* — `{ uid, progress?: {user_id, …columns, updated_at}, lessons?: { "<day>": {op:'upsert', messages} | {op:'delete'} } }`.
- *Merge* — progress upserts are idempotent (PK = `user_id`), so queued partial field-updates **merge
  into one row**; lesson writes **dedupe per day** (latest op wins, e.g. upsert-then-delete collapses
  to a delete).
- *Safety* — the queue is tagged with `uid`; a queue belonging to a different signed-in user is
  discarded on flush (it would fail RLS anyway), so it can never write one user's data to another.

**Offline read mirror (cold-start resilience).** The outbox protects *writes*; the **read mirror**
(`localStorage['cloud_cache']`) protects *reads*. Every successful cloud read — and every successful
progress write — is mirrored here, so opening the installed app (§17) with **no connection at all**
still shows the user's data instead of an empty default. On a read failure the loaders fall back to
the mirror: `initApp`'s progress + `verbs_data` reads via `_ownCache().progress`,
`loadLessonsFromCloud` / `loadCollectionsFromCloud` via the cached arrays. Like the outbox it is a
**transient mirror, not a source of truth** (§12): it is scoped to the signed-in user (`uid`-tagged,
a foreign mirror is dropped on `initApp` and on `logout` via `clearCloudCache`), and the cloud
overwrites it on the next successful read. *Limitation:* changes made online in one session are
mirrored, but a brand-new account that has never loaded online has nothing to fall back to.

**Lessons (AI chat history) — separate table `lessons`:**
- `loadLessonsFromCloud()` — `SELECT day, messages` for the current user; returns `[]` on error.
- `saveLessonToCloud(day, messages)` — `upsert` `{ user_id, day, messages, updated_at }` with
  `onConflict: 'user_id,day'`; on failure queues `{op:'upsert'}` in the outbox. `day > 0` = daily
  lesson; `day < 0` = weekly summary for week `(-day)` (e.g. `day = -3` stores the week-3 summary).
- `deleteLessonFromCloud(day)` — `DELETE` the row for that `user_id` + `day` pair; on failure queues
  `{op:'delete'}`.

# Architecture — Deutsch Daily (German A1 → B1 learning tools)

Comprehensive technical reference for this project. Re-derived directly from the source on
2026-06-10 (after the shared-module refactor: `leitner.js` / `speech.js` / `utils.js`, decomposed
planner render, lazy locales, and the `tests/` suite). For day-to-day editing rules and gotchas see
[CLAUDE.md](CLAUDE.md); this document is the deeper "how it all fits together" reference.

---

## 1. What the product is

A small web app that helps one user study German from ~A1 to the **Goethe-Zertifikat B1** exam
over a ~6-month, 24-week plan. The system has three built-in trainers, a user-collections trainer,
and a built-in AI tutor:

1. **Planner** (`/planner`) — one study day = one main task (118 days total).
   Contains a **built-in AI tutor chat** (Gemini) and a clipboard-copy button for the day plan.
2. **Vocabulary trainer** (`/vocab`) — 504 words across 24 weekly sets, three exercise modes
   mixed together, Leitner spaced repetition, and text-to-speech.
3. **Verb trainer** (`/verbs`) — drills 306 irregular verbs (three Stammformen) in cloze,
   triad-flashcard, and table modes; mastery is shared with the vocabulary page.
4. **AI Lehrer chat** — the planner has a built-in Gemini chat per study day. The user clicks
   "Start lesson" and the day plan is sent automatically as the opening message; subsequent
   turns are a live chat with a tutor persona. Conversation history is persisted per-day in
   the `lessons` Supabase table. A weekly-summary feature (PRO model) rolls up all lesson
   transcripts into feedback. (Requires the user to supply their own Gemini API key.)
5. **Collections** (`collections.html`) — user-supplied word sets imported from CSV or pasted from
   Excel/Sheets, drilled with the **same** flashcard/article/spelling trainers and Leitner model.
   Unlimited collections; optional one-click AI translation of missing entries. (See §16.)

The curriculum runs 24 weeks in 3 phases:

- **Phase 1 (weeks 1–8), A1→A2:** cases (Akkusativ, Dativ, Genitiv intro), modal verbs, Perfekt,
  separable prefixes, Imperativ.
- **Phase 2 (weeks 9–16), A2:** Präteritum, subordinate clauses (weil/dass/wenn/als), comparison,
  reflexive verbs, adjective declension (intro).
- **Phase 3 (weeks 17–24), B1:** full adjective declension, passive voice, Konjunktiv II,
  Relativsätze, indirect speech, verbs with prepositions + exam-format practice.

UI languages: **RU / UA / EN**. Learning content is German with a translation in the active UI
language.

---

## 2. Tech stack & deployment

- **Vanilla HTML/CSS/JS** — no framework, no bundler, no client build step. Each page is plain
  markup + an inline `<script>` plus a few shared `<script src>` modules.
- **Supabase** (`@supabase/supabase-js@2` from jsDelivr CDN) for auth + per-user progress storage.
- **Google Fonts** (Fraunces + Manrope) via `<link>` — the only other external load.
- **Hosting:** Vercel, static. `vercel.json` keeps `outputDirectory: "."` and adds `rewrites` that
  map the **pretty URLs** `/planner` `/vocab` `/verbs` `/collections` to the physical
  `views/<page>.html` files. (`cleanUrls` is intentionally **off** — it makes Vercel redirect
  `.html` paths to extensionless ones, which breaks a rewrite whose destination ends in `.html`.)
  Production URL is
  `https://deutsch-daily-red.vercel.app/` (referenced as the OAuth `redirectTo`).
- **Build:** `npm run build` → `node build.js`. `build.js` reads `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the environment and replaces the `YOUR_PROJECT_ID` /
  `YOUR_ANON_KEY` placeholders inside `assets/js/supabase.js`. It exits non-zero if either env var
  is missing. The committed `supabase.js` holds placeholders; real credentials are injected at
  deploy time on Vercel.

> The app is now an **authenticated HTTPS web app**. It requires a Supabase session, so it does
> not function when opened from the filesystem (`file://`). The heavy `file://` defensiveness in
> the project's history is largely historical — see §12.

---

## 3. Project structure

```
deutsch-daily/
├── index.html          # LOGIN / REGISTER page (email + Google OAuth). Root entry point ( / ).
├── views/              # all authenticated app pages live here; served via pretty-URL rewrites
│   ├── planner.html     # Daily planner + AI Lehrer chat.            ( /planner )
│   ├── vocab.html       # Vocabulary trainer.                         ( /vocab )
│   ├── verbs.html       # Irregular-verb trainer (triad / cloze / table). ( /verbs )
│   └── collections.html # User word-set trainer (import/edit/drill/AI translate). ( /collections ) §16
├── assets/
│   ├── css/  base.css · components.css · planner.css · chat.css · vocab.css · verbs.css · auth.css · collections.css
│   └── js/   i18n.js · theme.js · utils.js · supabase.js · cloud-sync.js · ai-config.js
│             gemini.js · leitner.js · speech.js · header.js
├── data/   weeks.js (WEEKS) · vocab.js (VOCAB) · verbs.js (VERBS — master verb dictionary)
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_RU / _UA / _EN = { ui, vocab, verbs, weeks })
├── build.js · package.json · vercel.json
├── ARCHITECTURE.md · CLAUDE.md · README.md · LICENSE
```

**Routing model:** `index.html` *is* the auth screen (the full login/register form) and is the only
HTML at the repo root, served at `/`. The four authenticated pages live in `views/` and are reached
via the `vercel.json` pretty-URL rewrites (`/planner` → `/views/planner.html`, …). All inter-page
navigation (the nav tabs in `header.js`, the post-login redirect, the session-loss redirect) uses
these pretty URLs / `/`. There is no separate "router" page — per-page session checks (`initApp`) do
the gating. The legacy `auth.html` redirect stub was deleted.

### Script load order

**planner.html:**
```
Supabase CDN
→ assets/js/i18n.js                (T, getLang, setLang, loadLocale, renderLangSwitcher)
→ assets/js/theme.js               (theme toggle + persistence)
→ assets/js/utils.js               (esc, showToast)
→ assets/js/supabase.js            (sb client)
→ assets/js/cloud-sync.js          (initApp, saveToCloud, … logout, currentUser, lessons functions)
→ assets/js/ai-config.js           (AI_MODEL_ID, AI_PRO_MODEL_ID, getAiSystemPrompt, getAiSummaryPrompt, getCollectionsTranslatePrompt)
→ assets/js/gemini.js              (getGeminiKey, geminiRequest)
→ assets/js/header.js              (appHeader — shared header/nav markup)
→ data/weeks.js                    (WEEKS)
→ inline page <script>             (state, chat state, render, page logic)
   initApp().then(loadLessonsThenRender)
```

> All in-page `<script src>` / `<link href>` use **root-absolute paths** (`/assets/…`, `/data/…`,
> `/locales/…`) so the pages work from `/views/*` and from the pretty-URL rewrites alike (§2). The
> first thing in every `<head>` is a tiny inline `<script>` that sets `data-theme` from
> `localStorage` synchronously — see the theme-FOUC note in §4.

**vocab.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js                       (leitnerApply, leitnerIsDue, leitnerIsMastered, …)
→ speech.js                        (speak, pickVoice)
→ header.js                        (appHeader)
→ data/vocab.js                    (VOCAB)
→ inline page <script>             (state, verbStore, render, page logic; calls initApp() last)
```

**verbs.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js
→ speech.js
→ header.js                        (appHeader)
→ data/verbs.js                    (VERBS)
→ inline page <script>             (state, render, page logic; calls initApp() last)
```

**collections.html:** (no `data/` files — words come from the user / cloud `collections` table)
```
Supabase CDN
→ i18n.js → theme.js → utils.js → leitner.js → speech.js → supabase.js → cloud-sync.js
→ ai-config.js                     (getCollectionsTranslatePrompt) → gemini.js (getGeminiKey, geminiRequest)
→ header.js                        (appHeader)
→ inline page <script>             (state, parseDelimited, ported trainer engine, render)
   initApp().then(loadCollectionsThenRender)   // no CLOUD_FIELD — owns the `collections` table
```

**Locale files are NOT in this list — they load on demand.** `i18n.loadLocale(code)` injects
`/locales/<code>.js` for the active language only (and caches it); the page bootstrap awaits
`loadLocale(getLang())` before the first render (`initApp()` for planner/vocab; the init chain in
`index.html`). Switching language fetches that one locale once. So a user downloads a single
locale, not all three.

**Early shell render (no header flash on section switch).** Nav tabs are plain `<a href>` — each
click is a full page load, and the whole `#app` (header included) is JS-rendered. If the first
render waited for `initApp()`'s Supabase round-trips, the header would blank out and pop back in on
every section switch. So each app page paints the shell immediately from local state once the
locale is ready, *before* the cloud is reached:
`loadLocale(getLang()).then(() => { try { render(); } catch {} });` runs right before `initApp()`.
The saved language is known synchronously from `localStorage['ui_lang']`, so this first paint is
already in the right language; `initApp()` then re-renders once with the cloud data (progress,
email). (Guarded by `tests/ui-refactor.test.js`.)

`index.html` (the login page, at the repo root) loads only the subset it needs (it skips
`cloud-sync.js`, `header.js`, and the data files). The legacy `auth.html` redirect stub was removed.

---

## 4. Shared modules (`assets/js/`)

### `i18n.js` — translation core (lazy locale loading)
- `_lang` initialised from `localStorage['ui_lang']`, default `'en'` (`DEFAULT_LANG`). Valid:
  `en`, `ua`, `ru`.
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

### `header.js` — shared app chrome (planner / vocab / verbs / collections)
The single source of truth for the header + nav, so all four sections render an **identical** header
(same markup, same 920px width, same nav tabs) — the app reads as one site, not four pages.
- `appHeader(active, { cat, h1, subtitle })` — returns the full `<header>` markup: category line,
  `<h1>` (raw HTML), italic subtitle, the nav tabs (with `active` marking the current page), the
  language switcher, theme toggle, user email and logout. Nav hrefs are the **pretty URLs**
  (`/planner` `/vocab` `/verbs` `/collections`) defined once in `NAV_ITEMS`.
- Each page calls it from its own render: planner's `renderHeader()` and collections' `header()`
  delegate to it; vocab/verbs interpolate `${appHeader(…)}` directly. Depends on `T` /
  `renderLangSwitcher` (i18n), `renderThemeToggle` (theme, guarded by `typeof`), `esc` (utils),
  `currentUser` / `logout` (cloud-sync).

### `ai-config.js` — Gemini configuration (planner + collections)
Loaded by `planner.html` and `collections.html`. Exports two model-id constants and three prompt
getters:
- `AI_MODEL_ID` — model for daily lessons + collection translation (currently `gemini-3.1-flash-lite`).
- `AI_PRO_MODEL_ID` — model for weekly summaries (currently `gemini-3.5-flash`).
- `getAiSystemPrompt()` — returns the tutor system prompt for the active UI language (RU/UA/EN).
  The prompt sets the persona, student context (A1→B1, lives in Berlin), output format (theory +
  examples + exercises + answer key), formatting rules for German (nouns with article/plural,
  verb conjugation tables), and per-task-type adaptation rules.
- `getAiSummaryPrompt()` — returns the weekly-summary system prompt (also per language).
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

### `leitner.js` — spaced-repetition core (shared by vocab + verbs)
A small pure-logic library; no DOM access.

Card shape: `{ box:0..5, due:ms, right:count, wrong:count, seen:count }`.
- `leitnerBlank()` → zeroed card.
- `leitnerIsDue(card, now)` → `card.due <= now` (unseen card always due).
- `leitnerIsSeen(card)` → `card.seen > 0`.
- `leitnerIsMastered(card)` → `card.box >= 5`.
- `leitnerBoxOf(card)` → `card.box`.
- `leitnerApply(card, correct)` — mutates the card:
  - `seen++`; correct → `box = min(5, box+1)`; wrong → `box = 1`.
  - `due = now + BOX_INTERVAL[box]` where `BOX_INTERVAL = {1:1d, 2:2d, 3:4d, 4:8d, 5:16d}`.

### `speech.js` — Web Speech API wrapper (German TTS)
- Caches a `de-*` voice in `GERMAN_VOICE`. Re-picks on `speechSynthesis.onvoiceschanged`.
  Priority: voice.lang matches `/de[-_]/i`, fallback `/german|deutsch/i` on voice.name.
- `pickVoice()` — run on page load and on `onvoiceschanged`.
- `speak(text, btnEl?, rate?)` — speaks with `lang='de-DE'`, default `rate=0.9`; adds/removes
  `.speaking` class on `btnEl` while speaking.

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
- `currentUser` (global, set after auth).
- `initApp()` — `sb.auth.getSession()`. **No session →** store `location.href` in
  `localStorage['auth_redirect']` and redirect to `/` (the login page). **Session →** set `currentUser`,
  `SELECT <CLOUD_FIELD>, lang` from `progress`, apply the payload (only when non-empty — the `{}`
  column default is skipped). It resolves the language (cloud value if valid, else the localStorage
  default) **before** the first render, then `await setLang(lang, true)` loads that one locale,
  syncs it into `localStorage`, and renders **once** — so there's no language flash and only the
  chosen locale is fetched.
- `saveToCloud()` / `saveLangToCloud(code)` / `saveThemeToCloud(theme)` / `saveVerbsToCloud(payload)`
  — all route through the internal `_pushProgress(fields)`, which `upsert`s
  `{ user_id, …fields, updated_at }` on the `progress` row (`onConflict: 'user_id'`). They write
  only their own column(s), so they compose without clobbering each other.
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

**Lessons (AI chat history) — separate table `lessons`:**
- `loadLessonsFromCloud()` — `SELECT day, messages` for the current user; returns `[]` on error.
- `saveLessonToCloud(day, messages)` — `upsert` `{ user_id, day, messages, updated_at }` with
  `onConflict: 'user_id,day'`; on failure queues `{op:'upsert'}` in the outbox. `day > 0` = daily
  lesson; `day < 0` = weekly summary for week `(-day)` (e.g. `day = -3` stores the week-3 summary).
- `deleteLessonFromCloud(day)` — `DELETE` the row for that `user_id` + `day` pair; on failure queues
  `{op:'delete'}`.

---

## 5. Auth & cloud-sync flow

The database is a Supabase Postgres connected to the Vercel project via the Vercel↔Supabase
integration (the integration injects the env vars `build.js` consumes — see §2). The app uses a
single table, `public.progress`, one row per user (confirmed schema):

| Column | Type | Null | Default | Written by | Payload shape |
| --- | --- | --- | --- | --- | --- |
| `user_id` | `uuid` | NO | — | upserts (conflict key) | `session.user.id` — PK, FK → `auth.users(id)` |
| `planner_data` | `jsonb` | yes | `'{}'::jsonb` | planner `getCloudPayload()` | `{ currentDay, viewingDay, completed }` |
| `vocab_data` | `jsonb` | yes | `'{}'::jsonb` | vocab `getCloudPayload()` → `serialize()` | `{ app, version:2, savedAt, selectedWeek, modes, levels, mastery }` |
| `verbs_data` | `jsonb` | yes | `'{}'::jsonb` | verbs `getCloudPayload()` **and** vocab `saveVerbStore()` | `{ app, version, savedAt, modes, sel, mastery }` — `mastery` keyed by **verb key**; `sel` = saved training selection |
| `lang` | `text` | yes | `'en'::text` | `saveLangToCloud` | `'ru' \| 'ua' \| 'en'` |
| `theme` | `text` | yes | — | `saveThemeToCloud` | `'light' \| 'dark'` |
| `gemini_key` | `text` | yes | — | `saveGeminiKeyToCloud` (planner, opt-in) | the user's Gemini API key, or `null`. Written only when the user ticks "remember on my account"; cleared (→ `null`) when they untick or remove the key. See §8. |
| `updated_at` | `timestamptz` | yes | `now()` | every upsert | ISO string |

> `verbs_data` was added with `alter table public.progress add column if not exists verbs_data jsonb default '{}'::jsonb;`. RLS is row-level (per `user_id`), so it covers new columns automatically. **Cross-cutting progress is live:** verb `mastery` is keyed by the verb key (e.g. `gehen`), so a verb counts the same wherever it appears. `verbs.html` owns the column via its `CLOUD_FIELD`. `vocab.html` ALSO reads/writes it: `cloud-sync` loads it into a `verbStore` via the page's `applyVerbProgress(d)` hook, and any vocabulary word that resolves to a master-verb key (`verbKeyForWord` strips the `—` form and looks it up in `VERBS`, ~69 of the vocab entries) routes its mastery to `verbStore` and persists via `saveVerbsToCloud`. `sel` (the verb-trainer's saved training selection) round-trips through the same column.

**Constraints & security:**
- `progress_pkey` — PRIMARY KEY (`user_id`). This is what makes the
  `upsert(..., { onConflict: 'user_id' })` calls behave as insert-or-update per user.
- `progress_user_id_fkey` — FOREIGN KEY (`user_id`) → `auth.users(id)`; each row is tied to a
  Supabase auth user.
- **RLS** policy `own data` — `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`:
  a signed-in user can read and write only their own row. (This is why shipping the anon key to the
  browser is safe — it cannot touch other users' rows.) Note: the policy only takes effect if RLS
  is enabled on the table (`alter table public.progress enable row level security`).

The canonical, idempotent DDL lives in **[`schema.sql`](schema.sql)** at the repo root (safe to
re-run; uses `if not exists` / guarded `create policy`). Equivalent shape:

```sql
create table public.progress (
  user_id      uuid        primary key references auth.users(id),
  planner_data jsonb       default '{}'::jsonb,
  vocab_data   jsonb       default '{}'::jsonb,
  verbs_data   jsonb       default '{}'::jsonb,
  lang         text        default 'en'::text,
  theme        text,                          -- no default; null → client default 'light'
  gemini_key   text,                          -- opt-in: user's Gemini API key, synced across devices
  updated_at   timestamptz default now()
);
alter table public.progress enable row level security;
create policy "own data" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI chat history (one row per user × day; weekly summaries stored as day = -week)
create table public.lessons (
  user_id    uuid        not null references auth.users(id),
  day        integer     not null,
  messages   jsonb       default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, day)
);
alter table public.lessons enable row level security;
create policy "own lessons" on public.lessons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user-supplied word sets (one row per collection; §16)
create table public.collections (
  id         uuid        primary key default gen_random_uuid(),  -- client-supplied (crypto.randomUUID)
  user_id    uuid        not null references auth.users(id),
  name       text        not null,
  words      jsonb       default '[]'::jsonb,   -- [ {id, de, tr, note?}, ... ]  (rewritten on edit)
  mastery    jsonb       default '{}'::jsonb,   -- { "<word.id>": leitner card }  (per-answer hot path)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.collections enable row level security;
create policy "own collections" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

`messages` is a JSON array of `{ role: "user"|"model", text: string }` objects — the full
conversation including the opening system message (the day plan). Day-lesson rows (`day > 0`)
use `AI_MODEL_ID`; summary rows (`day < 0`) use `AI_PRO_MODEL_ID`. The table is append-friendly:
clearing a lesson deletes the row (`deleteLessonFromCloud`); there is no soft-delete.

**Notes:**
- **Default language is `'en'` on both sides** — the DB column default (`lang 'en'`) matches the
  client default (`i18n.js` `DEFAULT_LANG = 'en'`), so a brand-new user sees English and there's no
  surprise language switch after the first save. `saveToCloud()` does **not** send `lang`; only
  `saveLangToCloud()` (the EN/UA/RU switcher) writes it.
- `planner_data` / `vocab_data` default to `'{}'::jsonb`. `initApp` applies a payload **only when
  non-empty** (`Object.keys(payload).length`), so neither page has to defend against `{}` — and the
  trainer no longer shows a spurious "bad file" toast when a row exists with an empty `vocab_data`
  (e.g. a row first created by the planner). The `mastery` guard inside `applyData` stays, because
  it also protects manual file import.

**Login (`index.html`):**
- On load, `sb.auth.getSession()`; if already signed in → `redirect()` (to
  `localStorage['auth_redirect']` or `/planner`). Otherwise render the form.
- Email/password sign-in (`signInWithPassword`) and sign-up (`signUp`, shows "confirm your email"
  notice). Google OAuth (`signInWithOAuth`, `redirectTo` = production root).
- Client-side validation: non-empty fields, password ≥ 6 chars. Error text via `T(...)`.

**Protected pages (`views/planner.html`, `views/vocab.html`, …):** `initApp()` enforces the session
(redirecting to `/` and remembering where to come back to via `auth_redirect`).

---

## 6. i18n data model

`window.LOCALE_RU / _UA / _EN`, each `{ ui, vocab, verbs, weeks }`, **lazy-loaded** (§4 —
`loadLocale`). **EN is the default and the `T()` fallback** (`i18n.js` `DEFAULT_LANG = 'en'`); each
locale is self-contained so the active one works alone. The data-overlay helpers `getLocalizedDay`
(planner) and `getTranslation` (vocab) keep a defensive RU last-resort, but since only the active
locale is loaded that path is effectively inert — each locale must be complete for the languages a
user actually selects.

- **`ui`** — flat string (or function) table keyed by UI string id. Used everywhere via `T(key)`.
- **`vocab`** — `{ <weekNumber>: [translation0, translation1, ...] }`, **index-matched** to
  `VOCAB[week].words`. Read by `getTranslation(week, idx)`.
- **`verbs`** — `{ <verbKey>: "translation" }`, keyed by the **same key as `VERBS`** in
  `data/verbs.js` (Infinitiv, reflexive → `"sich <inf>"`) — NOT index-matched. This is the
  translation source for the verb dictionary. All three locales carry the full set (306 each):
  RU is the original curated glosses, EN/UA were authored to match.
- **`weeks`** — `{ <weekNumber>: { theme, grammar, vocab, tasks: [...] } }`, **index-matched** to
  `WEEKS[n].tasks`. Overlaid onto the base curriculum by `getLocalizedDay(d)` in the planner.

> Consequence: `ui`/`vocab`/`weeks` are **index-/key-matched** to the base data — adding/removing a
> word or task means updating the German base **and** the matching slot in **all three** locales,
> or translations silently shift/blank out. `verbs` is key-based, so it's order-independent, but a
> verb shown for a given UI language needs its key present in that language's `verbs` map.

---

## 7. Data model — curriculum & vocabulary

### `data/weeks.js` — global `WEEKS` (planner)

```js
const WEEKS = [
  { n:1, theme:"…", grammar:"…", vocab:"…", tasks:[ ["test","…"], ["grammar","…"], … ] },
  // … 24 weeks
];
```
- `tasks` is an array of `[type, text]` pairs. The base text here is **Russian**; localized text
  comes from `LOCALE_*.weeks[n].tasks[i]`.
- `type` ∈ `test | grammar | listen | write | speak | read | review`. Mapped to a label via the
  `type_<type>` UI key (and the legacy `TYPE_LABEL` map kept inline in `planner.html`).
- Vocabulary is a **daily habit**, described by the week's `vocab` string — it is *not* its own day.

**Flattening to days** (in `planner.html`): every `[type, text]` across all weeks becomes one day.

```js
const DAYS = [];
WEEKS.forEach(w => w.tasks.forEach(([type, text], taskIdx) =>
  DAYS.push({ day: DAYS.length+1, week:w.n, weekTheme:w.theme, grammar:w.grammar,
              vocab:w.vocab, type, text, taskIdx })));
const TOTAL_DAYS = DAYS.length;   // currently 118 days (sum of all WEEKS[n].tasks)
```

`getLocalizedDay(d)` returns a copy of the day with `theme/grammar/vocab/text` replaced by the
active locale's `weeks[d.week]` values (matching `tasks[d.taskIdx]`), falling back to the base.

### `data/vocab.js` — global `VOCAB` (trainer)

```js
const VOCAB = {
  1: { theme:"Begrüßung, Familie, Zahlen", words:[ "Hallo", "der Vater", … ] },
  // … weeks 2..24
};
```
- `words` is a **German-only string array** (translations live in `locales/*.vocab`). This differs
  from the project's earlier `[de, ru]`-pair format.
- Nouns are stored **with their article**: `"der Vater"`.
- Some week-5 verbs carry the Perfekt form after an em dash: `"gehen — gegangen (sein)"`. Speech
  uses only the part before `—` (see `speakWord`).

### `data/verbs.js` — global `VERBS` (master verb dictionary)

```js
const VERBS = {
  "gehen":     { praet:"ging",   pp:"gegangen",  aux:"sein" },
  "essen":     { praet:"aß",     pp:"gegessen",  aux:"haben", praes:"isst" },
  "abfahren":  { praet:"fuhr ab",pp:"abgefahren",aux:"sein",  praes:"fährt ab", sep:true },
  "sich ansehen": { praet:"sah sich an", pp:"sich angesehen", aux:"haben", praes:"sieht an", sep:true, refl:true },
  // … ≈306 verbs
};
```
- A language-neutral **forms** dictionary (≈306 A1–B1 verbs). Key = Infinitiv; reflexive verbs are
  keyed `"sich <inf>"`. `praet` = Präteritum, `pp` = Partizip II (no auxiliary), `aux` = perfect
  auxiliary (`haben`|`sein`); optional `praes` (irregular present), `sep` (separable), `refl`.
- **Translations are NOT here** — they live in `locales/*.verbs[key]` (§6), fully populated in all
  three languages (306 each: RU/UA/EN).
- **Source of truth.** Previously generated from a CSV; the CSV and its generator were removed, so
  `data/verbs.js` (forms) + `locales/*.verbs` (glosses) are now hand-maintained.
- `verbs.html` drills verbs from `VERBS` in three modes (triad-flashcard, cloze, table). Mastery
  is stored in `verbs_data` (shared column, keyed by verb key). The vocab trainer also writes verb
  mastery into `verbs_data` for words that resolve to a verb key via `verbKeyForWord`.

---

## 8. `planner.html`

### State & persistence
```js
let state = { currentDay:1, viewingDay:1, completed:{} };
const CLOUD_FIELD = 'planner_data';
```
- `currentDay` — where the user is now (advances when the current day is marked done).
- `viewingDay` — the day being viewed (arrow navigation does not move `currentDay`).
- `completed` — `{ dayNumber: true }`.
- `save()` → `saveToCloud()`. There is no localStorage copy of progress; the cloud row is the
  source of truth (loaded by `initApp` via `applyCloudData`).

### Clipboard text
`buildPlanText(d)` assembles the localized day plan (header with day/week, week theme, grammar
focus, today's task with its type label, the daily vocab habit, and a closing instruction).
All fragments come from `T('planner_clip_*', ...)`.

`copyPlan(day)` uses `navigator.clipboard.writeText` with a fallback to a hidden `<textarea>` +
`document.execCommand('copy')` (`fallbackCopy`). On success it flashes the button to "copied".

The same `buildPlanText(d)` output is also used as the **first user message** sent to Gemini when
`startAILesson(day)` is called — clipboard copy and AI chat both derive from the same source.

### AI Lehrer chat

**State:**
```js
let lessonsCache = {};  // { day: [{role, text}, …] }  — live in-memory copy of lessons table
let summaryCache = {};  // { week: [{role, text}, …] } — weekly summaries (day = -week in DB)
let chatState = { loading: false, showKeyModal: false, summaryWeek: null };
```

**API key:** stored in `localStorage['gemini_key']` (user-provided). `getGeminiKey()` reads it;
`_storeGeminiKey(k)` writes/removes it. **By default the key is local-only** and never sent to
Supabase. The key modal also offers an **opt-in "remember this key on my account" checkbox**
(`keySynced()` ↔ `localStorage['gemini_key_sync']`): when ticked, `saveGeminiKeyAndClose()` also calls
`saveGeminiKeyToCloud(key)` so the key persists in the `progress.gemini_key` column and follows the
user to other devices. On a fresh device, `cloud-sync.initApp` reads that column and hands it to the
planner's `applyCloudKey(key)` hook, which writes it into `localStorage` (and sets the sync flag) so
the page works without re-pasting. Unticking the box — or `removeGeminiKey()` — clears the account
copy (`saveGeminiKeyToCloud('')` → `null`). The cloud write rides the offline outbox like any other
progress write (§4), so it's resilient to a flaky connection. The key is still sent *only* to the
user's own RLS-protected row and to Google; it never reaches other users.

**`geminiRequest(model, systemPrompt, messages)`** — direct fetch to
`https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=…`.
Sends `system_instruction` + `contents` (maps `role:'model'`/`'user'`). Throws on `data.error`.

**Lesson flow:**
1. `startAILesson(day)` — seeds `lessonsCache[day]` with the day plan as the first user message,
   calls `runLessonTurn(day)`.
2. `sendChatMessage(day)` — appends the user's text to `lessonsCache[day]`, calls
   `runLessonTurn(day)`.
3. `runLessonTurn(day)` — calls `geminiRequest(AI_MODEL_ID, systemPrompt, messages)`, pushes the
   model reply into `lessonsCache[day]`, persists via `saveLessonToCloud`, then `render()` +
   `scrollChatToBottom()`.

**Weekly summary:**
`generateWeeklySummary(week)` builds a transcript of all lesson messages for the week
(`buildWeekTranscript`) and calls `geminiRequest(AI_PRO_MODEL_ID, summaryPrompt, …)`. Result is
stored in `summaryCache[week]` and persisted as `day = -week`. Button appears only after all days
of the week are marked complete (`isWeekComplete`); `viewWeeklySummary(week)` opens a modal to
re-read a cached summary without regenerating.

**Init sequence:** `initApp().then(loadLessonsThenRender)` — `initApp` loads planner progress
and renders once; `loadLessonsThenRender` then fetches all lesson rows from `lessons` table,
populates `lessonsCache`/`summaryCache`, and re-renders to show chat history.

**Markdown renderer (`renderMd`):** inline-only renderer used for model messages. Handles:
headings (`#`–`####`), horizontal rules (`---`), unordered/ordered lists, GFM tables
(→ `<table class="ai-table">`), blank lines (→ spacer `div`), and paragraphs. Inline:
`**bold**`, `*italic*`, `` `code` ``. All content is HTML-escaped before inline markup is applied.

**UI functions:** `renderAiSection(d)` renders either a "no key" nudge, a "Start lesson" button
(empty cache), or the full chat view (messages + input row). `renderKeyModal()` and
`renderSummaryModal()` append overlays inside the `#app` markup.

### Actions & render
- `goDay(n)`, `goToCurrent()`, `jumpWeek(weekNum)` — navigation (clamped to `[1, TOTAL_DAYS]`).
- `toggleDone(day)` — toggles completion; completing the current day advances `currentDay`.
- `render()` — single full re-render of `#app` (header + progress bar + day card + nav + info box +
  footer) from template strings, composed from the `render*` section builders. It calls
  `scrollChatToBottom()` **only while `chatState.loading`** (a lesson turn is in flight) so plain
  day navigation / toggling done doesn't yank the viewport down into the chat; the chat-turn
  functions (`runLessonTurn`, `generateWeeklySummary`) scroll explicitly after they finish.
- Keyboard: `←/→` page days; `c` / `C` / `с` / `С` (Latin & Cyrillic) copies. The handler **bails
  on form fields** (`INPUT` / `TEXTAREA` / `SELECT` / `contentEditable`) so typing in the chat
  textarea or the API-key input isn't hijacked, and **bails while a modal is open** (key/summary).

---

## 9. `vocab.html`

### State & persistence
```js
let state = {
  selectedWeek: 1,
  mastery: {},          // { "week-idx": {box,due,right,wrong,seen} } — non-verb words
  modes: { flashcard:true, article:true, spelling:true },
  levels: { A1:false, A2:false, B1:false },  // CEFR level filter (A1=wks1-8, A2=9-16, B1=17-24)
  session: null,
  confirm: null
};
let verbStore = { mastery: {} };  // shared verb mastery, separate from state.mastery
```
- `serialize()` → `{ app, version:2, savedAt, selectedWeek, modes, levels, mastery }`. `applyData(d)`
  validates and applies; `verbStore` is handled separately via `applyVerbProgress`.
- `save()` → `saveToCloud()`. `verbStore` is written via `saveVerbsToCloud(verbStore)` whenever
  a verb card is answered.

### Leitner spaced repetition (via `leitner.js`)
- Vocab word card key: `"week-idx"` in `state.mastery`. Verb card key: verb infinitive in
  `verbStore.mastery`. Both use the same 5-box model (→ `leitner.js`).
- `updateCard(week, idx, correct)`: routes to `verbStore` if the word is a known verb key
  (`verbKeyForWord`), else to `state.mastery`. Calls `leitnerApply`, then `save()`.
- The per-word box bar (`.box-bar`, 5 segments) is **clickable → reset that one word**.

### Verb cross-trainer routing
`verbKeyForWord(de)` strips the `—` form suffix and looks up the result in `VERBS`. If a match is
found (~69 of the vocab entries), that word's mastery is stored in `verbStore.mastery[key]` instead
of `state.mastery`, and `saveVerbsToCloud(verbStore)` is called. This keeps verb mastery in sync
across the vocabulary and verb trainer pages.

### Three exercise modes
`availableModes(de)` decides which apply to a word:
- **flashcard** — always.
- **article** — only if `parseArticle(de)` matches `/^(der|die|das)\s+(.+)$/`.
- **spelling** — if the core (article stripped) has no space/`?`/`…`/`—`/`/` and length ≥ 2.

`pickMode(week, idx)` chooses randomly from `enabled ∩ available`, with a pedagogical nudge:
`box ≥ 3` leans toward **spelling** (60 %), `box ≤ 1` leans toward **article** (50 %).

- **flashcard** — German shown → "show translation" (auto-speaks on reveal) → self-grade
  "Knew it / Didn't know". **Advances immediately** after grading.
- **article** — word without article → `der/die/das` buttons (color-coded der=blue, die=red,
  das=green) → feedback + "Next". Audio appears only **after** answering (so it doesn't hint).
- **spelling** — translation shown → type the German → check. Comparison via `normalize()`
  from `utils.js`. A missing article is accepted correct with a note. On error, `diffChars` LCS
  highlights wrong chars (`diff-bad`) and missing chars (`diff-miss`), case-insensitively.

### Session (a training run)
`startSession(scope)`:

| `scope.type` | Cards selected |
|---|---|
| `'week'` | Due words of the chosen week + up to 12 new; if none due/new, the whole week |
| `'levels'` | Due/new words across the selected CEFR levels; up to 20 new per multi-level run |
| `'review-all'` | All weeks: `seen>0 && !mastered && due<=now` |

Queue is shuffled and capped at **25 cards**. `answer(correct)` → `updateCard`. A wrong card is
re-queued **once** at the end as an easier flashcard. Flashcards advance immediately;
article/spelling wait for "Next". `uniqueRight / uniqueTotal` → first-try score on end screen.

### Progress portability
- **Cloud** (Supabase) is the live store.
- **Manual export/import** — `exportProgress()` downloads `serialize()` as a JSON Blob;
  `importProgress()` reads a chosen file and calls `applyData()`.

### Reset
`resetWord(week, idx)` / `resetAll()` go through `state.confirm` (in-page modal via
`stageConfirm` / `clearConfirm` from `utils.js`), never the native `confirm()`.

### Render & keyboard
- `render()` → `renderSession()` if active, else home screen (stats, due banner, week tabs, word
  list). Confirm modal appended at end. Sub-renderers: `renderFlashcard` / `renderArticle` /
  `renderSpelling` / `renderEnd`.
- Keyboard: flashcard `Space`/`1`/`2`/`←`/`→`; article `1`/`2`/`3`, `Enter`=next; spelling
  typing + `Enter`; `Esc` exits the session.

---

## 10. `verbs.html`

### State & persistence
```js
let state = {
  mastery: {},    // { verbKey: {box,due,right,wrong,seen} } — shared with vocab via verbs_data
  modes: { triad:true, cloze:true, table:true },
  filter: 'all',  // 'all' | 'sein' | 'sep' | 'refl'
  sel: {},        // { verbKey: true } — hand-picked training selection
  session: null,
  confirm: null
};
const CLOUD_FIELD = 'verbs_data';
```
- `getCloudPayload()` → `{ app, version, savedAt, modes, sel, mastery }`. `sel` persists the
  verb selection across sessions. `mastery` is keyed by verb key — the same store that `vocab.html`
  reads via `applyVerbProgress`.
- Cloud is the source of truth; `save()` → `saveToCloud()`.

### Verb data
`VERBS[key]` from `data/verbs.js`. Key = Infinitiv; reflexive → `"sich <inf>"`. Fields: `praet`,
`pp`, `aux` (`haben`|`sein`), optional `praes` (irregular present), `sep` (separable), `refl`.
Translations from `locales/<lang>.verbs[key]` via `verbGloss(key)`.

### Three card modes
Mode availability: reflexive verbs (`refl: true`) support only **triad**; non-reflexive support all.
Pedagogical selection based on box: box 0–1 → triad; box 2–3 → cloze; box 4+ → table.

- **triad** — Prompt: infinitiv; user recalls Präteritum + Partizip II (with auxiliary). Read-aloud,
  `Space`/`Enter` to reveal. Self-grade "knew it / didn't".
- **cloze** — Show two of the three Stammformen; user types the missing one (praet **or** pp,
  chosen randomly). Comparison via `normalize()`. LCS diff feedback on error.
- **table** — Full grid: pick `haben`/`sein`, type Präteritum, type Partizip II. All three inputs
  checked together on submit.

### Filters & selection
- **Filter** (`state.filter`) — narrows the verb list displayed: `all` / `sein` / `sep` / `refl`.
  Applying a filter to a selection adds/removes verbs matching the filter.
- **Selection** (`state.sel`) — individual verbs checked by the user. Persisted to cloud so the
  training set is remembered across page loads.

### Session
`startSession(scope)`:

| `scope.type` | Cards selected |
|---|---|
| `'due'` | All verbs with `seen>0 && !mastered && due<=now` (across all verbs) |
| `'filter'` | Within the verbs matching `state.filter`: due (seen, not mastered) first, then up to **15** new; if that set is empty, fall back to the whole filter set |
| `'selected'` | Verbs in `state.sel`, capped at **40 cards** |

Non-`selected` sessions are shuffled and capped at **20 cards**; `selected` at **40**.

Wrong answer → re-queued once as easy `triad` (`requeued: true`). `uniqueRight / uniqueTotal`
drive the end-screen score.

### Render & keyboard
- `render()` → `renderSession()` if active, else home (filter chips, selection bar, verb list with
  box bars + audio). Sub-renderers: `renderTriad` / `renderCloze` / `renderTable` / `renderEnd`.
- Keyboard: triad `Space` reveal / `1`/`2` grade; cloze + table `Enter` submit / next; `Esc` exits.
- Confirm modal for `resetAll()` via `state.confirm`.

---

## 11. Design system (`assets/css/base.css`)

CSS custom properties on `:root`:

```css
--paper:#F2EDE3; --paper-2:#E8E0D0; --paper-3:#FAF6EC;   /* warm-paper backgrounds */
--ink:#1C1A17;  --ink-soft:#4A453D;  --line:#BFB5A0;      /* text + borders */
--accent:#B5512A; --accent-2:#8C3F1F;                     /* terracotta + hover */
--green:#4A7C3A;  --gold:#C5963B;                         /* mastered / in-progress */
--der:#2F5C8F;  --die:#A23B2D;  --das:#3F7A3A;            /* trainer gender colors */
--serif:'Fraunces', Georgia, serif;  --sans:'Manrope', system-ui, sans-serif;
--page-max:920px;                                         /* single content width for all app pages */
```

Editorial/typographic aesthetic: large light (300) serif headings (Fraunces), Manrope body,
minimal rounding, thin borders, tabular numerals (`.num`). **Container width is unified:** every
app page uses one `--page-max: 920px` token — `.container { max-width: var(--page-max) }` in
`base.css`. The old per-page overrides (planner 820px, vocab's 26px header padding) were removed so
the four sections read as one site; only `auth.css` (the login page) narrows to 480px. Responsive
via `@media (max-width: 600px)` across `base.css` + every page CSS + `chat.css` (and a 700/720px
tier on some pages).

CSS files: `base.css` (tokens, reset, header/footer/info-box/toast/container + `--page-max`),
`components.css` (`.user-bar-right`, nav-tabs, lang-switcher + the mobile nav-tabs horizontal-scroll
strip and email-ellipsis rules), then page-specific `planner.css` / `vocab.css` / `verbs.css` /
`collections.css` / `auth.css`. `chat.css` is loaded only by `planner.html` and covers `.ai-messages`, `.ai-msg` (user + model variants), `.ai-input-row` (auto-growing
`<textarea>`), `.ai-table`, the loading-dots animation, and the key/summary modals.

---

## 12. Environment notes

The app targets an **HTTPS browser session** (Vercel + Supabase). The following defensive patterns
still matter and should be preserved:

- **Clipboard fallback** — `navigator.clipboard` may be unavailable / require a secure context;
  keep the hidden-`<textarea>` + `execCommand('copy')` fallback (`fallbackCopy`).
- **Speech voices load async** — `getVoices()` is often empty on first call; keep the
  `onvoiceschanged` listener.
- **In-page confirm modal** — keep using `state.confirm`, not the native `confirm()`.
- **Never swallow handler errors silently** — surface failures via `showToast`.

`file://` usage (double-clicking the HTML files) is effectively **historical**: it can't establish
a Supabase session, so auth/sync don't work there. Treat `file://` as out of scope unless that
explicitly changes.

`localStorage` holds five persistent preference keys — `ui_lang` (language), `ui_theme`
(`light`|`dark`, written by `theme.js`), `auth_redirect` (post-login return URL), `gemini_key`
(user's Gemini API key) and `gemini_key_sync` (`'1'` if the user opted to mirror the key to their
account — §8) — plus one **transient** key, `cloud_outbox`: the
offline write queue (§4). It exists only while a cloud write is pending after a failure and is
cleared the moment those writes replay; it is a retry buffer, not a progress store. All learning
progress and chat history lives in Supabase.

---

## 13. Known gaps / things to watch

Each item below names the gap, its **severity**, and the **recommended mitigation** if/when it's
worth doing. Ordered roughly by impact.

- **No conversation-length limit for AI chat.** *(severity: medium)* `lessonsCache[day]` grows
  unbounded; every turn re-sends the whole history to Gemini, so a long lesson eventually hits the
  model's context limit (hard error) and inflates the `lessons` row.
  → *Mitigation:* window the `contents` sent to `geminiRequest` (e.g. keep the seed day-plan message
  + the last N turns), or summarise-and-truncate past a threshold. Storage stays full-fidelity; only
  the request is trimmed.

- **Index/key alignment across base data + locales.** *(severity: low, now guarded)* Curriculum,
  vocab, and verb edits must stay aligned across `data/` and all three `locales/*` (§6). This is now
  **structurally enforced** by `tests/data-align.test.js` (length/coverage for vocab, weeks, verbs)
  and `tests/i18n.test.js` (identical `ui` key sets). The guard catches a shifted index or a
  forgotten slot — it does **not** verify that a translation is *semantically* right, only that a
  non-empty value of the correct shape exists. Run `npm test` after any data/locale edit.

> **Already resolved (kept for history):**
> - **Gemini key was localStorage-only** (lost on clearing browser storage, no cross-device use) —
>   the key modal now has an opt-in "remember this key on my account" checkbox that mirrors the key
>   to `progress.gemini_key` and restores it on other devices via `applyCloudKey` (§8). Default stays
>   local-only; the cloud write rides the offline outbox. (Guarded by `tests/outbox.test.js`.)
> - **Cloud writes were fire-and-forget** — a failed write is now parked in the offline outbox
>   (`localStorage['cloud_outbox']`) and replayed on reconnect, with `toast_offline_saved` /
>   `toast_sync_restored` feedback. See §4. (Guarded by `tests/outbox.test.js`.)
> - **Data-overlay fallback pointed at RU, not EN** — `getLocalizedDay` (planner),
>   `getTranslation` (vocab) and `verbGloss` (verbs) now fall back to `LOCALE_EN`, consistent with
>   `DEFAULT_LANG` and the rest of the i18n layer.
> - Untranslated spelling/end-screen strings — `T()` keys are now wired everywhere.
> - Orphaned `settings_*` / `toast_sync_*` locale keys — removed when FSA auto-sync was dropped.
> - Dead locale keys (`ai_thinking`, `spelling_hint`, `spelling_hint_next`, `spelling_input_placeholder`,
>   `lang_label`) — removed from all three locales; `auth_loading` was repurposed into `auth_subtitle`.
> - **`index.html` hardcoded Russian** (page subtitle + "Загрузка…") — the subtitle now reads from
>   `T('auth_subtitle')` in `render()` (so it follows the language switcher) and the loading text is
>   a neutral `…`; the page title is the language-neutral "Deutsch Daily".
> - **Planner keyboard hijack** — `←/→`/`c` no longer fire while typing in the chat textarea or
>   API-key input (the handler now bails on form fields and open modals).
> - **Chat auto-scroll on navigation** — `render()` only follows the chat to the bottom while a turn
>   is loading, so paging through days no longer jumps the viewport into the chat.
> - **Dead code** — the unused `TYPE_LABEL` map was removed from `planner.html` (labels come from the
>   `type_<type>` UI keys).
> - `<html lang="ru">` hardcoded — `i18n.js` sets `document.documentElement.lang` dynamically on init
>   and on every `setLang()` call, so the static attribute is a no-op.
> - `lessons` DDL not in repo — `schema.sql` added at project root (idempotent, safe to re-run).
> - **Dark-theme flash on load/switch** — an inline `<head>` snippet now applies `data-theme` from
>   `localStorage` before any CSS paints, so there's no light→dark flicker (§4, §14.7).
> - **Sections looked like separate sites** (different widths + duplicated headers) — unified to a
>   single `--page-max: 920px` token and a shared `appHeader()` in `header.js` (§4, §11, §14.8).
> - **Pages scattered at the repo root** — the four authenticated pages now live in `views/` and are
>   served via `vercel.json` pretty-URL rewrites; the legacy `auth.html` stub was removed (§3).

---

## 14. Already-fixed bugs (do not reintroduce)

1. **Flashcard wouldn't advance.** `answer()` set `answered=true`, but `renderFlashcard` only read
   `revealed`, so it stuck and repeated "Knew it" clicks inflated the box. Fix: in flashcard mode
   `answer()` calls `nextCard()` immediately.
2. **Correct article button became invisible.** `chosen-correct` (white text) and `reveal-correct`
   (green text) both applied; green text on green background. Fix: add `reveal-correct` only when
   the user picked a *different* (wrong) button.
3. **Typed spelling answer disappeared after checking.** Fix: set the input `value` when `answered`
   and show an explicit "your answer / correct" comparison via `diffChars`.
4. **Box jumped 0→2 on the first correct answer.** Was `eff = box||1; box = eff+1`. Fix:
   `box = min(5, box+1)` (new 0→1, one box per correct answer).
5. **Reset buttons did nothing** — they depended on the native `confirm()`. Fix: in-page modal
   confirm.
6. **"Create/Open file" buttons did nothing** — File System Access API isn't available everywhere
   and the error was swallowed. Resolution: the FSA auto-sync feature was removed; only Blob
   export/import remains (and any user-facing failures should toast).
7. **Dark theme flashed light on every load / switch.** `theme.js` is external and runs after the
   blocking Supabase CDN script, so the light default could paint first. Fix: an inline `<head>`
   snippet sets `data-theme` from `localStorage` synchronously before any CSS paints (see §4).
8. **Sections felt like different sites** — mismatched container widths (planner 820 vs others 920)
   and four duplicated header blocks. Fix: one `--page-max: 920px` token + a single `appHeader()`
   builder in `header.js` (§4, §11). Don't reintroduce per-page width/header overrides.

---

## 15. Tests (`tests/`)

The app has **no build step**, so the test harness reproduces what a browser loads. `npm test`
runs `node --test tests/`; `npm run test:regression` runs the curated subset.

- **`harness.js`** — `loadPage({ page, extraFiles, exports, voices, shims })` reads a page's local
  `<script src>` deps (skipping a denylist of side-effectful modules — `supabase.js`,
  `cloud-sync.js`, `theme.js`, `ai-config.js` — which are shimmed), concatenates them with the
  page's inline `<script>` (bootstrap neutralised), evaluates it all as **one script** in a fresh
  `vm` sandbox seeded with browser shims (`document`, `localStorage`, `speechSynthesis`, …), and
  returns the captured globals. Because it follows the real `<script src>` list, it keeps working as
  helpers move between modules — top-level `const`/`function` from `assets/js/*` are in scope for the
  inline page code, exactly as in the browser. `resolvePage(page)` lets a test pass a bare page name
  (e.g. `'verbs.html'`) and resolves it to the repo root **or** `views/`; root-absolute `<script
  src="/assets/…">` paths are normalised before the denylist/dir filters run.
- **What's covered:** `leitner.test.js` (box transitions/scheduling), `helpers.test.js`
  (`esc`/`normalize`/`diffChars`/article parsing), `speech.test.js` (voice pick + per-page utterance
  text/rate), `confirm.test.js` (in-page confirm staging), `markdown.test.js` (`renderMd`),
  `render-smoke.test.js` (each page's `render()` runs and fills `#app`), `i18n.test.js` (identical
  `ui` key sets across locales + function-valued keys), `data-align.test.js` (base-data ↔ locale
  index/key alignment — see §13), `refactor-guards.test.js` (source-level guards: no hardcoded
  Russian in the trainer session UI, no orphaned/dead locale keys, no hardcoded `<html lang="ru">`),
  `outbox.test.js` (the offline write queue — see §4 — eval'd directly with a toggleable mock
  Supabase client, since the page harness shims `cloud-sync.js`; covers progress/lessons/collections
  queueing), and `collections.test.js` (`parseDelimited`/`parseTranslations` parsers, `colAvailableModes`,
  and list/import render-smoke — see §16). `ui-refactor.test.js` guards the move to `views/` +
  unified chrome: app pages live in `views/` with `index.html` alone at root, pages use
  root-absolute `/assets`/`/data`/`/locales` paths and load `header.js`, the inline theme snippet
  runs before the Supabase CDN (FOUC guard), no `*.html` inter-page links remain, `appHeader()`
  renders four pretty-URL nav tabs with the active one marked, `vercel.json` rewrites map the pretty
  URLs, and the width is unified (`--page-max: 920px`, no 820px planner override).
- **What it can't cover:** anything requiring a live Supabase session / network against the real
  backend (auth, end-to-end cloud sync, real Gemini calls). Verify those manually in the deployed
  HTTPS app.

---

## 16. `collections.html` (user-supplied word sets)

A standalone trainer for the user's *own* word lists, reusing the vocab trainers and Leitner model
on data that lives in the `collections` table (§5) instead of `VOCAB`. vocab.html is untouched; the
session-render engine (`renderFlashcard`/`renderArticle`/`renderSpelling`/`renderEnd`,
`parseArticle`, `deColored`, `submitSpelling`, keyboard) is **ported** here with the data source
swapped from `VOCAB[week][idx]` to a collection's word list, and styling reused from `vocab.css`
(plus `collections.css` for the management UI).

### State & data
```js
let state = { collections, view:'list'|'import'|'edit', draft, session, confirm, translating };
// collection: { id, name, words:[{id,de,tr,note?}], mastery:{ wid:leitnerCard } }
```
- **No `CLOUD_FIELD`** — the page owns the `collections` table. Bootstrap is
  `initApp().then(loadCollectionsThenRender)` (mirrors the planner's lessons load); `initApp` still
  enforces the session and loads `lang`/`theme` (§4).
- IDs (collection + each word) are **client-generated** via `crypto.randomUUID()`; mastery is keyed
  by the stable `word.id` so editing/deleting words never misaligns progress.
- **Saving:** create/edit/rename → `saveCollectionToCloud(col)` (full row); **each training answer →
  `saveCollectionMastery(col.id, col.mastery)`** (writes only the small `mastery` column — keeps
  large collections cheap to drill). Delete → `deleteCollectionFromCloud(id)` behind the in-page
  confirm modal. All ride the offline outbox (§4).
- **Soft cap `MAX_WORDS = 1000`** per collection (import + manual add) — number of collections is
  unlimited.

### Screens (single `render()` → `renderList`/`renderView`/`renderEditor`/`renderSession`)
- **List** — a card per collection (clickable name → detail view, `total/mastered/due` stats) with
  Train (due + up to 15 new, shuffled, capped 25) and Open.
- **View / detail** (`view:'view'`, `viewId`) — opened from the list. Shows the **word list with
  per-word Leitner box-bars** (same `.vocab-row`/`.box-seg` markup as the vocabulary page), German +
  translation + audio; clicking a word's box-bar resets just that word (confirm modal). Header has
  the collection name + stats and the actions Train / Train all / Edit / Export CSV / Delete. Editing
  from here returns to this view on save/cancel.
- **Import** — name + CSV upload (`FileReader`) and/or a paste box; `parseDelimited(text)` (auto-detects
  `\t` / `;` / `,`, minimal CSV quoting, header skip) → review table. Append + dedupe by German.
- **Edit** — same editable table on an existing collection: edit translations, delete words,
  `+ Add word`, rename. Inputs are read back via `syncDraftFromDom()` before any structural change or
  save (so re-render doesn't lose unsaved typing).
- **AI translate** — if a Gemini key is set, `translateMissing()` sends empty-translation German
  terms (chunked ~50) to `geminiRequest(AI_MODEL_ID, getCollectionsTranslatePrompt(), …)` and fills
  the parsed JSON reply (`parseTranslations` tolerates ``` fences / line lists) into the inputs.
- **Session** — the ported flashcard/article/spelling trainer; spelling is offered only when a word
  has a translation, article only when the German carries der/die/das (`colAvailableModes`).

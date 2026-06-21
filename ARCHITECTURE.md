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
2. **Vocabulary trainer** (`/vocab`) — 504 words across 24 weekly sets, four exercise modes
   mixed together (the fourth, **plural**, is an opt-in second Leitner track for nouns), Leitner
   spaced repetition, and text-to-speech.
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
6. **Settings** (`settings.html`, `/settings`) — authenticated account page: change password
   (re-authenticates with the current password via `sb.auth.signInWithPassword`, then
   `sb.auth.updateUser`), add/remove the Gemini AI key (reuses the planner's `gemini_key` /
   `gemini_key_sync` logic), switch theme + UI language, and request **account deletion** with a
   30-day recovery window. Deletion stamps `progress.deletion_requested_at`; a `SECURITY DEFINER`
   `purge_deleted_accounts()` SQL function (scheduled via pg_cron, see `schema.sql`) hard-deletes
   the user's rows + `auth.users` entry after 30 days. The client only sets/clears the flag and can
   cancel it any time in the window; `cloud-sync.initApp` loads the flag into the global
   `accountDeletionAt` and toasts a reminder on every page. Reached via the ⚙ link in the shared
   header (`appHeader`). Owns no `progress` column (omits `CLOUD_FIELD`, like collections).
7. **Today** (`today.html`, `/today`) — a **daily-flow wizard** (the first nav tab; the recommended
   starting point).
   The user presses one "Learn" button and is walked through the whole study day in order —
   grammar → words → verbs → AI tutor → done — with no manual section-switching. It hosts the
   shared trainer engines in `embedded` mode and reuses the planner's day model. (See §19.)

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
- **Build:** `npm run build` → `node build.js`. `build.js` (1) reads `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the environment and replaces the `YOUR_PROJECT_ID` /
  `YOUR_ANON_KEY` placeholders inside `assets/js/supabase.js` (exits non-zero if either env var is
  missing), and (2) **stamps the `sw.js` cache `VERSION`** with a monotonic build stamp
  (`<commitSHA8>-<UTC YYYYMMDDHHMM>`, SHA from `VERCEL_GIT_COMMIT_SHA` when present) so every deploy
  busts the old service-worker shell cache automatically — no manual bump. The committed
  `supabase.js` / `sw.js` hold placeholders / a static dev `VERSION`; both are rewritten at deploy
  time on Vercel. (Guarded by `tests/build.test.js`.)

> The app is now an **authenticated HTTPS web app**. It requires a Supabase session, so it does
> not function when opened from the filesystem (`file://`). The heavy `file://` defensiveness in
> the project's history is largely historical — see §12.

---

## 3. Project structure

```
deutsch-daily/
├── index.html          # PUBLIC LANDING page for guests (marketing + auth entry points). Root ( / ). §18
├── views/              # login + all authenticated app pages live here; served via pretty-URL rewrites
│   ├── login.html       # LOGIN / REGISTER (email + Google OAuth).    ( /login ) §5
│   ├── today.html       # Daily-flow wizard (grammar→words→verbs→AI→done). ( /today ) §19
│   ├── planner.html     # Daily planner + AI Lehrer chat.            ( /planner )
│   ├── vocab.html       # Vocabulary trainer (thin host → VocabTrainer). ( /vocab )
│   ├── verbs.html       # Irregular-verb trainer (thin host → VerbsTrainer). ( /verbs )
│   ├── collections.html # User word-set trainer (import/edit/drill/AI translate). ( /collections ) §16
│   └── settings.html    # Account: password / AI key / theme / lang / delete. ( /settings )
├── assets/
│   ├── css/  base.css · components.css · planner.css · chat.css · vocab.css · verbs.css · auth.css · collections.css · landing.css · settings.css · today.css
│   ├── js/   i18n.js · theme.js · utils.js · supabase.js · cloud-sync.js · ai-config.js
│   │         gemini.js · leitner.js · speech.js · header.js · pwa.js
│   │         markdown.js · planner-data.js · vocab-trainer.js · verbs-trainer.js   # AI md + day model + trainer engines
│   ├── favicon.svg · icon.svg · icon-maskable.svg     # icon sources (PNGs rendered into icons/)
│   └── icons/  icon-192.png · icon-512.png · maskable-512.png · apple-touch-icon.png
├── data/   weeks.js (WEEKS) · vocab.js (VOCAB) · verbs.js (VERBS — master verb dictionary)
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_RU / _UA / _EN = { ui, vocab, verbs, weeks })
├── manifest.webmanifest · sw.js     # installable PWA: web manifest + offline service worker (§17)
├── build.js · package.json · vercel.json
├── ARCHITECTURE.md · CLAUDE.md · README.md · LICENSE
```

**Routing model:** `index.html` is the **public landing page** (marketing + auth entry points,
§18) and is the only HTML at the repo root, served at `/`. The login/register form and the four
authenticated pages all live in `views/` and are reached via the `vercel.json` pretty-URL rewrites
(`/login` → `/views/login.html`, `/planner` → `/views/planner.html`, …). The auth flow:
- A **guest** at `/` sees the landing; its "Log in" / "Sign up" buttons and every CTA go to `/login`
  (register CTAs use `/login?mode=register`, and the footer email field deep-links
  `/login?mode=register&email=…` so the address is prefilled).
- A **signed-in** visitor to `/` is forwarded to the app (the landing's `redirect()` →
  `auth_redirect` or `/planner`), so logged-in users never see the marketing page.
- A guest who hits a protected page is bounced by `initApp` to **`/login`** (remembering the target
  in `auth_redirect`); `logout()` returns to the landing (`/`).

All inter-page navigation (the nav tabs in `header.js`, the post-login redirect, the session-loss
redirect) uses these pretty URLs / `/`. There is no separate "router" page — per-page session checks
(`initApp`) do the gating. The legacy `auth.html` redirect stub was deleted.

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
→ assets/js/markdown.js            (renderMd — AI reply markdown, shared with /today)
→ assets/js/header.js              (appHeader — shared header/nav markup)
→ data/weeks.js                    (WEEKS)
→ assets/js/planner-data.js        (DAYS, TOTAL_DAYS, getLocalizedDay — shared with /today)
→ inline page <script>             (state, chat state, render, page logic)
   initApp().then(loadLessonsThenRender)
```

> All in-page `<script src>` / `<link href>` use **root-absolute paths** (`/assets/…`, `/data/…`,
> `/locales/…`) so the pages work from `/views/*` and from the pretty-URL rewrites alike (§2). The
> first thing in every `<head>` is a tiny inline `<script>` that sets `data-theme` from
> `localStorage` synchronously — see the theme-FOUC note in §4.
>
> Every page (login included) also loads **`assets/js/pwa.js`** right after `utils.js` — one line
> that registers the service worker — and its `<head>` carries the PWA tags (`<link rel="manifest">`,
> `theme-color`, apple-touch-icon). See §17.

**vocab.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js                       (leitnerApply, leitnerIsDue, leitnerIsMastered, …)
→ speech.js                        (speak, pickVoice)
→ header.js                        (appHeader)
→ data/vocab.js                    (VOCAB)
→ data/verbs.js                    (VERBS)
→ vocab-trainer.js                 (window.VocabTrainer — the whole vocab engine)
→ inline page <script>             (thin host: CLOUD_FIELD + delegates render/keyboard to VocabTrainer)
```

**verbs.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js
→ speech.js
→ header.js                        (appHeader)
→ data/verbs.js                    (VERBS)
→ verbs-trainer.js                 (window.VerbsTrainer — the whole verb engine)
→ inline page <script>             (thin host: CLOUD_FIELD + delegates render/keyboard to VerbsTrainer)
```

**today.html:** (the wizard hosts BOTH engines + the planner day model)
```
Supabase CDN
→ i18n.js → theme.js → utils.js → pwa.js → leitner.js → speech.js → supabase.js → cloud-sync.js
→ ai-config.js → gemini.js → markdown.js → header.js
→ data/weeks.js → data/vocab.js → data/verbs.js
→ planner-data.js                  (DAYS, TOTAL_DAYS, getLocalizedDay)
→ vocab-trainer.js → verbs-trainer.js
→ inline page <script>             (flow controller; CLOUD_FIELD='planner_data'; initApp().then(afterInit))
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

`index.html` (the landing page, at the repo root) and `views/login.html` each load only the subset
they need (Supabase CDN + `i18n.js` / `theme.js` / `utils.js` / `pwa.js` / `supabase.js`); both skip
`cloud-sync.js`, `header.js`, and the data files. The landing's own `render()` (defined in its inline
`<script>`) rebuilds `#app` from `T()`-keyed template strings — same full-re-render convention as the
app pages. The legacy `auth.html` redirect stub was removed.

---

## 4. Shared modules (`assets/js/`)

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
- `appFooter({ text, showEmail, right })` — the matching shared **footer** for the four app pages
  (note text via `T()`, GitHub + Privacy + Terms links, and an optional `right` slot for a tagline or
  a "reset all" button). planner passes `planner_footer` + `showEmail`; vocab/verbs pass the reset
  button; collections calls it bare. Privacy/Terms point to the `/privacy` `/terms` pages.

### `planner-data.js` — curriculum day model (planner + today)
The flattening of `WEEKS` into `DAYS` (one task = one day), `TOTAL_DAYS`, and `getLocalizedDay(d)`
(the active-locale overlay) — extracted from `planner.html` so `/planner` and the `/today` wizard
share one day model. Top-level `const`/`function` in a classic script live in the shared global
lexical scope (same pattern as `leitner.js` `MAX_BOX`), so both pages see these directly. Depends on
`WEEKS` (must load first) and `getLang`.

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
- `onSessionEnd` — embedded only; the flow's `nextStep`.
Cloud-contract helpers live on the engine (`serialize`, `applyData`, `applyVerbProgress`/`setVerbStore`
on vocab; `serialize`, `applyData`, `setMasteryStore` on verbs); the thin host's
`getCloudPayload`/`applyCloudData` delegate to them. `setVerbStore`/`setMasteryStore` let `/today`
point BOTH engines at one shared `verbs_data.mastery` map (see §19). The engines depend on the same
globals the inline code used (`T`/`getLang`, `esc`/`showToast`/`normalize`/`diffChars`/`track`/
`stageConfirm`, `leitner*`/`MAX_BOX`, `speak`, `VOCAB`/`PLURALS`/`VERBS`). Tests reach engine
internals through the namespace via a small `harness.js` bridge (top-level lookup falls back to
`window.VocabTrainer`/`VerbsTrainer`), so the existing trainer tests kept their `exports` lists.

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
  verb conjugation tables), per-task-type adaptation rules, and a rule that any external resource
  must be given with a direct markdown link (no invented URLs — rendered clickable by `markdown.js`).
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
  `localStorage['auth_redirect']` and redirect to `/login`. **Session →** set `currentUser`,
  `SELECT <CLOUD_FIELD>, lang` from `progress`, apply the payload (only when non-empty — the `{}`
  column default is skipped). It resolves the language (cloud value if valid, else the localStorage
  default) **before** the first render, then `await setLang(lang, true)` loads that one locale,
  syncs it into `localStorage`, and renders **once** — so there's no language flash and only the
  chosen locale is fetched.
- `saveToCloud()` / `saveLangToCloud(code)` / `saveThemeToCloud(theme)` / `saveVerbsToCloud(payload)`
  / `saveVocabToCloud(payload)` — all route through the internal `_pushProgress(fields)`, which
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

---

## 5. Auth & cloud-sync flow

The database is a Supabase Postgres connected to the Vercel project via the Vercel↔Supabase
integration (the integration injects the env vars `build.js` consumes — see §2). The app uses a
single table, `public.progress`, one row per user (confirmed schema):

| Column | Type | Null | Default | Written by | Payload shape |
| --- | --- | --- | --- | --- | --- |
| `user_id` | `uuid` | NO | — | upserts (conflict key) | `session.user.id` — PK, FK → `auth.users(id)` |
| `planner_data` | `jsonb` | yes | `'{}'::jsonb` | planner `getCloudPayload()` | `{ currentDay, viewingDay, completed }` |
| `vocab_data` | `jsonb` | yes | `'{}'::jsonb` | vocab `getCloudPayload()` → `serialize()` | `{ app, version:2, savedAt, selectedWeek, modes, levels, mastery, pluralMastery }` |
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

**Login (`views/login.html`, served at `/login`):**
- On load, `sb.auth.getSession()`; if already signed in → `redirect()` (to
  `localStorage['auth_redirect']` or `/planner`). Otherwise render the form.
- **Deep links from the landing:** `?mode=register` opens the form in register mode; `?email=…`
  prefills the email field (the landing's footer CTA passes both).
- Email/password sign-in (`signInWithPassword`) and sign-up (`signUp`, shows "confirm your email"
  notice). Google OAuth (`signInWithOAuth`, `redirectTo` = production root `/` — the landing then
  forwards the now-signed-in user into the app).
- **Password recovery** — a single page with four `mode`s (`login` | `register` | `reset` |
  `update`). The "Forgot password?" link (login mode) → **`reset`**: enter the email,
  `sb.auth.resetPasswordForEmail(email, { redirectTo: origin + '/login' })` sends a recovery link.
  Clicking that link returns to `/login` with a recovery token; the page detects it (URL
  `#…type=recovery` fast path **and** the `onAuthStateChange` `PASSWORD_RECOVERY` event) and shows
  **`update`** — a new-password field that calls `sb.auth.updateUser({ password })`, then
  `redirect()`s into the app. The recovery case is the one time `initApp`/the page does **not**
  auto-redirect a live session straight to the app. (Guarded by `tests/login.test.js`.)
- Both the **header title block** (an `<a href="/">` around the logo) and an in-box "← Home" link
  (`T('auth_back_home')`) return to the landing.
- Client-side validation: non-empty fields, password ≥ 6 chars (also enforced on the new password).
  Error text via `T(...)`.

**Protected pages (`views/planner.html`, `views/vocab.html`, …):** `initApp()` enforces the session
(redirecting to **`/login`** and remembering where to come back to via `auth_redirect`).

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
  uses only the part before `—` (see `speakWord`). Any vocab word that is a known `VERBS` key is
  rendered with all three principal parts via `verbForms` (see §9), in every week.
- `PLURALS` (same file) — a German-only `{ "der Vater": "die Väter" }`-style map (keyed by the
  exact singular string, incl. its article) feeding the opt-in **plural** trainer mode. Not
  index-aligned to locales; nouns without an entry simply get no plural card. (See §9.)

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
1. `startAILesson(day)` — seeds `lessonsCache[day]` with the day plan as the first user message
   (flagged `seed:true` → hidden from the chat), calls `runLessonTurn(day)`.
2. `sendChatMessage(day)` — appends the user's text to `lessonsCache[day]`, calls
   `runLessonTurn(day)`.
3. `runLessonTurn(day)` — calls `geminiRequest(AI_MODEL_ID, systemPrompt, messages)`, pushes the
   model reply into `lessonsCache[day]` (the **first** reply flagged `pinned:true` → the day's
   explanation), persists via `saveLessonToCloud`, then `render()` + `scrollChatToBottom()`.

> **Pinned explanation + shared with `/today`.** `renderAiSection` shows `pinned` model messages as a
> highlighted "topic breakdown" block (`.ai-rule-wrap`, `ai_pinned_label`) above the chat, hides
> `seed` prompts, and lists the rest as follow-up chat. The `/today` wizard writes the **same**
> `lessons` row, so a day studied there is revisitable here and vice-versa. Old lessons without the
> flags render as plain chat (backward compatible). See §19.

**Weekly summary:**
`generateWeeklySummary(week)` builds a transcript of all lesson messages for the week
(`buildWeekTranscript`) and calls `geminiRequest(AI_PRO_MODEL_ID, summaryPrompt, …)`. Result is
stored in `summaryCache[week]` and persisted as `day = -week`. Button appears only after all days
of the week are marked complete (`isWeekComplete`); `viewWeeklySummary(week)` opens a modal to
re-read a cached summary without regenerating.

**Init sequence:** `initApp().then(loadLessonsThenRender)` — `initApp` loads planner progress
and renders once; `loadLessonsThenRender` then fetches all lesson rows from `lessons` table,
populates `lessonsCache`/`summaryCache`, and re-renders to show chat history.

**Markdown renderer (`renderMd`):** lives in `assets/js/markdown.js` (§4), shared with `/today`.
Inline-only renderer used for model messages. Handles: headings (`#`–`####`), horizontal rules
(`---`), unordered/ordered lists, GFM tables (→ `<table class="ai-table">`), blank lines (→ spacer
`div`), and paragraphs. Inline: `**bold**`, `*italic*`, `` `code` ``, safe links. All content is
HTML-escaped before inline markup is applied.

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

> **The engine lives in `assets/js/vocab-trainer.js` (`window.VocabTrainer`), not in the page.**
> `vocab.html` is now a thin host that wires the cloud-sync contract + keyboard and calls
> `VocabTrainer.init({ embedded:false })`; the same engine powers the `/today` wizard (§19). Handler
> names below are methods on the namespace (`VocabTrainer.startSession(…)`), referenced that way in
> the template `onclick` strings. The state/behaviour described here is unchanged. (See §4.)

### State & persistence
```js
let state = {
  selectedWeek: 1,
  mastery: {},          // { "week-idx": {box,due,right,wrong,seen} } — non-verb words
  pluralMastery: {},    // { "week-idx": {...} } — SEPARATE Leitner track for noun plurals
  modes: { flashcard:true, article:true, spelling:true, plural:false },
  levels: { A1:false, A2:false, B1:false },  // CEFR level filter (A1=wks1-8, A2=9-16, B1=17-24)
  session: null,
  confirm: null
};
let verbStore = { mastery: {} };  // shared verb mastery, separate from state.mastery
```
- `serialize()` → `{ app, version:2, savedAt, selectedWeek, modes, levels, mastery, pluralMastery }`.
  `applyData(d)` validates and applies (tolerates an old payload with no `pluralMastery`);
  `verbStore` is handled separately via `applyVerbProgress`.
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

### Three-form verb display (`verbForms`)
Any word that is a known **`VERBS`** key is shown with all THREE principal parts —
`Infinitiv — Präteritum — Partizip II` (+ `(sein)` for sein-auxiliary verbs) — in the word list
and the flashcard, in **every** week. Forms are pulled live from `VERBS` (the dash suffix of a
week-5 `"Infinitiv — Partizip II"` entry is dropped before lookup). The stored `VOCAB` string is
NOT mutated, so `verbKeyForWord()` / `speakWord()` still read the infinitive. Non-verbs and unknown
verbs are returned unchanged.

### Plural trainer (4th mode — opt-in)
The **plural** chip turns on an INDEPENDENT second Leitner track (`state.pluralMastery`, keyed by
the same `"week-idx"`) so learning a noun's plural is tracked separately from its meaning. Plural
forms live in the German-only **`PLURALS`** map (`data/vocab.js`), keyed by the exact singular
string; a noun only gets a plural card when it has an entry. When on, due/new plural cards are mixed
into the session (`collectPluralCards`) and counted in the "due" stat. Three sub-modes rotate by
box via `pickPluralMode`: **pl_flash** (reveal → self-grade), **pl_choose** (pick the right plural
from morphologically-generated distractors — `makePluralOptions` / `pluralDistractors` / `umlautify`),
**pl_input** (type `die …`). The plural chip toggles freely (the "keep ≥1 mode" rule only governs
the three singular modes).

### Session (a training run)
`startSession(scope)`:

| `scope.type` | Cards selected |
|---|---|
| `'week'` | Due words of the chosen week + up to 12 new; if none due/new, the whole week |
| `'levels'` | Due/new words across the selected CEFR levels; up to 20 new per multi-level run |
| `'review-all'` | All weeks: `seen>0 && !mastered && due<=now` |

Queue is shuffled and capped at **25 cards**. `answer(correct)` → `updateCard` (or `updatePlural`
for plural cards). A wrong card is re-queued **once** at the end as an easier reveal card of the
same track. Flashcards advance immediately; article/spelling/plural-choose/plural-input wait for
"Next". `uniqueRight / uniqueTotal` → first-try score on end screen.

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

> **The engine lives in `assets/js/verbs-trainer.js` (`window.VerbsTrainer`), not in the page.**
> `verbs.html` is a thin host (cloud-sync contract + keyboard + `VerbsTrainer.init({ embedded:false })`);
> the same engine powers the `/today` wizard (§19). Handler names below are methods on the namespace
> (`VerbsTrainer.answer(…)`). The state/behaviour described here is unchanged. (See §4.)

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
--accent:#8F3B6B; --accent-2:#6B2C50;                     /* plum ("Слива") + hover (dark: #C77EA8/#A85E8A) */
--green:#4A7C3A;  --gold:#C5963B;                         /* mastered / in-progress */
--der:#2F5C8F;  --die:#A23B2D;  --das:#3F7A3A;            /* trainer gender colors */
--serif:'Fraunces', Georgia, serif;  --sans:'Manrope', system-ui, sans-serif;
--page-max:920px;                                         /* single content width for all app pages */
```

Editorial/typographic aesthetic: large light (300) serif headings (Fraunces), Manrope body,
minimal rounding, thin borders, tabular numerals (`.num`). The Google-Fonts `<link>` (identical on
all pages) loads **both the upright and italic Fraunces axes** (`ital,opsz,wght@0,…;1,…`) so the
italic serif (subtitles, `<em>` accents, the landing's headings) renders as true Fraunces italic
rather than a browser-synthesised slant. **Container width is unified:** every
app page uses one `--page-max: 920px` token — `.container { max-width: var(--page-max) }` in
`base.css`. The old per-page overrides (planner 820px, vocab's 26px header padding) were removed so
the four sections read as one site; `auth.css` (the login page) narrows to 480px and `landing.css`
(the public landing) lays out its own editorial sections on the same `--page-max` content column.
Responsive via `@media (max-width: 600px)` across `base.css` + every page CSS + `chat.css` (and a
700/720px tier on some pages; `landing.css` collapses the hero/grids at 720px and tightens padding
at 560px).

CSS files: `base.css` (tokens, reset, header/footer/info-box/toast/container + `--page-max`),
`components.css` (`.user-bar-right`, nav-tabs, lang-switcher + the mobile nav-tabs horizontal-scroll
strip and email-ellipsis rules), then page-specific `planner.css` / `vocab.css` / `verbs.css` /
`collections.css` / `auth.css` / `landing.css` / `today.css` (the `/today` wizard chrome — intro
checklist, step header, grammar card, done screen; the in-flow sessions reuse `vocab.css`/`verbs.css`). `chat.css` is loaded by `planner.html` **and** `today.html` and covers `.ai-messages`, `.ai-msg` (user + model variants), `.ai-input-row` (auto-growing
`<textarea>`), `.ai-table`, the loading-dots animation, the key/summary modals, and the pinned
`.ai-rule-wrap` "topic breakdown" block (shared by both AI views). `landing.css`
(loaded only by `index.html`) reuses the `base.css` tokens + `components.css` switcher/toggle and adds
the editorial hero, the section grids, and the decorative `lp*`-prefixed keyframe animations
(disabled under `prefers-reduced-motion`).

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
account — §8) — plus two **transient** keys: `cloud_outbox` (the offline write queue — exists only
while a failed write is pending and is cleared the moment it replays, §4) and `cloud_cache` (the
offline read mirror — a copy of the last successful cloud read used as a cold-start fallback, §5).
Both are convenience buffers, **not progress stores**, and both are scoped to the signed-in user;
all learning progress and chat history lives in Supabase, which always overwrites them.

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
  advances `currentDay`; see §19). `ui-refactor.test.js` guards the move to `views/` +
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

---

## 17. PWA — installable app + offline shell

The site is an installable **Progressive Web App**: on Android/Chrome it offers *"Install app"* and
launches standalone (no address bar, own icon); on iOS *"Add to Home Screen"* does the same. No
build step or store — it works off the existing Vercel HTTPS deploy.

**Pieces:**
- **`manifest.webmanifest`** (root) — `name`/`short_name`, `display: standalone`, `start_url:
  /planner`, `scope: /`, `orientation: portrait`, `theme_color`/`background_color` `#F2EDE3` (light
  `--paper`), and the icon set. Linked from every page's `<head>`.
- **Icons** — `assets/icon.svg` (rounded, transparent corners → `any`) and `assets/icon-maskable.svg`
  (full-bleed, content inside the maskable safe zone) are the **sources**; `assets/icons/*.png`
  (192/512 `any`, `maskable-512`, `apple-touch-icon` 180) are rendered from them with `rsvg-convert`.
  Regenerate the PNGs if you edit a source SVG.
- **`<head>` tags** (all 6 pages — landing, login + the 4 app pages) — `<link rel="manifest">`, `theme-color` (kept in sync with the
  active light/dark theme by `theme.js`'s `applyTheme()`), `mobile-web-app-capable` /
  `apple-mobile-web-app-*`, and `apple-touch-icon`.
- **`assets/js/pwa.js`** — registers `sw.js` on `window.load` (best-effort; no-op on unsupported
  browsers / insecure origins). Loaded by every page so the shell is cached even before sign-in. It
  also **auto-applies SW updates**: if the page is already controlled by a SW, a `controllerchange`
  (fired when a new `VERSION` activates via `skipWaiting` + `clients.claim`) reloads the page once —
  so a returning visitor on a stale cached build sees the new assets without a manual refresh. The
  reload is guarded against loops and is not attached for first-time visitors (whose initial claim
  must not trigger a reload).
- **`sw.js`** (root, scope `/`) — the service worker.

**Service-worker caching strategy** (one cache per `VERSION`; `build.js` re-stamps `VERSION` on every
deploy (§2) so each deploy gets a fresh cache and old ones are pruned on `activate` — you no longer
hand-bump it for cache refresh, only keep `SHELL_ASSETS` accurate when assets are added/removed):
- **navigations** (HTML pages) → **network-first**, cached page as the offline fallback.
- **same-origin static** (`/assets`, `/data`, `/locales`) → **stale-while-revalidate**.
- **CDN libs + fonts** (Supabase UMD on jsDelivr, Google Fonts) → **cache-first** — the app can't
  boot without the Supabase library, so it must be available offline.
- **Supabase REST/Auth** (`*.supabase.co`) → **never cached**; passes straight to the network.
  Offline *data* is owned by JS, not the SW: failed writes ride `cloud_outbox`, cold-start reads fall
  back to `cloud_cache` (§4–§5). Caching auth/rest here would serve stale or wrong data.

**What works offline:** opening the installed app, the full UI shell, the curriculum/vocab/verb data
and locales, studying, and *writing* progress (queued, synced on reconnect). On a cold start with no
network the read mirror (§5) restores the last-seen progress. **Live Gemini AI lessons and
first-ever sign-in still need a connection.**

> **TWA / Play Store (not done, easy follow-up).** This PWA is the prerequisite for a `.aab` via
> PWABuilder/Bubblewrap (a Trusted Web Activity wrapping the same URL). That additionally needs a
> Play Developer account and a `/.well-known/assetlinks.json` for Digital Asset Links.

---

## 18. `index.html` — public landing page

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

---

## 19. `today.html` — the daily-flow wizard (`/today`)

A guided "do today's day in one run" experience and the **first nav tab**. Instead of hopping between
sections, the user presses one **Learn** button and is walked through the day in order. "Today" =
the planner's `currentDay` (read from `planner_data`); the day's content comes from the shared day
model (`planner-data.js` — `getLocalizedDay(DAYS[currentDay-1])`).

**Steps** (`STEPS = ['grammar','vocab','verbs','ai','done']`):
1. **grammar** — the day card (week theme · grammar focus · today's task with its `type_<type>` label),
   rendered by the page. A **"Break it down with AI"** button (`explainDay`) expands the AI chat panel
   right under the card and auto-sends a point-by-point breakdown request (`dayBreakdownText` →
   `today_ai_breakdown_req`: rule + examples + tables + a "what to memorize" checklist for EACH item).
   The panel reuses the shared `renderAiPanel()` / `ai` state, so the conversation carries over to the
   AI step. "Continue →" advances (the breakdown does not change the flow order).
2. **vocab** — `VocabTrainer.startSession({ type:'week', week })` for the current week (due words +
   up to 12 new; articles `der/die/das` ride along as a mode).
3. **verbs** — `VerbsTrainer.startSession({ type:'due' })` (repetition first); falls back to
   `{ type:'filter', filter:'all' }` (due + some new) when nothing is due.
4. **ai** — an in-flow chat (reuses `gemini.js` / `ai-config.js` / `markdown.js` / `chat.css`),
   **persisted** to the same `lessons` row the planner uses (one per user×day). If no Gemini key, it
   nudges to `/settings` and offers **Skip**. Same `ai` state + `renderAiPanel()` as the grammar
   panel, so it shows the breakdown done earlier plus any follow-ups.
5. **done** — marks `planner_data.completed[day] = true`, advances `currentDay` (when finishing the
   current day), persists via `saveToCloud`, and shows the completion screen → "Open the planner".

**Pinned explanation + follow-up chat (shared with the planner).** A lesson's `messages` carry two
optional flags: `seed:true` (the hidden prompt that elicits the explanation — the breakdown request
on `/today`, the day-plan on `/planner`) and `pinned:true` (the **first** model reply = the day's
explanation). Both `renderAiPanel()` (today) and the planner's `renderAiSection` render `pinned`
messages as a highlighted **"topic breakdown"** block (`.ai-rule-wrap`, label `ai_pinned_label`) on
top, hide `seed`, and show the rest as the follow-up chat below. Because both write the **same**
`lessons` row, the user can study a day on `/today` and later revisit/refresh it from `/planner` (any
day) — and vice-versa. Old lessons (no flags) fall through to plain chat, so the change is backward
compatible. `/today` loads the day's row via `loadDayLesson` (reusing `loadLessonsFromCloud`) when the
flow starts and saves each turn via `saveLessonToCloud(day, …)`.

**Hosting the engines.** The vocab + verb steps reuse the **shared engines** (§4) in `embedded:true`
mode: their immersive `.session-bg` overlay takes over `#app`, and the session end screen's primary
button (and the `×`) call the engine's `onSessionEnd` → the flow's `nextStep`. Between sessions the
engines' `render()` is a no-op (the wizard owns the screen — intro, grammar, ai, done). A single
`keydown` listener routes to whichever engine has an active session.

**Cloud columns** (each written independently, §4):
- `planner_data` — this page's `CLOUD_FIELD`; read for `currentDay`, written on finish.
- `verbs_data` — loaded via `applyVerbProgress` during `initApp`. The wizard wires **one shared
  mastery map** into both engines (`wireSharedVerbStore()` → `VerbsTrainer.setMasteryStore(map)` +
  `VocabTrainer.setVerbStore({ mastery: map })`), so a verb answered in either step counts once.
  Both engines' save hooks persist `VerbsTrainer.serialize()` via `saveVerbsToCloud`.
- `vocab_data` — `initApp` does not load it (it isn't the `CLOUD_FIELD`), so the page fetches it once
  after `initApp` (`loadVocabData` → `VocabTrainer.applyData`); the vocab engine saves it via
  `saveVocabToCloud`.
- `lessons` (table) — the AI step's per-day history, shared with the planner (see the pinned-explanation
  note above): `loadDayLesson` reads it, `saveLessonToCloud` writes it.

**Edge cases:** `currentDay > TOTAL_DAYS` → a "course complete" screen; a day already completed shows
a review banner on the intro but still lets the user run it again.

**Styling** — `today.css` for the wizard chrome (intro checklist, step header with progress, grammar
card, AI wrapper, done screen); the in-flow sessions reuse `vocab.css` / `verbs.css`. No new tokens
(§11). Guarded by `tests/today-flow.test.js` + a `render-smoke` entry.

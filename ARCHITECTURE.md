# Architecture — Deutsch Daily (German A1 → B1 learning tools)

Comprehensive technical reference for this project. Re-derived directly from the source on
2026-06-08. For day-to-day editing rules and gotchas see [CLAUDE.md](CLAUDE.md); this document
is the deeper "how it all fits together" reference.

---

## 1. What the product is

A small web app that helps one user study German from ~A1 to the **Goethe-Zertifikat B1** exam
over a ~6-month, 24-week plan. The system has three cooperating parts:

1. **Planner** (`index.html` → `planner.html`) — one study day = one main task. Contains a
   **built-in AI tutor chat** (Gemini) and a clipboard-copy button for the day plan.
2. **Vocabulary trainer** (`vocab.html`) — ~600 words across 24 weekly sets, three exercise modes
   mixed together, Leitner spaced repetition, and text-to-speech.
3. **Verb trainer** (`verbs.html`) — drills ~306 irregular verbs (three Stammformen) in cloze,
   triad-flashcard, and table modes; mastery is shared with the vocabulary page.
4. **AI Lehrer chat** — the planner has a built-in Gemini chat per study day. The user clicks
   "Start lesson" and the day plan is sent automatically as the opening message; subsequent
   turns are a live chat with a tutor persona. Conversation history is persisted per-day in
   the `lessons` Supabase table. A weekly-summary feature (PRO model) rolls up all lesson
   transcripts into feedback. (Requires the user to supply their own Gemini API key.)

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
- **Hosting:** Vercel, static (`vercel.json` → `{ "outputDirectory": "." }`). Production URL is
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
├── index.html          # LOGIN / REGISTER page (email + Google OAuth). Default entry point.
├── auth.html           # Legacy stub: <meta refresh> redirect to "/" (i.e. index.html).
├── planner.html        # Daily planner + AI Lehrer chat.
├── vocab.html          # Vocabulary trainer (thin: page markup + page logic).
├── verbs.html          # Irregular-verb trainer (3-form triad / cloze / table modes).
├── assets/
│   ├── css/  base.css · components.css · planner.css · chat.css · vocab.css · verbs.css · auth.css
│   └── js/   i18n.js · theme.js · utils.js · supabase.js · cloud-sync.js · ai-config.js
│             leitner.js · speech.js
├── data/   weeks.js (WEEKS) · vocab.js (VOCAB) · verbs.js (VERBS — master verb dictionary)
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_RU / _UA / _EN = { ui, vocab, verbs, weeks })
├── build.js · package.json · vercel.json
├── ARCHITECTURE.md · CLAUDE.md · README.md · LICENSE
```

**Important correction vs. older notes:** `index.html` *is* the auth screen (the full
login/register form, ~138 lines). `auth.html` is a 9-line redirect stub kept for any old links
pointing at it. There is no separate "router" page — routing is done by the session check inside
each page (`initApp`).

### Script load order

**planner.html:**
```
Supabase CDN
→ assets/js/i18n.js                (T, getLang, setLang, loadLocale, renderLangSwitcher)
→ assets/js/theme.js               (theme toggle + persistence)
→ assets/js/utils.js               (esc, showToast)
→ assets/js/supabase.js            (sb client)
→ assets/js/cloud-sync.js          (initApp, saveToCloud, … logout, currentUser, lessons functions)
→ assets/js/ai-config.js           (AI_MODEL_ID, AI_PRO_MODEL_ID, getAiSystemPrompt, getAiSummaryPrompt)
→ data/weeks.js                    (WEEKS)
→ inline page <script>             (state, chat state, render, page logic)
   initApp().then(loadLessonsThenRender)
```

**vocab.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js                       (leitnerApply, leitnerIsDue, leitnerIsMastered, …)
→ speech.js                        (speak, pickVoice)
→ data/vocab.js                    (VOCAB)
→ inline page <script>             (state, verbStore, render, page logic; calls initApp() last)
```

**verbs.html:**
```
Supabase CDN
→ i18n.js → theme.js → utils.js → supabase.js → cloud-sync.js
→ leitner.js
→ speech.js
→ data/verbs.js                    (VERBS)
→ inline page <script>             (state, render, page logic; calls initApp() last)
```

**Locale files are NOT in this list — they load on demand.** `i18n.loadLocale(code)` injects
`locales/<code>.js` for the active language only (and caches it); the page bootstrap awaits
`loadLocale(getLang())` before the first render (`initApp()` for planner/vocab; the init chain in
`index.html`). Switching language fetches that one locale once. So a user downloads a single
locale, not all three.

`index.html` and `auth.html` load only the subset they need (`index.html` skips `cloud-sync.js`
and the data files; `auth.html` loads nothing).

---

## 4. Shared modules (`assets/js/`)

### `i18n.js` — translation core (lazy locale loading)
- `_lang` initialised from `localStorage['ui_lang']`, default `'en'` (`DEFAULT_LANG`). Valid:
  `en`, `ua`, `ru`.
- `loadLocale(code)` — injects `locales/<code>.js` once and returns a cached Promise that resolves
  when `window.LOCALE_<CODE>` is set. This is how only the active language is fetched; nothing
  preloads all three. Pages **must `await loadLocale(getLang())` before the first render**.
- `T(key, ...args)` — look up `LOCALE_<lang>.ui[key]`, fall back to the `DEFAULT_LANG` (EN) value,
  then to the raw key (and tolerates a not-yet-loaded locale by returning the key). If the value is
  a **function**, it's called with `args` (e.g. `planner_progress: (done, total) => ...`).
- `setLang(code, skipSave)` — **async**: `await loadLocale(code)`, then set language, persist to
  `localStorage`, push to cloud via `saveLangToCloud` (unless `skipSave`), then re-`render()`.
  `skipSave` is used when applying the language loaded *from* the cloud, to avoid a write-back loop.
- `getLang()`, `renderLangSwitcher()` (renders the EN/UA/RU buttons).

### `ai-config.js` — Gemini configuration (planner-only)
Loaded only by `planner.html`. Exports two constants and two functions:
- `AI_MODEL_ID` — model for daily lessons (currently `gemini-3.1-flash-lite`).
- `AI_PRO_MODEL_ID` — model for weekly summaries (currently `gemini-3.5-flash`).
- `getAiSystemPrompt()` — returns the tutor system prompt for the active UI language (RU/UA/EN).
  The prompt sets the persona, student context (A1→B1, lives in Berlin), output format (theory +
  examples + exercises + answer key), formatting rules for German (nouns with article/plural,
  verb conjugation tables), and per-task-type adaptation rules.
- `getAiSummaryPrompt()` — returns the weekly-summary system prompt (also per language).

All prompts are pure string constants — edit this file to change models or tune the tutor persona
without touching `planner.html`.

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
| `CLOUD_FIELD` | column on the `progress` table: `'planner_data'`, `'vocab_data'`, or `'verbs_data'` |
| `applyCloudData(d)` | apply the loaded JSON payload into local `state` |
| `getCloudPayload()` | return the object to persist into `CLOUD_FIELD` |
| `render()` | (re)draw the UI |

`cloud-sync.js` provides:
- `currentUser` (global, set after auth).
- `initApp()` — `sb.auth.getSession()`. **No session →** store `location.href` in
  `localStorage['auth_redirect']` and redirect to `index.html`. **Session →** set `currentUser`,
  `SELECT <CLOUD_FIELD>, lang` from `progress`, apply the payload (only when non-empty — the `{}`
  column default is skipped). It resolves the language (cloud value if valid, else the localStorage
  default) **before** the first render, then `await setLang(lang, true)` loads that one locale,
  syncs it into `localStorage`, and renders **once** — so there's no language flash and only the
  chosen locale is fetched.
- `saveToCloud()` — `upsert` `{ user_id, [CLOUD_FIELD]: getCloudPayload(), updated_at }` with
  `onConflict: 'user_id'`.
- `saveLangToCloud(code)` — `upsert` `{ user_id, lang, updated_at }`.
- `saveThemeToCloud(theme)` / `saveVerbsToCloud(payload)` — `upsert` the `theme` / `verbs_data` column.
- During `initApp`, if the page defines `applyVerbProgress(d)`, the shared `verbs_data` is loaded
  into it (separate query, before render) — this is how the vocabulary page gets cross-cutting verb
  mastery without changing its own `CLOUD_FIELD`.
- `logout()` — `sb.auth.signOut()` then go to `/`.

**Lessons (AI chat history) — separate table `lessons`:**
- `loadLessonsFromCloud()` — `SELECT day, messages` for the current user; returns `[]` on error.
- `saveLessonToCloud(day, messages)` — `upsert` `{ user_id, day, messages, updated_at }` with
  `onConflict: 'user_id,day'`. `day > 0` = daily lesson; `day < 0` = weekly summary for week
  `(-day)` (e.g. `day = -3` stores the week-3 summary).
- `deleteLessonFromCloud(day)` — `DELETE` the row for that `user_id` + `day` pair.

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

Equivalent DDL:

```sql
create table public.progress (
  user_id      uuid primary key references auth.users(id),
  planner_data jsonb       default '{}'::jsonb,
  vocab_data   jsonb       default '{}'::jsonb,
  lang         text        default 'en'::text,
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
  `localStorage['auth_redirect']` or `planner.html`). Otherwise render the form.
- Email/password sign-in (`signInWithPassword`) and sign-up (`signUp`, shows "confirm your email"
  notice). Google OAuth (`signInWithOAuth`, `redirectTo` = production root).
- Client-side validation: non-empty fields, password ≥ 6 chars. Error text via `T(...)`.

**Protected pages (`planner.html`, `vocab.html`):** `initApp()` enforces the session (redirecting
to `index.html` and remembering where to come back to).

**`auth.html`:** legacy `<meta http-equiv="refresh" content="0; url=/">` — just bounces to root.

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
const TOTAL_DAYS = DAYS.length;   // currently ~115 days
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
`_storeGeminiKey(k)` writes/removes it. The key is never sent to Supabase; it stays local.

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
  footer) from template strings.
- Keyboard: `←/→` page days; `c` / `C` / `с` / `С` (Latin & Cyrillic) copies. `SELECT` focus is
  ignored so the week dropdown keeps working.

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
| `'filter'` | All verbs matching `state.filter`, regardless of due date |
| `'selected'` | Verbs in `state.sel`, capped at **40 cards** |

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
```

Editorial/typographic aesthetic: large light (300) serif headings (Fraunces), Manrope body,
minimal rounding, thin borders, tabular numerals (`.num`). Container width is set per page —
`base.css` defaults to 920px (vocab), overridden to 820px in `planner.css` and 480px in
`auth.css`. Responsive via `@media (max-width: 600px)` (and 720px on some pages).

CSS files: `base.css` (tokens, reset, header/footer/info-box/toast/container),
`components.css` (user-bar, nav-tabs, lang-switcher), then page-specific `planner.css` /
`vocab.css` / `verbs.css` / `auth.css`. `chat.css` is loaded only by `planner.html` and
covers `.ai-messages`, `.ai-msg` (user + model variants), `.ai-input-row` (auto-growing
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

`localStorage` is used for four keys: `ui_lang` (language preference), `ui_theme`
(`light`|`dark`, written by `theme.js`), `auth_redirect` (post-login return URL), and
`gemini_key` (user's Gemini API key — never sent to Supabase). All learning progress and
chat history lives in Supabase.

---

## 13. Known gaps / things to watch

- **Index-match fragility.** Curriculum/vocab edits must stay index-aligned across the base data
  file and all three locale files (§6). There is no runtime validation; a shifted index causes
  silent translation mismatches.
- **Gemini key lives only in localStorage.** If the user clears browser storage, the key is lost
  silently — there is no recovery prompt except re-opening the settings modal.
- **No conversation length limit for AI chat.** `lessonsCache[day]` grows unbounded; very long
  sessions may hit Gemini token limits or inflate cloud storage.
- **Cloud writes are fire-and-forget.** `saveToCloud` / `saveLessonToCloud` ignore errors silently.
  Offline edits are lost if the page is closed before connectivity is restored.

> **Already resolved (kept for history):**
> - Untranslated spelling/end-screen strings — `T()` keys are now wired everywhere.
> - Orphaned `settings_*` / `toast_sync_*` locale keys — removed when FSA auto-sync was dropped.
> - `<html lang="ru">` hardcoded — `i18n.js` sets `document.documentElement.lang` dynamically on
>   init (line 13) and on every `setLang()` call (line 50), so the static attribute is a no-op.
> - `lessons` DDL not in repo — `schema.sql` added at project root (idempotent, safe to re-run).

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

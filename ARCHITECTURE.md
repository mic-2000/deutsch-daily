# Architecture — Deutsch Daily (German A1 → B1 learning tools)

Comprehensive technical reference for this project. Re-derived directly from the source on
2026-06-06. For day-to-day editing rules and gotchas see [CLAUDE.md](CLAUDE.md); this document
is the deeper "how it all fits together" reference.

---

## 1. What the product is

A small web app that helps one user study German from ~A1 to the **Goethe-Zertifikat B1** exam
over a ~6-month, 24-week plan. The system has three cooperating parts:

1. **Planner** (`index.html` → `planner.html`) — one study day = one main task. A big button
   copies the day's plan to the clipboard as a ready-made prompt for a chat LLM.
2. **Vocabulary trainer** (`vocab.html`) — ~600 words across 24 weekly sets, three exercise modes
   mixed together, Leitner spaced repetition, and text-to-speech.
3. **An external chat LLM** — the user pastes the copied day plan; the model returns study
   material and exercises. (Not part of this repo; the planner just produces the prompt text.)

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
> the project's history is largely historical — see §11.

---

## 3. Project structure

```
deutsch-daily/
├── index.html          # LOGIN / REGISTER page (email + Google OAuth). Default entry point.
├── auth.html           # Legacy stub: <meta refresh> redirect to "/" (i.e. index.html).
├── planner.html        # Daily planner (thin: page markup + page logic).
├── vocab.html          # Vocabulary trainer (thin: page markup + page logic).
├── assets/
│   ├── css/  base.css · components.css · planner.css · vocab.css · auth.css
│   └── js/   i18n.js · utils.js · supabase.js · cloud-sync.js
├── data/   weeks.js (global WEEKS) · vocab.js (global VOCAB)
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_RU / _UA / _EN = { ui, vocab, weeks })
├── build.js · package.json · vercel.json
├── ARCHITECTURE.md · CLAUDE.md · LICENSE
```

**Important correction vs. older notes:** `index.html` *is* the auth screen (the full
login/register form, ~138 lines). `auth.html` is a 9-line redirect stub kept for any old links
pointing at it. There is no separate "router" page — routing is done by the session check inside
each page (`initApp`).

### Script load order (planner / vocab pages)

```
Supabase CDN
→ locales/ru.js, ua.js, en.js      (define window.LOCALE_*)
→ assets/js/i18n.js                (T, getLang, setLang, renderLangSwitcher)
→ assets/js/utils.js               (esc, showToast)
→ assets/js/supabase.js            (sb client)
→ assets/js/cloud-sync.js          (initApp, saveToCloud, saveLangToCloud, logout, currentUser)
→ data/weeks.js | data/vocab.js    (WEEKS | VOCAB)
→ inline page <script>             (state, render, page logic; calls initApp() last)
```

`index.html` and `auth.html` load only the subset they need (`index.html` skips `cloud-sync.js`
and the data files; `auth.html` loads nothing).

---

## 4. Shared modules (`assets/js/`)

### `i18n.js` — translation core
- `_lang` initialised from `localStorage['ui_lang']`, default `'en'` (`DEFAULT_LANG`). Valid:
  `en`, `ua`, `ru`.
- `T(key, ...args)` — look up `LOCALE_<lang>.ui[key]`, fall back to the `DEFAULT_LANG` (EN) value,
  then to the raw key. If the value is a **function**, it's called with `args` (used for
  interpolated strings, e.g. `planner_progress: (done, total) => ...`).
- `setLang(code, skipSave)` — set language, persist to `localStorage`, push to cloud via
  `saveLangToCloud` (unless `skipSave`), then re-`render()`. `skipSave` is used when applying the
  language loaded *from* the cloud, to avoid a write-back loop.
- `getLang()`, `renderLangSwitcher()` (renders the EN/UA/RU buttons).

### `utils.js` — tiny shared helpers
- `esc(s)` — HTML-escape `& < > " '`. **Every** dynamic value interpolated into `innerHTML` must
  go through this.
- `showToast(msg, duration?)` — bottom toast; default 2600 ms. Requires a `#toast` element.

### `supabase.js` — client
- Creates `sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`. URL/key are
  build-time placeholders (see §2).

### `cloud-sync.js` — session + progress sync (the per-page contract)
Each page must define these globals **before** calling `initApp()`:

| Global | Purpose |
| --- | --- |
| `CLOUD_FIELD` | column on the `progress` table: `'planner_data'` or `'vocab_data'` |
| `applyCloudData(d)` | apply the loaded JSON payload into local `state` |
| `getCloudPayload()` | return the object to persist into `CLOUD_FIELD` |
| `render()` | (re)draw the UI |

`cloud-sync.js` provides:
- `currentUser` (global, set after auth).
- `initApp()` — `sb.auth.getSession()`. **No session →** store `location.href` in
  `localStorage['auth_redirect']` and redirect to `index.html`. **Session →** set `currentUser`,
  `SELECT <CLOUD_FIELD>, lang` for this user from `progress`, apply the payload (only when
  non-empty — the `{}` column default is skipped) + language, then `render()`.
- `saveToCloud()` — `upsert` `{ user_id, [CLOUD_FIELD]: getCloudPayload(), updated_at }` with
  `onConflict: 'user_id'`.
- `saveLangToCloud(code)` — `upsert` `{ user_id, lang, updated_at }`.
- `logout()` — `sb.auth.signOut()` then go to `/`.

---

## 5. Auth & cloud-sync flow

The database is a Supabase Postgres connected to the Vercel project via the Vercel↔Supabase
integration (the integration injects the env vars `build.js` consumes — see §2). The app uses a
single table, `public.progress`, one row per user (confirmed schema):

| Column | Type | Null | Default | Written by | Payload shape |
| --- | --- | --- | --- | --- | --- |
| `user_id` | `uuid` | NO | — | upserts (conflict key) | `session.user.id` — PK, FK → `auth.users(id)` |
| `planner_data` | `jsonb` | yes | `'{}'::jsonb` | planner `getCloudPayload()` | `{ currentDay, viewingDay, completed }` |
| `vocab_data` | `jsonb` | yes | `'{}'::jsonb` | vocab `getCloudPayload()` → `serialize()` | `{ app, version, savedAt, selectedWeek, modes, mastery }` |
| `lang` | `text` | yes | `'en'::text` | `saveLangToCloud` | `'ru' \| 'ua' \| 'en'` |
| `updated_at` | `timestamptz` | yes | `now()` | every upsert | ISO string |

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
```

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

`window.LOCALE_RU / _UA / _EN`, each `{ ui, vocab, weeks }`. **EN is the default and the `T()`
fallback** (`i18n.js` `DEFAULT_LANG = 'en'`); all three locales define all three sections, so any
of them works as the active or fallback language. Note: the data-overlay helpers `getLocalizedDay`
(planner) and `getTranslation` (vocab) keep their own **hardcoded RU last-resort fallback** for a
missing week/word entry — independent of `DEFAULT_LANG`.

- **`ui`** — flat string (or function) table keyed by UI string id. Used everywhere via `T(key)`.
- **`vocab`** — `{ <weekNumber>: [translation0, translation1, ...] }`, **index-matched** to
  `VOCAB[week].words`. Read by `getTranslation(week, idx)` (active locale → RU fallback → `''`).
- **`weeks`** — `{ <weekNumber>: { theme, grammar, vocab, tasks: [...] } }`, **index-matched** to
  `WEEKS[n].tasks`. Overlaid onto the base curriculum by `getLocalizedDay(d)` in the planner.

> Consequence: adding/removing a word or a task means updating the German base array **and** the
> matching index in **all three** locale arrays, or translations silently shift/blank out.

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

### Clipboard text — the key feature
`buildPlanText(d)` assembles the localized day into the message the user pastes into the chat LLM
(header with day/week, week theme, grammar focus, today's task with its type label, the daily
vocab habit, and a closing instruction to "give me detailed material + 2–3 exercises"). All
fragments come from `T('planner_clip_*', ...)`.

`copyPlan(day)` uses `navigator.clipboard.writeText` with a fallback to a hidden `<textarea>` +
`document.execCommand('copy')` (`fallbackCopy`). On success it flashes the button to "copied".

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
let state = { selectedWeek:1, mastery:{}, modes:{flashcard:true, article:true, spelling:true},
              session:null, confirm:null };
const CLOUD_FIELD = 'vocab_data';
const KEY = 'de-vocab-trainer-v2';   // NOT a localStorage key anymore — only the export/import
                                     // format version reference.
```
- `serialize()` → the cloud/export payload `{ app, version:2, savedAt, selectedWeek, modes,
  mastery }`. `applyData(d)` validates (`d.mastery` must be an object) and applies it.
- `load()` is a **no-op** — cloud is the source of truth. `save()` → `saveToCloud()`.

### Leitner spaced repetition (5 boxes)
```js
const BOX_INTERVAL = { 1:1d, 2:2d, 3:4d, 4:8d, 5:16d };  const MAX_BOX = 5;
```
- Per word: `{ box, due, right, wrong, seen }`, keyed `"week-idx"` in `state.mastery`.
- `updateCard(week, idx, correct)`: `seen++`; correct → `box = min(5, box+1)` (new 0→1, one box per
  correct); wrong → `box = 1`. `due = now + BOX_INTERVAL[box]`, then `save()`.
- `isDue` — a word with no record is always due; otherwise `due <= now`. `isMastered` — `box >= 5`.
- The per-word box bar (`.box-bar`, 5 segments) is **clickable → reset that one word**.

### Three exercise modes
`availableModes(de)` decides which apply to a word:
- **flashcard** — always.
- **article** — only if `parseArticle(de)` matches `/^(der|die|das)\s+(.+)$/`.
- **spelling** — if the core (article stripped) has no space/`?`/`…`/`—`/`/` and length ≥ 2.

`pickMode(week, idx)` chooses randomly from `enabled ∩ available`, with a light pedagogical nudge:
`box ≥ 3` leans toward **spelling** (production), `box ≤ 1` leans toward **article**.

- **flashcard** — German shown → "show translation" (auto-speaks on reveal) → self-grade
  "Knew it / Didn't know". **Advances immediately** after grading.
- **article** — word without article → `der/die/das` buttons (color-coded der=blue, die=red,
  das=green) → feedback + "Next". Audio appears only **after** answering (so it doesn't hint).
- **spelling** — Russian/translation shown → type the German → check. Comparison via `normalize()`
  (lowercase, trim, ä→ae/ö→oe/ü→ue/ß→ss, collapse spaces). A missing article is accepted as
  correct with a note. On error, a character-level diff (`diffChars`, LCS) highlights wrong/extra
  chars (`diff-bad`) and missing chars (`diff-miss`), case-insensitively.

### Session (a training run)
`startSession(scope)` where `scope = {type:'week', week:N}` or `{type:'review-all'}`:
- **week** — due words of the week + up to 12 new; if neither, the whole week.
- **review-all** — across all weeks, words with `seen>0 && !mastered && due<=now` (the home
  "Review due" button).
- Queue is shuffled and capped at 25.
- `answer(correct)` → `updateCard`. A wrong card is re-queued **once** at the end as an easier
  flashcard. Flashcards advance immediately; article/spelling show feedback and wait for "Next".
- `uniqueRight / uniqueTotal` drive the first-try score on the end screen.

### Speech (Web Speech API)
`pickVoice()` finds a `de-*` voice (voices load async → also bound to
`speechSynthesis.onvoiceschanged`). `speak(text, btnEl)` uses `lang='de-DE'`, `rate=0.88`.
`speakWord(week, idx, btnEl)` speaks only the part before `—`.

### Progress portability
- **Cloud** (Supabase) is the live store.
- **Manual export/import** — `exportProgress()` downloads `serialize()` as a JSON Blob;
  `importProgress()` reads a chosen file and `applyData()`s it. Works in any browser; useful for
  backup/transfer. (The older File System Access API auto-sync has been removed.)

### Reset
`resetWord(week, idx)` / `resetAll()` go through an **in-page** modal
(`askConfirm`/`confirmYes`/`confirmNo` driven by `state.confirm`), never the native `confirm()`.

### Render & keyboard
- `render()` → `renderSession()` if a session is active, else the home screen (the confirm modal is
  appended to the home markup). `renderFlashcard` / `renderArticle` / `renderSpelling` /
  `renderEnd`.
- Keyboard: flashcard `Space`/`1`/`2`/`←`/`→`; article `1`/`2`/`3`, `Enter`=next; spelling typing +
  `Enter`; `Esc` exits the session.

---

## 10. Design system (`assets/css/base.css`)

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
`vocab.css` / `auth.css`.

---

## 11. Environment notes

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

`localStorage` is now used for only two small things: `ui_lang` (language preference) and
`auth_redirect` (post-login return URL). All learning progress lives in Supabase.

---

## 12. Known gaps / things to watch

- **Untranslated strings in the trainer session UI.** `renderSpelling` and `renderEnd` in
  `vocab.html` contain hardcoded Russian ("Напиши по-немецки", "Проверить", "Дальше →",
  "ä=ae… принимаются · Enter — проверить", "Готово!", "Безупречно!…", "Тренировка завершена",
  detail/score lines). Matching `T()` keys already exist (`spelling_*`, `end_*`) but aren't wired
  up — these screens don't follow the active UI language.
- **Orphaned locale keys.** `settings_create_file`, `settings_open_file`, `settings_auto_on`,
  `settings_sync_hint`, `toast_sync_created`, `toast_sync_opened`, `toast_sync_unavailable`,
  `toast_file_corrupt` remain in the locales but are unused since the File System Access API
  auto-sync was removed.
- **Index-match fragility.** Curriculum/vocab edits must stay index-aligned across the base data
  file and all three locale files (§6).
- **`<html lang="ru">`** is hardcoded on every page regardless of the selected UI language.

---

## 13. Already-fixed bugs (do not reintroduce)

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

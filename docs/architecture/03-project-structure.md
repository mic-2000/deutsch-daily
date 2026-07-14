# 3. Project structure

> Section §3 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

```
deutsch-daily/
├── index.html          # PUBLIC LANDING page for guests (marketing + auth entry points). Root ( / ). §18
├── views/              # login + all authenticated app pages live here; served via pretty-URL rewrites
│   ├── login.html       # LOGIN / REGISTER (email + Google OAuth).    ( /login ) §5
│   ├── welcome.html     # First-run onboarding wizard (5 questions → mini-lesson). ( /welcome ) §20
│   ├── today.html       # Daily-flow wizard (descriptor steps → …→produce→AI→weak→done). ( /today ) §19
│   ├── planner.html     # Daily planner + AI Lehrer chat.            ( /planner )
│   ├── vocab.html       # Vocabulary trainer (thin host → VocabTrainer). ( /vocab )
│   ├── verbs.html       # Irregular-verb trainer (thin host → VerbsTrainer). ( /verbs )
│   ├── collections.html # User word-set trainer (import/edit/drill/AI translate). ( /collections ) §16
│   ├── stats.html       # Read-only statistics + B1 forecast (read-only).  ( /stats ) §22
│   └── settings.html    # Account: password / AI key / theme / lang / delete. ( /settings )
├── assets/
│   ├── css/  base.css · components.css · planner.css · chat.css · vocab.css · verbs.css · auth.css · collections.css · landing.css · settings.css · today.css · welcome.css
│   ├── js/   i18n.js · theme.js · utils.js · supabase.js · cloud-sync.js · ai-config.js
│   │         gemini.js · leitner.js · speech.js · header.js · pwa.js
│   │         markdown.js · course-consts.js · planner-data.js · vocab-trainer.js · verbs-trainer.js · grammar-drill.js   # AI md + course shape + day model + trainer engines
│   ├── favicon.svg · icon.svg · icon-maskable.svg     # icon sources (PNGs rendered into icons/)
│   └── icons/  icon-192.png · icon-512.png · maskable-512.png · apple-touch-icon.png
├── data/   weeks.js (WEEKS) · vocab.js (VOCAB) · verbs.js (VERBS — master verb dictionary) · grammar-drills.js (GRAMMAR_DRILLS — keyed by slug, cut from v2) · dialogues.js (DIALOGUES — keyed by slug, cut from v2)
│   └── v2/   GENERATED Course-v2 data (weeks/vocab/grammar-drills/dialogues/manifest) — source of the live course; swapped into data/ by cutover-v2. §21
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_RU / _UA / _EN = { ui, vocab, verbs, weeks, drills, dialogues })
│   └── v2/   GENERATED Course-v2 locale overlays (en/ru/ua) — merged into locales/ by cutover-v2. §21
├── authoring/  Course-v2 single-source content (course.js · verb-bands.js · plurals.js · weeks/w01..w36.js) + README. §21
├── scripts/  gen-course.js (authoring → data/v2 + locales/v2) · cutover-v2.js (v2 → live data/ + locales/) · band-verbs.js (verb bands). §21
├── manifest.webmanifest · sw.js     # installable PWA: web manifest + offline service worker (§17)
├── build.js · package.json · vercel.json
├── docs/architecture/  per-§ architecture reference files (this document set; ARCHITECTURE.md = the index)
├── ARCHITECTURE.md (§→file index) · CLAUDE.md · README.md · LICENSE
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
→ assets/js/planner-data.js        (DAYS, TOTAL_DAYS, getLocalizedDay, dayReadiness — shared with /today)
→ assets/js/stats.js               (streakInfo, activityCalendar — streak + calendar, shared with /today)
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
→ course-consts.js                 (COURSE_VERSION, BAND_WEEKS, WEEK_FOR_LEVEL, levelOfWeek — needed by vocab-trainer)
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
→ data/weeks.js → data/vocab.js → data/verbs.js → data/grammar-drills.js → data/dialogues.js
→ course-consts.js                 (COURSE_VERSION, BAND_WEEKS, WEEK_FOR_LEVEL, levelOfWeek)
→ planner-data.js                  (DAYS, TOTAL_DAYS, getLocalizedDay)
→ stats.js                         (streakInfo, activityCalendar — streak + calendar)
→ vocab-trainer.js → verbs-trainer.js → grammar-drill.js
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

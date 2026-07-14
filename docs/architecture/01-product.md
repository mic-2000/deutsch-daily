# 1. What the product is

> Section §1 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

A small web app that helps one user study German from ~A1 to the **Goethe-Zertifikat B1** exam
over a ~9-month, 36-week plan. The system has three built-in trainers, a user-collections trainer,
and a built-in AI tutor:

1. **Planner** (`/planner`) — one study day = one main task (180 days total).
   Contains a **built-in AI tutor chat** (Gemini). The day card's primary action is always
   "Start lesson with AI"; with no key set it opens the key modal first and auto-starts the lesson
   once a key is saved.
2. **Vocabulary trainer** (`/vocab`) — ~660 words across 36 weekly sets, four exercise modes
   mixed together (the fourth, **plural**, is an opt-in second Leitner track for nouns), Leitner
   spaced repetition, and text-to-speech.
3. **Verb trainer** (`/verbs`) — drills 306 irregular verbs (three Stammformen) in cloze,
   triad-flashcard, table, and **Präsens-conjugation** modes; a **modal-verb filter** isolates the
   six Modalverben; mastery is shared with the vocabulary page.
4. **AI Lehrer chat** — the planner has a built-in Gemini chat per study day. The user clicks
   "Start lesson" and the day plan is sent automatically as the opening message; subsequent
   turns are a live chat with a tutor persona. Conversation history is persisted per-day in
   the `lessons` Supabase table. A weekly-summary feature (PRO model) rolls up all lesson
   transcripts into feedback. (Requires the user to supply their own Gemini API key.)
5. **Collections** (`collections.html`) — user-supplied word sets imported from CSV or pasted from
   Excel/Sheets, drilled with the **same** flashcard/article/spelling trainers and Leitner model.
   Unlimited collections; optional one-click AI translation of missing entries. (See §16.)
6. **Statistics** (`stats.html`, `/stats`) — a read-only progress screen (the landing's "Statistics"
   and "B1 forecast"): course position + streak, word/verb totals, activity, per-week accuracy, the
   weakest cards, and a pace-based projection of the B1-completion date. Premium-gated (see §22).
7. **Settings** (`settings.html`, `/settings`) — authenticated account page: change password
   (re-authenticates with the current password via `sb.auth.signInWithPassword`, then
   `sb.auth.updateUser`), add/remove the Gemini AI key (reuses the planner's `gemini_key` /
   `gemini_key_sync` logic), switch theme + UI language, **reset all learning progress** (words +
   verbs, via `doResetProgress` — clears the `vocab_data`/`verbs_data` mastery maps in the cloud),
   and request **account deletion** with a
   30-day recovery window. Deletion stamps `progress.deletion_requested_at`; a `SECURITY DEFINER`
   `purge_deleted_accounts()` SQL function (scheduled via pg_cron, see `schema.sql`) hard-deletes
   the user's rows + `auth.users` entry after 30 days. The client only sets/clears the flag and can
   cancel it any time in the window; `cloud-sync.initApp` loads the flag into the global
   `accountDeletionAt` and toasts a reminder on every page. Reached via the ⚙ link in the shared
   header (`appHeader`). Owns no `progress` column (omits `CLOUD_FIELD`, like collections).
7. **Today** (`today.html`, `/today`) — a **daily-flow wizard** (the header's primary CTA button —
   "▶ Начать урок" / "Start lesson" — the recommended starting point).
   The user presses one "Learn" button and is walked through the whole study day in order —
   grammar → review → words → verbs → listen → produce → AI tutor → done (blocks vary by tariff/day) —
   with no manual section-switching. It hosts the
   shared trainer engines in `embedded` mode and reuses the planner's day model. (See §19.)

The curriculum runs **36 weeks (180 study days)** in 3 CEFR bands — this is the Course v2 content,
cut over from the old 24-week v1 (see §21). Broad shape:

- **A1 (weeks 1–12):** greetings/family/numbers, the cases (Nominativ→Akkusativ→Dativ), modal verbs,
  separable verbs, Perfekt, time/calendar.
- **A2 (weeks 13–24):** Präteritum, subordinate clauses, comparison, reflexive verbs, adjective
  declension, Wechselpräpositionen, an A2 exam-format review week.
- **B1 (weeks 25–36):** full adjective declension, passive voice, Konjunktiv II, Relativsätze,
  indirect speech, verbs with prepositions, and two B1 exam-prep weeks.

The band boundaries live in one dependency-free module, **`assets/js/course-consts.js`**
(`COURSE_VERSION = 2`, `TOTAL_WEEKS = 36`, `BAND_WEEKS { A1:[1,12], A2:[13,24], B1:[25,36] }`,
`WEEK_FOR_LEVEL { A1:1, A2:13, B1:25 }`, `levelOfWeek(week)`) — the single source of truth for the
course's shape, kept independent from `weeks.js` so the vocab/verbs trainer pages (which don't load
the curriculum) can still map a week to its CEFR band.

`course-consts.js` also owns the **mixed-cache-version guard** (Gate 3). The PWA caches each course
data file independently (stale-while-revalidate), so a half-updated cache could serve `weeks.js` and
`vocab.js` from different `COURSE_VERSION`s — an index-matched drift that renders a broken course.
Each generated, index-matched data file self-registers the version it was built for into
`window.__courseAssets` (emitted by `gen-course.js`'s `assetReg`); `courseVersionConsistent()` compares
those to `COURSE_VERSION`, and every curriculum-coupled page (`/today`, `/planner`, `/vocab`,
`/welcome`) calls `courseVersionBlocked()` at bootstrap — on a mismatch it paints a localized reload
prompt (`version_reload_*`) whose button (`bustCachesAndReload()`) wipes caches + SW registrations and
hard-reloads, instead of rendering the drifted course.

UI languages: **RU / UA / EN**. Learning content is German with a translation in the active UI
language.

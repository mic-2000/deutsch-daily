# 19. `today.html` — the daily-flow wizard (`/today`)

> Section §19 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

A guided "do today's day in one run" experience and the **first nav tab**. Instead of hopping between
sections, the user presses one **Learn** button and is walked through the day in order. "Today" =
the planner's `currentDay` (read from `planner_data`); the day's content comes from the shared day
model (`planner-data.js` — `getLocalizedDay(DAYS[currentDay-1])`). The intro shows a prominent
**"Day N of TOTAL · Week W · theme"** indicator (`today_day_of`) so it's clear which day you're on,
with a compact **streak chip** below it (`streakChip()` → `🔥 N-day streak`, or a no-guilt
`streak_none` prompt; `stats.js` §above); the done screen states **"You completed Day N"**
(`today_done_day`). **Streak stamp (DEV-7):** every embedded session end calls `markActive()`, which
writes today's local date into `planner_data.lastActiveDate` (idempotent — at most one write per day),
so a trainer-only day (a session run without finishing the whole day) still counts toward the streak
even though it writes no `dayStats`. The streak itself is derived, not stored (see `stats.js`); the
`/planner` page renders the same numbers plus a **5-week Monday-first activity calendar**
(`renderStreak()` → `activityCalendar`).

**Steps** — the flow is **descriptor-driven**: `buildSteps(day, onboarding)` returns an ordered list of
step descriptors, each `{ id, required, enabled, run(), isComplete() }`, and `.filter`s out the
disabled ones (`flow.steps`). `id` doubles as the locale-key stem (`today_step_<id>` / `_sub`); `run()`
paints/starts the block; `isComplete()` (backed by `flow.results`) is read at the done step. Block
selection is **tariff-driven** (`tariff(onboarding)` → `5`/`10`/`15`/`'20+'`, default 15): the 5-min
*light track* runs a short grammar step + exactly ONE trainer (vocab on even days, verbs on odd) and no
AI; 10/15-min run grammar + both trainers (session length differs via `sessionCap`); 20+ adds the
inline AI step. A **grammar-review** block slots in right after grammar on 10/15/20+ whenever a
practised topic has come due (`hasDueGrammarReview()`). A **listen** block (after the trainers) appears
when TTS is usable *and* the current week has a dialogue *and* `shouldRunListening(day, onboarding)`
allows it for the tariff (light track skips listening unless `hardest === 'listening'`; 10-min every
other day; 15/20+ always). A **produce** block (after listen, before the AI step) appears on **produce
days** — the productive `write`/`speak` tasks (`isProduceDay(day)`) — at every tariff: micro-output on
the light track, a static self-check on 10/15, and an optional AI-feedback turn on 20+. A **weak-spots**
block (right before done) appears on 10/15/20+ (not the light track) when the learner actually has weak
cards (`hasWeakSpots()`): an optional remedial round over their worst cards across all four families.
`nextStep`/`flowHeader`/the intro checklist all iterate `flow.steps` (the intro builds a preview
list for the current day). Completion model: **AI and the weak-spots round are `required:false`** (never
block the day); a trainer session worked to its end screen (`onSessionEnd`'s `summary.completed`, set
from `s.pos >= s.queue.length` in `closeSession`) — or auto-skipped on an empty queue — marks its block
complete; **closing a trainer early leaves its block incomplete**.

**Return-after-break "easy day" (DEV-12; depends on DEV-7's `lastActiveDate`).** A gap of `BREAK_DAYS`
(4)+ local calendar days since `planner_data.lastActiveDate` is a *break* (`onBreak()` → `daysSinceActive()`
→ `dayKeyDiff` on the `YYYY-MM-DD` keys). On the intro, `showBreakOffer()` then swaps the plain **Start**
for a warm, shame-free re-entry card (`.today-break`, `today_break_*`): **Ease back in** (`startEasyDay`)
or **Do a full day** (`startNormalDay`). Either choice stamps `planner_data.breakPromptedFor` with the
break's anchor (the current `lastActiveDate`) via `ackBreak()`, so the offer shows **once per break** and
re-appears only when a later break re-anchors. The easy day (`startFlow(true)` → `flow.easy`, persisted in
the sessionStorage resume payload) runs `buildSteps(day, onboarding, true)` — the lightest set: a short
grammar card (`required:false`, drill optional) + both trainers in **due-only** mode + done (no
review/listen/produce/AI/weak). Due-only = `VocabTrainer` `{type:'daily', onlyDue:true}` (no new words,
no new plural cards, no empty-queue new-word flood) and `VerbsTrainer` `{type:'due'}` with **no**
new-verb fallback; `sessionCap()` runs at ~half. Empty due queues auto-skip, so a light re-entry with a
cleared backlog still can't deadlock (Gate 5). Completing it counts the day like any other (the done step
stamps `lastActiveDate` + `dayStats` and advances `currentDay`), which **re-anchors the streak** (stats.js
derives current/best with the freeze rule from there); the done screen shows a warm `today_easy_pace` note.
The full-day choice (`startFlow(false)`) is the unchanged normal flow.
1. **grammar** — the day card (week theme · grammar focus · today's task with its `type_<type>` label),
   rendered by the page. A **"Break it down with AI"** button (`explainDay`) expands the AI chat panel
   right under the card and auto-sends a point-by-point breakdown request (`dayBreakdownText` →
   `today_ai_breakdown_req`: rule + examples + tables + a "what to memorize" checklist for EACH item).
   The panel reuses the shared `renderAiPanel()` / `ai` state, so the conversation carries over to the
   AI step. When the day's task carries a keyed **grammar-drill slug** (`localizedToday().drill`,
   resolved via `drillForDay()` against `GRAMMAR_DRILLS`), a **"Practise the drill"** button starts an
   interactive drill via the shared **`GrammarDrill` engine** (`assets/js/grammar-drill.js`,
   `window.GrammarDrill`, `embedded:true`) — a short session of `cloze` / `choice` / `order` items
   whose end advances the flow (`onSessionEnd → nextStep`, like the vocab/verb engines). The drill is
   optional practice: grammar's `isComplete()` stays `true`, so a drill-less day (or a skipped/empty
   drill, which auto-skips) never deadlocks. "Continue →" advances without drilling.
2. **review** — appears on 10/15/20+ (not the light track) when the **grammar-review track** has due
   topics. `startReviewStep` re-drills up to `reviewSlugCap()` whole topics (`{10:2,15:3,'20+':5}`),
   most-overdue-first, via the **same `GrammarDrill` engine** in a **multi-slug** session
   (`startSession({ slugs, review:true })` — one queue across topics, each item tagged with its slug, a
   distinct "Review" badge). Working it to the end grades each topic (see below) and advances the flow;
   an empty due-set auto-skips (never deadlocks). `isComplete()` = nothing still due **or** the session
   was worked to its end — closing it early with topics still due leaves the day incomplete.
3. **vocab** — `VocabTrainer.startSession({ type:'daily', week })` — the day's daily review: the due
   backlog from every week reached so far (mastered-but-due included) + up to 12 new words from the
   current week (articles `der/die/das` ride along as a mode).
4. **verbs** — `VerbsTrainer.startSession({ type:'due' })` (repetition first); falls back to
   `{ type:'filter', filter:'all', week }` (due + some new) when nothing is due. Passing `week` makes
   the engine **band-gate new verbs**: only verbs whose `band` is at or below the current week's CEFR
   band (`levelOfWeek`) are introduced as new; already-seen due verbs stay reviewable regardless of
   band. The standalone `/verbs` page passes no `week`, so it stays unrestricted.
5. **listen** — a short listening-comprehension block on the current **week's dialogue**
   (`dialogueForDay()` → the keyed `DIALOGUES` entry whose `week` matches; `data/dialogues.js`, cut from
   v2). Rendered **inline** by the page (not a shared engine — listening is `/today`-only): the localized
   dialogue title (`dialogueLocale(slug).title`), a ▶/🐢-slow **Play** pair that reads the German lines
   in sequence via `speakLines()` (§4 `speech.js`), a collapsible transcript, and the dialogue's German
   **true/false** comprehension checks. `listenCheck` grades them (score + per-item marking), `finishListen`
   files `flow.results.listen` and advances. Gated on `ttsAvailable()`: no TTS or no dialogue → the block
   never appears (and `isComplete()` short-circuits) so it can't deadlock the day (Gate 5). Lines and
   checks are German-only (understanding the German *is* the task); only the title is localized.
6. **produce** — a short **productive** task on a `write`/`speak` day (`isProduceDay(day)`; `dayType` is
   the day's stable task type), rendered **inline** by the page. Shows the day's localized prompt
   (`localizedToday().text` + its `type_<type>` label), an optional draft box, and a short **self-check**
   the learner ticks (`produceChecks()` — one micro-check on the light track, three on 10/15/20+).
   Completion is that **self-check** signal — never gated on writing/speech quality (Plan §10):
   `finishProduce` files `flow.results.produce` and advances once the learner has ticked their
   self-assessment (the draft box is optional scaffolding, kept in `produce.text` via `produceType`).
   **20+ with a key** adds an optional **"Get feedback"** turn (`produceFeedback` → a one-shot
   `geminiRequest` off the draft, shown inline via `renderMd`) that is **not persisted** — the planner
   owns the day's `lessons` row — and never blocks. Needs neither TTS nor a key (the static self-check
   always works), so it can't deadlock the day (Gate 5).
7. **ai** — an in-flow chat (reuses `gemini.js` / `ai-config.js` / `markdown.js` / `chat.css`),
   **persisted** to the same `lessons` row the planner uses (one per user×day). On entry it
   **auto-generates a "day summary"** (`maybeSummarize` → `askSummary`): a short recap pinned on top —
   grammar takeaways + the word/verb session results (`flow.vocabResult` / `flow.verbResult`, captured
   from each engine's `onSessionEnd(summary)`), via `today_summary_req` + `today_summary_data`. It's
   generated once and persisted, so revisiting the day (or no key) doesn't regenerate. Below the
   pinned blocks, the same `ai` thread (`renderAiPanel()`) lets the student ask follow-ups. If no key,
   it nudges to `/settings` and offers **Skip**.
8. **weak** — an **optional remedial round** over the learner's worst cards across the four card
   families (Plan §11 Phase 6, item 14). Enabled on 10/15/20+ only, when `hasWeakSpots()`. It runs each
   family that has weak cards as its own sub-session **in turn** (vocab → verbs → grammar), reusing the
   very engines the main steps use: `VocabTrainer`/`VerbsTrainer` gain a `{ type:'weak', cap }` scope
   (worst word+plural / verb cards, `weakCount()` for availability), and `GrammarDrill.weakReviewSlugs`
   picks the weakest review topics. While `weak.active`, each engine's `onSessionEnd` routes to
   `weakStageDone` (which chains families) instead of the normal per-step handler, so a weak sub-session
   never clobbers a main step's result; a grammar sub-session still regrades its topics. "Weak spot" is
   the shared model in `leitner.js` — `leitnerIsWeak` (seen + missed + not mastered) / `leitnerWeakness`
   (worst first: miss count, then miss ratio, then distance from mastery); verb-WORDS are excluded from
   the vocab family (the verb store owns them, so a verb-word is never double-drilled). Selection is
   **re-scanned at run time**, so a family shored up earlier today drops out; an empty round auto-skips.
   `required:false`, so it never gates the day and can be bailed out of (× → the round ends without
   starting the next family). Caps scale by tariff (`weakCap` `{10:8,15:12,'20+':16}`; `weakGrammarCap`
   `{10:1,15:2,'20+':3}`).
9. **done** — gated on `dayComplete()` (every enabled `required` descriptor `isComplete()`): when the day
   is complete it marks `planner_data.completed[day] = true`, records `dayStats[day]`
   (`{ completedAt, blocks:[{id,required,completed}], counts:{vocab,verbs,listen} }` — written once, on the
   completing pass only), stamps `planner_data.lastActiveDate` (the streak stamp, DEV-7), advances
   `currentDay` (when finishing the current day), persists via
   `saveToCloud`, and shows the completion screen ("You completed Day N") with a prominent **streak**
   block (`streakDoneBlock()` → `🔥 N-day streak` + best + a `❄️` note when a freeze is bridging a recent
   gap; `stats.js`, §above), the current week's
   read-only **can-do list** (`weekCanDo()` → the active locale's `weeks[week].canDo`, EN fallback) and a
   small no-AI **day stats** block (words / verbs first-try score from `flow.vocabResult`/`flow.verbResult`)
   → "Open the planner". When a trainer's **due backlog** overflowed the tariff's `sessionCap()` (recorded
   at step start via `noteBacklog(id, due)` from `VocabTrainer.dueCount(week)` / `VerbsTrainer.dueCount()`
   into `flow.backlog`), the done screen also shows a small `.done-backlog` "N cards waiting" note
   (`today_backlog`) — the due cards that carry over to the next sessions (Plan §4). A **course-readiness**
   meter (`.done-readiness`, `today_readiness_*`) surfaces **only on partial coverage** — the share of the
   day's core SRS families (grammar · vocab · verbs) actually worked, via `currentReadiness()` →
   `dayReadiness(blocks)` (shared, in `planner-data.js`; §below). The 5-min light track runs one of the two
   trainers, so it reads **2/3** even though the day completes — coverage is reported **distinct from the
   streak/day-completion mark** (Plan §4, redesign-v2 §17 item 5); a full day is 3/3 and the meter is hidden.
   If a required trainer was closed early the day is **not** checked off: it shows an
   "almost there" partial screen (`today_done_partial_*`) that doesn't advance `currentDay`, with **Run the
   day again**.

**Grammar-review track (Leitner by drill slug).** A grammar topic enters
`planner_data.grammarReview` (`{ slug: {box,due,right,wrong,seen} }`) the first time its drill is worked
— in the grammar step OR the review step. `recordGrammarReview(perSlug)` grades **one soft-demotion
Leitner card per fully-worked slug** — topic-level, not per example: a topic passes at **≥60% first-try**
(`GrammarDrill.reviewPassed`), fed into `leitnerApply(card, passed, {wrongPolicy:'soft'})` (reusing
`leitner.js`, §8). A pass schedules the card forward (boxes 1→5, doubling intervals), so it comes back
due on a later day — which is exactly what the review step consumes
(`GrammarDrill.dueReviewSlugs(map, now, cap)`: due + still-existing slugs, most-overdue-first, capped to
whole topics). The engine owns no state here — it only reports per-topic tallies
(`closeSession`'s summary → `perSlug` of `{slug,right,total,answered}`) and computes due slugs; the map
lives in `planner_data`. It's persisted immediately via `saveToCloud` (idempotent `planner_data`
upsert) so review progress survives even if the day isn't finished, and rides along with the rest of
the planner payload (`getCloudPayload` returns `planner` whole; seeded `{}` by the v2 migration).

**Pinned blocks + follow-up chat (shared with the planner).** A lesson's `messages` carry optional
flags: `seed:true` (the hidden prompt that elicits a pinned reply — the breakdown request / day-plan /
summary request), `pinned:true` (render on top, highlighted), and `kind` (`'explanation'` → label
`ai_pinned_label` "Topic breakdown"; `'summary'` → label `today_summary_label` "Day summary"). Both
`renderAiPanel()` (today) and the planner's `renderAiSection` render each `pinned` message as its own
collapsible `.ai-rule-wrap` (`<details>`, labelled by `kind`) inside an `.ai-pinned-group`, hide
`seed`, then an `.ai-sep` divider (`ai_chat_sep`) separates them from the follow-up chat. On the
**AI step** the breakdown is collapsed by default and the summary stays open (the summary is what
matters there); on the grammar step and in the planner the blocks default open. Because both write the **same**
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
- `planner_data` — this page's `CLOUD_FIELD`; read for `currentDay`, written on finish (and mid-flow
  when a grammar-review card is graded).
- `verbs_data` — loaded via `applyVerbProgress` during `initApp`. The wizard wires **one shared
  mastery map** into both engines (`wireSharedVerbStore()` → `VerbsTrainer.setMasteryStore(map)` +
  `VocabTrainer.setVerbStore({ mastery: map })`), so a verb answered in either step counts once.
  Both engines' save hooks persist `VerbsTrainer.serialize()` via `saveVerbsToCloud`.
- `vocab_data` — `initApp` does not load it (it isn't the `CLOUD_FIELD`), so the page fetches it once
  after `initApp` (`loadVocabData` → `VocabTrainer.applyData`); the vocab engine saves it via
  `saveVocabToCloud`.
- `lessons` (table) — the AI step's per-day history, shared with the planner (see the pinned-explanation
  note above): `loadDayLesson` reads it, `saveLessonToCloud` writes it.

**Resume on refresh.** The flow position is mirrored to `sessionStorage['today_flow']` (`{step, day}`)
on each `renderStep` and cleared on exit (`×`). After `initApp`, `afterInit` reads it and `resumeFlow`
re-enters that step (transient per-tab nav state — survives reload, clears on tab close; NOT a
progress store). vocab/verb steps restart their session for that step (individual cards can't be
restored); grammar/ai/done re-render with the day's saved lesson reloaded.

**Edge cases:** `currentDay > TOTAL_DAYS` → a "course complete" screen; a day already completed shows
a review banner on the intro but still lets the user run it again.

**Styling** — `today.css` for the wizard chrome (intro checklist, step header with progress, grammar
card, AI wrapper, done screen); the in-flow sessions reuse `vocab.css` / `verbs.css`. No new tokens
(§11). Guarded by `tests/today-flow.test.js` + a `render-smoke` entry.

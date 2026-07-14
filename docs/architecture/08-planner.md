# 8. `planner.html`

> Section §8 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

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
- `getCloudPayload()` returns the whole `state` object and `applyCloudData` merges the loaded row
  into it (`Object.assign`), so **unknown `planner_data` keys are preserved** — keys written by
  `/today` (`dayStats`, `grammarReview`) or a future course version pass through untouched instead
  of being dropped when the planner re-saves. This page normalizes only `currentDay`/`viewingDay`/
  `completed`; it owns nothing else in the column.

### Day-plan text (AI seed)
`buildPlanText(d)` assembles the localized day plan (header with day/week, week theme, grammar
focus, today's task with its type label, the daily vocab habit, and a closing instruction).
All fragments come from `T('planner_clip_*', ...)`. It is used only as the **first user message**
sent to Gemini when `startAILesson(day)` is called — there is no clipboard-copy feature anymore.

### AI Lehrer chat

**State:**
```js
let lessonsCache = {};  // { day: [{role, text}, …] }  — live in-memory copy of lessons table
let summaryCache = {};  // { week: [{role, text}, …] } — weekly summaries (day = -week in DB)
let chatState = { loading: false, showKeyModal: false, summaryWeek: null, pendingLessonDay: null };
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

**UI functions:** `renderAiSection(d)` renders the full chat view (pinned explanation + messages +
input row) once the day has lesson messages; it returns nothing when there's no key or an empty
cache (the day card's "Start lesson with AI" button drives the first turn — for a keyless user it
opens `renderKeyModal()`, whose `onKeySaved` auto-starts the pending lesson via
`chatState.pendingLessonDay`). `renderKeyModal()` and `renderSummaryModal()` append overlays inside
the `#app` markup.

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

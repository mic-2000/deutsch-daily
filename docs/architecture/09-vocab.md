# 9. `vocab.html`

> Section §9 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

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
  das=green) → feedback + "Next". Audio appears only **after** answering (so it doesn't hint). On a
  MISS a one-line gender rule (`HINTS.articleHint`, DEV-15) appears under the feedback when a
  teachable suffix applies (§7 `data/hints.js`).
- **spelling** — translation shown → type the German → check. Comparison via `normalize()`
  from `utils.js`. A missing article is accepted correct with a note. On error, `diffChars` LCS
  highlights wrong chars (`diff-bad`) and missing chars (`diff-miss`), case-insensitively.

The **plural** modes (choose / type) likewise show a plural-formation rule (`HINTS.pluralHint`) under
the feedback on a miss.

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
forms live in the German-only **`PLURALS`** map (`data/vocab.js`, generated from
`authoring/plurals.js` — §21), keyed by the exact singular string; a noun only gets a plural card
when it has an entry. When on, due/new plural cards are mixed
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
| `'daily'` | **`/today`'s guided daily review.** Every due card from weeks `1..scope.week` — **including mastered-but-due** (so long-interval words resurface, unlike `'review-all'`) — plus up to 12 new words from the current week only; `scope.week` is clamped to the real week range, and it falls back to the current week's cards if empty |
| `'weak'` | **`/today`'s weak-spots round.** The worst word + plural cards across ALL weeks (seen + missed + not mastered), worst-first (`leitnerWeakness`), regardless of due date; verb-WORDS excluded (owned by the verb store). Capped by `scope.cap` (default 20). `collectWeakCards()`/`weakCount()`. §19 |

Queue is shuffled and capped at **25 cards**. `answer(correct)` → `updateCard` (or `updatePlural`
for plural cards). A wrong card is re-queued **once** at the end as an easier reveal card of the
same track. The re-queued clone (`requeued: true`) is **not graded again** — grading happens only
on the card's first appearance, so a wrong-then-right card is not double-counted. Flashcards advance
immediately; article/spelling/plural-choose/plural-input wait for "Next". `uniqueRight /
uniqueTotal` → first-try score on end screen.

**Per-day new-card budget.** Both engines keep a local-date-keyed ledger `state.newLog`
(`{ 'YYYY-MM-DD': count }`, via `leitnerToday()` in `leitner.js`) of how many **brand-new** cards
were introduced today — bumped once per new card on its **first grading** (not on re-queue, not for
already-seen cards). A scope opts into a per-day cap with `scope.dailyNew` (`true` → the engine
default — 12 words / 15 verbs — or a number to override); the session's new slice is then
`min(per-session slice, cap − introducedToday)`. `/today` passes `dailyNew: true` so extra same-day
sessions stop introducing fresh cards (and a capped-out day with nothing due yields no session, so
`/today` auto-skips that block); the free-explore `/vocab` & `/verbs` pages omit it and stay
uncapped, mirroring how band-gating is off there. The ledger is carried in `vocab_data`/`verbs_data`
(serialize/applyData) and pruned to today's entry. See `scripts/srs-budget.js` for the load model
that motivates conservative new-card rates (Plan §5, §11 Phase 2).

### Progress portability
- **Cloud** (Supabase) is the live store.

### Reset
`resetWord(week, idx)` (single word) goes through `state.confirm` (in-page modal via
`stageConfirm` / `clearConfirm` from `utils.js`), never the native `confirm()`. The engine still
exposes `resetAll()`, but the **global "reset all progress"** action now lives on the **Settings**
page (`doResetProgress`), which clears the `vocab_data`/`verbs_data` mastery maps in the cloud
directly; the trainer footers no longer carry a reset button.

### Render & keyboard
- `render()` → `renderSession()` if active, else home screen (stats, due banner, week tabs, word
  list). Confirm modal appended at end. Sub-renderers: `renderFlashcard` / `renderArticle` /
  `renderSpelling` / `renderEnd`.
- Keyboard: flashcard `Space`/`1`/`2`/`←`/`→`; article `1`/`2`/`3`, `Enter`=next; spelling
  typing + `Enter`; `Esc` exits the session.

# 10. `verbs.html`

> Section §10 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

> **The engine lives in `assets/js/verbs-trainer.js` (`window.VerbsTrainer`), not in the page.**
> `verbs.html` is a thin host (cloud-sync contract + keyboard + `VerbsTrainer.init({ embedded:false })`);
> the same engine powers the `/today` wizard (§19). Handler names below are methods on the namespace
> (`VerbsTrainer.answer(…)`). The state/behaviour described here is unchanged. (See §4.)

### State & persistence
```js
let state = {
  mastery: {},    // { verbKey: {box,due,right,wrong,seen} } — shared with vocab via verbs_data
  modes: { triad:true, conjug:true, cloze:true, table:true },
  filter: 'all',  // 'all' | 'modal' | 'sein' | 'sep' | 'refl'
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

### Four card modes
Mode availability: reflexive verbs (`refl: true`) support only **triad**; the **conjug** (Präsens
conjugation) mode is offered for plain verbs only (not separable / reflexive / multi-word keys); all
other non-reflexive verbs support every mode. Pedagogical selection walks the box: box 0 → triad,
then conjug → cloze → table as the card climbs the Leitner boxes. The **conjug** mode asks one
random person (ich/du/er/wir/ihr/sie) and reveals the full six-person paradigm on answer;
`conjugatePresent(key)` generates it from the infinitive + `praes` (verified in `tests/verb-present.test.js`).
On a MISS in the conjug mode, a one-line stem-vowel-change rule (`HINTS.verbStemHint`, DEV-15) appears
under the feedback when the verb has one (a→ä / e→i / e→ie / au→äu / o→ö; §7 `data/hints.js`).

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
| `'weak'` | **`/today`'s weak-spots round.** The worst verbs (seen + missed + not mastered), worst-first (`leitnerWeakness`), regardless of due date; capped by `scope.cap` (default 20). `collectWeakKeys()`/`weakCount()`. §19 |

Non-`selected` sessions are shuffled and capped at **20 cards**; `selected` at **40**.

Wrong answer → re-queued once as easy `triad` (`requeued: true`); the re-queued clone is **not
graded again** (grading is first-appearance only). `uniqueRight / uniqueTotal` drive the end-screen
score.

### Render & keyboard
- `render()` → `renderSession()` if active, else home (filter chips, selection bar, verb list with
  box bars + audio). Sub-renderers: `renderTriad` / `renderCloze` / `renderTable` / `renderEnd`.
- Keyboard: triad `Space` reveal / `1`/`2` grade; cloze + table `Enter` submit / next; `Esc` exits.
- Confirm modal via `state.confirm` (per-item reset); the global "reset all progress" lives on Settings.

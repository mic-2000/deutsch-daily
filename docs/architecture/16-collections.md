# 16. `collections.html` (user-supplied word sets)

> Section §16 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

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

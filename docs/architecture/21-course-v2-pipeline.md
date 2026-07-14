# 21. Course v2 authoring pipeline (`authoring/` → generated `data/v2` + `locales/v2`)

> Section §21 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The redesigned 36-week / 180-day course (`COURSE_VERSION 2`, see
`private/curriculum-redesign-2026-07-v2.md`) is authored from a **single trilingual source** and
compiled, not hand-maintained across parallel files. **This is now the LIVE course:** the cutover
(§7 of the redesign plan / step 7) swapped the generated artifacts into the runtime files —
`course-consts.js` is on `COURSE_VERSION 2` (§3), `data/weeks.js` + `data/vocab.js` carry the 36-week
content, and `locales/{en,ru,ua}.js` carry the merged vocab + weeks. `authoring/` + `data/v2` +
`locales/v2` remain the generated **source of record**; `scripts/cutover-v2.js` re-swaps them into
the live files after a regeneration (`npm run cutover:v2`).

**Why a generator.** The runtime contract is index-matched parallel arrays (`VOCAB[w].words[i]` ↔
`locale.vocab[w][i]`, week tasks ↔ locale tasks) — the exact thing `tests/data-align.test.js`
guards. Authoring each word/task/drill/dialogue **once** as a `{de,en,ru,ua}` object and generating
the parallel arrays makes alignment structural instead of hand-tended.

- **`authoring/`** — the source of truth. `README.md` documents the week-file schema; `course.js`
  holds course meta (version, `BAND_WEEKS {A1:[1,12],A2:[13,24],B1:[25,36]}`, phases); `weeks/w01..w36.js`
  are one CommonJS module per week (theme/grammar/vocab/verbFocus/5 tasks/5 canDo/keyed drills/one
  dialogue, every string co-locating all four languages); `verb-bands.js` is the hand CEFR map;
  `plurals.js` is the German-only `PLURALS` map + `NO_PLURAL` list (see §9).
- **`scripts/gen-course.js`** (`npm run gen:course`, `gen:check`) — validates the authoring
  invariants and emits `data/v2/{weeks,vocab,grammar-drills,dialogues,manifest}.js` (German + base
  English) and `locales/v2/{en,ru,ua}.js` (index-matched overlays + keyed `drills`/`dialogues`).
  `data/v2/vocab.js` carries both `VOCAB` and the `PLURALS` map (built from `authoring/plurals.js`,
  with a coverage gate: every noun-shaped vocab word must be in `PLURALS` or `NO_PLURAL`). It
  reports any `verbFocus` key missing from `VERBS`. Generated files carry a DO-NOT-EDIT banner.
- **`scripts/cutover-v2.js`** (`npm run cutover:v2`) — the Course v2 **cutover** (idempotent): copies
  `data/v2/weeks.js` → `data/weeks.js`, `data/v2/vocab.js` → `data/vocab.js` (`VOCAB` + `PLURALS`
  verbatim), `data/v2/grammar-drills.js` → `data/grammar-drills.js` (`GRAMMAR_DRILLS`, keyed by slug —
  consumed by the `/today` grammar step via the `GrammarDrill` engine, §19), `data/v2/dialogues.js` →
  `data/dialogues.js` (`DIALOGUES`, keyed by slug — consumed by the `/today` listen step, §19), and
  merges `locales/v2/<l>.js`'s `vocab` + `weeks` + keyed `drills` + keyed `dialogues` into the live
  `locales/<l>.js` (keeping `ui` + `verbs`; `ensureKey` appends an empty `drills`/`dialogues` slot if
  the live file predates it).
- **`scripts/band-verbs.js`** — writes the `band` field into every `data/verbs.js` entry (§7).
- **`scripts/srs-budget.js`** (`node scripts/srs-budget.js`, `--json`) — dependency-free SRS
  due-pressure estimator: counts the four card families from the live data (words + verbs + plurals +
  grammar), applies the §5 model (units × Leitner-box reviews × lapse), and reports per tariff
  (5/10/15/20+) whether the daily answer budget carries a learner through the 180-day course. Guarded
  by `tests/srs-budget.test.js` (the 15-minute default path must stay viable; 5-min is a light track).
- **`tests/course-v2-align.test.js`** — Gate 4: 36 weeks / 180 days / 5 tasks, drill + verbFocus
  resolution, band validity, "review points back", "verbFocus never above band", and full
  vocab/task/canDo/drill/dialogue locale alignment on the generated output.
- **`tests/course-v2-cutover.test.js`** — Gate 6: the live runtime state after the cutover —
  `course-consts` on v2, the shipped `data/weeks.js` flattening to 36 weeks / 180 days via
  `planner-data.js` (object tasks + legacy tuple tolerance), and `cloud-sync`'s pre-v2 → clean-v2
  `planner_data` migration.

Editing rule: change `authoring/`, then `npm run gen:course` (and `band-verbs.js` if verbs changed),
then `npm run cutover:v2` to refresh the live course; never hand-edit `data/v2/*` or `locales/v2/*`
(nor the generated blocks in the live `data/weeks.js` / `data/vocab.js` / `locales/*` — regenerate).

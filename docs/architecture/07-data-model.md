# 7. Data model — curriculum & vocabulary

> Section §7 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

### `data/weeks.js` — global `WEEKS` (planner)

```js
const WEEKS = [
  { n:1, phase:"A1.1", level:"A1", theme:"…", grammar:"…", vocab:"…", verbFocus:[…],
    tasks:[ { type:"grammar", text:"…", grammarFocus:"…", drill:"…" }, … ] },
  // … 36 weeks (Course v2, generated from authoring/ — see §21)
];
```
- `tasks` is an array of Course-v2 **task objects** `{ type, text, grammarFocus?, drill?, checklist? }`
  (legacy v1 `[type, text]` tuples are still tolerated by `taskFields()`). The base text is **English**
  (the `T()` default); localized text comes from `LOCALE_*.weeks[n].tasks[i]`.
- `type` ∈ `test | grammar | listen | write | speak | read | review`. Mapped to a label via the
  `type_<type>` UI key.
- Vocabulary is a **daily habit**, described by the week's `vocab` string — it is *not* its own day.

**Flattening to days** (in `planner-data.js`): every task across all weeks becomes one day.

```js
const DAYS = [];
WEEKS.forEach(w => w.tasks.forEach((task, taskIdx) => {
  const { type, text } = taskFields(task);   // normalizes v2 object OR v1 [type,text] tuple
  DAYS.push({ day: DAYS.length+1, week:w.n, weekTheme:w.theme, grammar:w.grammar,
              vocab:w.vocab, type, text, taskIdx });
}));
const TOTAL_DAYS = DAYS.length;   // 180 days (36 weeks × 5 tasks — Course v2)
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
  uses only the part before `—` (see `speakWord`). Any vocab word that is a known `VERBS` key is
  rendered with all three principal parts via `verbForms` (see §9), in every week.
- `PLURALS` (same file) — a German-only `{ "der Vater": "die Väter" }`-style map (keyed by the
  exact singular string, incl. its article) feeding the opt-in **plural** trainer mode. Not
  index-aligned to locales; nouns without an entry simply get no plural card. **Generated** from
  `authoring/plurals.js` (a `PLURALS` map + a `NO_PLURAL` list of nouns that intentionally get no
  card); `gen-course.js` enforces that every noun-shaped vocab word is classified in one of them.
  (See §9, §21.)

### `data/verbs.js` — global `VERBS` (master verb dictionary)

```js
const VERBS = {
  "gehen":     { band:"A1", praet:"ging",   pp:"gegangen",  aux:"sein" },
  "essen":     { band:"A1", praet:"aß",     pp:"gegessen",  aux:"haben", praes:"isst" },
  "abfahren":  { band:"A1", praet:"fuhr ab",pp:"abgefahren",aux:"sein",  praes:"fährt ab", sep:true },
  "sich ansehen": { band:"A2", praet:"sah sich an", pp:"sich angesehen", aux:"haben", praes:"sieht an", sep:true, refl:true },
  // … ≈343 verbs
};
```
- A language-neutral **forms** dictionary (≈343 A1–B1 verbs). Key = Infinitiv; reflexive verbs are
  keyed `"sich <inf>"`. `band` = CEFR level at which the verb may be introduced as *new* (A1|A2|B1;
  already-seen due cards stay reviewable above band). `praet` = Präteritum, `pp` = Partizip II (no
  auxiliary), `aux` = perfect auxiliary (`haben`|`sein`); optional `praes` (irregular present),
  `sep` (separable), `refl`.
- **`band` is generated, not hand-typed.** `scripts/band-verbs.js` writes it into every entry (line
  by line, idempotent): the minimum of the CEFR level of the earliest Course-v2 week whose
  `verbFocus` introduces the verb and a hand map (`authoring/verb-bands.js`). Re-run it after adding
  a verb. (See §21.)
- **Translations are NOT here** — they live in `locales/*.verbs[key]` (§6), fully populated in all
  three languages (306 each: RU/UA/EN).
- **Source of truth.** Previously generated from a CSV; the CSV and its generator were removed, so
  `data/verbs.js` (forms) + `locales/*.verbs` (glosses) are now hand-maintained.
- `verbs.html` drills verbs from `VERBS` in four modes (triad-flashcard, cloze, table, and Präsens
  conjugation). Mastery is stored in `verbs_data` (shared column, keyed by verb key). The vocab
  trainer also writes verb mastery into `verbs_data` for words that resolve to a verb key via
  `verbKeyForWord`.

### `data/hints.js` — global `HINTS` (error-explanation rules, DEV-15)

A pure, language-agnostic rule engine consumed by the trainers to explain a **missed** answer. No
prose lives here (that's `hint_*` in the locales, §6) — only rule matching and German example words.

```js
window.HINTS = {
  articleHint(core, gender)          → { key:'hint_article', args:[suffix, article], examples } | null
  pluralHint(sgWithArt, plWithArt)   → { key:'hint_plural',  args:[classId],         examples } | null
  verbStemHint(infinitive, praes)    → { key:'hint_verb',    args:[vowelChange],     examples } | null
};
```
- **Article** — noun gender by suffix (`-ung/-heit/-keit/-schaft/-ion/-tät/-ik/-ei/-ie/-ur → die`,
  `-chen/-lein/-ment/-um → das`, `-ling/-ismus/-or → der`). **Gender-gated:** a rule fires only when
  its gender equals the word's *actual* article, so a suffix with exceptions (e.g. `das Labor` vs
  `-or → der`) never mis-teaches — a mismatch just skips.
- **Plural** — formation class from the singular vs plural forms: ending (`-e`/`-er`/`-(e)n`/`-nen`/
  `-s`/none) × umlaut. Unclassifiable (Latin/irregular, e.g. `Firma → Firmen`) → `null`.
- **Verb** — present-tense stem-vowel change (`a→ä`, `e→i`, `e→ie`, `au→äu`, `o→ö`) from the
  infinitive vs the stored `praes` (drives the conjug mode). Regular verbs → `null`. (Präteritum/PP
  ablaut is intentionally *not* classified — too noisy to guarantee a correct rule.)
- Loaded on the four trainer hosts (`vocab` / `verbs` / `today` / `welcome`), guarded in the engines
  (`typeof HINTS !== 'undefined'`), and cached in the PWA shell (`SHELL_ASSETS`). Guarded by
  `tests/hints.test.js` (rule matching + "hint on a miss, only then" wiring).

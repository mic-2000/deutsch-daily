# Course v2 authoring source

This directory is the **single source of truth** for the 36-week / 180-day Course v2
(`COURSE_VERSION = 2`, see `private/curriculum-redesign-2026-07-v2.md`). Nothing here is loaded by
the app at runtime. Instead, `scripts/gen-course.js` reads these files and **generates** the
runtime data + locale files:

```
authoring/weeks/w01.js … w36.js   ──gen-course.js──▶   data/v2/weeks.js
authoring/course.js                                     data/v2/vocab.js
                                                        data/v2/grammar-drills.js
                                                        data/v2/dialogues.js
                                                        locales/v2/{en,ru,ua}.js
```

Run `npm run gen:course` after editing any authoring file. The generated files are committed
(they are the artifacts the Course v2 cutover — step 7 — swaps into `data/` and merges into
`locales/`), but they must never be hand-edited: edit the authoring source and regenerate.

## Why a single source

The app's runtime contract is **index-matched parallel arrays** (`VOCAB[w].words[i]` ↔
`locale.vocab[w][i]`, `WEEKS[n].tasks[i]` ↔ `locale.weeks[n].tasks[i]`). Hand-maintaining four
files in lockstep is the exact failure mode `tests/data-align.test.js` guards against. Here each
word/task/drill/dialogue is authored **once**, co-locating German + all three glosses in one
object, so the generator emits perfectly aligned arrays *by construction*. The alignment tests
(`tests/course-v2-align.test.js`) then verify the generated output as a backstop.

## The `T4` shape

Every user-facing string is a **four-language object** — German is the content being learned;
`en` is the default/fallback; `ru`/`ua` are the other UI languages:

```js
{ de: 'der Apfel', en: 'apple', ru: 'яблоко', ua: 'яблуко' }
```

For strings that are *not* German content (task instructions, week themes, can-do statements,
drill prompts) the `de` key is omitted — only `{ en, ru, ua }` (a `T3`).

## Week file schema — `authoring/weeks/wNN.js`

Each week is a CommonJS module exporting one object. `n` must equal the file number.

```js
module.exports = {
  n: 3,                       // 1..36, must match filename
  phase: 'A1.1',              // A1.1 A1.2 A2.1 A2.2 B1.1 B1.2 Pruefung
  level: 'A1',                // A1 | A2 | B1  (CEFR band of the week)

  theme:      { en, ru, ua }, // T3 — short week title (§6 "Focus"/"Тема")
  grammar:    { en, ru, ua }, // T3 — the week's grammar summary line
  vocabTheme: { en, ru, ua }, // T3 — the short "vocab:" hint shown on planner cards

  // Vocabulary set for the week. Each entry authored once as a T4.
  // Generator → VOCAB[n].words = [de,…]; locale.vocab[n] = [<lang>,…] (index-matched).
  vocab: [
    { de: 'das Brot', en: 'bread', ru: 'хлеб', ua: 'хліб' },
    …
  ],

  // Infinitive keys into data/verbs.js (VERBS). Every key MUST resolve (Gate 4), OR be listed
  // in receptiveVerbs below (a verb shown for recognition only, not required in the trainer).
  verbFocus: ['kaufen', 'bezahlen', 'kosten'],
  receptiveVerbs: [],         // optional — keys allowed to be absent from VERBS

  // Exactly 5 day-tasks (one task = one study day). Order = day order within the week.
  tasks: [
    {
      type: 'grammar',                 // grammar|review|listen|write|speak|test|read (v1's 7 types)
      text: { en, ru, ua },            // T3 — the day's instruction line
      grammarFocus: 'akk-artikel',     // optional — human label of the concept
      drill: 'akk-artikel',            // optional — slug defined in ANY week's `drills` (review
                                       //   days point back at an earlier week's slug; resolved
                                       //   course-globally, not just within this week)
      checklist: [ { en, ru, ua } ],   // optional — production/self-check bullets (T3[])
      milestone: false                 // optional — true on phase self-test days
    },
    …                                  // 5 total
  ],

  // One can-do statement per day (index-matched to tasks). Generator → locale.weeks[n].canDo[5].
  canDo: [ { en, ru, ua }, { en, ru, ua }, { en, ru, ua }, { en, ru, ua }, { en, ru, ua } ],

  // Grammar-drill definitions used by this week's tasks, keyed by slug.
  // Generator → data/v2/grammar-drills.js (German+answers) + locale.drills[slug] (concept+prompt).
  drills: {
    'akk-artikel': {
      level: 'A1',
      concept: { en, ru, ua },         // what the drill teaches
      prompt:  { en, ru, ua },         // instruction shown above the items
      items: [
        // type 'cloze':  fill the ___ in `de`
        { type: 'cloze',  de: 'Ich kaufe ___ Apfel.', answer: 'einen' },
        // type 'choice': pick the right option
        { type: 'choice', de: 'Ich sehe ___ Mann.', answer: 'den', options: ['der','den','dem'] },
        // type 'order':  assemble the words into `answer` order
        { type: 'order',  answer: ['Er','kauft','einen','Käse'] }
      ]
    }
  },

  // Optional single dialogue for the week's listen block, keyed by slug.
  // Generator → data/v2/dialogues.js (German lines + meta) + locale.dialogues[slug] (title+questions).
  dialogue: {
    slug: 'w03-einkaufen',
    level: 'A1',
    vocabularyMaxWeek: 3,              // no word from a later week appears in the lines
    title: { en, ru, ua },
    lines: [ { speaker: 'A', de: 'Was möchten Sie?' }, { speaker: 'B', de: 'Einen Kaffee, bitte.' } ],
    questions: [                       // richtig/falsch comprehension checks
      { de: 'Der Kunde kauft einen Tee.', answer: false, text: { en, ru, ua } }
    ]
  }
};
```

Optional fields (`drill`, `checklist`, `milestone`, `dialogue`, `receptiveVerbs`) may be omitted.
`review`/`test`/`milestone` days introduce **0 new grammar** — they carry a `drill` only if it
re-tests an earlier concept.

## Invariants the generator + tests enforce (Gate 4)

- 36 weeks, filenames `w01`..`w36`, each `n` matching; 5 tasks each; 180 days total.
- Every `task.drill` resolves to a drill defined in some week; every drill slug is unique course-wide.
- Every `verbFocus` key exists in `VERBS` unless listed in `receptiveVerbs`; every verb has a `band`.
- `canDo` has exactly 5 non-empty entries per week, in all three locales.
- Every vocab entry and every T3 has non-empty `en`/`ru`/`ua`; vocab `de` is non-empty & unique-per-week.
- Every drill slug and dialogue slug has a locale entry in `en`, `ru`, `ua`.

/* Week 15 — Character; comparative and superlative (A2, phase A2.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 71–75.
   Vocab reuse: old v1 week 11 (Charakter, Komparativ) + NEW base adjectives. */
module.exports = {
  n: 15,
  phase: "A2.1",
  level: "A2",
  theme:      { en: "Character; comparative and superlative", ru: "Характер; Komparativ и Superlativ", ua: "Характер; Komparativ і Superlativ" },
  grammar:    { en: "Komparativ and Superlativ (+Umlaut, irregulars); so … wie vs -er als", ru: "Komparativ и Superlativ (+Umlaut, исключения); so … wie vs -er als", ua: "Komparativ і Superlativ (+Umlaut, винятки); so … wie vs -er als" },
  vocabTheme: { en: "character traits, adjectives", ru: "черты характера, прилагательные", ua: "риси характеру, прикметники" },

  vocab: [
    // --- reused from v1 week 11 (index-matched glosses) ---
    { de: "der Charakter", en: "character",   ru: "характер",     ua: "характер" },
    { de: "nett",          en: "nice",        ru: "милый",        ua: "милий" },
    { de: "freundlich",    en: "friendly",    ru: "дружелюбный",  ua: "дружній" },
    { de: "höflich",       en: "polite",      ru: "вежливый",     ua: "ввічливий" },
    { de: "lustig",        en: "funny",       ru: "весёлый",      ua: "веселий" },
    { de: "ernst",         en: "serious",     ru: "серьёзный",    ua: "серйозний" },
    { de: "geduldig",      en: "patient",     ru: "терпеливый",   ua: "терплячий" },
    { de: "fleißig",       en: "hardworking", ru: "трудолюбивый", ua: "працьовитий" },
    { de: "faul",          en: "lazy",        ru: "ленивый",      ua: "лінивий" },
    { de: "ehrlich",       en: "honest",      ru: "честный",      ua: "чесний" },
    { de: "intelligent",   en: "intelligent", ru: "умный",        ua: "розумний" },
    { de: "mutig",         en: "brave",       ru: "смелый",       ua: "сміливий" },
    { de: "schüchtern",    en: "shy",         ru: "застенчивый",  ua: "сором'язливий" },
    { de: "großzügig",     en: "generous",    ru: "щедрый",       ua: "щедрий" },
    { de: "ruhig",         en: "calm",        ru: "спокойный",    ua: "спокійний" },
    { de: "besser",        en: "better",      ru: "лучше",        ua: "краще" },
    { de: "am besten",     en: "best",        ru: "лучше всего",  ua: "найкраще" },
    { de: "mehr",          en: "more",        ru: "больше",       ua: "більше" },
    { de: "weniger",       en: "less",        ru: "меньше",       ua: "менше" },
    // --- NEW: base adjectives for comparison ---
    { de: "schnell",       en: "fast",        ru: "быстрый",      ua: "швидкий" },
    { de: "langsam",       en: "slow",        ru: "медленный",    ua: "повільний" },
    { de: "jung",          en: "young",       ru: "молодой",      ua: "молодий" },
    { de: "alt",           en: "old",         ru: "старый",       ua: "старий" },
    { de: "kalt",          en: "cold",        ru: "холодный",     ua: "холодний" },
    { de: "warm",          en: "warm",        ru: "тёплый",       ua: "теплий" },
    { de: "schwer",        en: "difficult / heavy", ru: "трудный, тяжёлый", ua: "важкий" },
  ],

  verbFocus: ["vergleichen"],
  receptiveVerbs: ["vergleichen"],

  tasks: [
    { type: "grammar", grammarFocus: "Komparativ (-er + als)", drill: "komparativ-als",
      text: { en: "Form the Komparativ with -er + als and add an Umlaut where needed (älter, größer, wärmer).",
              ru: "Образуйте Komparativ с -er + als и добавляйте Umlaut там, где нужно (älter, größer, wärmer).",
              ua: "Утворюйте Komparativ з -er + als і додавайте Umlaut там, де потрібно (älter, größer, wärmer)." } },
    { type: "grammar", grammarFocus: "Superlativ (am -sten)", drill: "superlativ-am-sten",
      text: { en: "Form the Superlativ with am -sten and learn the irregulars gut/besser/am besten, gern, viel.",
              ru: "Образуйте Superlativ с am -sten и выучите исключения gut/besser/am besten, gern, viel.",
              ua: "Утворюйте Superlativ з am -sten і вивчіть винятки gut/besser/am besten, gern, viel." } },
    { type: "listen", grammarFocus: "so … wie vs -er als",
      text: { en: "Listen to a short comparison of two cities and answer the true/false questions. Notice so … wie (equal) vs -er als (unequal).",
              ru: "Прослушайте короткое сравнение двух городов и ответьте на вопросы верно/неверно. Обратите внимание на so … wie (равенство) и -er als (неравенство).",
              ua: "Прослухайте коротке порівняння двох міст і дайте відповіді правда/неправда. Зверніть увагу на so … wie (рівність) і -er als (нерівність)." } },
    { type: "write",
      text: { en: "Write 60–80 words comparing two cities using the comparative and superlative.",
              ru: "Напишите 60–80 слов, сравнивая два города, с Komparativ и Superlativ.",
              ua: "Напишіть 60–80 слів, порівнюючи два міста, з Komparativ і Superlativ." },
      checklist: [
        { en: "Use at least three comparatives with als.", ru: "Используйте минимум три сравнительные формы с als.", ua: "Використайте щонайменше три порівняльні форми з als." },
        { en: "Include one superlative (am … -sten).", ru: "Добавьте одну превосходную форму (am … -sten).", ua: "Додайте одну найвищу форму (am … -sten)." },
        { en: "Use one so … wie to show equality.", ru: "Используйте один оборот so … wie для равенства.", ua: "Використайте один зворот so … wie для рівності." },
      ] },
    { type: "review", drill: "komparativ-als",
      text: { en: "Review week 15: give adjectives in all three degrees out loud and take a dictation.",
              ru: "Повторение недели 15: назовите прилагательные во всех трёх степенях вслух и напишите диктант.",
              ua: "Повторення тижня 15: назвіть прикметники у всіх трьох ступенях уголос і напишіть диктант." } },
  ],

  canDo: [
    { en: "I can compare two things with the comparative and als.", ru: "Я могу сравнивать два предмета с Komparativ и als.", ua: "Я можу порівнювати два предмети з Komparativ і als." },
    { en: "I can say what is the best or the most with the superlative.", ru: "Я могу сказать, что лучше всего или больше всего, с Superlativ.", ua: "Я можу сказати, що найкраще чи найбільше, з Superlativ." },
    { en: "I can tell so … wie and -er als apart when listening.", ru: "Я могу различать so … wie и -er als на слух.", ua: "Я можу розрізняти so … wie і -er als на слух." },
    { en: "I can write a short comparison of two places.", ru: "Я могу написать короткое сравнение двух мест.", ua: "Я можу написати коротке порівняння двох місць." },
    { en: "I can describe a person's character with adjectives.", ru: "Я могу описать характер человека прилагательными.", ua: "Я можу описати характер людини прикметниками." },
  ],

  drills: {
    "komparativ-als": {
      level: "A2",
      concept: { en: "Comparative with -er + als", ru: "Сравнительная степень с -er + als", ua: "Порівняльний ступінь з -er + als" },
      prompt:  { en: "Put the adjective into the comparative.", ru: "Поставьте прилагательное в сравнительную степень.", ua: "Поставте прикметник у порівняльний ступінь." },
      items: [
        { type: "cloze",  de: "Berlin ist ___ als München. (groß)", answer: "größer" },
        { type: "cloze",  de: "Mein Bruder ist ___ als ich. (alt)", answer: "älter" },
        { type: "choice", de: "Der Zug ist ___ als das Auto.", answer: "schneller", options: ["schnell", "schneller", "am schnellsten"] },
      ],
    },
    "superlativ-am-sten": {
      level: "A2",
      concept: { en: "Superlative with am -sten", ru: "Превосходная степень с am -sten", ua: "Найвищий ступінь з am -sten" },
      prompt:  { en: "Put the adjective into the superlative.", ru: "Поставьте прилагательное в превосходную степень.", ua: "Поставте прикметник у найвищий ступінь." },
      items: [
        { type: "cloze",  de: "Im Juli ist es ___. (warm, Superlativ)", answer: "am wärmsten" },
        { type: "choice", de: "Er läuft ___ von allen.", answer: "am schnellsten", options: ["schneller", "am schnellsten", "schnell"] },
        { type: "order",  answer: ["Sie", "ist", "die", "beste", "Schülerin"] },
      ],
    },
  },

  dialogue: {
    slug: "w15-zwei-staedte",
    level: "A2",
    vocabularyMaxWeek: 15,
    title: { en: "Two cities", ru: "Два города", ua: "Два міста" },
    lines: [
      { speaker: "A", de: "Wo wohnst du lieber, in Hamburg oder in München?" },
      { speaker: "B", de: "München ist schöner, aber Hamburg ist größer als München." },
      { speaker: "A", de: "Ist das Leben in München teurer?" },
      { speaker: "B", de: "Ja, München ist am teuersten. Hamburg ist nicht so teuer wie München." },
      { speaker: "A", de: "Und das Wetter?" },
      { speaker: "B", de: "In Hamburg ist es kälter, aber in München regnet es weniger." },
    ],
    questions: [
      { de: "München ist größer als Hamburg.", answer: false, text: { en: "Munich is bigger than Hamburg.", ru: "Мюнхен больше Гамбурга.", ua: "Мюнхен більший за Гамбург." } },
      { de: "München ist am teuersten.", answer: true, text: { en: "Munich is the most expensive.", ru: "Мюнхен самый дорогой.", ua: "Мюнхен найдорожчий." } },
      { de: "In Hamburg ist es wärmer als in München.", answer: false, text: { en: "It is warmer in Hamburg than in Munich.", ru: "В Гамбурге теплее, чем в Мюнхене.", ua: "У Гамбурзі тепліше, ніж у Мюнхені." } },
    ],
  },
};

/* Week 19 — Morning rituals, reflexive verbs (A2, phase A2.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 91-95.
   Vocab reused from v1 week 15 (Reflexive Verben). */
module.exports = {
  n: 19,
  phase: "A2.2",
  level: "A2",
  theme:      { en: "Morning rituals, reflexive verbs", ru: "Утренние ритуалы, возвратные глаголы", ua: "Ранкові ритуали, зворотні дієслова" },
  grammar:    { en: "Reflexive pronouns: accusative (mich/dich/sich) vs dative (mir/dir/sich)", ru: "Возвратные местоимения: Akkusativ (mich/dich/sich) и Dativ (mir/dir/sich)", ua: "Зворотні займенники: Akkusativ (mich/dich/sich) і Dativ (mir/dir/sich)" },
  vocabTheme: { en: "reflexive verbs, daily routine", ru: "возвратные глаголы, распорядок дня", ua: "зворотні дієслова, розпорядок дня" },

  vocab: [
    { de: "sich freuen",            en: "to be glad",           ru: "радоваться",        ua: "радіти" },
    { de: "sich interessieren für", en: "to be interested in",  ru: "интересоваться",    ua: "цікавитися" },
    { de: "sich treffen mit",       en: "to meet with",         ru: "встречаться с",     ua: "зустрічатися з" },
    { de: "sich erholen",           en: "to recover / rest",    ru: "отдыхать",          ua: "відпочивати" },
    { de: "sich entspannen",        en: "to relax",             ru: "расслабляться",     ua: "розслаблятися" },
    { de: "sich beeilen",           en: "to hurry",             ru: "торопиться",        ua: "поспішати" },
    { de: "sich verspäten",         en: "to be late",           ru: "опаздывать",        ua: "запізнюватися" },
    { de: "sich anziehen",          en: "to get dressed",       ru: "одеваться",         ua: "одягатися" },
    { de: "sich ausziehen",         en: "to get undressed",     ru: "раздеваться",       ua: "роздягатися" },
    { de: "sich duschen",           en: "to shower",            ru: "принимать душ",     ua: "приймати душ" },
    { de: "sich setzen",            en: "to sit down",          ru: "садиться",          ua: "сідати" },
    { de: "sich vorstellen",        en: "to introduce oneself", ru: "представляться",    ua: "представлятися" },
    { de: "sich entscheiden",       en: "to decide",            ru: "принимать решение", ua: "ухвалювати рішення" },
    { de: "sich kümmern um",        en: "to take care of",      ru: "заботиться о",      ua: "піклуватися про" },
    { de: "sich unterhalten",       en: "to chat",              ru: "беседовать",        ua: "спілкуватися" },
    { de: "sich entschuldigen",     en: "to apologize",         ru: "извиняться",        ua: "вибачатися" },
    { de: "sich waschen",           en: "to wash oneself",      ru: "мыться",            ua: "митися" },
    { de: "sich merken",            en: "to memorize / note",   ru: "запоминать",        ua: "запам'ятовувати" },
  ],

  verbFocus: ["sich anziehen", "sich ausziehen", "sich duschen", "sich erholen", "sich entspannen", "sich verspäten", "sich vorstellen", "sich entscheiden", "sich kümmern", "sich entschuldigen"],

  tasks: [
    { type: "grammar", grammarFocus: "Reflexivpronomen Akkusativ", drill: "reflexiv-akkusativ",
      text: { en: "Learn the reflexive pronouns in the accusative (mich/dich/sich/uns/euch/sich) with verbs like sich duschen, sich anziehen, sich beeilen.",
              ru: "Выучите возвратные местоимения в Akkusativ (mich/dich/sich/uns/euch/sich) с глаголами sich duschen, sich anziehen, sich beeilen.",
              ua: "Вивчіть зворотні займенники в Akkusativ (mich/dich/sich/uns/euch/sich) з дієсловами sich duschen, sich anziehen, sich beeilen." } },
    { type: "grammar", grammarFocus: "Reflexivpronomen Dativ", drill: "reflexiv-dativ",
      text: { en: "Use dative reflexive pronouns (mir/dir/sich) when there is a direct object: sich die Haare waschen, sich etwas merken.",
              ru: "Используйте возвратные местоимения в Dativ (mir/dir/sich), когда есть прямое дополнение: sich die Haare waschen, sich etwas merken.",
              ua: "Використовуйте зворотні займенники в Dativ (mir/dir/sich), коли є прямий додаток: sich die Haare waschen, sich etwas merken." } },
    { type: "listen",
      text: { en: "Listen to the dialogue 'Mein Morgen' and answer the true/false questions. Notice accusative vs dative reflexives.",
              ru: "Прослушайте диалог «Mein Morgen» и ответьте на вопросы верно/неверно. Обратите внимание на Akkusativ и Dativ возвратных глаголов.",
              ua: "Прослухайте діалог «Mein Morgen» і дайте відповіді правда/неправда. Зверніть увагу на Akkusativ і Dativ зворотних дієслів." } },
    { type: "write",
      text: { en: "Write about your morning ritual — 8–10 sentences using at least 5 reflexive verbs.",
              ru: "Опишите свой утренний ритуал — 8–10 предложений, используя не менее 5 возвратных глаголов.",
              ua: "Опишіть свій ранковий ритуал — 8–10 речень, використовуючи щонайменше 5 зворотних дієслів." },
      checklist: [
        { en: "Use at least 3 accusative reflexives (ich dusche mich …).", ru: "Используйте минимум 3 Akkusativ-рефлексива (ich dusche mich …).", ua: "Використайте щонайменше 3 Akkusativ-рефлексиви (ich dusche mich …)." },
        { en: "Include one dative reflexive (ich putze mir die Zähne).", ru: "Добавьте один Dativ-рефлексив (ich putze mir die Zähne).", ua: "Додайте один Dativ-рефлексив (ich putze mir die Zähne)." },
        { en: "Order the actions with zuerst, dann, danach.", ru: "Расположите действия с zuerst, dann, danach.", ua: "Розташуйте дії з zuerst, dann, danach." },
      ] },
    { type: "review", drill: "reflexiv-akkusativ",
      text: { en: "Review week 19: fill in reflexive verbs and recap the accusative vs dative pronouns out loud.",
              ru: "Повторение недели 19: заполните пропуски с возвратными глаголами и повторите вслух Akkusativ vs Dativ местоимения.",
              ua: "Повторення тижня 19: заповніть пропуски зі зворотними дієсловами й повторіть уголос Akkusativ vs Dativ займенники." } },
  ],

  canDo: [
    { en: "I can describe daily actions with accusative reflexive verbs (ich wasche mich, ich ziehe mich an).", ru: "Я могу описывать ежедневные действия с Akkusativ-рефлексивами (ich wasche mich, ich ziehe mich an).", ua: "Я можу описувати щоденні дії з Akkusativ-рефлексивами (ich wasche mich, ich ziehe mich an)." },
    { en: "I can use dative reflexives with an object (ich wasche mir die Haare).", ru: "Я могу использовать Dativ-рефлексивы с дополнением (ich wasche mir die Haare).", ua: "Я можу використовувати Dativ-рефлексиви з додатком (ich wasche mir die Haare)." },
    { en: "I can follow and answer questions about a morning-routine dialogue.", ru: "Я могу понять и ответить на вопросы по диалогу об утреннем распорядке.", ua: "Я можу зрозуміти й відповісти на питання за діалогом про ранковий розпорядок." },
    { en: "I can write about my morning ritual using reflexive verbs.", ru: "Я могу написать о своём утреннем ритуале с возвратными глаголами.", ua: "Я можу написати про свій ранковий ритуал зі зворотними дієсловами." },
    { en: "I can tell accusative and dative reflexive pronouns apart.", ru: "Я могу различать возвратные местоимения в Akkusativ и Dativ.", ua: "Я можу розрізняти зворотні займенники в Akkusativ і Dativ." },
  ],

  drills: {
    "reflexiv-akkusativ": {
      level: "A2",
      concept: { en: "Accusative reflexive pronouns with reflexive verbs", ru: "Возвратные местоимения в Akkusativ с возвратными глаголами", ua: "Зворотні займенники в Akkusativ зі зворотними дієсловами" },
      prompt:  { en: "Put in the correct accusative reflexive pronoun.", ru: "Вставьте правильное возвратное местоимение в Akkusativ.", ua: "Вставте правильний зворотний займенник в Akkusativ." },
      items: [
        { type: "cloze",  de: "Ich dusche ___ jeden Morgen.", answer: "mich" },
        { type: "choice", de: "Du musst ___ beeilen.", answer: "dich", options: ["mich", "dich", "sich"] },
        { type: "order",  answer: ["Er", "zieht", "sich", "schnell", "an"] },
      ],
    },
    "reflexiv-dativ": {
      level: "A2",
      concept: { en: "Dative reflexive pronouns when there is an accusative object", ru: "Возвратные местоимения в Dativ при наличии дополнения в Akkusativ", ua: "Зворотні займенники в Dativ за наявності додатка в Akkusativ" },
      prompt:  { en: "Put in the correct dative reflexive pronoun.", ru: "Вставьте правильное возвратное местоимение в Dativ.", ua: "Вставте правильний зворотний займенник в Dativ." },
      items: [
        { type: "cloze",  de: "Ich wasche ___ die Haare.", answer: "mir" },
        { type: "choice", de: "Kannst du ___ das merken?", answer: "dir", options: ["dich", "dir", "sich"] },
        { type: "order",  answer: ["Ich", "putze", "mir", "die", "Zähne"] },
      ],
    },
  },

  dialogue: {
    slug: "w19-mein-morgen",
    level: "A2",
    vocabularyMaxWeek: 19,
    title: { en: "My morning", ru: "Моё утро", ua: "Мій ранок" },
    lines: [
      { speaker: "A", de: "Wann stehst du morgens auf?" },
      { speaker: "B", de: "Ich stehe um sechs Uhr auf. Dann dusche ich mich." },
      { speaker: "A", de: "Wäschst du dir auch die Haare?" },
      { speaker: "B", de: "Ja, und danach ziehe ich mich an." },
      { speaker: "A", de: "Beeilst du dich am Morgen?" },
      { speaker: "B", de: "Nein, ich habe Zeit. Ich trinke einen Kaffee und entspanne mich." },
    ],
    questions: [
      { de: "Er steht um sechs Uhr auf.", answer: true, text: { en: "He gets up at six o'clock.", ru: "Он встаёт в шесть часов.", ua: "Він встає о шостій годині." } },
      { de: "Er wäscht sich nie die Haare.", answer: false, text: { en: "He never washes his hair.", ru: "Он никогда не моет волосы.", ua: "Він ніколи не миє волосся." } },
      { de: "Am Morgen beeilt er sich nicht.", answer: true, text: { en: "In the morning he does not hurry.", ru: "Утром он не торопится.", ua: "Вранці він не поспішає." } },
    ],
  },
};

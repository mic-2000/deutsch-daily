/* Week 21 — Goals & plans; Infinitiv mit zu, um…zu (A2, phase A2.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 101–105.
   The zu-Infinitiv stems and goal words are new; the verb+preposition pairs reuse old v1 week 22
   (Verben mit Präpositionen), index-matched glosses. */
module.exports = {
  n: 21,
  phase: 'A2.2',
  level: 'A2',
  theme:      { en: 'Goals & plans; infinitive with zu', ru: 'Цели и планы; инфинитив с zu', ua: 'Цілі та плани; інфінітив із zu' },
  grammar:    { en: 'zu-Infinitiv after verbs/expressions; purpose clauses um…zu (same subject) vs damit; verb+preposition pairs I', ru: 'zu-Infinitiv после глаголов/выражений; цель um…zu (один субъект) vs damit; глагольно-предложные пары I', ua: 'zu-Infinitiv після дієслів/виразів; мета um…zu (один суб’єкт) vs damit; дієслівно-прийменникові пари I' },
  vocabTheme: { en: 'goals, plans, verb+preposition pairs', ru: 'цели, планы, глагольно-предложные пары', ua: 'цілі, плани, дієслівно-прийменникові пари' },

  vocab: [
    { de: 'Lust haben zu',        en: 'to feel like doing',   ru: 'хотеть (что-то делать)',  ua: 'мати бажання (щось робити)' },
    { de: 'Zeit haben zu',        en: 'to have time to',      ru: 'иметь время (что-то делать)', ua: 'мати час (щось робити)' },
    { de: 'Angst haben zu',       en: 'to be afraid to',      ru: 'бояться (что-то делать)', ua: 'боятися (щось робити)' },
    { de: 'versuchen zu',         en: 'to try to',            ru: 'пытаться (что-то делать)', ua: 'намагатися (щось робити)' },
    { de: 'vergessen zu',         en: 'to forget to',         ru: 'забывать (что-то сделать)', ua: 'забувати (щось зробити)' },
    { de: 'anfangen zu',          en: 'to start to',          ru: 'начинать (что-то делать)', ua: 'починати (щось робити)' },
    { de: 'um … zu',              en: 'in order to',          ru: 'чтобы (с целью)',         ua: 'щоб (з метою)' },
    { de: 'damit',                en: 'so that',              ru: 'чтобы (для другого лица)', ua: 'щоб (для іншої особи)' },
    { de: 'das Ziel',             en: 'goal',                 ru: 'цель',                    ua: 'мета' },
    { de: 'der Plan',             en: 'plan',                 ru: 'план',                    ua: 'план' },
    { de: 'sich freuen auf',      en: 'to look forward to',   ru: 'радоваться (предстоящему)', ua: 'радіти (майбутньому)' },
    { de: 'warten auf',           en: 'to wait for',          ru: 'ждать',                   ua: 'чекати на' },
    { de: 'denken an',            en: 'to think about',       ru: 'думать о',                ua: 'думати про' },
    { de: 'träumen von',          en: 'to dream of',          ru: 'мечтать о',               ua: 'мріяти про' },
    { de: 'sich interessieren für', en: 'to be interested in', ru: 'интересоваться',         ua: 'цікавитися' },
    { de: 'achten auf',           en: 'to pay attention to',  ru: 'обращать внимание на',    ua: 'звертати увагу на' },
  ],

  verbFocus: ['versuchen', 'vergessen', 'warten', 'denken', 'träumen', 'achten', 'sich freuen', 'sich interessieren'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Infinitiv mit zu', drill: 'infinitiv-mit-zu',
      text: { en: 'Learn the zu-Infinitiv after verbs and expressions: Ich versuche zu …, Ich habe Lust/Zeit/Angst zu … (with separable verbs zu goes inside: aufzustehen).',
              ru: 'Выучите zu-Infinitiv после глаголов и выражений: Ich versuche zu …, Ich habe Lust/Zeit/Angst zu … (в отделяемых глаголах zu стоит внутри: aufzustehen).',
              ua: 'Вивчіть zu-Infinitiv після дієслів і виразів: Ich versuche zu …, Ich habe Lust/Zeit/Angst zu … (у відокремлюваних дієсловах zu стоїть усередині: aufzustehen).' } },
    { type: 'grammar', grammarFocus: 'um…zu vs damit', drill: 'um-zu-damit',
      text: { en: 'Express purpose: use um…zu when the subject is the same, and damit when the two clauses have different subjects.',
              ru: 'Выражайте цель: um…zu при одном субъекте, damit — когда у двух частей разные субъекты.',
              ua: 'Виражайте мету: um…zu за одного суб’єкта, damit — коли у двох частин різні суб’єкти.' } },
    { type: 'grammar', grammarFocus: 'Verb+preposition pairs I', drill: 'rektionen-1',
      text: { en: 'Learn verb+preposition pairs (warten auf, denken an, sich freuen auf/über). Listen to the dialogue "Pläne" and hear them in context.',
              ru: 'Выучите глагольно-предложные пары (warten auf, denken an, sich freuen auf/über). Прослушайте диалог «Pläne» и услышьте их в контексте.',
              ua: 'Вивчіть дієслівно-прийменникові пари (warten auf, denken an, sich freuen auf/über). Прослухайте діалог «Pläne» і почуйте їх у контексті.' } },
    { type: 'write',
      text: { en: 'Write "Meine Ziele" — 8 sentences about your goals using zu-Infinitiv and um…zu.',
              ru: 'Напишите «Meine Ziele» — 8 предложений о своих целях с zu-Infinitiv и um…zu.',
              ua: 'Напишіть «Meine Ziele» — 8 речень про свої цілі із zu-Infinitiv та um…zu.' },
      checklist: [
        { en: 'Use at least three zu-Infinitiv constructions.', ru: 'Используйте минимум три конструкции с zu-Infinitiv.', ua: 'Використайте щонайменше три конструкції із zu-Infinitiv.' },
        { en: 'Include one um…zu purpose clause.', ru: 'Добавьте одно придаточное цели с um…zu.', ua: 'Додайте одне підрядне мети з um…zu.' },
        { en: 'Use one verb+preposition pair (auf/an/für …).', ru: 'Используйте одну глагольно-предложную пару (auf/an/für …).', ua: 'Використайте одну дієслівно-прийменникову пару (auf/an/für …).' },
      ] },
    { type: 'review', drill: 'rektionen-1',
      text: { en: 'Review week 21: contrast sich freuen auf (a future event) with sich freuen über (something now/past), then a TTS dictation of the verb+preposition pairs.',
              ru: 'Повторение недели 21: противопоставьте sich freuen auf (будущее событие) и sich freuen über (сейчас/в прошлом), затем TTS-диктант глагольно-предложных пар.',
              ua: 'Повторення тижня 21: протиставте sich freuen auf (майбутня подія) і sich freuen über (зараз/у минулому), потім TTS-диктант дієслівно-прийменникових пар.' } },
  ],

  canDo: [
    { en: 'I can use the zu-Infinitiv after verbs and expressions (ich versuche zu …, ich habe Lust zu …).', ru: 'Я могу использовать zu-Infinitiv после глаголов и выражений (ich versuche zu …, ich habe Lust zu …).', ua: 'Я можу використовувати zu-Infinitiv після дієслів і виразів (ich versuche zu …, ich habe Lust zu …).' },
    { en: 'I can express purpose with um…zu and damit.', ru: 'Я могу выражать цель с um…zu и damit.', ua: 'Я можу виражати мету з um…zu і damit.' },
    { en: 'I can use common verb+preposition pairs (warten auf, denken an, sich freuen auf).', ru: 'Я могу использовать частые глагольно-предложные пары (warten auf, denken an, sich freuen auf).', ua: 'Я можу використовувати поширені дієслівно-прийменникові пари (warten auf, denken an, sich freuen auf).' },
    { en: 'I can write about my goals using zu-Infinitiv and um…zu.', ru: 'Я могу написать о своих целях с zu-Infinitiv и um…zu.', ua: 'Я можу написати про свої цілі із zu-Infinitiv та um…zu.' },
    { en: 'I can tell sich freuen auf (future) from sich freuen über (now/past) apart.', ru: 'Я могу различать sich freuen auf (будущее) и sich freuen über (сейчас/прошлое).', ua: 'Я можу розрізняти sich freuen auf (майбутнє) і sich freuen über (зараз/минуле).' },
  ],

  drills: {
    'infinitiv-mit-zu': {
      level: 'A2',
      concept: { en: 'The zu-Infinitiv after verbs and expressions', ru: 'zu-Infinitiv после глаголов и выражений', ua: 'zu-Infinitiv після дієслів і виразів' },
      prompt:  { en: 'Complete the zu-Infinitiv construction.', ru: 'Дополните конструкцию с zu-Infinitiv.', ua: 'Доповніть конструкцію із zu-Infinitiv.' },
      items: [
        { type: 'cloze',  de: 'Ich habe keine Zeit, heute ___ kommen.', answer: 'zu' },
        { type: 'choice', de: 'Er vergisst oft, die Tür ___ schließen.', answer: 'zu', options: ['zu', 'um', 'für'] },
        { type: 'order',  answer: ['Ich', 'versuche', 'mehr', 'zu', 'schlafen'] },
      ],
    },
    'um-zu-damit': {
      level: 'A2',
      concept: { en: 'Purpose clauses: um…zu (same subject) vs damit (different subjects)', ru: 'Придаточные цели: um…zu (один субъект) vs damit (разные субъекты)', ua: 'Підрядні мети: um…zu (один суб’єкт) vs damit (різні суб’єкти)' },
      prompt:  { en: 'Choose um…zu or damit and complete the clause.', ru: 'Выберите um…zu или damit и завершите предложение.', ua: 'Виберіть um…zu або damit і завершіть речення.' },
      items: [
        { type: 'cloze',  de: 'Ich lerne Deutsch, ___ in Berlin zu arbeiten.', answer: 'um' },
        { type: 'choice', de: 'Ich erkläre es dir, ___ du es verstehst.', answer: 'damit', options: ['um', 'damit', 'dass'] },
        { type: 'order',  answer: ['Sie', 'spart', 'Geld,', 'um', 'zu', 'reisen'] },
      ],
    },
    'rektionen-1': {
      level: 'A2',
      concept: { en: 'Verbs with a fixed preposition', ru: 'Глаголы с фиксированным предлогом', ua: 'Дієслова з фіксованим прийменником' },
      prompt:  { en: 'Fill in the correct preposition.', ru: 'Вставьте правильный предлог.', ua: 'Вставте правильний прийменник.' },
      items: [
        { type: 'cloze',  de: 'Ich warte ___ den Bus.', answer: 'auf' },
        { type: 'choice', de: 'Wir freuen uns ___ das Wochenende.', answer: 'auf', options: ['auf', 'über', 'für'] },
        { type: 'cloze',  de: 'Denkst du oft ___ deine Familie?', answer: 'an' },
      ],
    },
  },

  dialogue: {
    slug: 'w21-plaene',
    level: 'A2',
    vocabularyMaxWeek: 21,
    title: { en: 'Weekend plans', ru: 'Планы на выходные', ua: 'Плани на вихідні' },
    lines: [
      { speaker: 'A', de: 'Was hast du am Wochenende vor?' },
      { speaker: 'B', de: 'Ich habe Lust, ins Museum zu gehen. Und du?' },
      { speaker: 'A', de: 'Ich freue mich auf das Konzert am Samstag.' },
      { speaker: 'B', de: 'Schön! Ich versuche, auch Zeit zum Lernen zu finden.' },
      { speaker: 'A', de: 'Warum lernst du so viel?' },
      { speaker: 'B', de: 'Ich lerne Deutsch, um in Berlin zu arbeiten.' },
    ],
    questions: [
      { de: 'B möchte ins Museum gehen.', answer: true, text: { en: 'B wants to go to the museum.', ru: 'B хочет пойти в музей.', ua: 'B хоче піти в музей.' } },
      { de: 'A freut sich auf ein Konzert.', answer: true, text: { en: 'A is looking forward to a concert.', ru: 'A с нетерпением ждёт концерт.', ua: 'A з нетерпінням чекає на концерт.' } },
      { de: 'B lernt Deutsch, um in Wien zu arbeiten.', answer: false, text: { en: 'B is learning German in order to work in Vienna.', ru: 'B учит немецкий, чтобы работать в Вене.', ua: 'B вчить німецьку, щоб працювати у Відні.' } },
    ],
  },
};

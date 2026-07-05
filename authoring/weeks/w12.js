/* Week 12 — A1 consolidation + weather (A1, phase A1.2). Days 56–60. Day 60 = Goethe A1 milestone. */
module.exports = {
  n: 12,
  phase: 'A1.2',
  level: 'A1',
  theme:      { en: 'A1 consolidation + weather', ru: 'Консолидация A1 + погода', ua: 'Консолідація A1 + погода' },
  grammar:    { en: 'Review of cases, tenses and the sentence bracket; Goethe A1 self-check', ru: 'Повторение падежей, времён и рамки; самопроверка Goethe A1', ua: 'Повторення відмінків, часів і рамки; самоперевірка Goethe A1' },
  vocabTheme: { en: 'weather, adverbs', ru: 'погода, наречия', ua: 'погода, прислівники' },

  vocab: [
    { de: 'das Wetter',   en: 'weather',       ru: 'погода',        ua: 'погода' },
    { de: 'die Sonne',    en: 'sun',           ru: 'солнце',        ua: 'сонце' },
    { de: 'der Regen',    en: 'rain',          ru: 'дождь',         ua: 'дощ' },
    { de: 'der Schnee',   en: 'snow',          ru: 'снег',          ua: 'сніг' },
    { de: 'der Wind',     en: 'wind',          ru: 'ветер',         ua: 'вітер' },
    { de: 'die Wolke',    en: 'cloud',         ru: 'облако',        ua: 'хмара' },
    { de: 'warm',         en: 'warm',          ru: 'тёплый',        ua: 'теплий' },
    { de: 'kalt',         en: 'cold',          ru: 'холодный',      ua: 'холодний' },
    { de: 'sonnig',       en: 'sunny',         ru: 'солнечно',      ua: 'сонячно' },
    { de: 'vielleicht',   en: 'maybe',         ru: 'возможно',      ua: 'можливо' },
    { de: 'leider',       en: 'unfortunately', ru: 'к сожалению',   ua: 'на жаль' },
    { de: 'genau',        en: 'exactly',       ru: 'точно',         ua: 'точно' },
    { de: 'natürlich',    en: 'of course',     ru: 'конечно',       ua: 'звичайно' },
    { de: 'wirklich',     en: 'really',        ru: 'действительно', ua: 'справді' },
    { de: 'die Temperatur', en: 'temperature', ru: 'температура',   ua: 'температура' },
    { de: 'der Grad',     en: 'degree',        ru: 'градус',        ua: 'градус' },
  ],

  verbFocus: ['regnen', 'schneien', 'scheinen'],

  tasks: [
    { type: 'review', drill: 'kasus-wdh-a1',
      text: { en: 'Consolidation: cases der→den→dem across Nominativ/Akkusativ/Dativ; new weather words.', ru: 'Консолидация: падежи der→den→dem по Nominativ/Akkusativ/Dativ; новые слова о погоде.', ua: 'Консолідація: відмінки der→den→dem за Nominativ/Akkusativ/Dativ; нові слова про погоду.' } },
    { type: 'review',
      text: { en: 'Consolidation: Perfekt, the sentence bracket and separable verbs; weather adverbs.', ru: 'Консолидация: Perfekt, рамка и отделяемые глаголы; наречия для погоды.', ua: 'Консолідація: Perfekt, рамка та відокремлювані дієслова; прислівники для погоди.' } },
    { type: 'listen',
      text: { en: 'Mini Hören/Lesen: a short weather forecast and dialogue with comprehension checks.', ru: 'Мини Hören/Lesen: короткий прогноз погоды и диалог с проверками.', ua: 'Міні Hören/Lesen: короткий прогноз погоди й діалог з перевірками.' } },
    { type: 'write',
      text: { en: 'Write a letter to a friend — 40–60 words: the weather and what you did yesterday (Perfekt).', ru: 'Напишите письмо другу — 40–60 слов: погода и что вы делали вчера (Perfekt).', ua: 'Напишіть лист другу — 40–60 слів: погода і що ви робили вчора (Perfekt).' },
      checklist: [
        { en: 'Describe today’s weather.', ru: 'Опишите сегодняшнюю погоду.', ua: 'Опишіть сьогоднішню погоду.' },
        { en: 'Use at least 2 verbs in the Perfekt.', ru: 'Используйте хотя бы 2 глагола в Perfekt.', ua: 'Використайте щонайменше 2 дієслова в Perfekt.' },
      ] },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE: Goethe A1 self-check across weeks 1–11; review your mistakes.', ru: 'КОНТРОЛЬНАЯ ТОЧКА: самопроверка Goethe A1 по неделям 1–11; разбор ошибок.', ua: 'КОНТРОЛЬНА ТОЧКА: самоперевірка Goethe A1 за тижнями 1–11; розбір помилок.' } },
  ],

  canDo: [
    { en: 'I can use the three cases with the right articles.', ru: 'Я могу использовать три падежа с правильными артиклями.', ua: 'Я можу використовувати три відмінки з правильними артиклями.' },
    { en: 'I can talk about the past with the Perfekt.', ru: 'Я могу говорить о прошлом с Perfekt.', ua: 'Я можу говорити про минуле з Perfekt.' },
    { en: 'I can follow a short weather forecast.', ru: 'Я могу понять короткий прогноз погоды.', ua: 'Я можу зрозуміти короткий прогноз погоди.' },
    { en: 'I can write a short letter about the weather and my day.', ru: 'Я могу написать короткое письмо о погоде и своём дне.', ua: 'Я можу написати короткий лист про погоду і свій день.' },
    { en: 'I can gauge my A1 level with a self-check.', ru: 'Я могу оценить свой уровень A1 самопроверкой.', ua: 'Я можу оцінити свій рівень A1 самоперевіркою.' },
  ],

  drills: {
    'kasus-wdh-a1': {
      level: 'A1',
      concept: { en: 'Review: Nominativ/Akkusativ/Dativ articles', ru: 'Повторение: артикли Nom/Akk/Dativ', ua: 'Повторення: артиклі Nom/Akk/Dativ' },
      prompt:  { en: 'Choose the correct article for the case.', ru: 'Выберите правильный артикль для падежа.', ua: 'Виберіть правильний артикль для відмінка.' },
      items: [
        { type: 'choice', de: 'Ich sehe ___ Mann. (Akk.)', answer: 'den', options: ['der', 'den', 'dem'] },
        { type: 'choice', de: 'Ich helfe ___ Frau. (Dat.)', answer: 'der', options: ['die', 'der', 'den'] },
        { type: 'cloze',  de: '___ Kind spielt. (Nom., neuter)', answer: 'Das' },
      ],
    },
  },

  dialogue: {
    slug: 'w12-wetter',
    level: 'A1',
    vocabularyMaxWeek: 12,
    title: { en: 'What’s the weather like?', ru: 'Какая погода?', ua: 'Яка погода?' },
    lines: [
      { speaker: 'A', de: 'Wie ist das Wetter heute?' },
      { speaker: 'B', de: 'Es ist warm und die Sonne scheint.' },
      { speaker: 'A', de: 'Und morgen?' },
      { speaker: 'B', de: 'Morgen regnet es vielleicht. Es wird kälter.' },
    ],
    questions: [
      { de: 'Heute scheint die Sonne.', answer: true, text: { en: 'The sun is shining today.', ru: 'Сегодня светит солнце.', ua: 'Сьогодні світить сонце.' } },
      { de: 'Morgen wird es wärmer.', answer: false, text: { en: 'It will be warmer tomorrow.', ru: 'Завтра будет теплее.', ua: 'Завтра буде тепліше.' } },
      { de: 'Es regnet heute.', answer: false, text: { en: 'It is raining today.', ru: 'Сегодня идёт дождь.', ua: 'Сьогодні йде дощ.' } },
    ],
  },
};

/* Week 27 — Descriptions; Adjektivdeklination II (strong declension) (B1, phase B1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 131–135.
   Vocab rebuilds old v1 week 17 (Erweiterte Beschreibungen): the hardest B2 adjectives
   (atemberaubend, herausragend, bemerkenswert, außergewöhnlich, einzigartig) are replaced by
   B1-level ones (gefährlich, bequem, praktisch, frisch, modern); reused words keep their glosses. */
module.exports = {
  n: 27,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'Descriptions; adjective declension II', ru: 'Описания; склонение прилагательных II', ua: 'Описи; відмінювання прикметників II' },
  grammar:    { en: 'Strong (no-article) adjective declension; contrast of the three types', ru: 'Сильное склонение прилагательных (без артикля); контраст трёх типов', ua: 'Сильне відмінювання прикметників (без артикля); контраст трьох типів' },
  vocabTheme: { en: 'descriptive adjectives', ru: 'описательные прилагательные', ua: 'описові прикметники' },

  vocab: [
    { de: 'beeindruckend', en: 'impressive',   ru: 'впечатляющий',    ua: 'вражаючий' },
    { de: 'enttäuschend',  en: 'disappointing', ru: 'разочаровывающий', ua: 'розчаровуючий' },
    { de: 'seltsam',       en: 'strange',       ru: 'странный',        ua: 'дивний' },
    { de: 'typisch',       en: 'typical',       ru: 'типичный',        ua: 'типовий' },
    { de: 'üblich',        en: 'usual',         ru: 'обычный',         ua: 'звичайний' },
    { de: 'selten',        en: 'rare',          ru: 'редкий',          ua: 'рідкісний' },
    { de: 'wertvoll',      en: 'valuable',      ru: 'ценный',          ua: 'цінний' },
    { de: 'nützlich',      en: 'useful',        ru: 'полезный',        ua: 'корисний' },
    { de: 'schwierig',     en: 'difficult',     ru: 'трудный',         ua: 'важкий' },
    { de: 'kompliziert',   en: 'complicated',   ru: 'сложный',         ua: 'складний' },
    { de: 'einfach',       en: 'simple',        ru: 'простой',         ua: 'простий' },
    { de: 'gefährlich',    en: 'dangerous',     ru: 'опасный',         ua: 'небезпечний' },
    { de: 'bequem',        en: 'comfortable',   ru: 'удобный',         ua: 'зручний' },
    { de: 'praktisch',     en: 'practical',     ru: 'практичный',      ua: 'практичний' },
    { de: 'frisch',        en: 'fresh',         ru: 'свежий',          ua: 'свіжий' },
    { de: 'modern',        en: 'modern',        ru: 'современный',     ua: 'сучасний' },
  ],

  verbFocus: ['beschreiben', 'wirken'],

  tasks: [
    { type: 'grammar', grammarFocus: 'strong adjective declension', drill: 'adjektiv-stark',
      text: { en: 'Decline adjectives with no article (strong declension): guter Wein, kalte Milch, frisches Brot.',
              ru: 'Склоняйте прилагательные без артикля (сильное склонение): guter Wein, kalte Milch, frisches Brot.',
              ua: 'Відмінюйте прикметники без артикля (сильне відмінювання): guter Wein, kalte Milch, frisches Brot.' } },
    { type: 'grammar', grammarFocus: 'contrast of the three declension types', drill: 'adjektiv-kontrast',
      text: { en: 'Contrast the three types: der gute Wein (weak), ein guter Wein (mixed), guter Wein (strong).',
              ru: 'Сравните три типа: der gute Wein (слабое), ein guter Wein (смешанное), guter Wein (сильное).',
              ua: 'Порівняйте три типи: der gute Wein (слабке), ein guter Wein (мішане), guter Wein (сильне).' } },
    { type: 'listen',
      text: { en: 'Listen to a short description of a restaurant and describe food and things with adjectives.',
              ru: 'Прослушайте короткое описание ресторана и опишите еду и вещи с прилагательными.',
              ua: 'Прослухайте короткий опис ресторану й опишіть їжу та речі з прикметниками.' } },
    { type: 'write',
      text: { en: 'Describe your favourite place or a photo in 80–120 words, using adjectives in all three declensions.',
              ru: 'Опишите любимое место или фото в 80–120 словах, используя прилагательные во всех трёх склонениях.',
              ua: 'Опишіть улюблене місце або фото у 80–120 словах, використовуючи прикметники в усіх трьох відмінюваннях.' },
      checklist: [
        { en: 'Use at least one strong (no-article) adjective ending (guter Kaffee).', ru: 'Используйте хотя бы одно сильное окончание без артикля (guter Kaffee).', ua: 'Використайте принаймні одне сильне закінчення без артикля (guter Kaffee).' },
        { en: 'Use both a weak (der schöne Ort) and a mixed (ein schöner Ort) form.', ru: 'Используйте слабую (der schöne Ort) и смешанную (ein schöner Ort) форму.', ua: 'Використайте слабку (der schöne Ort) і мішану (ein schöner Ort) форму.' },
        { en: 'Say how the place looks or feels with wirken (Der Ort wirkt gemütlich).', ru: 'Скажите, как выглядит или ощущается место, с wirken (Der Ort wirkt gemütlich).', ua: 'Скажіть, як виглядає чи відчувається місце, з wirken (Der Ort wirkt gemütlich).' },
      ] },
    { type: 'review', drill: 'adjektiv-stark',
      text: { en: 'Review week 27: a no-article adjective-ending cloze, then a TTS dictation of adjectives.',
              ru: 'Повторение недели 27: клоуз на окончания прилагательных без артикля, затем TTS-диктант прилагательных.',
              ua: 'Повторення тижня 27: клоуз на закінчення прикметників без артикля, потім TTS-диктант прикметників.' } },
  ],

  canDo: [
    { en: 'I can decline adjectives with no article (guter Wein, kalte Milch).', ru: 'Я могу склонять прилагательные без артикля (guter Wein, kalte Milch).', ua: 'Я можу відмінювати прикметники без артикля (guter Wein, kalte Milch).' },
    { en: 'I can choose the right adjective ending across the weak, mixed and strong declension.', ru: 'Я могу выбрать правильное окончание прилагательного в слабом, смешанном и сильном склонении.', ua: 'Я можу вибрати правильне закінчення прикметника у слабкому, мішаному та сильному відмінюванні.' },
    { en: 'I can understand a short spoken description and talk about food with adjectives.', ru: 'Я могу понять короткое устное описание и рассказать о еде с прилагательными.', ua: 'Я можу зрозуміти короткий усний опис і розповісти про їжу з прикметниками.' },
    { en: 'I can describe my favourite place in a short text.', ru: 'Я могу описать любимое место в коротком тексте.', ua: 'Я можу описати улюблене місце в короткому тексті.' },
    { en: 'I can spell adjective endings correctly from dictation.', ru: 'Я могу правильно писать окончания прилагательных под диктовку.', ua: 'Я можу правильно писати закінчення прикметників під диктування.' },
  ],

  drills: {
    'adjektiv-stark': {
      level: 'B1',
      concept: { en: 'Strong adjective declension (no article)', ru: 'Сильное склонение прилагательного (без артикля)', ua: 'Сильне відмінювання прикметника (без артикля)' },
      prompt:  { en: 'Add the strong (no-article) adjective ending.', ru: 'Добавьте сильное окончание прилагательного (без артикля).', ua: 'Додайте сильне закінчення прикметника (без артикля).' },
      items: [
        { type: 'cloze',  de: '___ Wein schmeckt gut. (gut, Nom. m.)', answer: 'Guter' },
        { type: 'choice', de: 'Zum Frühstück trinke ich ___ Milch. (kalt, Akk. f.)', answer: 'kalte', options: ['kalte', 'kalten', 'kalter'] },
        { type: 'cloze',  de: 'Sie kauft ___ Brot. (frisch, Akk. n.)', answer: 'frisches' },
      ],
    },
    'adjektiv-kontrast': {
      level: 'B1',
      concept: { en: 'Weak, mixed and strong declension contrasted', ru: 'Контраст слабого, смешанного и сильного склонения', ua: 'Контраст слабкого, мішаного та сильного відмінювання' },
      prompt:  { en: 'Give the adjective ending for each declension type.', ru: 'Дайте окончание прилагательного для каждого типа склонения.', ua: 'Дайте закінчення прикметника для кожного типу відмінювання.' },
      items: [
        { type: 'choice', de: 'Der ___ Wein ist teuer. (gut, mit bestimmtem Artikel)', answer: 'gute', options: ['gute', 'guter', 'gutes'] },
        { type: 'cloze',  de: 'Das ist ein ___ Wein. (gut, nach ein-)', answer: 'guter' },
        { type: 'cloze',  de: '___ Wein ist nicht immer teuer. (gut, ohne Artikel)', answer: 'Guter' },
      ],
    },
  },

  dialogue: {
    slug: 'w27-beschreibung',
    level: 'B1',
    vocabularyMaxWeek: 27,
    title: { en: 'The new restaurant', ru: 'Новый ресторан', ua: 'Новий ресторан' },
    lines: [
      { speaker: 'A', de: 'Wie war das neue Restaurant?' },
      { speaker: 'B', de: 'Sehr gut! Es gibt frisches Brot, guten Käse und kalte Milch.' },
      { speaker: 'A', de: 'Und wie wirkt das Lokal auf dich?' },
      { speaker: 'B', de: 'Gemütlich und praktisch. Der Service ist einfach und schnell.' },
      { speaker: 'A', de: 'Ist gutes Essen dort teuer?' },
      { speaker: 'B', de: 'Nein, guter Käse muss nicht teuer sein.' },
    ],
    questions: [
      { de: 'Im Restaurant gibt es frisches Brot.', answer: true, text: { en: 'There is fresh bread at the restaurant.', ru: 'В ресторане есть свежий хлеб.', ua: 'У ресторані є свіжий хліб.' } },
      { de: 'B findet den Service kompliziert.', answer: false, text: { en: 'B finds the service complicated.', ru: 'B считает сервис сложным.', ua: 'B вважає сервіс складним.' } },
      { de: 'Das Lokal wirkt gemütlich auf B.', answer: true, text: { en: 'The place seems cosy to B.', ru: 'Заведение кажется B уютным.', ua: 'Заклад видається B затишним.' } },
    ],
  },
};

/* Week 20 — Clothes; adjective declension I (A2, phase A2.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 96–100.
   Vocab reuses old v1 week 16 (Kleidung) + the 11 colors from old v1 week 3, index-matched glosses;
   der Pullover / die Bluse are new. */
module.exports = {
  n: 20,
  phase: 'A2.2',
  level: 'A2',
  theme:      { en: 'Clothes; adjective declension I', ru: 'Одежда; склонение прилагательных I', ua: 'Одяг; відмінювання прикметників I' },
  grammar:    { en: 'Weak declension (after der/die/das), mixed declension (after ein/kein/mein); dieser/jeder/welcher', ru: 'Слабое склонение (после der/die/das), смешанное (после ein/kein/mein); dieser/jeder/welcher', ua: 'Слабке відмінювання (після der/die/das), змішане (після ein/kein/mein); dieser/jeder/welcher' },
  vocabTheme: { en: 'clothes, colors', ru: 'одежда, цвета', ua: 'одяг, кольори' },

  vocab: [
    { de: 'die Kleidung',  en: 'clothing',          ru: 'одежда',       ua: 'одяг' },
    { de: 'das Hemd',      en: 'shirt',             ru: 'рубашка',      ua: 'сорочка' },
    { de: 'die Hose',      en: 'trousers / pants',  ru: 'брюки',        ua: 'штани' },
    { de: 'der Rock',      en: 'skirt',             ru: 'юбка',         ua: 'спідниця' },
    { de: 'das Kleid',     en: 'dress',             ru: 'платье',       ua: 'сукня' },
    { de: 'die Jacke',     en: 'jacket',            ru: 'куртка',       ua: 'куртка' },
    { de: 'der Mantel',    en: 'coat',              ru: 'пальто',       ua: 'пальто' },
    { de: 'der Schuh',     en: 'shoe',              ru: 'ботинок',      ua: 'черевик' },
    { de: 'die Socke',     en: 'sock',              ru: 'носок',        ua: 'шкарпетка' },
    { de: 'der Hut',       en: 'hat',               ru: 'шляпа',        ua: 'капелюх' },
    { de: 'die Mütze',     en: 'cap / beanie',      ru: 'шапка',        ua: 'шапка' },
    { de: 'der Schal',     en: 'scarf',             ru: 'шарф',         ua: 'шарф' },
    { de: 'der Stoff',     en: 'fabric',            ru: 'ткань',        ua: 'тканина' },
    { de: 'der Pullover',  en: 'sweater / jumper',  ru: 'свитер',       ua: 'светр' },
    { de: 'die Bluse',     en: 'blouse',            ru: 'блузка',       ua: 'блузка' },
    { de: 'rot',           en: 'red',               ru: 'красный',      ua: 'червоний' },
    { de: 'blau',          en: 'blue',              ru: 'синий',        ua: 'синій' },
    { de: 'gelb',          en: 'yellow',            ru: 'жёлтый',       ua: 'жовтий' },
    { de: 'grün',          en: 'green',             ru: 'зелёный',      ua: 'зелений' },
    { de: 'schwarz',       en: 'black',             ru: 'чёрный',       ua: 'чорний' },
    { de: 'weiß',          en: 'white',             ru: 'белый',        ua: 'білий' },
    { de: 'grau',          en: 'grey',              ru: 'серый',        ua: 'сірий' },
    { de: 'braun',         en: 'brown',             ru: 'коричневый',   ua: 'коричневий' },
    { de: 'orange',        en: 'orange',            ru: 'оранжевый',    ua: 'помаранчевий' },
    { de: 'rosa',          en: 'pink',              ru: 'розовый',      ua: 'рожевий' },
    { de: 'bunt',          en: 'colorful',          ru: 'разноцветный', ua: 'різнобарвний' },
  ],

  verbFocus: ['tragen', 'passen', 'anprobieren', 'anziehen', 'ausziehen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Weak adjective declension', drill: 'adjektiv-schwach',
      text: { en: 'Learn the weak adjective endings after the definite article and dieser/jeder/welcher: der rote Rock, die blaue Jacke, das weiße Hemd.',
              ru: 'Выучите слабые окончания прилагательных после определённого артикля и dieser/jeder/welcher: der rote Rock, die blaue Jacke, das weiße Hemd.',
              ua: 'Вивчіть слабкі закінчення прикметників після означеного артикля та dieser/jeder/welcher: der rote Rock, die blaue Jacke, das weiße Hemd.' } },
    { type: 'grammar', grammarFocus: 'Mixed adjective declension', drill: 'adjektiv-gemischt',
      text: { en: 'Use mixed endings after ein/kein/mein: if the article has no ending, the adjective shows gender/case (ein roter Rock, ein weißes Hemd, eine rote Bluse).',
              ru: 'Используйте смешанные окончания после ein/kein/mein: если у артикля нет окончания, прилагательное показывает род/падеж (ein roter Rock, ein weißes Hemd, eine rote Bluse).',
              ua: 'Використовуйте змішані закінчення після ein/kein/mein: якщо артикль не має закінчення, прикметник показує рід/відмінок (ein roter Rock, ein weißes Hemd, eine rote Bluse).' } },
    { type: 'listen',
      text: { en: 'Listen to the dialogue "Im Kleidungsgeschäft" and answer the true/false questions. Note the verb anprobieren (to try on); remember that anziehen/ausziehen (put on / take off clothes) differs from the reflexive sich anziehen (get dressed).',
              ru: 'Прослушайте диалог «Im Kleidungsgeschäft» и ответьте на вопросы верно/неверно. Обратите внимание на глагол anprobieren (примерять); помните, что anziehen/ausziehen (надевать/снимать вещь) отличается от возвратного sich anziehen (одеваться).',
              ua: 'Прослухайте діалог «Im Kleidungsgeschäft» і дайте відповіді правда/неправда. Зверніть увагу на дієслово anprobieren (приміряти); пам’ятайте, що anziehen/ausziehen (вдягати/знімати річ) відрізняється від зворотного sich anziehen (одягатися).' } },
    { type: 'write',
      text: { en: 'Describe three outfits in 60–80 words: what you wear on a workday, at the weekend and to a party.',
              ru: 'Опишите три наряда в 60–80 словах: что вы носите в рабочий день, в выходные и на вечеринку.',
              ua: 'Опишіть три вбрання у 60–80 словах: що ви носите в робочий день, на вихідних і на вечірку.' },
      checklist: [
        { en: 'Use at least four color adjectives with the correct ending.', ru: 'Используйте минимум четыре прилагательных-цвета с правильным окончанием.', ua: 'Використайте щонайменше чотири прикметники-кольори з правильним закінченням.' },
        { en: 'Include one weak (der rote …) and one mixed (ein roter …) phrase.', ru: 'Добавьте одну слабую (der rote …) и одну смешанную (ein roter …) конструкцию.', ua: 'Додайте одну слабку (der rote …) і одну змішану (ein roter …) конструкцію.' },
        { en: 'Use the verb tragen at least twice.', ru: 'Используйте глагол tragen минимум дважды.', ua: 'Використайте дієслово tragen щонайменше двічі.' },
      ] },
    { type: 'review', drill: 'adjektiv-schwach',
      text: { en: 'Review week 20: an adjective-ending cloze, then a spoken TTS dictation of clothing and color words.',
              ru: 'Повторение недели 20: клоуз на окончания прилагательных, затем TTS-диктант слов об одежде и цветах.',
              ua: 'Повторення тижня 20: клоуз на закінчення прикметників, потім TTS-диктант слів про одяг і кольори.' } },
  ],

  canDo: [
    { en: 'I can use weak adjective endings after the definite article (der rote Mantel).', ru: 'Я могу использовать слабые окончания прилагательных после определённого артикля (der rote Mantel).', ua: 'Я можу використовувати слабкі закінчення прикметників після означеного артикля (der rote Mantel).' },
    { en: 'I can use mixed adjective endings after ein/kein/mein (ein roter Mantel).', ru: 'Я могу использовать смешанные окончания после ein/kein/mein (ein roter Mantel).', ua: 'Я можу використовувати змішані закінчення після ein/kein/mein (ein roter Mantel).' },
    { en: 'I can follow a clothing-shop dialogue and answer questions about it.', ru: 'Я могу понять диалог в магазине одежды и ответить на вопросы по нему.', ua: 'Я можу зрозуміти діалог у магазині одягу й відповісти на питання за ним.' },
    { en: 'I can describe my outfits and their colors in writing.', ru: 'Я могу письменно описать свои наряды и их цвета.', ua: 'Я можу письмово описати свої вбрання та їхні кольори.' },
    { en: 'I can choose the right adjective ending in weak and mixed positions.', ru: 'Я могу выбрать правильное окончание прилагательного в слабой и смешанной позиции.', ua: 'Я можу вибрати правильне закінчення прикметника у слабкій і змішаній позиції.' },
  ],

  drills: {
    'adjektiv-schwach': {
      level: 'A2',
      concept: { en: 'Weak adjective endings after the definite article', ru: 'Слабые окончания прилагательных после определённого артикля', ua: 'Слабкі закінчення прикметників після означеного артикля' },
      prompt:  { en: 'Add the correct weak adjective ending.', ru: 'Добавьте правильное слабое окончание прилагательного.', ua: 'Додайте правильне слабке закінчення прикметника.' },
      items: [
        { type: 'cloze',  de: 'Der ___ Rock gefällt mir. (rot)', answer: 'rote' },
        { type: 'choice', de: 'Ich nehme die ___ Jacke. (blau)', answer: 'blaue', options: ['blau', 'blaue', 'blauen'] },
        { type: 'order',  answer: ['Ich', 'trage', 'den', 'schwarzen', 'Mantel'] },
      ],
    },
    'adjektiv-gemischt': {
      level: 'A2',
      concept: { en: 'Mixed adjective endings after ein/kein/mein', ru: 'Смешанные окончания прилагательных после ein/kein/mein', ua: 'Змішані закінчення прикметників після ein/kein/mein' },
      prompt:  { en: 'Add the correct mixed adjective ending.', ru: 'Добавьте правильное смешанное окончание прилагательного.', ua: 'Додайте правильне змішане закінчення прикметника.' },
      items: [
        { type: 'cloze',  de: 'Das ist ein ___ Hemd. (weiß)', answer: 'weißes' },
        { type: 'choice', de: 'Er kauft einen ___ Pullover. (grün)', answer: 'grünen', options: ['grüne', 'grünen', 'grünes'] },
        { type: 'order',  answer: ['Sie', 'trägt', 'eine', 'rote', 'Bluse'] },
      ],
    },
  },

  dialogue: {
    slug: 'w20-im-kleidungsgeschaeft',
    level: 'A2',
    vocabularyMaxWeek: 20,
    title: { en: 'At the clothing shop', ru: 'В магазине одежды', ua: 'У магазині одягу' },
    lines: [
      { speaker: 'A', de: 'Guten Tag! Kann ich Ihnen helfen?' },
      { speaker: 'B', de: 'Ja, ich suche einen blauen Pullover.' },
      { speaker: 'A', de: 'Welche Größe tragen Sie?' },
      { speaker: 'B', de: 'Größe M. Kann ich auch den roten Rock anprobieren?' },
      { speaker: 'A', de: 'Natürlich. Die Kabine ist dort rechts.' },
      { speaker: 'B', de: 'Der Rock passt gut, aber der Pullover ist zu klein.' },
    ],
    questions: [
      { de: 'Der Kunde sucht einen blauen Pullover.', answer: true, text: { en: 'The customer is looking for a blue sweater.', ru: 'Клиент ищет синий свитер.', ua: 'Клієнт шукає синій светр.' } },
      { de: 'Der rote Rock passt nicht.', answer: false, text: { en: 'The red skirt does not fit.', ru: 'Красная юбка не подходит.', ua: 'Червона спідниця не підходить.' } },
      { de: 'Der Pullover ist zu klein.', answer: true, text: { en: 'The sweater is too small.', ru: 'Свитер слишком мал.', ua: 'Светр замалий.' } },
    ],
  },
};

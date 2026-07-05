/* Week 10 — City & orientation; Imperativ (A1, phase A1.2). Days 46–50. Reuses v1 W7 (city). */
module.exports = {
  n: 10,
  phase: 'A1.2',
  level: 'A1',
  theme:      { en: 'City & directions; Imperativ', ru: 'Город и ориентация; Imperativ', ua: 'Місто й орієнтація; Imperativ' },
  grammar:    { en: 'Imperativ (du/ihr/Sie) + special forms; giving directions', ru: 'Imperativ (du/ihr/Sie) + особые формы; объяснение дороги', ua: 'Imperativ (du/ihr/Sie) + особливі форми; пояснення дороги' },
  vocabTheme: { en: 'city, orientation', ru: 'город, ориентиры', ua: 'місто, орієнтири' },

  vocab: [
    { de: 'die Stadt',        en: 'city',           ru: 'город',            ua: 'місто' },
    { de: 'das Dorf',         en: 'village',        ru: 'деревня',          ua: 'село' },
    { de: 'die Straße',       en: 'street',         ru: 'улица',            ua: 'вулиця' },
    { de: 'der Platz',        en: 'square',         ru: 'площадь',          ua: 'площа' },
    { de: 'die Kreuzung',     en: 'intersection',   ru: 'перекрёсток',      ua: 'перехрестя' },
    { de: 'die Ampel',        en: 'traffic light',  ru: 'светофор',         ua: 'світлофор' },
    { de: 'die Brücke',       en: 'bridge',         ru: 'мост',             ua: 'міст' },
    { de: 'das Krankenhaus',  en: 'hospital',       ru: 'больница',         ua: 'лікарня' },
    { de: 'die Apotheke',     en: 'pharmacy',       ru: 'аптека',           ua: 'аптека' },
    { de: 'die Post',         en: 'post office',    ru: 'почта',            ua: 'пошта' },
    { de: 'die Bank',         en: 'bank',           ru: 'банк',             ua: 'банк' },
    { de: 'die Kirche',       en: 'church',         ru: 'церковь',          ua: 'церква' },
    { de: 'das Rathaus',      en: 'town hall',      ru: 'ратуша',           ua: 'ратуша' },
    { de: 'das Kino',         en: 'cinema',         ru: 'кинотеатр',        ua: 'кінотеатр' },
    { de: 'die Bibliothek',   en: 'library',        ru: 'библиотека',       ua: 'бібліотека' },
    { de: 'das Stadtzentrum', en: 'city centre',    ru: 'центр города',     ua: 'центр міста' },
    { de: 'geradeaus',        en: 'straight ahead', ru: 'прямо',            ua: 'прямо' },
    { de: 'links',            en: 'left',           ru: 'налево',           ua: 'ліворуч' },
    { de: 'rechts',           en: 'right',          ru: 'направо',          ua: 'праворуч' },
    { de: 'die Ecke',         en: 'corner',         ru: 'угол',             ua: 'ріг' },
    { de: 'weit',             en: 'far',            ru: 'далеко',           ua: 'далеко' },
    { de: 'nah',              en: 'near',           ru: 'близко',           ua: 'близько' },
  ],

  verbFocus: ['abbiegen', 'nehmen', 'geben', 'fahren', 'sein', 'fragen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Imperativ du/ihr', drill: 'imperativ-du-ihr',
      text: { en: 'Imperativ for du and ihr: Mach! Geht! (drop the -st ending for du).', ru: 'Imperativ для du и ihr: Mach! Geht! (у du отбрасываем -st).', ua: 'Imperativ для du та ihr: Mach! Geht! (у du відкидаємо -st).' } },
    { type: 'grammar', grammarFocus: 'Imperativ Sie + special forms', drill: 'imperativ-sie',
      text: { en: 'Imperativ Sie (Nehmen Sie!) and special forms: Sei! Nimm! Gib!', ru: 'Imperativ Sie (Nehmen Sie!) и особые формы: Sei! Nimm! Gib!', ua: 'Imperativ Sie (Nehmen Sie!) та особливі форми: Sei! Nimm! Gib!' } },
    { type: 'grammar', grammarFocus: 'Directions', drill: 'wegbeschreibung',
      text: { en: 'Giving directions: geradeaus, links/rechts abbiegen, bis zur Ampel.', ru: 'Объяснение дороги: geradeaus, links/rechts abbiegen, bis zur Ampel.', ua: 'Пояснення дороги: geradeaus, links/rechts abbiegen, bis zur Ampel.' } },
    { type: 'write',
      text: { en: 'Describe the route from home to the station — 8 steps in the Imperativ.', ru: 'Опишите маршрут от дома до вокзала — 8 шагов в Imperativ.', ua: 'Опишіть маршрут від дому до вокзалу — 8 кроків у Imperativ.' },
      checklist: [
        { en: 'Use at least 5 imperatives.', ru: 'Используйте хотя бы 5 повелительных форм.', ua: 'Використайте щонайменше 5 наказових форм.' },
        { en: 'Include links/rechts abbiegen and geradeaus.', ru: 'Включите links/rechts abbiegen и geradeaus.', ua: 'Включіть links/rechts abbiegen і geradeaus.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: dictation of numbers and times; revisit the weakest cards.', ru: 'День повторения: диктант чисел и времени; повторите слабейшие карточки.', ua: 'День повторення: диктант чисел і часу; повторіть найслабші картки.' } },
  ],

  canDo: [
    { en: 'I can give simple commands with du and ihr.', ru: 'Я могу давать простые команды с du и ihr.', ua: 'Я можу давати прості команди з du та ihr.' },
    { en: 'I can give polite commands with Sie.', ru: 'Я могу давать вежливые команды с Sie.', ua: 'Я можу давати ввічливі команди з Sie.' },
    { en: 'I can explain the way to a place.', ru: 'Я могу объяснить дорогу к месту.', ua: 'Я можу пояснити дорогу до місця.' },
    { en: 'I can write directions from A to B.', ru: 'Я могу написать маршрут от A до B.', ua: 'Я можу написати маршрут від A до B.' },
    { en: 'I can understand numbers and times by ear.', ru: 'Я могу понимать числа и время на слух.', ua: 'Я можу розуміти числа й час на слух.' },
  ],

  drills: {
    'imperativ-du-ihr': {
      level: 'A1',
      concept: { en: 'Imperativ for du and ihr', ru: 'Imperativ для du и ihr', ua: 'Imperativ для du та ihr' },
      prompt:  { en: 'Form the imperative.', ru: 'Образуйте повелительное наклонение.', ua: 'Утворіть наказовий спосіб.' },
      items: [
        { type: 'cloze',  de: '___ langsam! (du, fahren)', answer: 'Fahr' },
        { type: 'cloze',  de: '___ nach links! (ihr, gehen)', answer: 'Geht' },
        { type: 'choice', de: '___ das Fenster auf! (du, aufmachen)', answer: 'Mach', options: ['Mach', 'Machst', 'Macht'] },
      ],
    },
    'imperativ-sie': {
      level: 'A1',
      concept: { en: 'Imperativ Sie and special forms', ru: 'Imperativ Sie и особые формы', ua: 'Imperativ Sie та особливі форми' },
      prompt:  { en: 'Form the polite imperative.', ru: 'Образуйте вежливое повеление.', ua: 'Утворіть ввічливий наказ.' },
      items: [
        { type: 'cloze',  de: '___ Sie bitte hier! (warten)', answer: 'Warten' },
        { type: 'choice', de: '___ Sie die nächste Straße! (nehmen)', answer: 'Nehmen', options: ['Nehmen', 'Nimm', 'Nehmt'] },
        { type: 'order',  answer: ['Biegen', 'Sie', 'rechts', 'ab'] },
      ],
    },
    'wegbeschreibung': {
      level: 'A1',
      concept: { en: 'Giving directions', ru: 'Объяснение дороги', ua: 'Пояснення дороги' },
      prompt:  { en: 'Choose the right direction word.', ru: 'Выберите правильное слово направления.', ua: 'Виберіть правильне слово напрямку.' },
      items: [
        { type: 'choice', de: 'Gehen Sie ___ bis zur Ampel.', answer: 'geradeaus', options: ['geradeaus', 'links', 'rechts'] },
        { type: 'cloze',  de: 'An der Kreuzung biegen Sie ___ ab. (left)', answer: 'links' },
        { type: 'order',  answer: ['Das', 'Kino', 'ist', 'an', 'der', 'Ecke'] },
      ],
    },
  },

  dialogue: {
    slug: 'w10-wegbeschreibung',
    level: 'A1',
    vocabularyMaxWeek: 10,
    title: { en: 'Asking for the way', ru: 'Спросить дорогу', ua: 'Запитати дорогу' },
    lines: [
      { speaker: 'A', de: 'Entschuldigung, wo ist die Post?' },
      { speaker: 'B', de: 'Gehen Sie geradeaus bis zur Ampel.' },
      { speaker: 'B', de: 'Dann biegen Sie rechts ab. Die Post ist an der Ecke.' },
      { speaker: 'A', de: 'Ist es weit?' },
      { speaker: 'B', de: 'Nein, nur fünf Minuten.' },
    ],
    questions: [
      { de: 'Die Post ist links.', answer: false, text: { en: 'The post office is on the left.', ru: 'Почта слева.', ua: 'Пошта ліворуч.' } },
      { de: 'Man muss bis zur Ampel geradeaus gehen.', answer: true, text: { en: 'You go straight to the traffic light.', ru: 'Нужно идти прямо до светофора.', ua: 'Треба йти прямо до світлофора.' } },
      { de: 'Die Post ist weit weg.', answer: false, text: { en: 'The post office is far away.', ru: 'Почта далеко.', ua: 'Пошта далеко.' } },
    ],
  },
};

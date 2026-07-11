/* Week 35 — Exam: Lesen + Hören (B1, phase Pruefung). Days 171–175. Original exam-format simulations (no copied material). */
module.exports = {
  n: 35,
  phase: 'Pruefung',
  level: 'B1',
  theme:      { en: 'Exam: Lesen + Hören', ru: 'Экзамен: Lesen + Hören', ua: 'Іспит: Lesen + Hören' },
  grammar:    { en: 'No new grammar — reading and listening exam strategies + original simulations', ru: 'Без новой грамматики — стратегии Lesen/Hören + оригинальные симуляции', ua: 'Без нової граматики — стратегії Lesen/Hören + оригінальні симуляції' },
  vocabTheme: { en: 'exam instruction words', ru: 'инструкционные слова', ua: 'інструкційні слова' },

  vocab: [
    { de: 'die Anzeige',    en: 'advertisement / notice', ru: 'объявление',   ua: 'оголошення' },
    { de: 'die Überschrift', en: 'heading',               ru: 'заголовок',    ua: 'заголовок' },
    { de: 'die Aufgabe',    en: 'task',                   ru: 'задание',      ua: 'завдання' },
    { de: 'der Absatz',     en: 'paragraph',              ru: 'абзац',        ua: 'абзац' },
    { de: 'die Lücke',      en: 'gap',                    ru: 'пропуск',      ua: 'пропуск' },
    { de: 'ankreuzen',      en: 'to tick / mark',         ru: 'отметить',     ua: 'позначити' },
    { de: 'richtig',        en: 'correct',                ru: 'правильно',    ua: 'правильно' },
    { de: 'falsch',         en: 'wrong',                  ru: 'неправильно',  ua: 'неправильно' },
    { de: 'die Zusammenfassung', en: 'summary',           ru: 'краткое изложение', ua: 'стислий виклад' },
    { de: 'der Hinweis',    en: 'hint / clue',            ru: 'подсказка',    ua: 'підказка' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'test',
      text: { en: 'Lesen strategies + an original B1 exam-format reading simulation.', ru: 'Стратегии Lesen + оригинальная B1 симуляция чтения.', ua: 'Стратегії Lesen + оригінальна B1 симуляція читання.' } },
    { type: 'test',
      text: { en: 'Hören strategies + an original B1 exam-format listening simulation (TTS).', ru: 'Стратегии Hören + оригинальная B1 симуляция аудирования (TTS).', ua: 'Стратегії Hören + оригінальна B1 симуляція аудіювання (TTS).' } },
    { type: 'read',
      text: { en: 'Second original B1 exam-format reading simulation under time.', ru: 'Вторая оригинальная B1 симуляция чтения на время.', ua: 'Друга оригінальна B1 симуляція читання на час.' } },
    { type: 'test',
      text: { en: 'Second original B1 exam-format listening simulation (TTS).', ru: 'Вторая оригинальная B1 симуляция аудирования (TTS).', ua: 'Друга оригінальна B1 симуляція аудіювання (TTS).' } },
    { type: 'review',
      text: { en: 'Error analysis: review the four simulations; weak spots go to the trainer.', ru: 'Разбор ошибок: анализ четырёх симуляций; слабые места → в тренажёр.', ua: 'Розбір помилок: аналіз чотирьох симуляцій; слабкі місця → у тренажер.' } },
  ],

  canDo: [
    { en: 'I can use reading strategies under time.', ru: 'Я могу применять стратегии чтения на время.', ua: 'Я можу застосовувати стратегії читання на час.' },
    { en: 'I can use listening strategies in an exam.', ru: 'Я могу применять стратегии аудирования на экзамене.', ua: 'Я можу застосовувати стратегії аудіювання на іспиті.' },
    { en: 'I can complete a B1 reading section.', ru: 'Я могу выполнить раздел чтения B1.', ua: 'Я можу виконати розділ читання B1.' },
    { en: 'I can complete a B1 listening section.', ru: 'Я могу выполнить раздел аудирования B1.', ua: 'Я можу виконати розділ аудіювання B1.' },
    { en: 'I can analyse my mistakes and close gaps.', ru: 'Я могу разобрать ошибки и закрыть пробелы.', ua: 'Я можу розібрати помилки й закрити прогалини.' },
  ],

  drills: {},

  dialogue: {
    slug: 'w35-hoeren-sim',
    level: 'B1',
    vocabularyMaxWeek: 35,
    title: { en: 'Listening simulation', ru: 'Симуляция аудирования', ua: 'Симуляція аудіювання' },
    lines: [
      { speaker: 'Sprecher', de: 'Willkommen zur Führung durch das Museum.' },
      { speaker: 'Sprecher', de: 'Die Ausstellung im ersten Stock ist heute leider geschlossen.' },
      { speaker: 'Sprecher', de: 'Fotografieren ist erlaubt, aber bitte ohne Blitz.' },
    ],
    questions: [
      { de: 'Die Ausstellung im ersten Stock ist heute offen.', answer: false, text: { en: 'The first-floor exhibition is open today.', ru: 'Выставка на втором этаже сегодня открыта.', ua: 'Виставка на другому поверсі сьогодні відкрита.' } },
      { de: 'Man darf fotografieren.', answer: true, text: { en: 'Photography is allowed.', ru: 'Фотографировать можно.', ua: 'Фотографувати можна.' } },
      { de: 'Man darf mit Blitz fotografieren.', answer: false, text: { en: 'Flash photography is allowed.', ru: 'Можно снимать со вспышкой.', ua: 'Можна знімати зі спалахом.' } },
    ],
  },
};

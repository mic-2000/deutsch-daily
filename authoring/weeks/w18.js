/* Week 18 — A2.1 consolidation + technology (A2, phase A2.1). Days 86–90. Day 90 = A2-mid milestone. */
module.exports = {
  n: 18,
  phase: 'A2.1',
  level: 'A2',
  theme:      { en: 'A2.1 consolidation + technology', ru: 'Консолидация A2.1 + техника', ua: 'Консолідація A2.1 + техніка' },
  grammar:    { en: 'Review of tenses, subordinate clauses and Komparativ; A2-mid check', ru: 'Повторение времён, придаточных и Komparativ; промежуточная проверка A2', ua: 'Повторення часів, підрядних і Komparativ; проміжна перевірка A2' },
  vocabTheme: { en: 'technology, communication', ru: 'техника, связь', ua: 'техніка, зв’язок' },

  vocab: [
    { de: 'das Handy',      en: 'mobile phone',  ru: 'мобильный телефон', ua: 'мобільний телефон' },
    { de: 'das Smartphone', en: 'smartphone',    ru: 'смартфон',      ua: 'смартфон' },
    { de: 'der Computer',   en: 'computer',      ru: 'компьютер',     ua: 'комп’ютер' },
    { de: 'die E-Mail',     en: 'email',         ru: 'электронная почта', ua: 'електронна пошта' },
    { de: 'das Internet',   en: 'internet',      ru: 'интернет',      ua: 'інтернет' },
    { de: 'die Nachricht',  en: 'message',       ru: 'сообщение',     ua: 'повідомлення' },
    { de: 'die App',        en: 'app',           ru: 'приложение',    ua: 'застосунок' },
    { de: 'das Passwort',   en: 'password',      ru: 'пароль',        ua: 'пароль' },
    { de: 'der Bildschirm', en: 'screen',        ru: 'экран',         ua: 'екран' },
    { de: 'online',         en: 'online',        ru: 'онлайн',        ua: 'онлайн' },
    { de: 'herunterladen',  en: 'to download',   ru: 'скачивать',     ua: 'завантажувати' },
    { de: 'die Datei',      en: 'file',          ru: 'файл',          ua: 'файл' },
  ],

  verbFocus: ['schicken', 'telefonieren'],

  tasks: [
    { type: 'review', drill: 'zeiten-wdh-a2',
      text: { en: 'Consolidation: Perfekt / Präteritum / Plusquamperfekt; new technology words.', ru: 'Консолидация: Perfekt / Präteritum / Plusquamperfekt; новые слова о технике.', ua: 'Консолідація: Perfekt / Präteritum / Plusquamperfekt; нові слова про техніку.' } },
    { type: 'review',
      text: { en: 'Consolidation: subordinate clause word order and Komparativ.', ru: 'Консолидация: порядок слов в придаточных и Komparativ.', ua: 'Консолідація: порядок слів у підрядних і Komparativ.' } },
    { type: 'listen',
      text: { en: 'Mini A2 Hören: a two-voice dialogue with three comprehension checks.', ru: 'Мини A2 Hören: диалог в два голоса с тремя проверками.', ua: 'Міні A2 Hören: діалог у два голоси з трьома перевірками.' } },
    { type: 'write',
      text: { en: 'Write an email to a friend — 60–80 words with at least 2 subordinate clauses.', ru: 'Напишите e-mail другу — 60–80 слов с минимум 2 придаточными.', ua: 'Напишіть e-mail другу — 60–80 слів із щонайменше 2 підрядними.' },
      checklist: [
        { en: 'Use a greeting and a closing.', ru: 'Используйте приветствие и прощание.', ua: 'Використайте привітання і прощання.' },
        { en: 'Include weil or dass.', ru: 'Включите weil или dass.', ua: 'Включіть weil або dass.' },
      ] },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE: A2-mid check — a reading task plus 20 grammar points from weeks 13–17.', ru: 'КОНТРОЛЬНАЯ ТОЧКА: промежуточная проверка A2 — задание на чтение и 20 грамматических заданий по материалу недель 13–17.', ua: 'КОНТРОЛЬНА ТОЧКА: проміжна перевірка A2 — завдання на читання і 20 граматичних завдань за матеріалом тижнів 13–17.' } },
  ],

  canDo: [
    { en: 'I can talk about the past with the right tense.', ru: 'Я могу говорить о прошлом с правильным временем.', ua: 'Я можу говорити про минуле з правильним часом.' },
    { en: 'I can build correct subordinate clauses.', ru: 'Я могу строить правильные придаточные.', ua: 'Я можу будувати правильні підрядні.' },
    { en: 'I can follow a short technology dialogue.', ru: 'Я могу понять короткий диалог о технике.', ua: 'Я можу зрозуміти короткий діалог про техніку.' },
    { en: 'I can write a clear email to a friend.', ru: 'Я могу написать понятный e-mail другу.', ua: 'Я можу написати зрозумілий e-mail другу.' },
    { en: 'I can assess my progress at the A2 midpoint.', ru: 'Я могу оценить свой прогресс в середине уровня A2.', ua: 'Я можу оцінити свій прогрес у середині рівня A2.' },
  ],

  drills: {
    'zeiten-wdh-a2': {
      level: 'A2',
      concept: { en: 'Review: past tenses', ru: 'Повторение: прошедшие времена', ua: 'Повторення: минулі часи' },
      prompt:  { en: 'Choose the right past-tense form.', ru: 'Выберите правильную форму прошедшего.', ua: 'Виберіть правильну форму минулого.' },
      items: [
        { type: 'choice', de: 'Gestern ___ ich einen Film gesehen.', answer: 'habe', options: ['habe', 'bin', 'hatte'] },
        { type: 'cloze',  de: 'Nachdem er gegessen ___, ging er zur Arbeit. (Plusquamperfekt, haben)', answer: 'hatte' },
        { type: 'choice', de: 'Als Kind ___ ich viel Sport.', answer: 'machte', options: ['machte', 'gemacht', 'mache'] },
      ],
    },
  },

  dialogue: {
    slug: 'w18-technik',
    level: 'A2',
    vocabularyMaxWeek: 18,
    title: { en: 'A problem with the phone', ru: 'Проблема с телефоном', ua: 'Проблема з телефоном' },
    lines: [
      { speaker: 'A', de: 'Die App auf meinem Handy funktioniert nicht mehr.' },
      { speaker: 'B', de: 'Hast du die App neu heruntergeladen?' },
      { speaker: 'A', de: 'Ja, aber ich habe mein Passwort vergessen.' },
      { speaker: 'B', de: 'Kein Problem, ich schicke dir eine E-Mail mit einem neuen Passwort.' },
    ],
    questions: [
      { de: 'Die App funktioniert nicht.', answer: true, text: { en: 'The app does not work.', ru: 'Приложение не работает.', ua: 'Застосунок не працює.' } },
      { de: 'A hat das Passwort vergessen.', answer: true, text: { en: 'A forgot the password.', ru: 'A забыл пароль.', ua: 'A забув пароль.' } },
      { de: 'B kann nicht helfen.', answer: false, text: { en: 'B cannot help.', ru: 'B не может помочь.', ua: 'B не може допомогти.' } },
    ],
  },
};

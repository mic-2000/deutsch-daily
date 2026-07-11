/* Week 6 — Time and calendar; A1.1 consolidation (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 26–30.
   Consolidation week: 0 new verbs; day 30 is the A1.1 MILESTONE self-test. Vocab is NEW calendar
   lexis (weekdays, months, clock, calendar). */
module.exports = {
  n: 6,
  phase: 'A1.1',
  level: 'A1',
  theme:      { en: 'Time and calendar (A1.1 consolidation)', ru: 'Время и календарь (консолидация A1.1)', ua: 'Час і календар (консолідація A1.1)' },
  grammar:    { en: 'Time prepositions am/im/um/von…bis, clock times, ordinal numbers and dates, review of the cases',
                ru: 'Предлоги времени am/im/um/von…bis, время на часах, порядковые числа и даты, повторение падежей',
                ua: 'Прийменники часу am/im/um/von…bis, час на годиннику, порядкові числа й дати, повторення відмінків' },
  vocabTheme: { en: 'days of the week, months, clock', ru: 'дни недели, месяцы, часы', ua: 'дні тижня, місяці, годинник' },

  vocab: [
    // days of the week (NEW)
    { de: 'der Montag',     en: 'Monday',    ru: 'понедельник', ua: 'понеділок' },
    { de: 'der Dienstag',   en: 'Tuesday',   ru: 'вторник',     ua: 'вівторок' },
    { de: 'der Mittwoch',   en: 'Wednesday', ru: 'среда',       ua: 'середа' },
    { de: 'der Donnerstag', en: 'Thursday',  ru: 'четверг',     ua: 'четвер' },
    { de: 'der Freitag',    en: 'Friday',    ru: 'пятница',     ua: 'п’ятниця' },
    { de: 'der Samstag',    en: 'Saturday',  ru: 'суббота',     ua: 'субота' },
    { de: 'der Sonntag',    en: 'Sunday',    ru: 'воскресенье', ua: 'неділя' },
    // months (NEW)
    { de: 'der Januar',   en: 'January',   ru: 'январь',   ua: 'січень' },
    { de: 'der Februar',  en: 'February',  ru: 'февраль',  ua: 'лютий' },
    { de: 'der März',     en: 'March',     ru: 'март',     ua: 'березень' },
    { de: 'der April',    en: 'April',     ru: 'апрель',   ua: 'квітень' },
    { de: 'der Mai',      en: 'May',       ru: 'май',      ua: 'травень' },
    { de: 'der Juni',     en: 'June',      ru: 'июнь',     ua: 'червень' },
    { de: 'der Juli',     en: 'July',      ru: 'июль',     ua: 'липень' },
    { de: 'der August',   en: 'August',    ru: 'август',   ua: 'серпень' },
    { de: 'der September', en: 'September', ru: 'сентябрь', ua: 'вересень' },
    { de: 'der Oktober',  en: 'October',   ru: 'октябрь',  ua: 'жовтень' },
    { de: 'der November', en: 'November',  ru: 'ноябрь',   ua: 'листопад' },
    { de: 'der Dezember', en: 'December',  ru: 'декабрь',  ua: 'грудень' },
    // clock / calendar (NEW)
    { de: 'die Uhr',      en: 'clock, o’clock', ru: 'часы, час (на часах)', ua: 'годинник, година (на годиннику)' },
    { de: 'die Stunde',   en: 'hour',       ru: 'час',      ua: 'година' },
    { de: 'die Minute',   en: 'minute',     ru: 'минута',   ua: 'хвилина' },
    { de: 'die Woche',    en: 'week',       ru: 'неделя',   ua: 'тиждень' },
    { de: 'der Monat',    en: 'month',      ru: 'месяц',    ua: 'місяць' },
    { de: 'das Datum',    en: 'date',       ru: 'дата',     ua: 'дата' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'grammar', grammarFocus: 'Time prepositions am/im/um/von…bis', drill: 'zeit-praepositionen',
      text: { en: 'Learn the time prepositions: am (days), im (months), um (clock time) and von … bis.',
              ru: 'Выучите предлоги времени: am (дни), im (месяцы), um (время), von … bis.',
              ua: 'Вивчіть прийменники часу: am (дні), im (місяці), um (час), von … bis.' } },
    { type: 'grammar', grammarFocus: 'Clock times and ordinal dates', drill: 'uhrzeit-datum',
      text: { en: 'Tell the time with halb and Viertel, and say dates with ordinal numbers (am 3. Mai).',
              ru: 'Называйте время с halb и Viertel и даты порядковыми числами (am 3. Mai).',
              ua: 'Називайте час з halb і Viertel та дати порядковими числами (am 3. Mai).' } },
    { type: 'review', drill: 'dativ-artikel',
      text: { en: 'Cumulative case review: work through the der→den→dem table across Nominativ, Akkusativ and Dativ.',
              ru: 'Кумулятивное повторение падежей: пройдите таблицу der→den→dem по Nominativ, Akkusativ и Dativ.',
              ua: 'Кумулятивне повторення відмінків: пройдіть таблицю der→den→dem за Nominativ, Akkusativ та Dativ.' } },
    { type: 'write',
      text: { en: 'Skills check: write “My day by the clock” in 6–8 sentences, then do a time dictation.',
              ru: 'Проверка навыков: напишите «Мой день по часам» в 6–8 предложениях, затем сделайте диктант времени.',
              ua: 'Перевірка навичок: напишіть «Мій день за годинником» у 6–8 реченнях, потім зробіть диктант часу.' },
      checklist: [
        { en: 'Give at least four clock times with um … Uhr.', ru: 'Укажите время минимум четыре раза с um … Uhr.', ua: 'Вкажіть час щонайменше чотири рази з um … Uhr.' },
        { en: 'Use am with a day of the week at least once.', ru: 'Используйте am с днём недели хотя бы раз.', ua: 'Використайте am з днем тижня хоча б раз.' },
        { en: 'Write down every time you hear in the dictation.', ru: 'Запишите каждое время, которое слышите в диктанте.', ua: 'Запишіть кожен час, який чуєте в диктанті.' },
      ] },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE — A1.1 self-test: cover the grammar and vocabulary of weeks 1–5, then review your mistakes.',
              ru: 'КОНТРОЛЬНАЯ ТОЧКА — самотест A1.1: проверьте грамматику и словарь недель 1–5, затем разберите ошибки.',
              ua: 'КОНТРОЛЬНА ТОЧКА — самотест A1.1: перевірте граматику й словник тижнів 1–5, потім розберіть помилки.' } },
  ],

  canDo: [
    { en: 'I can say when something happens with am, im, um and von … bis.', ru: 'Я могу сказать, когда что-то происходит, с am, im, um и von … bis.', ua: 'Я можу сказати, коли щось відбувається, з am, im, um та von … bis.' },
    { en: 'I can tell the time and say dates with ordinal numbers.', ru: 'Я могу называть время и даты порядковыми числами.', ua: 'Я можу називати час і дати порядковими числами.' },
    { en: 'I can recognise and use the three cases (Nominativ, Akkusativ, Dativ).', ru: 'Я могу распознавать и использовать три падежа (Nominativ, Akkusativ, Dativ).', ua: 'Я можу розпізнавати й використовувати три відмінки (Nominativ, Akkusativ, Dativ).' },
    { en: 'I can describe my day by the clock and write down times I hear.', ru: 'Я могу описать свой день по часам и записать время на слух.', ua: 'Я можу описати свій день за годинником і записати час на слух.' },
    { en: 'I can pass a self-test covering the A1.1 grammar and vocabulary.', ru: 'Я могу пройти самотест по грамматике и словарю A1.1.', ua: 'Я можу пройти самотест з граматики й словника A1.1.' },
  ],

  drills: {
    'zeit-praepositionen': {
      level: 'A1',
      concept: { en: 'Time prepositions am/im/um/von…bis', ru: 'Предлоги времени am/im/um/von…bis', ua: 'Прийменники часу am/im/um/von…bis' },
      prompt:  { en: 'Fill in the right time preposition.', ru: 'Вставьте правильный предлог времени.', ua: 'Вставте правильний прийменник часу.' },
      items: [
        { type: 'cloze',  de: '___ Montag arbeite ich. (Tag)', answer: 'Am' },
        { type: 'choice', de: 'Ich habe ___ Juli Urlaub. (Monat)', answer: 'im', options: ['am', 'im', 'um'] },
        { type: 'cloze',  de: 'Der Kurs beginnt ___ neun Uhr. (Uhrzeit)', answer: 'um' },
      ],
    },
    'uhrzeit-datum': {
      level: 'A1',
      concept: { en: 'Clock times (halb, Viertel) and ordinal dates', ru: 'Время (halb, Viertel) и порядковые даты', ua: 'Час (halb, Viertel) та порядкові дати' },
      prompt:  { en: 'Complete the time or the date.', ru: 'Дополните время или дату.', ua: 'Доповніть час або дату.' },
      items: [
        { type: 'cloze',  de: '8:30 Uhr = halb ___', answer: 'neun' },
        { type: 'choice', de: 'Heute ist der ___ Mai. (der 3.)', answer: 'dritte', options: ['drei', 'dritte', 'dritten'] },
        { type: 'cloze',  de: '9:15 Uhr = Viertel nach ___', answer: 'neun' },
      ],
    },
  },

  dialogue: {
    slug: 'w06-termin',
    level: 'A1',
    vocabularyMaxWeek: 6,
    title: { en: 'Making an appointment', ru: 'Договариваемся о встрече', ua: 'Домовляємося про зустріч' },
    lines: [
      { speaker: 'A', de: 'Wann hast du am Montag Zeit?' },
      { speaker: 'B', de: 'Am Montag arbeite ich bis vier Uhr.' },
      { speaker: 'A', de: 'Und am Dienstag? Vielleicht um halb sechs?' },
      { speaker: 'B', de: 'Ja, halb sechs ist gut. Wo treffen wir uns?' },
      { speaker: 'A', de: 'Im Café. Bis Dienstag!' },
    ],
    questions: [
      { de: 'Am Montag arbeitet B bis vier Uhr.', answer: true, text: { en: 'On Monday B works until four o’clock.', ru: 'В понедельник B работает до четырёх часов.', ua: 'У понеділок B працює до четвертої години.' } },
      { de: 'Sie treffen sich am Mittwoch.', answer: false, text: { en: 'They meet on Wednesday.', ru: 'Они встречаются в среду.', ua: 'Вони зустрічаються в середу.' } },
      { de: 'Sie treffen sich im Café.', answer: true, text: { en: 'They meet at the café.', ru: 'Они встречаются в кафе.', ua: 'Вони зустрічаються в кафе.' } },
    ],
  },
};

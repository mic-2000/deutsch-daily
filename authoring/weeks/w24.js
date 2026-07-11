/* Week 24 — A2 exam week (A2, phase A2.2). Days 116–120. Day 120 = milestone debrief.
   Original, exam-format-aligned tasks (no copied Goethe/telc material, no official simulation). */
module.exports = {
  n: 24,
  phase: 'A2.2',
  level: 'A2',
  theme:      { en: 'A2 exam week', ru: 'Экзаменационная неделя A2', ua: 'Екзаменаційний тиждень A2' },
  grammar:    { en: 'No new grammar — exam-format modules (Lesen/Hören/Schreiben/Sprechen)', ru: 'Без новой грамматики — экзаменационные модули (Lesen/Hören/Schreiben/Sprechen)', ua: 'Без нової граматики — екзаменаційні модулі (Lesen/Hören/Schreiben/Sprechen)' },
  vocabTheme: { en: 'useful exam words', ru: 'полезные слова для экзамена', ua: 'корисні слова для іспиту' },

  vocab: [
    { de: 'wichtig',        en: 'important',    ru: 'важный',        ua: 'важливий' },
    { de: 'ungefähr',       en: 'approximately', ru: 'примерно',     ua: 'приблизно' },
    { de: 'sofort',         en: 'immediately',  ru: 'сразу',         ua: 'одразу' },
    { de: 'normalerweise',  en: 'normally',     ru: 'обычно',        ua: 'зазвичай' },
    { de: 'endlich',        en: 'finally',      ru: 'наконец',       ua: 'нарешті' },
    { de: 'plötzlich',      en: 'suddenly',     ru: 'внезапно',      ua: 'раптово' },
    { de: 'wahrscheinlich', en: 'probably',     ru: 'вероятно',      ua: 'ймовірно' },
    { de: 'meistens',       en: 'mostly',       ru: 'чаще всего',    ua: 'здебільшого' },
    { de: 'trotzdem',       en: 'nevertheless', ru: 'тем не менее',  ua: 'попри це' },
    { de: 'inzwischen',     en: 'meanwhile',    ru: 'тем временем',  ua: 'тим часом' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'test',
      text: { en: 'Original A2 exam-format Lesen module: short texts with comprehension items.', ru: 'Оригинальный A2 экзаменационный модуль Lesen: короткие тексты с заданиями.', ua: 'Оригінальний A2 екзаменаційний модуль Lesen: короткі тексти із завданнями.' } },
    { type: 'test',
      text: { en: 'Original A2 exam-format Hören module: TTS listening with comprehension items.', ru: 'Оригинальный A2 экзаменационный модуль Hören: аудирование (TTS) с заданиями.', ua: 'Оригінальний A2 екзаменаційний модуль Hören: аудіювання (TTS) із завданнями.' } },
    { type: 'write',
      text: { en: 'Original A2 exam-format Schreiben task: a short message of 40–50 words.', ru: 'Оригинальное A2 экзаменационное задание Schreiben: короткое сообщение 40–50 слов.', ua: 'Оригінальне A2 екзаменаційне завдання Schreiben: коротке повідомлення 40–50 слів.' },
      checklist: [
        { en: 'Cover all three prompt points.', ru: 'Раскройте все три пункта задания.', ua: 'Розкрийте всі три пункти завдання.' },
        { en: 'Use a greeting and closing.', ru: 'Используйте приветствие и прощание.', ua: 'Використайте привітання і прощання.' },
      ] },
    { type: 'speak',
      text: { en: 'Original A2 exam-format Sprechen task: answer with the AI partner, or a 3-point monologue without a key.', ru: 'Оригинальное A2 задание Sprechen: ответ с AI-партнёром или монолог по 3 пунктам без ключа.', ua: 'Оригінальне A2 завдання Sprechen: відповідь з AI-партнером або монолог за 3 пунктами без ключа.' } },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE: analyse all four modules; unknown words go to the trainer. Verdict "A2 reached".', ru: 'КОНТРОЛЬНАЯ ТОЧКА: разбор всех четырёх модулей; незнакомые слова → в тренажёр. Вердикт «A2 достигнут».', ua: 'КОНТРОЛЬНА ТОЧКА: розбір усіх чотирьох модулів; незнайомі слова → у тренажер. Вердикт «A2 досягнуто».' } },
  ],

  canDo: [
    { en: 'I can handle an A2 reading task.', ru: 'Я могу справиться с заданием на чтение A2.', ua: 'Я можу впоратися із завданням на читання A2.' },
    { en: 'I can handle an A2 listening task.', ru: 'Я могу справиться с заданием на аудирование A2.', ua: 'Я можу впоратися із завданням на аудіювання A2.' },
    { en: 'I can write a short A2 message.', ru: 'Я могу написать короткое сообщение уровня A2.', ua: 'Я можу написати коротке повідомлення рівня A2.' },
    { en: 'I can speak on an A2 topic.', ru: 'Я могу говорить на тему уровня A2.', ua: 'Я можу говорити на тему рівня A2.' },
    { en: 'I can review my mistakes and confirm A2.', ru: 'Я могу разобрать ошибки и подтвердить A2.', ua: 'Я можу розібрати помилки й підтвердити A2.' },
  ],

  drills: {},

  dialogue: {
    slug: 'w24-pruefung-a2',
    level: 'A2',
    vocabularyMaxWeek: 24,
    title: { en: 'Exam-format listening (A2)', ru: 'Аудирование в формате экзамена (A2)', ua: 'Аудіювання у форматі іспиту (A2)' },
    lines: [
      { speaker: 'Ansage', de: 'Der Zug nach München fährt heute nicht um 9 Uhr, sondern um 10 Uhr.' },
      { speaker: 'Ansage', de: 'Der Grund ist ein technisches Problem.' },
      { speaker: 'Ansage', de: 'Bitte warten Sie an Gleis drei.' },
    ],
    questions: [
      { de: 'Der Zug fährt normalerweise um 9 Uhr.', answer: true, text: { en: 'The train normally leaves at 9.', ru: 'Обычно поезд отправляется в 9.', ua: 'Зазвичай потяг вирушає о 9.' } },
      { de: 'Heute fährt der Zug früher.', answer: false, text: { en: 'Today the train leaves earlier.', ru: 'Сегодня поезд отправляется раньше.', ua: 'Сьогодні потяг вирушає раніше.' } },
      { de: 'Die Reisenden sollen an Gleis drei warten.', answer: true, text: { en: 'Passengers should wait at platform three.', ru: 'Пассажирам нужно ждать на третьем пути.', ua: 'Пасажирам треба чекати на третій колії.' } },
    ],
  },
};

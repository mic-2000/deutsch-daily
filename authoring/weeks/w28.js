/* Week 28 — Processes; the passive (B1, phase B1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 136–140.
   Vocab reuses old v1 week 18 (Prozesse, Passiv), index-matched glosses (Futur-Passiv dropped;
   Modalpassiv and lassen added as grammar). The process verbs herstellen/verarbeiten/entwickeln/
   benutzen/verwenden are the verbFocus but are not yet in data/verbs.js — declared receptive. */
module.exports = {
  n: 28,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'Processes; the passive', ru: 'Процессы; пассив', ua: 'Процеси; пасив' },
  grammar:    { en: 'Passive present/past + man-sentences; modal passive; von/durch; lassen + infinitive (recognition)', ru: 'Passiv Präsens/Präteritum + man-Sätze; Modalpassiv; von/durch; lassen + Infinitiv (рецептивно)', ua: 'Passiv Präsens/Präteritum + man-Sätze; Modalpassiv; von/durch; lassen + Infinitiv (рецептивно)' },
  vocabTheme: { en: 'processes and instructions', ru: 'процессы и инструкции', ua: 'процеси та інструкції' },

  vocab: [
    { de: 'der Prozess',   en: 'process',          ru: 'процесс',       ua: 'процес' },
    { de: 'die Anweisung', en: 'instruction',      ru: 'указание',      ua: 'вказівка' },
    { de: 'die Anleitung', en: 'manual / guide',   ru: 'инструкция',    ua: 'інструкція' },
    { de: 'herstellen',    en: 'to manufacture',   ru: 'изготавливать', ua: 'виготовляти' },
    { de: 'produzieren',   en: 'to produce',       ru: 'производить',   ua: 'виробляти' },
    { de: 'verarbeiten',   en: 'to process',       ru: 'обрабатывать',  ua: 'обробляти' },
    { de: 'entwickeln',    en: 'to develop',       ru: 'разрабатывать', ua: 'розробляти' },
    { de: 'bauen',         en: 'to build',         ru: 'строить',       ua: 'будувати' },
    { de: 'reparieren',    en: 'to repair',        ru: 'ремонтировать', ua: 'ремонтувати' },
    { de: 'benutzen',      en: 'to use',           ru: 'использовать',  ua: 'використовувати' },
    { de: 'verwenden',     en: 'to use / apply',   ru: 'применять',     ua: 'застосовувати' },
    { de: 'bedienen',      en: 'to operate',       ru: 'управлять (машиной)', ua: 'керувати (машиною)' },
    { de: 'wird gebaut',   en: 'is being built',   ru: 'строится',      ua: 'будується' },
    { de: 'wurde gebaut',  en: 'was built',        ru: 'был построен',  ua: 'був побудований' },
  ],

  verbFocus: ['herstellen', 'verarbeiten', 'entwickeln', 'benutzen', 'verwenden'],
  receptiveVerbs: ['herstellen', 'verarbeiten', 'entwickeln', 'benutzen', 'verwenden'],

  tasks: [
    { type: 'grammar', grammarFocus: 'passive present and past + man', drill: 'passiv-vorgang',
      text: { en: 'Form the passive: wird/wurde gebaut, and contrast it with the man-sentence (man baut).',
              ru: 'Образуйте пассив: wird/wurde gebaut, и сравните его с предложением с man (man baut).',
              ua: 'Утворіть пасив: wird/wurde gebaut, і порівняйте його з реченням із man (man baut).' } },
    { type: 'grammar', grammarFocus: 'modal passive', drill: 'passiv-modal',
      text: { en: 'Use the passive with modal verbs: muss repariert werden, kann verstanden werden.',
              ru: 'Используйте пассив с модальными глаголами: muss repariert werden, kann verstanden werden.',
              ua: 'Використовуйте пасив із модальними дієсловами: muss repariert werden, kann verstanden werden.' } },
    { type: 'grammar', grammarFocus: 'agent with von/durch; lassen + infinitive (receptive)', drill: 'passiv-agens',
      text: { en: 'Name the agent with von (person) or durch (means); learn to understand lassen + infinitive (etwas reparieren lassen).',
              ru: 'Указывайте деятеля через von (лицо) или durch (средство); учитесь понимать lassen + инфинитив (etwas reparieren lassen).',
              ua: 'Вказуйте виконавця через von (особа) або durch (засіб); вчіться розуміти lassen + інфінітив (etwas reparieren lassen).' } },
    { type: 'write',
      text: { en: 'Write a recipe or an instruction of about 80 words using the passive and man.',
              ru: 'Напишите рецепт или инструкцию примерно на 80 слов, используя пассив и man.',
              ua: 'Напишіть рецепт або інструкцію приблизно на 80 слів, використовуючи пасив і man.' },
      checklist: [
        { en: 'Use the passive at least three times (wird … / wurde …).', ru: 'Используйте пассив минимум три раза (wird … / wurde …).', ua: 'Використайте пасив щонайменше тричі (wird … / wurde …).' },
        { en: 'Include one man-sentence as an alternative (Man nimmt …).', ru: 'Включите одно предложение с man как альтернативу (Man nimmt …).', ua: 'Включіть одне речення з man як альтернативу (Man nimmt …).' },
        { en: 'Write the steps in a clear order (zuerst, dann, danach, schließlich).', ru: 'Опишите шаги в чёткой последовательности (zuerst, dann, danach, schließlich).', ua: 'Опишіть кроки в чіткій послідовності (zuerst, dann, danach, schließlich).' },
      ] },
    { type: 'review', drill: 'passiv-vorgang',
      text: { en: 'Review week 28: an Aktiv→Passiv cloze, then explain out loud how something works or is made.',
              ru: 'Повторение недели 28: клоуз Aktiv→Passiv, затем устно объясните, как что-то работает или производится.',
              ua: 'Повторення тижня 28: клоуз Aktiv→Passiv, потім усно поясніть, як щось працює або виробляється.' } },
  ],

  canDo: [
    { en: 'I can form the passive in the present and past (wird/wurde gebaut) and contrast it with man.', ru: 'Я могу образовать пассив в настоящем и прошедшем (wird/wurde gebaut) и противопоставить его man.', ua: 'Я можу утворити пасив у теперішньому й минулому (wird/wurde gebaut) і протиставити його man.' },
    { en: 'I can use the passive with modal verbs (muss repariert werden).', ru: 'Я могу использовать пассив с модальными глаголами (muss repariert werden).', ua: 'Я можу використовувати пасив із модальними дієсловами (muss repariert werden).' },
    { en: 'I can name the agent with von or durch and understand lassen + infinitive.', ru: 'Я могу указать деятеля через von или durch и понимаю lassen + инфинитив.', ua: 'Я можу вказати виконавця через von або durch і розумію lassen + інфінітив.' },
    { en: 'I can write a short instruction or recipe using the passive.', ru: 'Я могу написать короткую инструкцию или рецепт, используя пассив.', ua: 'Я можу написати коротку інструкцію або рецепт, використовуючи пасив.' },
    { en: 'I can explain out loud how something works or is made.', ru: 'Я могу устно объяснить, как что-то работает или производится.', ua: 'Я можу усно пояснити, як щось працює або виробляється.' },
  ],

  drills: {
    'passiv-vorgang': {
      level: 'B1',
      concept: { en: 'Passive in the present and past tense', ru: 'Пассив в настоящем и прошедшем времени', ua: 'Пасив у теперішньому й минулому часі' },
      prompt:  { en: 'Put the sentence into the passive.', ru: 'Поставьте предложение в пассив.', ua: 'Поставте речення в пасив.' },
      items: [
        { type: 'cloze',  de: 'Der Käse ___ in der Fabrik hergestellt. (Präsens Passiv)', answer: 'wird' },
        { type: 'choice', de: 'Man baut hier ein Haus. → Ein Haus ___ hier gebaut.', answer: 'wird', options: ['wird', 'wurde', 'hat'] },
        { type: 'cloze',  de: 'Das Auto ___ letztes Jahr repariert. (Präteritum Passiv)', answer: 'wurde' },
      ],
    },
    'passiv-modal': {
      level: 'B1',
      concept: { en: 'Passive with modal verbs', ru: 'Пассив с модальными глаголами', ua: 'Пасив із модальними дієсловами' },
      prompt:  { en: 'Complete the modal passive.', ru: 'Дополните пассив с модальным глаголом.', ua: 'Доповніть пасив із модальним дієсловом.' },
      items: [
        { type: 'cloze',  de: 'Das Fenster ___ repariert werden. (müssen)', answer: 'muss' },
        { type: 'choice', de: 'Der Text kann leicht ___. (verstehen, Passiv)', answer: 'verstanden werden', options: ['verstanden werden', 'verstehen werden', 'verstanden sein'] },
        { type: 'order',  answer: ['Das', 'Problem', 'muss', 'gelöst', 'werden'] },
      ],
    },
    'passiv-agens': {
      level: 'B1',
      concept: { en: 'Agent with von/durch and lassen + infinitive', ru: 'Деятель через von/durch и lassen + инфинитив', ua: 'Виконавець через von/durch та lassen + інфінітив' },
      prompt:  { en: 'Fill in von/durch or the form of lassen.', ru: 'Вставьте von/durch или форму lassen.', ua: 'Вставте von/durch або форму lassen.' },
      items: [
        { type: 'cloze',  de: 'Das Haus wurde ___ einem Architekten gebaut. (Person)', answer: 'von' },
        { type: 'choice', de: 'Die Stadt wurde ___ das Feuer zerstört. (Ursache/Mittel)', answer: 'durch', options: ['von', 'durch', 'mit'] },
        { type: 'cloze',  de: 'Ich ___ mein Auto reparieren. (lassen — ich beauftrage jemanden)', answer: 'lasse' },
      ],
    },
  },

  dialogue: {
    slug: 'w28-herstellung',
    level: 'B1',
    vocabularyMaxWeek: 28,
    title: { en: 'How chocolate is made', ru: 'Как делают шоколад', ua: 'Як роблять шоколад' },
    lines: [
      { speaker: 'A', de: 'Wie wird Schokolade eigentlich hergestellt?' },
      { speaker: 'B', de: 'Zuerst werden die Kakaobohnen verarbeitet und dann gemahlen.' },
      { speaker: 'A', de: 'Und wird alles in der Fabrik gemacht?' },
      { speaker: 'B', de: 'Ja. Die Masse wird mit Zucker und Milch gemischt.' },
      { speaker: 'A', de: 'Wer bedient die Maschinen?' },
      { speaker: 'B', de: 'Die Maschinen werden von Technikern bedient. Kaputte Teile lässt die Firma sofort reparieren.' },
    ],
    questions: [
      { de: 'Die Kakaobohnen werden zuerst verarbeitet.', answer: true, text: { en: 'The cocoa beans are processed first.', ru: 'Сначала обрабатывают какао-бобы.', ua: 'Спочатку обробляють какао-боби.' } },
      { de: 'Die Schokolade wird zu Hause hergestellt.', answer: false, text: { en: 'The chocolate is made at home.', ru: 'Шоколад производят дома.', ua: 'Шоколад виробляють удома.' } },
      { de: 'Die Maschinen werden von Technikern bedient.', answer: true, text: { en: 'The machines are operated by technicians.', ru: 'Машинами управляют техники.', ua: 'Машинами керують техніки.' } },
    ],
  },
};

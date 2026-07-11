/* Week 22 — Professions; relative clauses I (A2, phase A2.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 106–110.
   The masculine professions reuse old v1 week 20 (Berufe) + der Lehrer from old v1 week 10,
   index-matched glosses; the feminine -in forms are new. */
module.exports = {
  n: 22,
  phase: 'A2.2',
  level: 'A2',
  theme:      { en: 'Professions; relative clauses I', ru: 'Профессии; относительные придаточные I', ua: 'Професії; підрядні означальні I' },
  grammar:    { en: 'Relative clauses in the nominative (der Mann, der …) and accusative (der Mann, den ich kenne)', ru: 'Относительные придаточные в Nominativ (der Mann, der …) и Akkusativ (der Mann, den ich kenne)', ua: 'Підрядні означальні в Nominativ (der Mann, der …) і Akkusativ (der Mann, den ich kenne)' },
  vocabTheme: { en: 'professions (masculine and feminine)', ru: 'профессии (мужские и женские)', ua: 'професії (чоловічі та жіночі)' },

  vocab: [
    { de: 'der Arzt',          en: 'doctor',              ru: 'врач',              ua: 'лікар' },
    { de: 'der Ingenieur',     en: 'engineer',            ru: 'инженер',           ua: 'інженер' },
    { de: 'der Anwalt',        en: 'lawyer',              ru: 'адвокат',           ua: 'адвокат' },
    { de: 'der Richter',       en: 'judge',               ru: 'судья',             ua: 'суддя' },
    { de: 'der Architekt',     en: 'architect',           ru: 'архитектор',        ua: 'архітектор' },
    { de: 'der Journalist',    en: 'journalist',          ru: 'журналист',         ua: 'журналіст' },
    { de: 'der Übersetzer',    en: 'translator',          ru: 'переводчик',        ua: 'перекладач' },
    { de: 'der Verkäufer',     en: 'salesperson',         ru: 'продавец',          ua: 'продавець' },
    { de: 'der Lehrer',        en: 'teacher',             ru: 'учитель',           ua: 'вчитель' },
    { de: 'die Ärztin',        en: 'doctor (female)',     ru: 'врач (женщина)',    ua: 'лікарка' },
    { de: 'die Ingenieurin',   en: 'engineer (female)',   ru: 'инженер (женщина)', ua: 'інженерка' },
    { de: 'die Anwältin',      en: 'lawyer (female)',     ru: 'адвокат (женщина)', ua: 'адвокатка' },
    { de: 'die Richterin',     en: 'judge (female)',      ru: 'судья (женщина)',   ua: 'суддя (жінка)' },
    { de: 'die Architektin',   en: 'architect (female)',  ru: 'архитектор (женщина)', ua: 'архітекторка' },
    { de: 'die Journalistin',  en: 'journalist (female)', ru: 'журналистка',       ua: 'журналістка' },
    { de: 'die Übersetzerin',  en: 'translator (female)', ru: 'переводчица',       ua: 'перекладачка' },
    { de: 'die Verkäuferin',   en: 'saleswoman',          ru: 'продавщица',        ua: 'продавчиня' },
    { de: 'die Lehrerin',      en: 'teacher (female)',    ru: 'учительница',       ua: 'вчителька' },
  ],

  verbFocus: ['arbeiten', 'werden', 'kennen', 'bedeuten'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Relativsatz Nominativ', drill: 'relativ-nominativ',
      text: { en: 'Learn relative clauses with a nominative pronoun (subject): der Mann, der …; die Frau, die …; das Kind, das …; die Kinder, die ….',
              ru: 'Выучите относительные придаточные с местоимением в Nominativ (подлежащее): der Mann, der …; die Frau, die …; das Kind, das …; die Kinder, die ….',
              ua: 'Вивчіть підрядні означальні із займенником у Nominativ (підмет): der Mann, der …; die Frau, die …; das Kind, das …; die Kinder, die ….' } },
    { type: 'grammar', grammarFocus: 'Relativsatz Akkusativ', drill: 'relativ-akkusativ',
      text: { en: 'Use accusative relative pronouns when they are the object: der Mann, den ich kenne; die Frau, die ich sehe.',
              ru: 'Используйте относительные местоимения в Akkusativ, когда они являются дополнением: der Mann, den ich kenne; die Frau, die ich sehe.',
              ua: 'Використовуйте відносні займенники в Akkusativ, коли вони є додатком: der Mann, den ich kenne; die Frau, die ich sehe.' } },
    { type: 'listen',
      text: { en: 'Listen to the dialogue "Was bist du von Beruf?" and answer the true/false questions. Notice the nominative and accusative relative pronouns.',
              ru: 'Прослушайте диалог «Was bist du von Beruf?» и ответьте на вопросы верно/неверно. Обратите внимание на относительные местоимения в Nominativ и Akkusativ.',
              ua: 'Прослухайте діалог «Was bist du von Beruf?» і дайте відповіді правда/неправда. Зверніть увагу на відносні займенники в Nominativ і Akkusativ.' } },
    { type: 'write',
      text: { en: 'Write 6–8 definitions of professions using relative clauses (Ein Arzt ist eine Person, die kranke Menschen behandelt).',
              ru: 'Напишите 6–8 определений профессий с относительными придаточными (Ein Arzt ist eine Person, die kranke Menschen behandelt).',
              ua: 'Напишіть 6–8 визначень професій із підрядними означальними (Ein Arzt ist eine Person, die kranke Menschen behandelt).' },
      checklist: [
        { en: 'Write at least six definitions.', ru: 'Напишите минимум шесть определений.', ua: 'Напишіть щонайменше шість визначень.' },
        { en: 'Use a nominative relative pronoun (der/die/das/die).', ru: 'Используйте относительное местоимение в Nominativ (der/die/das/die).', ua: 'Використайте відносний займенник у Nominativ (der/die/das/die).' },
        { en: 'Use at least one accusative relative pronoun (den).', ru: 'Используйте минимум одно относительное местоимение в Akkusativ (den).', ua: 'Використайте щонайменше один відносний займенник в Akkusativ (den).' },
      ] },
    { type: 'review', drill: 'relativ-akkusativ',
      text: { en: 'Review week 22: a der/die/das/den relative-pronoun cloze, then a spoken TTS dictation of professions.',
              ru: 'Повторение недели 22: клоуз на относительные местоимения der/die/das/den, затем TTS-диктант профессий.',
              ua: 'Повторення тижня 22: клоуз на відносні займенники der/die/das/den, потім TTS-диктант професій.' } },
  ],

  canDo: [
    { en: 'I can describe people with nominative relative clauses (der Mann, der hier arbeitet).', ru: 'Я могу описывать людей относительными придаточными в Nominativ (der Mann, der hier arbeitet).', ua: 'Я можу описувати людей підрядними означальними в Nominativ (der Mann, der hier arbeitet).' },
    { en: 'I can use accusative relative clauses (die Frau, die ich kenne).', ru: 'Я могу использовать относительные придаточные в Akkusativ (die Frau, die ich kenne).', ua: 'Я можу використовувати підрядні означальні в Akkusativ (die Frau, die ich kenne).' },
    { en: 'I can follow a dialogue about professions and answer questions about it.', ru: 'Я могу понять диалог о профессиях и ответить на вопросы по нему.', ua: 'Я можу зрозуміти діалог про професії й відповісти на питання за ним.' },
    { en: 'I can write definitions of professions using relative clauses.', ru: 'Я могу написать определения профессий с относительными придаточными.', ua: 'Я можу написати визначення професій із підрядними означальними.' },
    { en: 'I can pick the right relative pronoun der/die/das/den by gender and case.', ru: 'Я могу выбрать правильное относительное местоимение der/die/das/den по роду и падежу.', ua: 'Я можу вибрати правильний відносний займенник der/die/das/den за родом і відмінком.' },
  ],

  drills: {
    'relativ-nominativ': {
      level: 'A2',
      concept: { en: 'Relative pronoun as the subject (nominative)', ru: 'Относительное местоимение как подлежащее (Nominativ)', ua: 'Відносний займенник як підмет (Nominativ)' },
      prompt:  { en: 'Choose the nominative relative pronoun.', ru: 'Выберите относительное местоимение в Nominativ.', ua: 'Виберіть відносний займенник у Nominativ.' },
      items: [
        { type: 'cloze',  de: 'Das ist der Mann, ___ hier arbeitet.', answer: 'der' },
        { type: 'choice', de: 'Ich kenne eine Frau, ___ Ärztin ist.', answer: 'die', options: ['der', 'die', 'das'] },
        { type: 'order',  answer: ['Ich', 'sehe', 'den', 'Mann,', 'der', 'singt'] },
      ],
    },
    'relativ-akkusativ': {
      level: 'A2',
      concept: { en: 'Relative pronoun as the direct object (accusative)', ru: 'Относительное местоимение как дополнение (Akkusativ)', ua: 'Відносний займенник як додаток (Akkusativ)' },
      prompt:  { en: 'Choose the accusative relative pronoun.', ru: 'Выберите относительное местоимение в Akkusativ.', ua: 'Виберіть відносний займенник в Akkusativ.' },
      items: [
        { type: 'cloze',  de: 'Das ist der Kollege, ___ ich gut kenne.', answer: 'den' },
        { type: 'choice', de: 'Ich habe eine Frage, ___ ich stellen möchte.', answer: 'die', options: ['der', 'die', 'den'] },
        { type: 'order',  answer: ['Das', 'ist', 'der', 'Film,', 'den', 'ich', 'mag'] },
      ],
    },
  },

  dialogue: {
    slug: 'w22-beruf',
    level: 'A2',
    vocabularyMaxWeek: 22,
    title: { en: 'What is your job?', ru: 'Кто ты по профессии?', ua: 'Хто ти за фахом?' },
    lines: [
      { speaker: 'A', de: 'Was bist du von Beruf?' },
      { speaker: 'B', de: 'Ich bin Ärztin. Ich arbeite im Krankenhaus.' },
      { speaker: 'A', de: 'Interessant! Mein Bruder ist auch Arzt.' },
      { speaker: 'B', de: 'Und du? Was machst du?' },
      { speaker: 'A', de: 'Ich bin Lehrer. Ich unterrichte Deutsch.' },
      { speaker: 'B', de: 'Der Beruf, den du hast, gefällt mir sehr.' },
    ],
    questions: [
      { de: 'B ist Ärztin.', answer: true, text: { en: 'B is a doctor.', ru: 'B — врач.', ua: 'B — лікарка.' } },
      { de: 'A arbeitet als Ingenieur.', answer: false, text: { en: 'A works as an engineer.', ru: 'A работает инженером.', ua: 'A працює інженером.' } },
      { de: 'A unterrichtet Deutsch.', answer: true, text: { en: 'A teaches German.', ru: 'A преподаёт немецкий.', ua: 'A викладає німецьку.' } },
    ],
  },
};

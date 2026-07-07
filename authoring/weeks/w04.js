/* Week 4 — Hobbies; modal verbs (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 16–20.
   Vocab reuses old v1 W3 (Hobbys, Sport, Freizeit) minus colours (moved to W20) plus the six
   modal verbs as vocabulary units. */
module.exports = {
  n: 4,
  phase: 'A1.1',
  level: 'A1',
  theme:      { en: 'Hobbies; modal verbs', ru: 'Хобби; модальные глаголы', ua: 'Хобі; модальні дієслова' },
  grammar:    { en: 'The six modal verbs (present) and the sentence bracket (modal + infinitive at the end)',
                ru: 'Шесть модальных глаголов (Präsens) и рамочная конструкция (модальный + инфинитив в конце)',
                ua: 'Шість модальних дієслів (Präsens) та рамкова конструкція (модальне + інфінітив у кінці)' },
  vocabTheme: { en: 'hobbies, sport, free time', ru: 'хобби, спорт, досуг', ua: 'хобі, спорт, дозвілля' },

  vocab: [
    // hobbies / sport / free time (reused from old v1 W3)
    { de: 'das Hobby',    en: 'hobby',        ru: 'хобби',           ua: 'хобі' },
    { de: 'die Freizeit', en: 'free time',    ru: 'свободное время', ua: 'вільний час' },
    { de: 'der Sport',    en: 'sport',        ru: 'спорт',           ua: 'спорт' },
    { de: 'spielen',      en: 'to play',      ru: 'играть',          ua: 'грати' },
    { de: 'lesen',        en: 'to read',      ru: 'читать',          ua: 'читати' },
    { de: 'singen',       en: 'to sing',      ru: 'петь',            ua: 'співати' },
    { de: 'tanzen',       en: 'to dance',     ru: 'танцевать',       ua: 'танцювати' },
    { de: 'malen',        en: 'to paint',     ru: 'рисовать',        ua: 'малювати' },
    { de: 'reisen',       en: 'to travel',    ru: 'путешествовать',  ua: 'подорожувати' },
    { de: 'schwimmen',    en: 'to swim',      ru: 'плавать',         ua: 'плавати' },
    { de: 'laufen',       en: 'to run',       ru: 'бегать',          ua: 'бігати' },
    { de: 'wandern',      en: 'to hike',      ru: 'ходить в поход',  ua: 'ходити в похід' },
    { de: 'Fußball',      en: 'football',     ru: 'футбол',          ua: 'футбол' },
    { de: 'Tennis',       en: 'tennis',       ru: 'теннис',          ua: 'теніс' },
    { de: 'das Buch',     en: 'book',         ru: 'книга',           ua: 'книга' },
    { de: 'der Film',     en: 'film',         ru: 'фильм',           ua: 'фільм' },
    { de: 'das Konzert',  en: 'concert',      ru: 'концерт',         ua: 'концерт' },
    { de: 'das Museum',   en: 'museum',       ru: 'музей',           ua: 'музей' },
    { de: 'der Park',     en: 'park',         ru: 'парк',            ua: 'парк' },
    { de: 'gerne',        en: 'gladly',       ru: 'охотно',          ua: 'охоче' },
    { de: 'lieber',       en: 'rather',       ru: 'охотнее',         ua: 'краще / радше' },
    { de: 'interessant',  en: 'interesting',  ru: 'интересный',      ua: 'цікавий' },
    { de: 'langweilig',   en: 'boring',       ru: 'скучный',         ua: 'нудний' },
    { de: 'spannend',     en: 'exciting',     ru: 'захватывающий',   ua: 'захопливий' },
    // the six modal verbs as vocabulary units (NEW)
    { de: 'können',       en: 'can, to be able to',        ru: 'мочь, уметь',                ua: 'могти, вміти' },
    { de: 'wollen',       en: 'to want to',                ru: 'хотеть',                     ua: 'хотіти' },
    { de: 'müssen',       en: 'must, to have to',          ru: 'быть должным (по необходимости)', ua: 'мусити, бути змушеним' },
    { de: 'dürfen',       en: 'may, to be allowed to',     ru: 'мочь (иметь разрешение)',    ua: 'могти (мати дозвіл)' },
    { de: 'sollen',       en: 'should, to be supposed to', ru: 'быть должным (по указанию)', ua: 'бути повинним (за вказівкою)' },
    { de: 'möchten',      en: 'would like to',             ru: 'хотел бы',                   ua: 'хотів би' },
  ],

  verbFocus: ['können', 'wollen', 'müssen', 'dürfen', 'sollen', 'mögen', 'spielen', 'lesen', 'schwimmen', 'tanzen', 'singen', 'malen', 'reisen'],
  receptiveVerbs: ['malen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'können / wollen / müssen', drill: 'modalverben-1',
      text: { en: 'Learn the present-tense forms of können, wollen and müssen (irregular ich/du/er).',
              ru: 'Выучите формы Präsens глаголов können, wollen и müssen (неправильные ich/du/er).',
              ua: 'Вивчіть форми Präsens дієслів können, wollen і müssen (неправильні ich/du/er).' } },
    { type: 'grammar', grammarFocus: 'dürfen / sollen / mögen (möchten)', drill: 'modalverben-2',
      text: { en: 'Learn dürfen, sollen and mögen/möchten and start using the sentence bracket.',
              ru: 'Выучите dürfen, sollen и mögen/möchten и начните использовать рамочную конструкцию.',
              ua: 'Вивчіть dürfen, sollen і mögen/möchten та почніть використовувати рамкову конструкцію.' } },
    { type: 'grammar', grammarFocus: 'Satzklammer (sentence bracket)', drill: 'satzklammer',
      text: { en: 'Put the modal in position 2 and the infinitive at the very end (Satzklammer).',
              ru: 'Ставьте модальный глагол на 2-е место, а инфинитив — в самый конец (Satzklammer).',
              ua: 'Ставте модальне дієслово на 2-ге місце, а інфінітив — у самий кінець (Satzklammer).' } },
    { type: 'write',
      text: { en: 'Write 8–10 sentences about your hobbies using modal verbs and the sentence bracket.',
              ru: 'Напишите 8–10 предложений о своих хобби с модальными глаголами и рамочной конструкцией.',
              ua: 'Напишіть 8–10 речень про свої хобі з модальними дієсловами та рамковою конструкцією.' },
      checklist: [
        { en: 'Use at least three different modal verbs.', ru: 'Используйте минимум три разных модальных глагола.', ua: 'Використайте щонайменше три різних модальних дієслова.' },
        { en: 'Put the infinitive at the end of every modal sentence.', ru: 'Ставьте инфинитив в конце каждого предложения с модальным глаголом.', ua: 'Ставте інфінітив у кінці кожного речення з модальним дієсловом.' },
        { en: 'Say what you like doing with gern or lieber.', ru: 'Скажите, что делаете охотно, с gern или lieber.', ua: 'Скажіть, що робите охоче, з gern або lieber.' },
      ] },
    { type: 'review', drill: 'satzklammer',
      text: { en: 'Review week 4, then give a one-minute spoken monologue about your hobbies.',
              ru: 'Повторите неделю 4, затем произнесите вслух минутный монолог о своих хобби.',
              ua: 'Повторіть тиждень 4, потім виголосіть хвилинний монолог про свої хобі.' } },
  ],

  canDo: [
    { en: 'I can say what I can, want and have to do with können, wollen and müssen.', ru: 'Я могу сказать, что умею, хочу и должен, с können, wollen и müssen.', ua: 'Я можу сказати, що вмію, хочу й мушу, з können, wollen і müssen.' },
    { en: 'I can say what I may, should and would like to do with dürfen, sollen and möchten.', ru: 'Я могу сказать, что мне можно, что следует и что я хотел бы, с dürfen, sollen и möchten.', ua: 'Я можу сказати, що мені можна, що слід і що я хотів би, з dürfen, sollen і möchten.' },
    { en: 'I can build sentences with the verb bracket (modal + infinitive at the end).', ru: 'Я могу строить предложения с глагольной рамкой (модальный + инфинитив в конце).', ua: 'Я можу будувати речення з дієслівною рамкою (модальне + інфінітив у кінці).' },
    { en: 'I can write several sentences about my hobbies using modal verbs.', ru: 'Я могу написать несколько предложений о своих хобби с модальными глаголами.', ua: 'Я можу написати кілька речень про свої хобі з модальними дієсловами.' },
    { en: 'I can talk about my hobbies out loud for a minute.', ru: 'Я могу рассказать о своих хобби вслух в течение минуты.', ua: 'Я можу розповісти про свої хобі вголос протягом хвилини.' },
  ],

  drills: {
    'modalverben-1': {
      level: 'A1',
      concept: { en: 'Present tense of können, wollen, müssen', ru: 'Präsens глаголов können, wollen, müssen', ua: 'Präsens дієслів können, wollen, müssen' },
      prompt:  { en: 'Fill in the correct modal-verb form.', ru: 'Вставьте правильную форму модального глагола.', ua: 'Вставте правильну форму модального дієслова.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ gut schwimmen. (können)', answer: 'kann' },
        { type: 'choice', de: 'Wir ___ heute lernen. (müssen)', answer: 'müssen', options: ['muss', 'müssen', 'müsst'] },
        { type: 'cloze',  de: 'Du ___ Fußball spielen. (wollen)', answer: 'willst' },
      ],
    },
    'modalverben-2': {
      level: 'A1',
      concept: { en: 'Present tense of dürfen, sollen, mögen/möchten', ru: 'Präsens глаголов dürfen, sollen, mögen/möchten', ua: 'Präsens дієслів dürfen, sollen, mögen/möchten' },
      prompt:  { en: 'Fill in the correct modal-verb form.', ru: 'Вставьте правильную форму модального глагола.', ua: 'Вставте правильну форму модального дієслова.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ ein Eis. (möchten)', answer: 'möchte' },
        { type: 'choice', de: 'Er ___ hier nicht rauchen. (dürfen)', answer: 'darf', options: ['darf', 'darfst', 'dürfen'] },
        { type: 'cloze',  de: 'Du ___ mehr lesen. (sollen)', answer: 'sollst' },
      ],
    },
    'satzklammer': {
      level: 'A1',
      concept: { en: 'The sentence bracket: modal in position 2, infinitive at the end', ru: 'Рамочная конструкция: модальный на 2-м месте, инфинитив в конце', ua: 'Рамкова конструкція: модальне на 2-му місці, інфінітив у кінці' },
      prompt:  { en: 'Build the sentence or complete the bracket.', ru: 'Соберите предложение или завершите рамку.', ua: 'Складіть речення або завершіть рамку.' },
      items: [
        { type: 'order',  answer: ['Ich', 'kann', 'heute', 'Tennis', 'spielen'] },
        { type: 'order',  answer: ['Wir', 'wollen', 'ins', 'Museum', 'gehen'] },
        { type: 'cloze',  de: 'Ich muss heute Deutsch ___. (lernen)', answer: 'lernen' },
      ],
    },
  },

  dialogue: {
    slug: 'w04-hobbys',
    level: 'A1',
    vocabularyMaxWeek: 4,
    title: { en: 'What do you do in your free time?', ru: 'Чем ты занимаешься в свободное время?', ua: 'Чим ти займаєшся у вільний час?' },
    lines: [
      { speaker: 'A', de: 'Was machst du gern in der Freizeit?' },
      { speaker: 'B', de: 'Ich spiele gern Fußball. Und du?' },
      { speaker: 'A', de: 'Ich lese gern. Ich möchte auch tanzen lernen.' },
      { speaker: 'B', de: 'Kannst du gut schwimmen?' },
      { speaker: 'A', de: 'Nein, nicht so gut. Wollen wir heute ins Museum gehen?' },
      { speaker: 'B', de: 'Gute Idee! Ich muss aber noch lernen.' },
    ],
    questions: [
      { de: 'B spielt gern Fußball.', answer: true, text: { en: 'B likes playing football.', ru: 'B любит играть в футбол.', ua: 'B любить грати у футбол.' } },
      { de: 'A kann sehr gut schwimmen.', answer: false, text: { en: 'A can swim very well.', ru: 'A очень хорошо плавает.', ua: 'A дуже добре плаває.' } },
      { de: 'Sie wollen heute ins Museum gehen.', answer: true, text: { en: 'They want to go to the museum today.', ru: 'Они хотят сегодня пойти в музей.', ua: 'Вони хочуть сьогодні піти в музей.' } },
    ],
  },
};

/* Week 26 — Telling stories; Präteritum II (weak -te + three strong ablaut classes) (B1, phase B1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 126–130.
   Vocab is a NEW small set of narrative connectives (8); the strong Präteritum forms come from the
   verb trainer (30 forms, curriculum source old v1 days 46–49). */
module.exports = {
  n: 26,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'Telling stories; Präteritum II', ru: 'Истории; Präteritum II', ua: 'Історії; Präteritum II' },
  grammar:    { en: 'Präteritum: weak -te and three strong ablaut classes', ru: 'Präteritum: слабый -te и три класса сильного аблаута', ua: 'Präteritum: слабкий -te та три класи сильного аблауту' },
  vocabTheme: { en: 'narrative connectives', ru: 'повествовательные связки', ua: 'оповідні зв’язки' },

  vocab: [
    { de: 'eines Tages',       en: 'one day (in a story)', ru: 'однажды',                 ua: 'одного дня' },
    { de: 'am Anfang',         en: 'at first',             ru: 'вначале',                 ua: 'спочатку' },
    { de: 'auf einmal',        en: 'all of a sudden',      ru: 'вдруг',                   ua: 'раптом' },
    { de: 'nach einer Weile',  en: 'after a while',        ru: 'спустя некоторое время',  ua: 'через деякий час' },
    { de: 'schließlich',       en: 'finally',              ru: 'наконец',                 ua: 'нарешті' },
    { de: 'zum Schluss',       en: 'to conclude',          ru: 'напоследок',              ua: 'на завершення' },
    { de: 'am Ende',           en: 'in the end',           ru: 'в конце',                 ua: 'у кінці' },
    { de: 'seitdem',           en: 'since then',           ru: 'с тех пор',               ua: 'відтоді' },
  ],

  verbFocus: ['bleiben', 'schreiben', 'steigen', 'trinken', 'finden', 'helfen', 'singen', 'sprechen', 'fahren', 'gehen', 'kommen', 'sehen', 'geben', 'essen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Präteritum: weak -te and class ei-ie-ie', drill: 'praeteritum-schwach-ei',
      text: { en: 'Weak Präteritum -te (kaufte, machte) and the ablaut class ei-ie-ie (blieb, schrieb).',
              ru: 'Слабый Präteritum -te (kaufte, machte) и класс аблаута ei-ie-ie (blieb, schrieb).',
              ua: 'Слабкий Präteritum -te (kaufte, machte) та клас аблауту ei-ie-ie (blieb, schrieb).' } },
    { type: 'grammar', grammarFocus: 'Präteritum: class i/e→a', drill: 'praeteritum-klasse-ia',
      text: { en: 'Strong Präteritum with i/e → a (trank, half, sang) — 10 forms of this class.',
              ru: 'Сильный Präteritum с i/e → a (trank, half, sang) — 10 форм этого класса.',
              ua: 'Сильний Präteritum з i/e → a (trank, half, sang) — 10 форм цього класу.' } },
    { type: 'grammar', grammarFocus: 'Präteritum: strong patterns II', drill: 'praeteritum-klasse-a',
      text: { en: 'Strong Präteritum patterns such as fuhr, ging and kam — chain these into a short story.',
              ru: 'Сильные формы Präteritum, например fuhr, ging и kam, — соедините их в короткую историю.',
              ua: 'Сильні форми Präteritum, наприклад fuhr, ging і kam, — поєднайте їх у коротку історію.' } },
    { type: 'write',
      text: { en: 'Write a short story of about 100 words entirely in the Präteritum, using narrative connectives.',
              ru: 'Напишите короткую историю примерно на 100 слов полностью в Präteritum, используя связки.',
              ua: 'Напишіть коротку історію приблизно на 100 слів повністю в Präteritum, використовуючи зв’язки.' },
      checklist: [
        { en: 'Use at least six strong Präteritum forms.', ru: 'Используйте минимум шесть сильных форм Präteritum.', ua: 'Використайте щонайменше шість сильних форм Präteritum.' },
        { en: 'Open with eines Tages and close with schließlich or am Ende.', ru: 'Начните с eines Tages и закончите schließlich или am Ende.', ua: 'Почніть з eines Tages і завершіть schließlich або am Ende.' },
        { en: 'Keep the whole story in the past — no Perfekt.', ru: 'Держите всю историю в прошедшем — без Perfekt.', ua: 'Тримайте всю історію в минулому — без Perfekt.' },
      ] },
    { type: 'review', drill: 'praeteritum-klasse-a',
      text: { en: 'Review week 26: an ablaut-form cloze, then a TTS dictation of Präteritum forms.',
              ru: 'Повторение недели 26: клоуз на формы аблаута, затем TTS-диктант форм Präteritum.',
              ua: 'Повторення тижня 26: клоуз на форми аблауту, потім TTS-диктант форм Präteritum.' } },
  ],

  canDo: [
    { en: 'I can form the weak Präteritum (-te) and the ei-ie-ie strong pattern.', ru: 'Я могу образовать слабый Präteritum (-te) и сильный образец ei-ie-ie.', ua: 'Я можу утворити слабкий Präteritum (-te) і сильний зразок ei-ie-ie.' },
    { en: 'I can use the i/e→a ablaut Präteritum forms (trank, half).', ru: 'Я могу использовать формы Präteritum с аблаутом i/e→a (trank, half).', ua: 'Я можу використовувати форми Präteritum з аблаутом i/e→a (trank, half).' },
    { en: 'I can use strong Präteritum patterns such as fuhr, ging and kam and link a story.', ru: 'Я могу использовать сильные формы Präteritum, например fuhr, ging и kam, и связать историю.', ua: 'Я можу використовувати сильні форми Präteritum, наприклад fuhr, ging і kam, і зв’язати історію.' },
    { en: 'I can write a short story in the Präteritum.', ru: 'Я могу написать короткую историю в Präteritum.', ua: 'Я можу написати коротку історію в Präteritum.' },
    { en: 'I can retell past events out loud with narrative connectives.', ru: 'Я могу вслух пересказать прошедшие события со связками.', ua: 'Я можу вголос переказати минулі події зі зв’язками.' },
  ],

  drills: {
    'praeteritum-schwach-ei': {
      level: 'B1',
      concept: { en: 'Weak Präteritum -te and the ei-ie-ie ablaut class', ru: 'Слабый Präteritum -te и класс аблаута ei-ie-ie', ua: 'Слабкий Präteritum -te та клас аблауту ei-ie-ie' },
      prompt:  { en: 'Put the verb into the Präteritum.', ru: 'Поставьте глагол в Präteritum.', ua: 'Поставте дієслово в Präteritum.' },
      items: [
        { type: 'cloze',  de: 'Gestern ___ ich einen Brief. (schreiben)', answer: 'schrieb' },
        { type: 'cloze',  de: 'Wir ___ den ganzen Tag zu Hause. (bleiben)', answer: 'blieben' },
        { type: 'choice', de: 'Er ___ sich ein neues Auto. (kaufen)', answer: 'kaufte', options: ['kaufte', 'kaufen', 'kaufst'] },
      ],
    },
    'praeteritum-klasse-ia': {
      level: 'B1',
      concept: { en: 'Strong Präteritum with the vowel change i/e → a', ru: 'Сильный Präteritum с чередованием i/e → a', ua: 'Сильний Präteritum з чергуванням i/e → a' },
      prompt:  { en: 'Put the strong verb into the Präteritum.', ru: 'Поставьте сильный глагол в Präteritum.', ua: 'Поставте сильне дієслово в Präteritum.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ ein Glas Wasser. (trinken)', answer: 'trank' },
        { type: 'cloze',  de: 'Sie ___ ihrer Mutter im Garten. (helfen)', answer: 'half' },
        { type: 'choice', de: 'Wir ___ zusammen ein Lied. (singen)', answer: 'sangen', options: ['sangen', 'singen', 'sungen'] },
      ],
    },
    'praeteritum-klasse-a': {
      level: 'B1',
      concept: { en: 'Strong Präteritum patterns such as fuhr, ging and kam', ru: 'Сильные формы Präteritum, например fuhr, ging и kam', ua: 'Сильні форми Präteritum, наприклад fuhr, ging і kam' },
      prompt:  { en: 'Put the strong verb into the Präteritum or build the sentence.', ru: 'Поставьте сильный глагол в Präteritum или соберите предложение.', ua: 'Поставте сильне дієслово в Präteritum або складіть речення.' },
      items: [
        { type: 'cloze',  de: 'Er ___ mit dem Zug nach Berlin. (fahren)', answer: 'fuhr' },
        { type: 'cloze',  de: 'Wir ___ am Abend ins Kino. (gehen)', answer: 'gingen' },
        { type: 'order',  answer: ['Sie', 'kam', 'spät', 'nach', 'Hause'] },
      ],
    },
  },

  dialogue: {
    slug: 'w26-geschichte',
    level: 'B1',
    vocabularyMaxWeek: 26,
    title: { en: 'A story from last summer', ru: 'История прошлого лета', ua: 'Історія минулого літа' },
    lines: [
      { speaker: 'A', de: 'Erzähl mal, was letzten Sommer passierte!' },
      { speaker: 'B', de: 'Eines Tages fuhren wir ans Meer. Am Anfang war alles ruhig.' },
      { speaker: 'A', de: 'Und dann?' },
      { speaker: 'B', de: 'Auf einmal kam ein starker Wind und wir gingen schnell ins Hotel zurück.' },
      { speaker: 'A', de: 'Wie ging die Geschichte aus?' },
      { speaker: 'B', de: 'Schließlich schien wieder die Sonne, und am Ende blieben wir noch eine Woche.' },
    ],
    questions: [
      { de: 'B fuhr eines Tages ans Meer.', answer: true, text: { en: 'B went to the sea one day.', ru: 'Однажды B поехал(а) на море.', ua: 'Одного дня B поїхав(ла) на море.' } },
      { de: 'Am Ende reiste B sofort ab.', answer: false, text: { en: 'In the end B left immediately.', ru: 'В конце B сразу уехал(а).', ua: 'У кінці B одразу поїхав(ла).' } },
      { de: 'Ein starker Wind kam auf einmal.', answer: true, text: { en: 'A strong wind came all of a sudden.', ru: 'Вдруг поднялся сильный ветер.', ua: 'Раптом здійнявся сильний вітер.' } },
    ],
  },
};

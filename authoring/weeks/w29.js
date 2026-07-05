/* Week 29 — Wishes; Konjunktiv II (B1, phase B1.1). Days 141–145. Reuses v1 W19 (wishes/KII). */
module.exports = {
  n: 29,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'Wishes; Konjunktiv II', ru: 'Желания; Konjunktiv II', ua: 'Бажання; Konjunktiv II' },
  grammar:    { en: 'KII forms hätte/wäre/würde; Irrealis + advice; KII of the past', ru: 'Формы KII hätte/wäre/würde; Irrealis + советы; KII прошедшего', ua: 'Форми KII hätte/wäre/würde; Irrealis + поради; KII минулого' },
  vocabTheme: { en: 'wishes, advice', ru: 'желания, советы', ua: 'бажання, поради' },

  vocab: [
    { de: 'der Wunsch',        en: 'wish',                 ru: 'желание',        ua: 'бажання' },
    { de: 'der Traum',         en: 'dream',                ru: 'мечта',          ua: 'мрія' },
    { de: 'der Vorschlag',     en: 'suggestion',           ru: 'предложение',    ua: 'пропозиція' },
    { de: 'der Rat',           en: 'advice',               ru: 'совет',          ua: 'порада' },
    { de: 'die Bedingung',     en: 'condition',            ru: 'условие',        ua: 'умова' },
    { de: 'die Möglichkeit',   en: 'possibility',          ru: 'возможность',    ua: 'можливість' },
    { de: 'es wäre schön',     en: 'it would be nice',     ru: 'было бы хорошо', ua: 'було б добре' },
    { de: 'an deiner Stelle',  en: 'in your place',        ru: 'на твоём месте', ua: 'на твоєму місці' },
    { de: 'hoffentlich',       en: 'hopefully',            ru: 'надеюсь',        ua: 'сподіваюся' },
    { de: 'eigentlich',        en: 'actually',             ru: 'вообще-то',      ua: 'власне' },
    { de: 'unbedingt',         en: 'definitely',           ru: 'обязательно',    ua: 'обов’язково' },
    { de: 'die Beschwerde',    en: 'complaint',            ru: 'жалоба',         ua: 'скарга' },
    { de: 'die Entschuldigung', en: 'apology',             ru: 'извинение',      ua: 'вибачення' },
    { de: 'zufrieden',         en: 'satisfied',            ru: 'довольный',      ua: 'задоволений' },
  ],

  verbFocus: ['raten', 'wünschen', 'hoffen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'KII forms', drill: 'kii-formen',
      text: { en: 'Konjunktiv II forms: hätte, wäre, würde + Infinitiv.', ru: 'Формы Konjunktiv II: hätte, wäre, würde + Infinitiv.', ua: 'Форми Konjunktiv II: hätte, wäre, würde + Infinitiv.' } },
    { type: 'grammar', grammarFocus: 'KII usage', drill: 'kii-gebrauch',
      text: { en: 'Using KII: unreal conditions (Irrealis) and advice (An deiner Stelle würde ich …).', ru: 'Употребление KII: нереальные условия (Irrealis) и советы (An deiner Stelle würde ich …).', ua: 'Вживання KII: нереальні умови (Irrealis) і поради (An deiner Stelle würde ich …).' } },
    { type: 'grammar', grammarFocus: 'KII of the past', drill: 'kii-vergangenheit',
      text: { en: 'KII of the past: hätte gemacht / wäre gefahren.', ru: 'KII прошедшего: hätte gemacht / wäre gefahren.', ua: 'KII минулого: hätte gemacht / wäre gefahren.' } },
    { type: 'write',
      text: { en: 'Write a complaint letter to a hotel — 80 words, Goethe Teil-1 format.', ru: 'Напишите письмо-жалобу в отель — 80 слов, формат Goethe Teil 1.', ua: 'Напишіть лист-скаргу в готель — 80 слів, формат Goethe Teil 1.' },
      checklist: [
        { en: 'Use at least 2 KII forms.', ru: 'Используйте хотя бы 2 формы KII.', ua: 'Використайте щонайменше 2 форми KII.' },
        { en: 'State the problem and a request.', ru: 'Опишите проблему и просьбу.', ua: 'Опишіть проблему і прохання.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: spoken monologue "what would you do with a million"; revisit Passiv (W28).', ru: 'День повторения: монолог «что бы ты сделал с миллионом»; повтор Passiv (W28).', ua: 'День повторення: монолог «що б ти зробив із мільйоном»; повтор Passiv (W28).' } },
  ],

  canDo: [
    { en: 'I can form the Konjunktiv II with hätte/wäre/würde.', ru: 'Я могу образовать Konjunktiv II с hätte/wäre/würde.', ua: 'Я можу утворити Konjunktiv II з hätte/wäre/würde.' },
    { en: 'I can talk about unreal situations and give advice.', ru: 'Я могу говорить о нереальных ситуациях и давать советы.', ua: 'Я можу говорити про нереальні ситуації та давати поради.' },
    { en: 'I can say what would have happened in the past.', ru: 'Я могу сказать, что произошло бы в прошлом.', ua: 'Я можу сказати, що сталося б у минулому.' },
    { en: 'I can write a formal complaint letter.', ru: 'Я могу написать официальную жалобу.', ua: 'Я можу написати офіційну скаргу.' },
    { en: 'I can express wishes and hypothetical plans.', ru: 'Я могу выражать желания и гипотетические планы.', ua: 'Я можу висловлювати бажання й гіпотетичні плани.' },
  ],

  drills: {
    'kii-formen': {
      level: 'B1',
      concept: { en: 'Konjunktiv II forms', ru: 'Формы Konjunktiv II', ua: 'Форми Konjunktiv II' },
      prompt:  { en: 'Fill in the Konjunktiv II form.', ru: 'Вставьте форму Konjunktiv II.', ua: 'Вставте форму Konjunktiv II.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ gern mehr Zeit. (haben → KII)', answer: 'hätte' },
        { type: 'cloze',  de: 'Es ___ schön, wenn du kommst. (sein → KII)', answer: 'wäre' },
        { type: 'choice', de: 'Ich ___ dir helfen. (werden → KII)', answer: 'würde', options: ['werde', 'würde', 'wurde'] },
      ],
    },
    'kii-gebrauch': {
      level: 'B1',
      concept: { en: 'Using KII for advice and unreal conditions', ru: 'KII для советов и нереальных условий', ua: 'KII для порад і нереальних умов' },
      prompt:  { en: 'Complete the sentence.', ru: 'Завершите предложение.', ua: 'Завершіть речення.' },
      items: [
        { type: 'order',  answer: ['An', 'deiner', 'Stelle', 'würde', 'ich', 'warten'] },
        { type: 'cloze',  de: 'Wenn ich reich ___, würde ich reisen. (sein → KII)', answer: 'wäre' },
        { type: 'choice', de: 'Du ___ mehr schlafen. (advice)', answer: 'solltest', options: ['sollst', 'solltest', 'wirst'] },
      ],
    },
    'kii-vergangenheit': {
      level: 'B1',
      concept: { en: 'KII of the past', ru: 'KII прошедшего', ua: 'KII минулого' },
      prompt:  { en: 'Form the past Konjunktiv II.', ru: 'Образуйте KII прошедшего.', ua: 'Утворіть KII минулого.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ das gemacht. (haben → KII past)', answer: 'hätte' },
        { type: 'cloze',  de: 'Er ___ früher gekommen. (sein → KII past)', answer: 'wäre' },
        { type: 'order',  answer: ['Ich', 'hätte', 'dir', 'geholfen'] },
      ],
    },
  },

  dialogue: {
    slug: 'w29-beschwerde',
    level: 'B1',
    vocabularyMaxWeek: 29,
    title: { en: 'A complaint at the hotel', ru: 'Жалоба в отеле', ua: 'Скарга в готелі' },
    lines: [
      { speaker: 'Gast', de: 'Guten Tag. Ich hätte gern ein ruhigeres Zimmer.' },
      { speaker: 'Rezeption', de: 'Was ist das Problem?' },
      { speaker: 'Gast', de: 'Das Zimmer ist zu laut. An Ihrer Stelle würde ich es auch ändern.' },
      { speaker: 'Rezeption', de: 'Kein Problem, wir hätten noch ein Zimmer im vierten Stock.' },
    ],
    questions: [
      { de: 'Der Gast möchte ein ruhigeres Zimmer.', answer: true, text: { en: 'The guest wants a quieter room.', ru: 'Гость хочет более тихий номер.', ua: 'Гість хоче тихіший номер.' } },
      { de: 'Das Zimmer ist zu klein.', answer: false, text: { en: 'The room is too small.', ru: 'Номер слишком маленький.', ua: 'Номер занадто малий.' } },
      { de: 'Die Rezeption hat noch ein anderes Zimmer.', answer: true, text: { en: 'Reception has another room available.', ru: 'На ресепшене есть другой номер.', ua: 'На ресепшені є інший номер.' } },
    ],
  },
};

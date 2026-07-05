/* Week 17 — Memories; Nebensätze II + Plusquamperfekt (A2, phase A2.1). Days 81–85. Reuses v1 W13. */
module.exports = {
  n: 17,
  phase: 'A2.1',
  level: 'A2',
  theme:      { en: 'Memories; subordinate clauses II', ru: 'Воспоминания; придаточные II', ua: 'Спогади; підрядні II' },
  grammar:    { en: 'wenn vs. als; während/bevor/sobald; Plusquamperfekt + nachdem', ru: 'wenn vs. als; während/bevor/sobald; Plusquamperfekt + nachdem', ua: 'wenn vs. als; während/bevor/sobald; Plusquamperfekt + nachdem' },
  vocabTheme: { en: 'memories, emotions', ru: 'воспоминания, эмоции', ua: 'спогади, емоції' },

  vocab: [
    { de: 'die Erinnerung', en: 'memory',        ru: 'воспоминание',  ua: 'спогад' },
    { de: 'die Kindheit',   en: 'childhood',     ru: 'детство',       ua: 'дитинство' },
    { de: 'die Jugend',     en: 'youth',         ru: 'юность',        ua: 'юність' },
    { de: 'früher',         en: 'in the past',   ru: 'раньше',        ua: 'раніше' },
    { de: 'damals',         en: 'back then',     ru: 'тогда',         ua: 'тоді' },
    { de: 'glücklich',      en: 'happy',         ru: 'счастливый',    ua: 'щасливий' },
    { de: 'zufrieden',      en: 'satisfied',     ru: 'довольный',     ua: 'задоволений' },
    { de: 'überrascht',     en: 'surprised',     ru: 'удивлённый',    ua: 'здивований' },
    { de: 'enttäuscht',     en: 'disappointed',  ru: 'разочарованный', ua: 'розчарований' },
    { de: 'aufgeregt',      en: 'excited',       ru: 'взволнованный', ua: 'схвильований' },
    { de: 'stolz',          en: 'proud',         ru: 'гордый',        ua: 'гордий' },
    { de: 'als',            en: 'when (past, once)', ru: 'когда (однократно)', ua: 'коли (одноразово)' },
    { de: 'wenn',           en: 'if / when',     ru: 'если / когда',  ua: 'якщо / коли' },
    { de: 'während',        en: 'while',         ru: 'во время / пока', ua: 'під час / поки' },
    { de: 'bevor',          en: 'before',        ru: 'прежде чем',    ua: 'перш ніж' },
    { de: 'nachdem',        en: 'after',         ru: 'после того как', ua: 'після того як' },
    { de: 'sobald',         en: 'as soon as',    ru: 'как только',    ua: 'щойно' },
  ],

  verbFocus: ['sich erinnern', 'vergessen', 'sich freuen', 'sich ärgern'],

  tasks: [
    { type: 'grammar', grammarFocus: 'wenn vs. als', drill: 'wenn-als',
      text: { en: 'wenn (repeated/present) vs. als (a single event in the past).', ru: 'wenn (повторяющееся/настоящее) vs. als (однократное в прошлом).', ua: 'wenn (повторюване/теперішнє) vs. als (одноразове в минулому).' } },
    { type: 'grammar', grammarFocus: 'Temporal conjunctions', drill: 'temporal-konjunktionen',
      text: { en: 'Temporal conjunctions: während, bevor, sobald.', ru: 'Временные союзы: während, bevor, sobald.', ua: 'Часові сполучники: während, bevor, sobald.' } },
    { type: 'grammar', grammarFocus: 'Plusquamperfekt', drill: 'plusquamperfekt',
      text: { en: 'Plusquamperfekt: hatte/war + Partizip II, used with nachdem.', ru: 'Plusquamperfekt: hatte/war + Partizip II, с nachdem.', ua: 'Plusquamperfekt: hatte/war + Partizip II, із nachdem.' } },
    { type: 'write',
      text: { en: 'Write a memory — 80–100 words with als/nachdem and war/hatte.', ru: 'Напишите воспоминание — 80–100 слов с als/nachdem и war/hatte.', ua: 'Напишіть спогад — 80–100 слів з als/nachdem і war/hatte.' },
      checklist: [
        { en: 'Use als for one past event.', ru: 'Используйте als для одного события в прошлом.', ua: 'Використайте als для однієї події в минулому.' },
        { en: 'Use nachdem with the Plusquamperfekt once.', ru: 'Используйте nachdem с Plusquamperfekt один раз.', ua: 'Використайте nachdem з Plusquamperfekt один раз.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: als/nachdem dictation; revisit weil/dass/ob (W16).', ru: 'День повторения: диктант с als/nachdem; повтор weil/dass/ob (W16).', ua: 'День повторення: диктант з als/nachdem; повтор weil/dass/ob (W16).' } },
  ],

  canDo: [
    { en: 'I can choose between wenn and als correctly.', ru: 'Я могу правильно выбрать между wenn и als.', ua: 'Я можу правильно обрати між wenn та als.' },
    { en: 'I can link events with während/bevor/sobald.', ru: 'Я могу связывать события с während/bevor/sobald.', ua: 'Я можу поєднувати події з während/bevor/sobald.' },
    { en: 'I can say what had happened earlier (Plusquamperfekt).', ru: 'Я могу сказать, что произошло раньше (Plusquamperfekt).', ua: 'Я можу сказати, що сталося раніше (Plusquamperfekt).' },
    { en: 'I can talk about a childhood memory.', ru: 'Я могу рассказать о воспоминании из детства.', ua: 'Я можу розповісти про спогад із дитинства.' },
    { en: 'I can describe how I felt about it.', ru: 'Я могу описать, что я тогда чувствовал.', ua: 'Я можу описати, що я тоді відчував.' },
  ],

  drills: {
    'wenn-als': {
      level: 'A2',
      concept: { en: 'wenn vs. als', ru: 'wenn против als', ua: 'wenn проти als' },
      prompt:  { en: 'Choose wenn or als.', ru: 'Выберите wenn или als.', ua: 'Виберіть wenn або als.' },
      items: [
        { type: 'choice', de: '___ ich klein war, wohnte ich in Kyjiw.', answer: 'Als', options: ['Als', 'Wenn', 'Wann'] },
        { type: 'choice', de: 'Immer ___ es regnet, bleibe ich zu Hause.', answer: 'wenn', options: ['als', 'wenn', 'ob'] },
        { type: 'cloze',  de: '___ ich gestern nach Hause kam, war es schon dunkel. (single past event)', answer: 'Als' },
      ],
    },
    'temporal-konjunktionen': {
      level: 'A2',
      concept: { en: 'während / bevor / sobald', ru: 'während / bevor / sobald', ua: 'während / bevor / sobald' },
      prompt:  { en: 'Choose the temporal conjunction.', ru: 'Выберите временной союз.', ua: 'Виберіть часовий сполучник.' },
      items: [
        { type: 'choice', de: '___ ich koche, höre ich Musik.', answer: 'Während', options: ['Während', 'Bevor', 'Sobald'] },
        { type: 'choice', de: 'Ruf mich an, ___ du ankommst.', answer: 'sobald', options: ['während', 'bevor', 'sobald'] },
        { type: 'cloze',  de: '___ ich schlafen gehe, lese ich ein Buch. (before)', answer: 'Bevor' },
      ],
    },
    'plusquamperfekt': {
      level: 'A2',
      concept: { en: 'Plusquamperfekt with nachdem', ru: 'Plusquamperfekt с nachdem', ua: 'Plusquamperfekt із nachdem' },
      prompt:  { en: 'Form the Plusquamperfekt.', ru: 'Образуйте Plusquamperfekt.', ua: 'Утворіть Plusquamperfekt.' },
      items: [
        { type: 'cloze',  de: 'Nachdem ich gegessen ___, ging ich spazieren. (haben)', answer: 'hatte' },
        { type: 'cloze',  de: 'Nachdem er angekommen ___, rief er an. (sein)', answer: 'war' },
        { type: 'order',  answer: ['Nachdem', 'wir', 'gegessen', 'hatten,', 'gingen', 'wir'] },
      ],
    },
  },

  dialogue: {
    slug: 'w17-erinnerung',
    level: 'A2',
    vocabularyMaxWeek: 17,
    title: { en: 'Childhood memories', ru: 'Воспоминания детства', ua: 'Спогади дитинства' },
    lines: [
      { speaker: 'A', de: 'Als ich ein Kind war, wohnten wir auf dem Land.' },
      { speaker: 'B', de: 'Und wie war das?' },
      { speaker: 'A', de: 'Sehr schön. Nachdem wir umgezogen waren, vermisste ich den Garten.' },
      { speaker: 'B', de: 'Das kann ich verstehen. Ich war auch oft glücklich damals.' },
    ],
    questions: [
      { de: 'Person A wohnte als Kind auf dem Land.', answer: true, text: { en: 'Person A lived in the countryside as a child.', ru: 'Человек A в детстве жил в деревне.', ua: 'Людина A у дитинстві жила в селі.' } },
      { de: 'Nach dem Umzug hatte A einen Garten.', answer: false, text: { en: 'After moving, A had a garden.', ru: 'После переезда у A был сад.', ua: 'Після переїзду в A був сад.' } },
      { de: 'B war damals oft glücklich.', answer: true, text: { en: 'B was often happy back then.', ru: 'B тогда часто был счастлив.', ua: 'B тоді часто був щасливий.' } },
    ],
  },
};

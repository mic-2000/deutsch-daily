/* Week 11 — Body & health; conjunctions ADUSO (A1, phase A1.2). Days 51–55. Reuses v1 W8 (body/health). */
module.exports = {
  n: 11,
  phase: 'A1.2',
  level: 'A1',
  theme:      { en: 'Body & health; conjunctions (ADUSO)', ru: 'Тело и здоровье; союзы (ADUSO)', ua: 'Тіло та здоров’я; сполучники (ADUSO)' },
  grammar:    { en: 'ADUSO (position 0): und/aber/oder/denn/sondern; time-before-place', ru: 'ADUSO (позиция 0): und/aber/oder/denn/sondern; время перед местом', ua: 'ADUSO (позиція 0): und/aber/oder/denn/sondern; час перед місцем' },
  vocabTheme: { en: 'body, health', ru: 'тело, здоровье', ua: 'тіло, здоров’я' },

  vocab: [
    { de: 'der Körper',   en: 'body',        ru: 'тело',            ua: 'тіло' },
    { de: 'der Kopf',     en: 'head',        ru: 'голова',          ua: 'голова' },
    { de: 'das Auge',     en: 'eye',         ru: 'глаз',            ua: 'око' },
    { de: 'das Ohr',      en: 'ear',         ru: 'ухо',             ua: 'вухо' },
    { de: 'die Nase',     en: 'nose',        ru: 'нос',             ua: 'ніс' },
    { de: 'der Mund',     en: 'mouth',       ru: 'рот',             ua: 'рот' },
    { de: 'der Zahn',     en: 'tooth',       ru: 'зуб',             ua: 'зуб' },
    { de: 'die Hand',     en: 'hand',        ru: 'рука (кисть)',    ua: 'рука (кисть)' },
    { de: 'der Arm',      en: 'arm',         ru: 'рука',            ua: 'рука' },
    { de: 'das Bein',     en: 'leg',         ru: 'нога',            ua: 'нога' },
    { de: 'der Fuß',      en: 'foot',        ru: 'ступня',          ua: 'ступня' },
    { de: 'der Bauch',    en: 'belly',       ru: 'живот',           ua: 'живіт' },
    { de: 'der Rücken',   en: 'back',        ru: 'спина',           ua: 'спина' },
    { de: 'das Herz',     en: 'heart',       ru: 'сердце',          ua: 'серце' },
    { de: 'krank',        en: 'ill / sick',  ru: 'больной',         ua: 'хворий' },
    { de: 'gesund',       en: 'healthy',     ru: 'здоровый',        ua: 'здоровий' },
    { de: 'das Fieber',   en: 'fever',       ru: 'температура',     ua: 'температура' },
    { de: 'die Schmerzen', en: 'pains',      ru: 'боли',            ua: 'болі' },
    { de: 'der Arzt',     en: 'doctor',      ru: 'врач',            ua: 'лікар' },
    { de: 'die Tablette', en: 'pill',        ru: 'таблетка',        ua: 'таблетка' },
  ],

  verbFocus: ['weh tun', 'nehmen', 'fühlen', 'bleiben'],
  receptiveVerbs: ['weh tun'],

  tasks: [
    { type: 'grammar', grammarFocus: 'und/aber/oder', drill: 'aduso-position-0',
      text: { en: 'Coordinating conjunctions und/aber/oder in position 0 (no verb shift).', ru: 'Сочинительные союзы und/aber/oder в позиции 0 (без сдвига глагола).', ua: 'Сурядні сполучники und/aber/oder у позиції 0 (без зсуву дієслова).' } },
    { type: 'grammar', grammarFocus: 'denn / sondern', drill: 'denn-sondern',
      text: { en: 'denn (because) and sondern (but rather, after a negation) — both stay in position 0 like und/aber/oder.', ru: 'denn (потому что) и sondern (а, после отрицания) — оба стоят в позиции 0, как und/aber/oder.', ua: 'denn (тому що) і sondern (а, після заперечення) — обидва стоять у позиції 0, як und/aber/oder.' } },
    { type: 'grammar', grammarFocus: 'Time before place', drill: 'zeit-vor-ort',
      text: { en: 'Word order: time before place (Ich gehe heute zum Arzt).', ru: 'Порядок слов: время перед местом (Ich gehe heute zum Arzt).', ua: 'Порядок слів: час перед місцем (Ich gehe heute zum Arzt).' } },
    { type: 'write',
      text: { en: 'Write a short dialogue at the doctor — 8–10 lines with aber/denn.', ru: 'Напишите короткий диалог у врача — 8–10 реплик с aber/denn.', ua: 'Напишіть короткий діалог у лікаря — 8–10 реплік з aber/denn.' },
      checklist: [
        { en: 'Name at least 2 body parts.', ru: 'Назовите хотя бы 2 части тела.', ua: 'Назвіть щонайменше 2 частини тіла.' },
        { en: 'Use denn to give a reason.', ru: 'Используйте denn для причины.', ua: 'Використайте denn для причини.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: add plural forms (Nasen, Augen, Bäuche); dictation.', ru: 'День повторения: формы мн. ч. (Nasen, Augen, Bäuche); диктант.', ua: 'День повторення: форми множини (Nasen, Augen, Bäuche); диктант.' } },
  ],

  canDo: [
    { en: 'I can link ideas with und, aber and oder.', ru: 'Я могу связывать мысли с und, aber и oder.', ua: 'Я можу поєднувати думки з und, aber та oder.' },
    { en: 'I can give a reason with denn.', ru: 'Я могу назвать причину с denn.', ua: 'Я можу назвати причину з denn.' },
    { en: 'I can put time before place in a sentence.', ru: 'Я могу ставить время перед местом в предложении.', ua: 'Я можу ставити час перед місцем у реченні.' },
    { en: 'I can describe symptoms at the doctor.', ru: 'Я могу описать симптомы у врача.', ua: 'Я можу описати симптоми у лікаря.' },
    { en: 'I can name body parts and their plural forms.', ru: 'Я могу назвать части тела и их формы мн.ч.', ua: 'Я можу назвати частини тіла та їхні форми множини.' },
  ],

  drills: {
    'aduso-position-0': {
      level: 'A1',
      concept: { en: 'Conjunctions in position 0', ru: 'Союзы в позиции 0', ua: 'Сполучники в позиції 0' },
      prompt:  { en: 'Choose the right conjunction.', ru: 'Выберите правильный союз.', ua: 'Виберіть правильний сполучник.' },
      items: [
        { type: 'choice', de: 'Ich bin müde ___ ich gehe schlafen.', answer: 'und', options: ['und', 'oder', 'aber'] },
        { type: 'choice', de: 'Er ist krank, ___ er arbeitet.', answer: 'aber', options: ['und', 'aber', 'oder'] },
        { type: 'cloze',  de: 'Möchtest du Tee ___ Kaffee? (or)', answer: 'oder' },
      ],
    },
    'denn-sondern': {
      level: 'A1',
      concept: { en: 'denn vs. sondern', ru: 'denn против sondern', ua: 'denn проти sondern' },
      prompt:  { en: 'Choose denn or sondern.', ru: 'Выберите denn или sondern.', ua: 'Виберіть denn або sondern.' },
      items: [
        { type: 'choice', de: 'Ich bleibe zu Hause, ___ ich bin krank.', answer: 'denn', options: ['denn', 'sondern', 'aber'] },
        { type: 'choice', de: 'Das ist kein Tee, ___ Kaffee.', answer: 'sondern', options: ['denn', 'sondern', 'und'] },
        { type: 'cloze',  de: 'Ich nehme eine Tablette, ___ mein Kopf tut weh. (because)', answer: 'denn' },
      ],
    },
    'zeit-vor-ort': {
      level: 'A1',
      concept: { en: 'Time before place', ru: 'Время перед местом', ua: 'Час перед місцем' },
      prompt:  { en: 'Put the sentence in the right order.', ru: 'Поставьте предложение в правильном порядке.', ua: 'Поставте речення в правильному порядку.' },
      items: [
        { type: 'order',  answer: ['Ich', 'gehe', 'heute', 'zum', 'Arzt'] },
        { type: 'order',  answer: ['Wir', 'fahren', 'morgen', 'nach', 'Berlin'] },
        { type: 'cloze',  de: 'Er kommt ___ nach Hause. (heute — time slot)', answer: 'heute' },
      ],
    },
  },

  dialogue: {
    slug: 'w11-beim-arzt',
    level: 'A1',
    vocabularyMaxWeek: 11,
    title: { en: 'At the doctor', ru: 'У врача', ua: 'У лікаря' },
    lines: [
      { speaker: 'Arzt', de: 'Guten Tag. Was fehlt Ihnen?' },
      { speaker: 'Patient', de: 'Mein Kopf tut weh und ich habe Fieber.' },
      { speaker: 'Arzt', de: 'Seit wann sind Sie krank?' },
      { speaker: 'Patient', de: 'Seit gestern. Ich bin sehr müde.' },
      { speaker: 'Arzt', de: 'Nehmen Sie diese Tabletten und bleiben Sie im Bett.' },
    ],
    questions: [
      { de: 'Der Patient hat Fieber.', answer: true, text: { en: 'The patient has a fever.', ru: 'У пациента температура.', ua: 'У пацієнта температура.' } },
      { de: 'Der Patient ist seit einer Woche krank.', answer: false, text: { en: 'The patient has been ill for a week.', ru: 'Пациент болен неделю.', ua: 'Пацієнт хворіє тиждень.' } },
      { de: 'Der Arzt gibt dem Patienten Tabletten.', answer: true, text: { en: 'The doctor gives the patient pills.', ru: 'Врач даёт пациенту таблетки.', ua: 'Лікар дає пацієнту таблетки.' } },
    ],
  },
};

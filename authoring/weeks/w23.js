/* Week 23 — Service & politeness; Konjunktiv II formulas (A2, phase A2.2). Days 111–115. Reuses food (v1 W2). */
module.exports = {
  n: 23,
  phase: 'A2.2',
  level: 'A2',
  theme:      { en: 'Service & politeness; Konjunktiv II formulas', ru: 'Сервис и вежливость; формулы Konjunktiv II', ua: 'Сервіс і ввічливість; формули Konjunktiv II' },
  grammar:    { en: 'Polite requests könnte/würde gern/hätte gern; advice with sollte', ru: 'Вежливые просьбы könnte/würde gern/hätte gern; советы с sollte', ua: 'Ввічливі прохання könnte/würde gern/hätte gern; поради з sollte' },
  vocabTheme: { en: 'politeness, restaurant', ru: 'вежливость, ресторан', ua: 'ввічливість, ресторан' },

  vocab: [
    { de: 'Könnten Sie …?',   en: 'Could you …?',        ru: 'Не могли бы вы …?',   ua: 'Чи не могли б ви …?' },
    { de: 'Würden Sie …?',    en: 'Would you …?',        ru: 'Вы бы …?',            ua: 'Ви б …?' },
    { de: 'Ich hätte gern …', en: "I'd like …",          ru: 'Я хотел бы …',        ua: 'Я хотів би …' },
    { de: 'Ich möchte …',     en: 'I would like …',      ru: 'Я хотел бы …',        ua: 'Я хотів би …' },
    { de: 'die Speisekarte',  en: 'menu',                ru: 'меню',                ua: 'меню' },
    { de: 'die Bestellung',   en: 'order',               ru: 'заказ',               ua: 'замовлення' },
    { de: 'die Rechnung',     en: 'bill',                ru: 'счёт',                ua: 'рахунок' },
    { de: 'das Trinkgeld',    en: 'tip',                 ru: 'чаевые',              ua: 'чайові' },
    { de: 'der Kellner',      en: 'waiter',              ru: 'официант',            ua: 'офіціант' },
    { de: 'die Vorspeise',    en: 'starter',             ru: 'закуска',             ua: 'закуска' },
    { de: 'das Hauptgericht', en: 'main course',         ru: 'основное блюдо',      ua: 'основна страва' },
    { de: 'die Nachspeise',   en: 'dessert',             ru: 'десерт',              ua: 'десерт' },
    { de: 'lecker',           en: 'delicious',           ru: 'вкусный',             ua: 'смачний' },
    { de: 'höflich',          en: 'polite',              ru: 'вежливый',            ua: 'ввічливий' },
    { de: 'der Vorschlag',    en: 'suggestion',          ru: 'предложение',         ua: 'пропозиція' },
    { de: 'der Rat',          en: 'advice',              ru: 'совет',               ua: 'порада' },
  ],

  verbFocus: ['bestellen', 'bringen', 'empfehlen'],
  receptiveVerbs: ['empfehlen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Polite requests (KII)', drill: 'kii-hoeflich',
      text: { en: 'Polite requests: könnte, würde gern, hätte gern.', ru: 'Вежливые просьбы: könnte, würde gern, hätte gern.', ua: 'Ввічливі прохання: könnte, würde gern, hätte gern.' } },
    { type: 'grammar', grammarFocus: 'Advice with sollte', drill: 'sollte-rat',
      text: { en: 'Giving advice with sollte (+ dürfte/müsste).', ru: 'Советы с sollte (+ dürfte/müsste).', ua: 'Поради з sollte (+ dürfte/müsste).' } },
    { type: 'listen',
      text: { en: 'Integration: a restaurant dialogue "Im Restaurant" with comprehension checks.', ru: 'Интеграция: диалог в ресторане «Im Restaurant» с проверками.', ua: 'Інтеграція: діалог у ресторані «Im Restaurant» з перевірками.' } },
    { type: 'write',
      text: { en: 'Write a polite email or role-play making a reservation — 60–80 words.', ru: 'Напишите вежливый e-mail или разыграйте сцену бронирования — 60–80 слов.', ua: 'Напишіть ввічливий e-mail або розіграйте сцену бронювання — 60–80 слів.' },
      checklist: [
        { en: 'Use at least 2 polite KII formulas.', ru: 'Используйте хотя бы 2 вежливые формулы KII.', ua: 'Використайте щонайменше 2 ввічливі формули KII.' },
        { en: 'Make one request and one suggestion.', ru: 'Сделайте одну просьбу и одно предложение.', ua: 'Зробіть одне прохання й одну пропозицію.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: polite formulas dictation; revisit Relativsätze I (W22).', ru: 'День повторения: диктант вежливых формул; повтор Relativsätze I (W22).', ua: 'День повторення: диктант ввічливих формул; повтор Relativsätze I (W22).' } },
  ],

  canDo: [
    { en: 'I can make a polite request with könnte/würde.', ru: 'Я могу вежливо попросить с könnte/würde.', ua: 'Я можу ввічливо попросити з könnte/würde.' },
    { en: 'I can give advice with sollte.', ru: 'Я могу дать совет с sollte.', ua: 'Я можу дати пораду з sollte.' },
    { en: 'I can order politely in a restaurant.', ru: 'Я могу вежливо сделать заказ в ресторане.', ua: 'Я можу ввічливо зробити замовлення в ресторані.' },
    { en: 'I can write a polite email.', ru: 'Я могу написать вежливый e-mail.', ua: 'Я можу написати ввічливий e-mail.' },
    { en: 'I can soften requests to sound friendly.', ru: 'Я могу смягчить просьбу, чтобы звучать дружелюбно.', ua: 'Я можу пом’якшити прохання, щоб звучати доброзичливо.' },
  ],

  drills: {
    'kii-hoeflich': {
      level: 'A2',
      concept: { en: 'Polite Konjunktiv II requests', ru: 'Вежливые просьбы в Konjunktiv II', ua: 'Ввічливі прохання в Konjunktiv II' },
      prompt:  { en: 'Choose the polite form.', ru: 'Выберите вежливую форму.', ua: 'Виберіть ввічливу форму.' },
      items: [
        { type: 'choice', de: '___ Sie mir bitte helfen?', answer: 'Könnten', options: ['Können', 'Könnten', 'Konnten'] },
        { type: 'cloze',  de: 'Ich ___ gern einen Kaffee. (hätte)', answer: 'hätte' },
        { type: 'order',  answer: ['Würden', 'Sie', 'die', 'Rechnung', 'bringen?'] },
      ],
    },
    'sollte-rat': {
      level: 'A2',
      concept: { en: 'Advice with sollte', ru: 'Советы с sollte', ua: 'Поради з sollte' },
      prompt:  { en: 'Give advice with sollte.', ru: 'Дайте совет с sollte.', ua: 'Дайте пораду з sollte.' },
      items: [
        { type: 'cloze',  de: 'Du ___ mehr schlafen. (sollte, du-form)', answer: 'solltest' },
        { type: 'choice', de: 'Ihr ___ einen Arzt fragen.', answer: 'solltet', options: ['sollt', 'solltet', 'sollten'] },
        { type: 'cloze',  de: 'Man ___ höflich sein. (sollte)', answer: 'sollte' },
      ],
    },
  },

  dialogue: {
    slug: 'w23-im-restaurant',
    level: 'A2',
    vocabularyMaxWeek: 23,
    title: { en: 'At the restaurant', ru: 'В ресторане', ua: 'У ресторані' },
    lines: [
      { speaker: 'Kellner', de: 'Guten Abend. Was hätten Sie gern?' },
      { speaker: 'Gast', de: 'Ich hätte gern die Suppe als Vorspeise.' },
      { speaker: 'Kellner', de: 'Und als Hauptgericht?' },
      { speaker: 'Gast', de: 'Könnten Sie mir etwas empfehlen?' },
      { speaker: 'Kellner', de: 'Der Fisch ist heute sehr lecker.' },
    ],
    questions: [
      { de: 'Der Gast bestellt eine Suppe als Vorspeise.', answer: true, text: { en: 'The guest orders soup as a starter.', ru: 'Гость заказывает суп как закуску.', ua: 'Гість замовляє суп як закуску.' } },
      { de: 'Der Kellner empfiehlt Fleisch.', answer: false, text: { en: 'The waiter recommends meat.', ru: 'Официант советует мясо.', ua: 'Офіціант радить м’ясо.' } },
      { de: 'Der Gast fragt nach einer Empfehlung.', answer: true, text: { en: 'The guest asks for a recommendation.', ru: 'Гость просит рекомендацию.', ua: 'Гість просить рекомендацію.' } },
    ],
  },
};

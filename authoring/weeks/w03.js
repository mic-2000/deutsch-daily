/* Week 3 — Food and shopping; the accusative (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 11–15.
   Vocab reuses old v1 W2 (Lebensmittel, Einkaufen); grammar adds the accusative. */
module.exports = {
  n: 3,
  phase: 'A1.1',
  level: 'A1',
  theme:      { en: 'Food and shopping; the accusative', ru: 'Еда и покупки; винительный падеж', ua: 'Їжа та покупки; знахідний відмінок' },
  grammar:    { en: 'Accusative articles (der→den, ein→einen), kein vs nicht, accusative prepositions, stem-vowel change',
                ru: 'Артикли Akkusativ (der→den, ein→einen), kein vs nicht, предлоги Akkusativ, изменение корневой гласной',
                ua: 'Артиклі Akkusativ (der→den, ein→einen), kein vs nicht, прийменники Akkusativ, зміна кореневого голосного' },
  vocabTheme: { en: 'food, groceries, shopping', ru: 'продукты, еда, покупки', ua: 'продукти, їжа, покупки' },

  vocab: [
    // groceries / food (reused from old v1 W2)
    { de: 'das Brot',       en: 'bread',       ru: 'хлеб',        ua: 'хліб' },
    { de: 'der Käse',       en: 'cheese',      ru: 'сыр',         ua: 'сир' },
    { de: 'das Ei',         en: 'egg',         ru: 'яйцо',        ua: 'яйце' },
    { de: 'das Fleisch',    en: 'meat',        ru: 'мясо',        ua: "м'ясо" },
    { de: 'der Fisch',      en: 'fish',        ru: 'рыба',        ua: 'риба' },
    { de: 'das Gemüse',     en: 'vegetables',  ru: 'овощи',       ua: 'овочі' },
    { de: 'das Obst',       en: 'fruit',       ru: 'фрукты',      ua: 'фрукти' },
    { de: 'der Apfel',      en: 'apple',       ru: 'яблоко',      ua: 'яблуко' },
    { de: 'die Milch',      en: 'milk',        ru: 'молоко',      ua: 'молоко' },
    // shopping (reused from old v1 W2)
    { de: 'der Supermarkt', en: 'supermarket', ru: 'супермаркет', ua: 'супермаркет' },
    { de: 'die Bäckerei',   en: 'bakery',      ru: 'пекарня',     ua: 'пекарня' },
    { de: 'der Markt',      en: 'market',      ru: 'рынок',       ua: 'ринок' },
    { de: 'der Preis',      en: 'price',       ru: 'цена',        ua: 'ціна' },
    { de: 'das Geld',       en: 'money',       ru: 'деньги',      ua: 'гроші' },
    { de: 'billig',         en: 'cheap',       ru: 'дешёвый',     ua: 'дешевий' },
    { de: 'teuer',          en: 'expensive',   ru: 'дорогой',     ua: 'дорогий' },
    { de: 'das Kilo',       en: 'kilogram',    ru: 'килограмм',   ua: 'кілограм' },
    { de: 'die Flasche',    en: 'bottle',      ru: 'бутылка',     ua: 'пляшка' },
    // drinks (reused from old v1 W2)
    { de: 'der Kaffee',     en: 'coffee',      ru: 'кофе',        ua: 'кава' },
    { de: 'der Tee',        en: 'tea',         ru: 'чай',         ua: 'чай' },
    { de: 'das Wasser',     en: 'water',       ru: 'вода',        ua: 'вода' },
    { de: 'der Saft',       en: 'juice',       ru: 'сок',         ua: 'сік' },
    { de: 'der Kuchen',     en: 'cake',        ru: 'пирог / торт', ua: 'пиріг / торт' },
    { de: 'das Frühstück',  en: 'breakfast',   ru: 'завтрак',     ua: 'сніданок' },
    // taste / rest (reused from old v1 W2)
    { de: 'lecker',         en: 'delicious',   ru: 'вкусный',     ua: 'смачний' },
    { de: 'süß',            en: 'sweet',       ru: 'сладкий',     ua: 'солодкий' },
    { de: 'frisch',         en: 'fresh',       ru: 'свежий',      ua: 'свіжий' },
    { de: 'hungrig',        en: 'hungry',      ru: 'голодный',    ua: 'голодний' },
  ],

  verbFocus: ['kaufen', 'bezahlen', 'kosten', 'brauchen', 'nehmen', 'essen', 'trinken', 'kochen', 'suchen'],
  receptiveVerbs: ['kochen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Accusative articles (der→den, ein→einen)', drill: 'akk-artikel',
      text: { en: 'Learn the accusative articles: der→den, ein→einen (die/das and eine stay the same). Say what you buy.',
              ru: 'Выучите артикли Akkusativ: der→den, ein→einen (die/das и eine не меняются). Скажите, что вы покупаете.',
              ua: 'Вивчіть артиклі Akkusativ: der→den, ein→einen (die/das та eine не змінюються). Скажіть, що ви купуєте.' } },
    { type: 'grammar', grammarFocus: 'kein and nicht', drill: 'kein-nicht',
      text: { en: 'Negate with kein/keinen in the accusative and learn when to use nicht instead of kein.',
              ru: 'Отрицайте с kein/keinen в Akkusativ и запомните, когда вместо kein нужно nicht.',
              ua: 'Заперечуйте з kein/keinen в Akkusativ і запам’ятайте, коли замість kein потрібно nicht.' } },
    { type: 'grammar', grammarFocus: 'Accusative prepositions + stem-vowel change', drill: 'akk-praepositionen',
      text: { en: 'Accusative prepositions für/ohne/gegen/durch/um and the stem-vowel change (du isst, er nimmt).',
              ru: 'Предлоги Akkusativ für/ohne/gegen/durch/um и изменение корневой гласной (du isst, er nimmt).',
              ua: 'Прийменники Akkusativ für/ohne/gegen/durch/um та зміна кореневого голосного (du isst, er nimmt).' } },
    { type: 'write',
      text: { en: 'Write a short shop dialogue of 8–10 lines: greet, ask prices, order and pay.',
              ru: 'Напишите короткий диалог в магазине из 8–10 реплик: поздоровайтесь, спросите цены, закажите и оплатите.',
              ua: 'Напишіть короткий діалог у магазині з 8–10 реплік: привітайтеся, спитайте ціни, замовте й оплатіть.' },
      checklist: [
        { en: 'Use at least three food words with the correct accusative article.', ru: 'Используйте минимум три слова о еде с правильным артиклем Akkusativ.', ua: 'Використайте щонайменше три слова про їжу з правильним артиклем Akkusativ.' },
        { en: 'Ask about a price (Was kostet …? / Wie viel kostet …?).', ru: 'Спросите о цене (Was kostet …? / Wie viel kostet …?).', ua: 'Спитайте про ціну (Was kostet …? / Wie viel kostet …?).' },
        { en: 'Use kaufen, nehmen or bezahlen at least once.', ru: 'Используйте kaufen, nehmen или bezahlen хотя бы раз.', ua: 'Використайте kaufen, nehmen або bezahlen хоча б раз.' },
      ] },
    { type: 'review', drill: 'akk-artikel',
      text: { en: 'Review week 3, then role-play a shop conversation out loud using a template.',
              ru: 'Повторите неделю 3, затем разыграйте вслух диалог в магазине по шаблону.',
              ua: 'Повторіть тиждень 3, потім розіграйте вголос діалог у магазині за шаблоном.' } },
  ],

  canDo: [
    { en: 'I can use accusative articles to say what I buy or take.', ru: 'Я могу использовать артикли Akkusativ, чтобы сказать, что покупаю или беру.', ua: 'Я можу використовувати артиклі Akkusativ, щоб сказати, що купую або беру.' },
    { en: 'I can negate correctly with kein and nicht.', ru: 'Я могу правильно отрицать с kein и nicht.', ua: 'Я можу правильно заперечувати з kein і nicht.' },
    { en: 'I can use accusative prepositions and stem-changing verbs (essen, nehmen).', ru: 'Я могу использовать предлоги Akkusativ и глаголы с чередованием (essen, nehmen).', ua: 'Я можу використовувати прийменники Akkusativ та дієслова з чергуванням (essen, nehmen).' },
    { en: 'I can write a short shopping dialogue.', ru: 'Я могу написать короткий диалог о покупках.', ua: 'Я можу написати короткий діалог про покупки.' },
    { en: 'I can order food and shop in a role-play.', ru: 'Я могу заказать еду и сделать покупки в ролевой игре.', ua: 'Я можу замовити їжу й зробити покупки в рольовій грі.' },
  ],

  drills: {
    'akk-artikel': {
      level: 'A1',
      concept: { en: 'Accusative articles (der→den, ein→einen)', ru: 'Артикли Akkusativ (der→den, ein→einen)', ua: 'Артиклі Akkusativ (der→den, ein→einen)' },
      prompt:  { en: 'Put the article into the accusative.', ru: 'Поставьте артикль в Akkusativ.', ua: 'Поставте артикль в Akkusativ.' },
      items: [
        { type: 'cloze',  de: 'Ich kaufe ___ Apfel. (ein)', answer: 'einen' },
        { type: 'choice', de: 'Ich nehme ___ Käse.', answer: 'den', options: ['der', 'den', 'dem'] },
        { type: 'order',  answer: ['Ich', 'brauche', 'einen', 'Kaffee'] },
      ],
    },
    'kein-nicht': {
      level: 'A1',
      concept: { en: 'Negation: kein with nouns, nicht otherwise', ru: 'Отрицание: kein с существительными, иначе nicht', ua: 'Заперечення: kein з іменниками, інакше nicht' },
      prompt:  { en: 'Fill in kein-/keinen or nicht.', ru: 'Вставьте kein-/keinen или nicht.', ua: 'Вставте kein-/keinen або nicht.' },
      items: [
        { type: 'cloze',  de: 'Ich trinke ___ Wasser.', answer: 'kein' },
        { type: 'choice', de: 'Ich esse ___ Fisch.', answer: 'keinen', options: ['kein', 'keinen', 'nicht'] },
        { type: 'cloze',  de: 'Ich mag den Käse ___.', answer: 'nicht' },
      ],
    },
    'akk-praepositionen': {
      level: 'A1',
      concept: { en: 'Accusative prepositions and stem-vowel change', ru: 'Предлоги Akkusativ и изменение корневой гласной', ua: 'Прийменники Akkusativ та зміна кореневого голосного' },
      prompt:  { en: 'Fill in the accusative form or the correct verb form.', ru: 'Вставьте форму Akkusativ или правильную форму глагола.', ua: 'Вставте форму Akkusativ або правильну форму дієслова.' },
      items: [
        { type: 'cloze',  de: 'Das Geschenk ist für ___ Vater. (der)', answer: 'den' },
        { type: 'choice', de: 'Er ___ einen Apfel. (nehmen)', answer: 'nimmt', options: ['nehmt', 'nimmt', 'nehmst'] },
        { type: 'cloze',  de: 'Du ___ viel Gemüse. (essen)', answer: 'isst' },
      ],
    },
  },

  dialogue: {
    slug: 'w03-einkaufen',
    level: 'A1',
    vocabularyMaxWeek: 3,
    title: { en: 'At the shop', ru: 'В магазине', ua: 'У магазині' },
    lines: [
      { speaker: 'A', de: 'Guten Tag! Was möchten Sie?' },
      { speaker: 'B', de: 'Guten Tag. Ich brauche Brot und Käse.' },
      { speaker: 'A', de: 'Das Brot ist frisch. Möchten Sie auch Obst?' },
      { speaker: 'B', de: 'Ja, ich nehme einen Apfel. Was kostet der Kaffee?' },
      { speaker: 'A', de: 'Der Kaffee kostet drei Euro.' },
      { speaker: 'B', de: 'Gut, ich nehme den Kaffee. Ich bezahle mit Karte.' },
    ],
    questions: [
      { de: 'Der Kunde kauft Brot und Käse.', answer: true, text: { en: 'The customer buys bread and cheese.', ru: 'Покупатель покупает хлеб и сыр.', ua: 'Покупець купує хліб і сир.' } },
      { de: 'Der Kaffee kostet fünf Euro.', answer: false, text: { en: 'The coffee costs five euros.', ru: 'Кофе стоит пять евро.', ua: 'Кава коштує п’ять євро.' } },
      { de: 'Der Kunde bezahlt mit Karte.', answer: true, text: { en: 'The customer pays by card.', ru: 'Покупатель платит картой.', ua: 'Покупець платить карткою.' } },
    ],
  },
};

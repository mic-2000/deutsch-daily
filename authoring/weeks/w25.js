/* Week 25 — Extended family; the genitive + n-Deklination (B1, phase B1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 121–125.
   Vocab reuses old v1 week 14 (Genitiv, Familie erweitert), index-matched glosses. */
module.exports = {
  n: 25,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'Extended family; the genitive', ru: 'Расширенная семья; генитив', ua: 'Розширена сім’я; генітив' },
  grammar:    { en: 'Genitiv case, genitive prepositions (wegen/trotz/während/statt), n-Deklination', ru: 'Genitiv, генитивные предлоги (wegen/trotz/während/statt), n-Deklination', ua: 'Genitiv, генітивні прийменники (wegen/trotz/während/statt), n-Deklination' },
  vocabTheme: { en: 'extended family', ru: 'расширенная семья', ua: 'розширена сім’я' },

  vocab: [
    { de: 'wegen',                en: 'because of',      ru: 'из-за (Gen.)',       ua: 'через (причина)' },
    { de: 'trotz',                en: 'despite',         ru: 'несмотря на (Gen.)', ua: 'незважаючи на' },
    { de: 'während',              en: 'during',          ru: 'во время (Gen.)',    ua: 'під час' },
    { de: 'statt',                en: 'instead of',      ru: 'вместо (Gen.)',      ua: 'замість' },
    { de: 'aufgrund',             en: 'due to',          ru: 'вследствие (Gen.)',  ua: 'внаслідок' },
    { de: 'der Schwager',         en: 'brother-in-law',  ru: 'шурин/деверь',       ua: 'зять / шурин' },
    { de: 'die Schwägerin',       en: 'sister-in-law',   ru: 'невестка',           ua: 'невістка' },
    { de: 'der Schwiegervater',   en: 'father-in-law',   ru: 'тесть/свёкор',       ua: 'тесть / свекор' },
    { de: 'die Schwiegermutter',  en: 'mother-in-law',   ru: 'тёща/свекровь',      ua: 'теща / свекруха' },
    { de: 'der Enkel',            en: 'grandson',        ru: 'внук',               ua: 'онук' },
    { de: 'die Enkelin',          en: 'granddaughter',   ru: 'внучка',             ua: 'онучка' },
    { de: 'der Neffe',            en: 'nephew',          ru: 'племянник',          ua: 'племінник' },
    { de: 'die Nichte',           en: 'niece',           ru: 'племянница',         ua: 'племінниця' },
    { de: 'der Nachbar',          en: 'neighbor',        ru: 'сосед',              ua: 'сусід' },
  ],

  verbFocus: ['empfehlen', 'gehören'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Genitiv forms', drill: 'genitiv-formen',
      text: { en: 'Form the genitive: des Mannes / der Frau / der Kinder — masculine and neuter nouns add -(e)s.',
              ru: 'Образуйте генитив: des Mannes / der Frau / der Kinder — мужской и средний род получают -(e)s.',
              ua: 'Утворіть генітив: des Mannes / der Frau / der Kinder — чоловічий і середній рід отримують -(e)s.' } },
    { type: 'grammar', grammarFocus: 'Genitiv prepositions', drill: 'genitiv-praepositionen',
      text: { en: 'Use the genitive prepositions wegen, trotz, während and statt.',
              ru: 'Используйте генитивные предлоги wegen, trotz, während и statt.',
              ua: 'Використовуйте генітивні прийменники wegen, trotz, während і statt.' } },
    { type: 'grammar', grammarFocus: 'n-Deklination', drill: 'n-deklination',
      text: { en: 'Learn the n-Deklination: der Kollege → den/des Kollegen; der Junge, der Nachbar, der Kunde add -(e)n in every case but the nominative.',
              ru: 'Выучите n-Deklination: der Kollege → den/des Kollegen; der Junge, der Nachbar, der Kunde получают -(e)n во всех падежах, кроме именительного.',
              ua: 'Вивчіть n-Deklination: der Kollege → den/des Kollegen; der Junge, der Nachbar, der Kunde отримують -(e)n у всіх відмінках, крім називного.' } },
    { type: 'write',
      text: { en: 'Describe your extended family in 80–100 words: build a small family tree and explain relationships.',
              ru: 'Опишите свою расширенную семью в 80–100 словах: составьте небольшое семейное древо и объясните родственные связи.',
              ua: 'Опишіть свою розширену сім’ю у 80–100 словах: складіть невеличке родинне дерево та поясніть родинні зв’язки.' },
      checklist: [
        { en: 'Use the genitive at least twice (das Haus meiner Großeltern).', ru: 'Используйте генитив минимум дважды (das Haus meiner Großeltern).', ua: 'Використайте генітив принаймні двічі (das Haus meiner Großeltern).' },
        { en: 'Use wegen or trotz once.', ru: 'Используйте wegen или trotz один раз.', ua: 'Використайте wegen або trotz один раз.' },
        { en: 'Name at least three relatives (Schwager, Nichte, Enkel …).', ru: 'Назовите минимум трёх родственников (Schwager, Nichte, Enkel …).', ua: 'Назвіть щонайменше трьох родичів (Schwager, Nichte, Enkel …).' },
      ] },
    { type: 'review', drill: 'genitiv-formen',
      text: { en: 'Review week 25: a genitive/n-Deklination cloze, then a spoken TTS dictation of family words.',
              ru: 'Повторение недели 25: клоуз на генитив/n-Deklination, затем TTS-диктант слов о семье.',
              ua: 'Повторення тижня 25: клоуз на генітив/n-Deklination, потім TTS-диктант слів про сім’ю.' } },
  ],

  canDo: [
    { en: 'I can express possession with the genitive (das Auto meines Vaters).', ru: 'Я могу выразить принадлежность генитивом (das Auto meines Vaters).', ua: 'Я можу висловити належність генітивом (das Auto meines Vaters).' },
    { en: 'I can use the genitive prepositions wegen, trotz, während and statt.', ru: 'Я могу использовать генитивные предлоги wegen, trotz, während и statt.', ua: 'Я можу використовувати генітивні прийменники wegen, trotz, während і statt.' },
    { en: 'I can decline n-nouns like Kollege, Junge and Nachbar correctly.', ru: 'Я могу правильно склонять n-существительные вроде Kollege, Junge и Nachbar.', ua: 'Я можу правильно відмінювати n-іменники на кшталт Kollege, Junge і Nachbar.' },
    { en: 'I can describe my extended family in a short text.', ru: 'Я могу описать свою расширенную семью в коротком тексте.', ua: 'Я можу описати свою розширену сім’ю в короткому тексті.' },
    { en: 'I can talk about my relatives and their relationships out loud.', ru: 'Я могу вслух рассказать о родственниках и их связях.', ua: 'Я можу вголос розповісти про родичів та їхні зв’язки.' },
  ],

  drills: {
    'genitiv-formen': {
      level: 'B1',
      concept: { en: 'Genitive article and noun endings', ru: 'Артикли и окончания существительных в генитиве', ua: 'Артиклі та закінчення іменників у генітиві' },
      prompt:  { en: 'Put the noun phrase into the genitive.', ru: 'Поставьте именную группу в генитив.', ua: 'Поставте іменникову групу в генітив.' },
      items: [
        { type: 'cloze',  de: 'Das ist das Auto ___ Mannes. (der Mann)', answer: 'des' },
        { type: 'choice', de: 'Die Farbe ___ Blume ist schön. (die Blume)', answer: 'der', options: ['der', 'des', 'dem'] },
        { type: 'order',  answer: ['Das', 'ist', 'der', 'Hund', 'meiner', 'Schwester'] },
      ],
    },
    'genitiv-praepositionen': {
      level: 'B1',
      concept: { en: 'Prepositions that take the genitive', ru: 'Предлоги, требующие генитива', ua: 'Прийменники, що вимагають генітива' },
      prompt:  { en: 'Fill in the genitive preposition or the genitive article.', ru: 'Вставьте генитивный предлог или артикль в генитиве.', ua: 'Вставте генітивний прийменник або артикль у генітиві.' },
      items: [
        { type: 'cloze',  de: '___ des Regens bleiben wir zu Hause. (because of)', answer: 'Wegen' },
        { type: 'choice', de: 'Trotz ___ schlechten Wetters gehen wir spazieren. (das Wetter)', answer: 'des', options: ['der', 'des', 'dem'] },
        { type: 'cloze',  de: 'Während ___ Woche arbeite ich viel. (die Woche)', answer: 'der' },
      ],
    },
    'n-deklination': {
      level: 'B1',
      concept: { en: 'n-Deklination: weak masculine nouns add -(e)n', ru: 'n-Deklination: слабые существительные мужского рода получают -(e)n', ua: 'n-Deklination: слабкі іменники чоловічого роду отримують -(e)n' },
      prompt:  { en: 'Add the correct n-Deklination ending.', ru: 'Добавьте правильное окончание n-Deklination.', ua: 'Додайте правильне закінчення n-Deklination.' },
      items: [
        { type: 'cloze',  de: 'Ich helfe dem ___. (der Kollege)', answer: 'Kollegen' },
        { type: 'choice', de: 'Kennst du diesen ___? (der Junge)', answer: 'Jungen', options: ['Junge', 'Jungen', 'Junges'] },
        { type: 'cloze',  de: 'Das ist das Auto des ___. (der Nachbar)', answer: 'Nachbarn' },
      ],
    },
  },

  dialogue: {
    slug: 'w25-verwandtschaft',
    level: 'B1',
    vocabularyMaxWeek: 25,
    title: { en: 'The whole family', ru: 'Вся родня', ua: 'Уся рідня' },
    lines: [
      { speaker: 'A', de: 'Wer ist der Mann auf dem Foto neben deiner Mutter?' },
      { speaker: 'B', de: 'Das ist der Bruder meines Vaters, also mein Onkel.' },
      { speaker: 'A', de: 'Und die Frau daneben ist seine Frau, deine Tante?' },
      { speaker: 'B', de: 'Genau. Ihre Kinder sind meine Cousins und meine Cousine.' },
      { speaker: 'A', de: 'Wegen der Arbeit deines Onkels wohnen sie jetzt weit weg, oder?' },
      { speaker: 'B', de: 'Ja, trotz der Entfernung sehen wir uns aber jedes Jahr.' },
    ],
    questions: [
      { de: 'Der Mann auf dem Foto ist der Bruder von Bs Vater.', answer: true, text: { en: 'The man in the photo is the brother of B’s father.', ru: 'Мужчина на фото — брат отца B.', ua: 'Чоловік на фото — брат батька B.' } },
      { de: 'Bs Onkel und seine Familie wohnen in der Nähe.', answer: false, text: { en: 'B’s uncle and his family live nearby.', ru: 'Дядя B и его семья живут поблизости.', ua: 'Дядько B і його родина живуть поблизу.' } },
      { de: 'Die Familie sieht sich jedes Jahr.', answer: true, text: { en: 'The family sees each other every year.', ru: 'Семья видится каждый год.', ua: 'Родина бачиться щороку.' } },
    ],
  },
};

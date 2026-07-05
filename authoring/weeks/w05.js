/* Week 5 — Home and furniture; the dative (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 21–25.
   Vocab reuses old v1 W4 (Wohnen, Möbel, Räume); Wechselpräpositionen are deferred to W9. */
module.exports = {
  n: 5,
  phase: 'A1.1',
  level: 'A1',
  theme:      { en: 'Home and furniture; the dative', ru: 'Дом и мебель; дательный падеж', ua: 'Дім та меблі; давальний відмінок' },
  grammar:    { en: 'Dative articles and dative verbs, dative prepositions, accusative/dative personal pronouns',
                ru: 'Артикли Dativ и глаголы с Dativ, предлоги Dativ, личные местоимения Akkusativ/Dativ',
                ua: 'Артиклі Dativ та дієслова з Dativ, прийменники Dativ, особові займенники Akkusativ/Dativ' },
  vocabTheme: { en: 'home, rooms, furniture', ru: 'жильё, комнаты, мебель', ua: 'житло, кімнати, меблі' },

  vocab: [
    // rooms / home (reused from old v1 W4)
    { de: 'das Haus',        en: 'house',       ru: 'дом',        ua: 'будинок' },
    { de: 'die Wohnung',     en: 'apartment',   ru: 'квартира',   ua: 'квартира' },
    { de: 'das Zimmer',      en: 'room',        ru: 'комната',    ua: 'кімната' },
    { de: 'das Schlafzimmer', en: 'bedroom',    ru: 'спальня',    ua: 'спальня' },
    { de: 'das Wohnzimmer',  en: 'living room', ru: 'гостиная',   ua: 'вітальня' },
    { de: 'die Küche',       en: 'kitchen',     ru: 'кухня',      ua: 'кухня' },
    { de: 'das Bad',         en: 'bathroom',    ru: 'ванная',     ua: 'ванна кімната' },
    { de: 'der Balkon',      en: 'balcony',     ru: 'балкон',     ua: 'балкон' },
    { de: 'der Flur',        en: 'hallway',     ru: 'коридор',    ua: 'коридор' },
    { de: 'der Garten',      en: 'garden',      ru: 'сад',        ua: 'сад' },
    // furniture (reused from old v1 W4)
    { de: 'der Tisch',       en: 'table',       ru: 'стол',       ua: 'стіл' },
    { de: 'der Stuhl',       en: 'chair',       ru: 'стул',       ua: 'стілець' },
    { de: 'das Sofa',        en: 'sofa',        ru: 'диван',      ua: 'диван' },
    { de: 'der Sessel',      en: 'armchair',    ru: 'кресло',     ua: 'крісло' },
    { de: 'das Bett',        en: 'bed',         ru: 'кровать',    ua: 'ліжко' },
    { de: 'der Schrank',     en: 'wardrobe',    ru: 'шкаф',       ua: 'шафа' },
    { de: 'das Regal',       en: 'shelf',       ru: 'полка',      ua: 'полиця' },
    { de: 'der Teppich',     en: 'carpet',      ru: 'ковёр',      ua: 'килим' },
    { de: 'die Lampe',       en: 'lamp',        ru: 'лампа',      ua: 'лампа' },
    { de: 'das Bild',        en: 'picture',     ru: 'картина',    ua: 'картина' },
    // home features / adjectives (reused from old v1 W4)
    { de: 'die Tür',         en: 'door',        ru: 'дверь',      ua: 'двері' },
    { de: 'das Fenster',     en: 'window',      ru: 'окно',       ua: 'вікно' },
    { de: 'die Wand',        en: 'wall',        ru: 'стена',      ua: 'стіна' },
    { de: 'groß',            en: 'big',         ru: 'большой',    ua: 'великий' },
    { de: 'klein',           en: 'small',       ru: 'маленький',  ua: 'маленький' },
    { de: 'gemütlich',       en: 'cozy',        ru: 'уютный',     ua: 'затишний' },
    { de: 'hell',            en: 'bright',      ru: 'светлый',    ua: 'світлий' },
    { de: 'modern',          en: 'modern',      ru: 'современный', ua: 'сучасний' },
    { de: 'wohnen',          en: 'to live',     ru: 'жить',       ua: 'жити' },
    { de: 'mieten',          en: 'to rent',     ru: 'снимать',    ua: 'орендувати' },
  ],

  verbFocus: ['helfen', 'gefallen', 'gehören', 'danken', 'folgen', 'gratulieren', 'passen', 'fehlen', 'schmecken'],
  receptiveVerbs: ['danken', 'folgen', 'gratulieren'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Dative articles and dative verbs', drill: 'dativ-artikel',
      text: { en: 'Learn the dative articles dem/der/dem/den(+n) and the dative verbs helfen, gefallen, gehören.',
              ru: 'Выучите артикли Dativ dem/der/dem/den(+n) и глаголы с Dativ helfen, gefallen, gehören.',
              ua: 'Вивчіть артиклі Dativ dem/der/dem/den(+n) та дієслова з Dativ helfen, gefallen, gehören.' } },
    { type: 'grammar', grammarFocus: 'Dative prepositions', drill: 'dativ-praepositionen',
      text: { en: 'Learn the dative prepositions aus/bei/mit/nach/seit/von/zu — always followed by the dative.',
              ru: 'Выучите предлоги Dativ aus/bei/mit/nach/seit/von/zu — всегда с Dativ.',
              ua: 'Вивчіть прийменники Dativ aus/bei/mit/nach/seit/von/zu — завжди з Dativ.' } },
    { type: 'grammar', grammarFocus: 'Accusative/dative personal pronouns', drill: 'pronomen-akk-dat',
      text: { en: 'Learn the personal pronouns in the accusative and dative: mich/mir, dich/dir, ihm/ihr.',
              ru: 'Выучите личные местоимения в Akkusativ и Dativ: mich/mir, dich/dir, ihm/ihr.',
              ua: 'Вивчіть особові займенники в Akkusativ та Dativ: mich/mir, dich/dir, ihm/ihr.' } },
    { type: 'write',
      text: { en: 'Write a description of your room in 8–10 sentences using the dative.',
              ru: 'Напишите описание своей комнаты в 8–10 предложениях с использованием Dativ.',
              ua: 'Напишіть опис своєї кімнати у 8–10 реченнях з використанням Dativ.' },
      checklist: [
        { en: 'Name at least four pieces of furniture.', ru: 'Назовите минимум четыре предмета мебели.', ua: 'Назвіть щонайменше чотири предмети меблів.' },
        { en: 'Use a dative preposition (mit, bei, aus …) at least twice.', ru: 'Используйте предлог Dativ (mit, bei, aus …) минимум дважды.', ua: 'Використайте прийменник Dativ (mit, bei, aus …) щонайменше двічі.' },
        { en: 'Use one dative verb, e.g. Das Zimmer gefällt mir.', ru: 'Используйте один глагол с Dativ, напр. Das Zimmer gefällt mir.', ua: 'Використайте одне дієслово з Dativ, напр. Das Zimmer gefällt mir.' },
      ] },
    { type: 'review', drill: 'dativ-artikel',
      text: { en: 'Review week 5, then give a spoken audio tour of your flat using 3 bullet points.',
              ru: 'Повторите неделю 5, затем проведите устную аудио-экскурсию по своей квартире по 3 пунктам.',
              ua: 'Повторіть тиждень 5, потім проведіть усну аудіо-екскурсію своєю квартирою за 3 пунктами.' } },
  ],

  canDo: [
    { en: 'I can use dative articles and dative verbs (helfen, gefallen, gehören).', ru: 'Я могу использовать артикли Dativ и глаголы с Dativ (helfen, gefallen, gehören).', ua: 'Я можу використовувати артиклі Dativ та дієслова з Dativ (helfen, gefallen, gehören).' },
    { en: 'I can use dative prepositions (mit, bei, aus …).', ru: 'Я могу использовать предлоги Dativ (mit, bei, aus …).', ua: 'Я можу використовувати прийменники Dativ (mit, bei, aus …).' },
    { en: 'I can use accusative and dative personal pronouns.', ru: 'Я могу использовать личные местоимения в Akkusativ и Dativ.', ua: 'Я можу використовувати особові займенники в Akkusativ та Dativ.' },
    { en: 'I can write a description of my room using the dative.', ru: 'Я могу написать описание своей комнаты с использованием Dativ.', ua: 'Я можу написати опис своєї кімнати з використанням Dativ.' },
    { en: 'I can give a short spoken tour of my flat.', ru: 'Я могу провести короткую устную экскурсию по своей квартире.', ua: 'Я можу провести коротку усну екскурсію своєю квартирою.' },
  ],

  drills: {
    'dativ-artikel': {
      level: 'A1',
      concept: { en: 'Dative articles (dem/der/dem/den+n) and dative verbs', ru: 'Артикли Dativ (dem/der/dem/den+n) и глаголы с Dativ', ua: 'Артиклі Dativ (dem/der/dem/den+n) та дієслова з Dativ' },
      prompt:  { en: 'Put the article into the dative.', ru: 'Поставьте артикль в Dativ.', ua: 'Поставте артикль в Dativ.' },
      items: [
        { type: 'cloze',  de: 'Ich helfe ___ Mann. (der)', answer: 'dem' },
        { type: 'choice', de: 'Das Sofa gefällt ___ Frau. (die)', answer: 'der', options: ['die', 'der', 'dem'] },
        { type: 'cloze',  de: 'Der Tisch gehört ___ Kind. (das)', answer: 'dem' },
      ],
    },
    'dativ-praepositionen': {
      level: 'A1',
      concept: { en: 'Dative prepositions (aus, bei, mit, nach, seit, von, zu)', ru: 'Предлоги Dativ (aus, bei, mit, nach, seit, von, zu)', ua: 'Прийменники Dativ (aus, bei, mit, nach, seit, von, zu)' },
      prompt:  { en: 'Fill in the dative form after the preposition.', ru: 'Вставьте форму Dativ после предлога.', ua: 'Вставте форму Dativ після прийменника.' },
      items: [
        { type: 'cloze',  de: 'Ich fahre mit ___ Bus. (der)', answer: 'dem' },
        { type: 'choice', de: 'Sie kommt aus ___ Küche. (die)', answer: 'der', options: ['die', 'der', 'dem'] },
        { type: 'cloze',  de: 'Wir wohnen bei ___ Eltern. (die, Pl.)', answer: 'den' },
      ],
    },
    'pronomen-akk-dat': {
      level: 'A1',
      concept: { en: 'Personal pronouns in the accusative and dative', ru: 'Личные местоимения в Akkusativ и Dativ', ua: 'Особові займенники в Akkusativ та Dativ' },
      prompt:  { en: 'Choose the correct pronoun.', ru: 'Выберите правильное местоимение.', ua: 'Виберіть правильний займенник.' },
      items: [
        { type: 'choice', de: 'Kannst du ___ helfen? (ich, Dativ)', answer: 'mir', options: ['mich', 'mir', 'ich'] },
        { type: 'cloze',  de: 'Ich sehe ___ nicht. (du, Akkusativ)', answer: 'dich' },
        { type: 'choice', de: 'Das Buch gehört ___. (er, Dativ)', answer: 'ihm', options: ['ihn', 'ihm', 'er'] },
      ],
    },
  },

  dialogue: {
    slug: 'w05-wohnung',
    level: 'A1',
    vocabularyMaxWeek: 5,
    title: { en: 'Showing the flat', ru: 'Показываю квартиру', ua: 'Показую квартиру' },
    lines: [
      { speaker: 'A', de: 'Das ist meine neue Wohnung. Ich wohne hier seit einem Jahr.' },
      { speaker: 'B', de: 'Schön! Das Sofa im Wohnzimmer gefällt mir sehr.' },
      { speaker: 'A', de: 'Danke. Die Küche ist klein, aber gemütlich.' },
      { speaker: 'B', de: 'Und der große Schrank dort?' },
      { speaker: 'A', de: 'Der Schrank gehört meiner Schwester. Sie wohnt bei mir.' },
      { speaker: 'B', de: 'Die Wohnung ist wirklich schön!' },
    ],
    questions: [
      { de: 'Die Küche ist klein und gemütlich.', answer: true, text: { en: 'The kitchen is small and cozy.', ru: 'Кухня маленькая и уютная.', ua: 'Кухня маленька й затишна.' } },
      { de: 'Der Schrank gehört der Schwester.', answer: true, text: { en: 'The wardrobe belongs to the sister.', ru: 'Шкаф принадлежит сестре.', ua: 'Шафа належить сестрі.' } },
      { de: 'A wohnt seit zehn Jahren in der Wohnung.', answer: false, text: { en: 'A has lived in the flat for ten years.', ru: 'A живёт в квартире десять лет.', ua: 'A живе в квартирі десять років.' } },
    ],
  },
};

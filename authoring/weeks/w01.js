/* Week 1 — Introductions, countries, languages (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 1–5. */
module.exports = {
  n: 1,
  phase: 'A1.1',
  level: 'A1',
  theme:      { en: 'Introductions, countries, languages', ru: 'Знакомство, страны, языки', ua: 'Знайомство, країни, мови' },
  grammar:    { en: 'Präsens, sein/haben, Nominativ, W-/yes-no questions, verb in position 2', ru: 'Präsens, sein/haben, Nominativ, W-/да-нет вопросы, глагол на 2-м месте', ua: 'Präsens, sein/haben, Nominativ, W-/так-ні питання, дієслово на 2-му місці' },
  vocabTheme: { en: 'greetings, countries, languages', ru: 'приветствия, страны, языки', ua: 'привітання, країни, мови' },

  vocab: [
    { de: 'Hallo',            en: 'hello',                 ru: 'привет',              ua: 'привіт' },
    { de: 'Guten Tag',        en: 'good day / hello',      ru: 'добрый день',         ua: 'добрий день' },
    { de: 'Guten Morgen',     en: 'good morning',          ru: 'доброе утро',         ua: 'доброго ранку' },
    { de: 'Guten Abend',      en: 'good evening',          ru: 'добрый вечер',        ua: 'добрий вечір' },
    { de: 'Tschüss',          en: 'bye',                   ru: 'пока',                ua: 'бувай' },
    { de: 'Auf Wiedersehen',  en: 'goodbye',               ru: 'до свидания',         ua: 'до побачення' },
    { de: 'Danke',            en: 'thank you',             ru: 'спасибо',             ua: 'дякую' },
    { de: 'Bitte',            en: 'please / you are welcome', ru: 'пожалуйста',        ua: 'будь ласка' },
    { de: 'ja',               en: 'yes',                   ru: 'да',                  ua: 'так' },
    { de: 'nein',             en: 'no',                    ru: 'нет',                 ua: 'ні' },
    { de: 'das Land',         en: 'country',               ru: 'страна',              ua: 'країна' },
    { de: 'die Sprache',      en: 'language',              ru: 'язык',                ua: 'мова' },
    { de: 'Deutschland',      en: 'Germany',               ru: 'Германия',            ua: 'Німеччина' },
    { de: 'Deutsch',          en: 'German (language)',     ru: 'немецкий',            ua: 'німецька' },
    { de: 'Wie heißt du?',    en: "what's your name?",     ru: 'как тебя зовут?',     ua: 'як тебе звати?' },
    { de: 'Ich komme aus …',  en: 'I come from …',         ru: 'я из …',              ua: 'я з …' },
  ],

  verbFocus: ['heißen', 'kommen', 'wohnen', 'sein', 'haben', 'sprechen', 'lernen', 'machen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Präsens endings', drill: 'praesens-endungen',
      text: { en: 'Learn the Präsens endings -e/-st/-t and the nominative personal pronouns (ich, du, er/sie/es …).',
              ru: 'Выучите окончания Präsens -e/-st/-t и личные местоимения в Nominativ (ich, du, er/sie/es …).',
              ua: 'Вивчіть закінчення Präsens -e/-st/-t та особові займенники в Nominativ (ich, du, er/sie/es …).' } },
    { type: 'grammar', grammarFocus: 'sein / haben', drill: 'sein-haben',
      text: { en: 'Conjugate sein and haben in the present tense by heart.',
              ru: 'Проспрягайте sein и haben в настоящем времени наизусть.',
              ua: 'Провідміняйте sein і haben у теперішньому часі напам’ять.' } },
    { type: 'grammar', grammarFocus: 'Nominativ articles + questions', drill: 'nominativ-artikel',
      text: { en: 'Nominative articles der/die/das and ein/eine; verb in position 2, W- and yes/no questions.',
              ru: 'Артикли Nominativ der/die/das и ein/eine; глагол на 2-м месте, W- и да-нет вопросы.',
              ua: 'Артиклі Nominativ der/die/das та ein/eine; дієслово на 2-му місці, W- і так-ні питання.' } },
    { type: 'write',
      text: { en: 'Write a Steckbrief about yourself — 30–40 words (name, country, language).',
              ru: 'Напишите Steckbrief о себе — 30–40 слов (имя, страна, язык).',
              ua: 'Напишіть Steckbrief про себе — 30–40 слів (ім’я, країна, мова).' },
      checklist: [
        { en: 'Use sein at least once (Ich bin …).', ru: 'Используйте sein хотя бы раз (Ich bin …).', ua: 'Використайте sein принаймні раз (Ich bin …).' },
        { en: 'Say where you come from (Ich komme aus …).', ru: 'Скажите, откуда вы (Ich komme aus …).', ua: 'Скажіть, звідки ви (Ich komme aus …).' },
        { en: 'Name a language you speak.', ru: 'Назовите язык, на котором говорите.', ua: 'Назвіть мову, якою розмовляєте.' },
      ] },
    { type: 'review', drill: 'nominativ-artikel',
      text: { en: 'Review week 1: introduce yourself out loud for 1 minute using 3 bullet points.',
              ru: 'Повторение недели 1: представьтесь вслух за 1 минуту по 3 пунктам.',
              ua: 'Повторення тижня 1: представтеся вголос за 1 хвилину за 3 пунктами.' } },
  ],

  canDo: [
    { en: 'I can greet people and say my name.', ru: 'Я могу поздороваться и назвать своё имя.', ua: 'Я можу привітатися й назвати своє ім’я.' },
    { en: 'I can say who and how I am using sein and haben.', ru: 'Я могу сказать, кто я и как дела, с sein и haben.', ua: 'Я можу сказати, хто я і як справи, з sein і haben.' },
    { en: 'I can ask and answer simple questions about a person.', ru: 'Я могу задавать простые вопросы о человеке и отвечать на них.', ua: 'Я можу ставити прості запитання про людину й відповідати на них.' },
    { en: 'I can write a short profile about myself.', ru: 'Я могу написать короткую анкету о себе.', ua: 'Я можу написати коротку анкету про себе.' },
    { en: 'I can introduce myself out loud for a minute.', ru: 'Я могу представиться вслух в течение минуты.', ua: 'Я можу представитися вголос протягом хвилини.' },
  ],

  drills: {
    'praesens-endungen': {
      level: 'A1',
      concept: { en: 'Present-tense endings of regular verbs', ru: 'Окончания правильных глаголов в Präsens', ua: 'Закінчення правильних дієслів у Präsens' },
      prompt:  { en: 'Put the verb in the correct present-tense form.', ru: 'Поставьте глагол в правильную форму настоящего времени.', ua: 'Поставте дієслово в правильну форму теперішнього часу.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ in Berlin. (wohnen)', answer: 'wohne' },
        { type: 'cloze',  de: 'Du ___ Deutsch. (lernen)', answer: 'lernst' },
        { type: 'choice', de: 'Er ___ aus Italien.', answer: 'kommt', options: ['komme', 'kommst', 'kommt'] },
      ],
    },
    'sein-haben': {
      level: 'A1',
      concept: { en: 'Conjugation of sein and haben', ru: 'Спряжение sein и haben', ua: 'Відмінювання sein і haben' },
      prompt:  { en: 'Fill in the correct form of sein or haben.', ru: 'Вставьте правильную форму sein или haben.', ua: 'Вставте правильну форму sein або haben.' },
      items: [
        { type: 'cloze',  de: 'Ich ___ Student. (sein)', answer: 'bin' },
        { type: 'cloze',  de: 'Wir ___ Zeit. (haben)', answer: 'haben' },
        { type: 'choice', de: 'Sie ___ müde. (sein, 3. Pl.)', answer: 'sind', options: ['ist', 'sind', 'bist'] },
      ],
    },
    'nominativ-artikel': {
      level: 'A1',
      concept: { en: 'Nominative articles and question word order', ru: 'Артикли Nominativ и порядок слов в вопросе', ua: 'Артиклі Nominativ і порядок слів у питанні' },
      prompt:  { en: 'Choose the right article or build the question.', ru: 'Выберите артикль или соберите вопрос.', ua: 'Виберіть артикль або складіть питання.' },
      items: [
        { type: 'choice', de: '___ Mann ist nett.', answer: 'Der', options: ['Der', 'Die', 'Das'] },
        { type: 'cloze',  de: 'Das ist ___ Frau.', answer: 'eine' },
        { type: 'order',  answer: ['Wie', 'heißt', 'du'] },
      ],
    },
  },

  dialogue: {
    slug: 'w01-vorstellung',
    level: 'A1',
    vocabularyMaxWeek: 1,
    title: { en: 'Getting to know each other', ru: 'Знакомство', ua: 'Знайомство' },
    lines: [
      { speaker: 'A', de: 'Hallo! Wie heißt du?' },
      { speaker: 'B', de: 'Ich heiße Anna. Und du?' },
      { speaker: 'A', de: 'Ich heiße Tom. Woher kommst du?' },
      { speaker: 'B', de: 'Ich komme aus Polen. Ich wohne in Berlin.' },
      { speaker: 'A', de: 'Sprichst du Deutsch?' },
      { speaker: 'B', de: 'Ja, ein bisschen.' },
    ],
    questions: [
      { de: 'Anna kommt aus Polen.', answer: true, text: { en: 'Anna is from Poland.', ru: 'Анна из Польши.', ua: 'Анна з Польщі.' } },
      { de: 'Tom wohnt in Berlin.', answer: false, text: { en: 'Tom lives in Berlin.', ru: 'Том живёт в Берлине.', ua: 'Том живе в Берліні.' } },
      { de: 'Anna spricht ein bisschen Deutsch.', answer: true, text: { en: 'Anna speaks a little German.', ru: 'Анна немного говорит по-немецки.', ua: 'Анна трохи говорить німецькою.' } },
    ],
  },
};

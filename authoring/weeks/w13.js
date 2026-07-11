/* Week 13 — Biography & holidays; Präteritum I (A2, phase A2.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 61–65.
   Vocab reuse: old v1 week 9 (biography) + NEW holidays. */
module.exports = {
  n: 13,
  phase: "A2.1",
  level: "A2",
  theme:      { en: "Biography and holidays", ru: "Биография и праздники", ua: "Біографія та свята" },
  grammar:    { en: "Präteritum: war/hatte and modal verbs; the tense-choice rule", ru: "Präteritum: war/hatte и модальные глаголы; правило выбора времени", ua: "Präteritum: war/hatte і модальні дієслова; правило вибору часу" },
  vocabTheme: { en: "biography, life stages, holidays", ru: "биография, этапы жизни, праздники", ua: "біографія, етапи життя, свята" },

  vocab: [
    // --- reused from v1 week 9 (index-matched glosses) ---
    { de: "die Biografie",  en: "biography",             ru: "биография",              ua: "біографія" },
    { de: "das Leben",      en: "life",                  ru: "жизнь",                  ua: "життя" },
    { de: "geboren sein",   en: "to be born",            ru: "родиться",               ua: "народитися" },
    { de: "aufwachsen",     en: "to grow up",            ru: "вырастать, расти",       ua: "виростати, рости" },
    { de: "die Kindheit",   en: "childhood",             ru: "детство",                ua: "дитинство" },
    { de: "die Jugend",     en: "youth",                 ru: "юность",                 ua: "юність" },
    { de: "heiraten",       en: "to get married",        ru: "жениться, выходить замуж", ua: "одружуватися" },
    { de: "studieren",      en: "to study at university", ru: "учиться в вузе",         ua: "навчатися в університеті" },
    { de: "der Beruf",      en: "profession",            ru: "профессия",              ua: "професія" },
    { de: "sterben",        en: "to die",                ru: "умирать",                ua: "помирати" },
    { de: "damals",         en: "back then",             ru: "тогда",                  ua: "тоді" },
    { de: "später",         en: "later",                 ru: "позже",                  ua: "пізніше" },
    { de: "war",            en: "was",                   ru: "был",                    ua: "був" },
    { de: "hatte",          en: "had",                   ru: "имел",                   ua: "мав" },
    { de: "wurde",          en: "became",                ru: "стал",                   ua: "став" },
    { de: "konnte",         en: "could",                 ru: "мог",                    ua: "міг" },
    { de: "musste",         en: "had to",                ru: "должен был",             ua: "мусив" },
    { de: "wollte",         en: "wanted",                ru: "хотел",                  ua: "хотів" },
    // --- NEW: holidays & celebrations ---
    { de: "der Geburtstag", en: "birthday",              ru: "день рождения",          ua: "день народження" },
    { de: "das Geschenk",   en: "gift / present",        ru: "подарок",                ua: "подарунок" },
    { de: "das Fest",       en: "celebration / feast",   ru: "праздник, торжество",    ua: "свято, урочистість" },
    { de: "der Feiertag",   en: "public holiday",        ru: "праздничный день",       ua: "святковий день" },
    { de: "Weihnachten",    en: "Christmas",             ru: "Рождество",              ua: "Різдво" },
    { de: "Ostern",         en: "Easter",                ru: "Пасха",                  ua: "Великдень" },
    { de: "die Hochzeit",   en: "wedding",               ru: "свадьба",                ua: "весілля" },
    { de: "die Einladung",  en: "invitation",            ru: "приглашение",            ua: "запрошення" },
  ],

  verbFocus: ["heiraten", "aufwachsen", "feiern", "sterben", "studieren"],
  receptiveVerbs: ["heiraten", "aufwachsen", "feiern"],

  tasks: [
    { type: "grammar", grammarFocus: "Präteritum: war / hatte", drill: "praeteritum-sein-haben",
      text: { en: "Learn the Präteritum of sein and haben (war, hatte) and use them to talk about the past.",
              ru: "Выучите Präteritum глаголов sein и haben (war, hatte) и используйте их, чтобы говорить о прошлом.",
              ua: "Вивчіть Präteritum дієслів sein і haben (war, hatte) і використовуйте їх, щоб говорити про минуле." } },
    { type: "grammar", grammarFocus: "Präteritum: modal verbs", drill: "praeteritum-modalverben",
      text: { en: "Learn the Präteritum of the modal verbs: konnte, musste, wollte, durfte, sollte, mochte.",
              ru: "Выучите Präteritum модальных глаголов: konnte, musste, wollte, durfte, sollte, mochte.",
              ua: "Вивчіть Präteritum модальних дієслів: konnte, musste, wollte, durfte, sollte, mochte." } },
    { type: "listen", grammarFocus: "tense rule: Perfekt vs Präteritum",
      text: { en: "Listen to a birthday dialogue. Learn the rule: Perfekt is common in speech, Präteritum in written narrative — and sein, haben and modal verbs are usually used in the Präteritum even in everyday speech.",
              ru: "Прослушайте диалог о дне рождения. Запомните правило: Perfekt часто употребляется в устной речи, Präteritum — в письменном повествовании, а sein, haben и модальные обычно употребляются в Präteritum даже в повседневной речи.",
              ua: "Прослухайте діалог про день народження. Запам'ятайте правило: Perfekt часто вживається в усному мовленні, Präteritum — у письмовій розповіді, а sein, haben і модальні зазвичай уживаються в Präteritum навіть у повсякденному мовленні." } },
    { type: "write",
      text: { en: "Write a short biography (60–80 words) in the Präteritum: childhood, studies, profession.",
              ru: "Напишите короткую биографию (60–80 слов) в Präteritum: детство, учёба, профессия.",
              ua: "Напишіть коротку біографію (60–80 слів) у Präteritum: дитинство, навчання, професія." },
      checklist: [
        { en: "Use war and hatte at least twice.", ru: "Используйте war и hatte хотя бы дважды.", ua: "Використайте war і hatte принаймні двічі." },
        { en: "Include one modal verb in the Präteritum (konnte / wollte / musste).", ru: "Добавьте один модальный глагол в Präteritum (konnte / wollte / musste).", ua: "Додайте одне модальне дієслово в Präteritum (konnte / wollte / musste)." },
        { en: "Mention where you grew up and what you studied.", ru: "Укажите, где вы росли и что изучали.", ua: "Вкажіть, де ви росли і що вивчали." },
      ] },
    { type: "review", drill: "praeteritum-sein-haben",
      text: { en: "Review week 13: dictate the forms war/hatte and tell about your childhood out loud for a minute.",
              ru: "Повторение недели 13: продиктуйте формы war/hatte и расскажите вслух о своём детстве за минуту.",
              ua: "Повторення тижня 13: продиктуйте форми war/hatte і розкажіть уголос про своє дитинство за хвилину." } },
  ],

  canDo: [
    { en: "I can talk about the past using war and hatte.", ru: "Я могу говорить о прошлом с помощью war и hatte.", ua: "Я можу говорити про минуле за допомогою war і hatte." },
    { en: "I can use modal verbs in the Präteritum.", ru: "Я могу использовать модальные глаголы в Präteritum.", ua: "Я можу використовувати модальні дієслова в Präteritum." },
    { en: "I can understand a short dialogue about a birthday and know when to use Perfekt or Präteritum.", ru: "Я могу понять короткий диалог о дне рождения и знаю, когда использовать Perfekt или Präteritum.", ua: "Я можу зрозуміти короткий діалог про день народження і знаю, коли вживати Perfekt чи Präteritum." },
    { en: "I can write a short biography in the past tense.", ru: "Я могу написать короткую биографию в прошедшем времени.", ua: "Я можу написати коротку біографію у минулому часі." },
    { en: "I can tell someone about my childhood out loud.", ru: "Я могу рассказать вслух о своём детстве.", ua: "Я можу розповісти вголос про своє дитинство." },
  ],

  drills: {
    "praeteritum-sein-haben": {
      level: "A2",
      concept: { en: "Präteritum of sein and haben", ru: "Präteritum глаголов sein и haben", ua: "Präteritum дієслів sein і haben" },
      prompt:  { en: "Put sein or haben into the Präteritum.", ru: "Поставьте sein или haben в Präteritum.", ua: "Поставте sein або haben у Präteritum." },
      items: [
        { type: "cloze",  de: "Als Kind ___ ich sehr schüchtern. (sein)", answer: "war" },
        { type: "cloze",  de: "Wir ___ damals kein Auto. (haben)", answer: "hatten" },
        { type: "choice", de: "Meine Eltern ___ 1990 in Berlin. (sein)", answer: "waren", options: ["war", "waren", "warst"] },
      ],
    },
    "praeteritum-modalverben": {
      level: "A2",
      concept: { en: "Modal verbs in the Präteritum", ru: "Модальные глаголы в Präteritum", ua: "Модальні дієслова в Präteritum" },
      prompt:  { en: "Put the modal verb into the Präteritum.", ru: "Поставьте модальный глагол в Präteritum.", ua: "Поставте модальне дієслово у Präteritum." },
      items: [
        { type: "cloze",  de: "Früher ___ ich nicht schwimmen. (können)", answer: "konnte" },
        { type: "cloze",  de: "Meine Schwester ___ jeden Tag um sechs aufstehen. (müssen)", answer: "musste" },
        { type: "choice", de: "Als Kind ___ er nicht lange fernsehen. (dürfen)", answer: "durfte", options: ["durfte", "darf", "durftest"] },
      ],
    },
  },

  dialogue: {
    slug: "w13-geburtstag",
    level: "A2",
    vocabularyMaxWeek: 13,
    title: { en: "The birthday party", ru: "День рождения", ua: "День народження" },
    lines: [
      { speaker: "A", de: "Hallo Lena! Wie war deine Geburtstagsparty?" },
      { speaker: "B", de: "Hallo Max! Sie war wunderbar. Viele Freunde sind gekommen und wir haben lange gefeiert." },
      { speaker: "A", de: "Hattest du schöne Geschenke?" },
      { speaker: "B", de: "Ja, meine Eltern haben mir ein Buch geschenkt. Das war das beste Geschenk." },
      { speaker: "A", de: "Wie alt bist du jetzt?" },
      { speaker: "B", de: "Ich bin dreißig. Früher wollte ich immer eine große Party." },
    ],
    questions: [
      { de: "Lenas Party war langweilig.", answer: false, text: { en: "Lena's party was boring.", ru: "Вечеринка Лены была скучной.", ua: "Вечірка Лени була нудною." } },
      { de: "Lenas Eltern haben ihr ein Buch geschenkt.", answer: true, text: { en: "Lena's parents gave her a book.", ru: "Родители подарили Лене книгу.", ua: "Батьки подарували Лені книжку." } },
      { de: "Lena ist jetzt dreißig Jahre alt.", answer: true, text: { en: "Lena is now thirty years old.", ru: "Лене сейчас тридцать лет.", ua: "Лені зараз тридцять років." } },
    ],
  },
};

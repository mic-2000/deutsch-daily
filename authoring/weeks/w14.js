/* Week 14 — Study, work, bureaucracy; Futur I (A2, phase A2.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 66–70.
   Vocab reuse: old v1 week 10 (Schule, Studium, Arbeit) + NEW bureaucracy. */
module.exports = {
  n: 14,
  phase: "A2.1",
  level: "A2",
  theme:      { en: "Study, work, bureaucracy; Futur I", ru: "Учёба, работа, бюрократия; Futur I", ua: "Навчання, робота, бюрократія; Futur I" },
  grammar:    { en: "Futur I (werden + infinitive) for plans and assumptions; Präteritum receptively", ru: "Futur I (werden + инфинитив) для планов и предположений; Präteritum рецептивно", ua: "Futur I (werden + інфінітив) для планів і припущень; Präteritum рецептивно" },
  vocabTheme: { en: "studies, work, bureaucracy", ru: "учёба, работа, бюрократия", ua: "навчання, робота, бюрократія" },

  vocab: [
    // --- reused from v1 week 10 (index-matched glosses) ---
    { de: "die Schule",      en: "school",              ru: "школа",                    ua: "школа" },
    { de: "der Schüler",     en: "pupil",               ru: "ученик",                   ua: "учень" },
    { de: "der Lehrer",      en: "teacher",             ru: "учитель",                  ua: "вчитель" },
    { de: "die Universität", en: "university",          ru: "университет",              ua: "університет" },
    { de: "der Student",     en: "student (university)", ru: "студент",                 ua: "студент" },
    { de: "das Studium",     en: "studies",             ru: "учёба (в вузе)",           ua: "навчання (у вузі)" },
    { de: "das Fach",        en: "subject",             ru: "предмет",                  ua: "предмет" },
    { de: "die Note",        en: "grade / mark",        ru: "оценка",                   ua: "оцінка" },
    { de: "die Prüfung",     en: "exam",                ru: "экзамен",                  ua: "іспит" },
    { de: "bestehen",        en: "to pass (an exam)",   ru: "сдать экзамен",            ua: "скласти іспит" },
    { de: "der Job",         en: "job",                 ru: "работа",                   ua: "робота" },
    { de: "die Stelle",      en: "position",            ru: "должность",                ua: "посада" },
    { de: "der Chef",        en: "boss",                ru: "начальник",                ua: "начальник" },
    { de: "der Kollege",     en: "colleague",           ru: "коллега",                  ua: "колега" },
    { de: "das Gehalt",      en: "salary",              ru: "зарплата",                 ua: "зарплата" },
    { de: "die Karriere",    en: "career",              ru: "карьера",                  ua: "кар'єра" },
    { de: "der Erfolg",      en: "success",             ru: "успех",                    ua: "успіх" },
    { de: "der Lebenslauf",  en: "CV / résumé",         ru: "резюме",                   ua: "резюме" },
    { de: "das Praktikum",   en: "internship",          ru: "стажировка",               ua: "стажування" },
    // --- NEW: bureaucracy ---
    { de: "der Termin",      en: "appointment",         ru: "приём, встреча",           ua: "прийом, зустріч" },
    { de: "das Formular",    en: "form",                ru: "бланк, анкета",            ua: "бланк, анкета" },
    { de: "der Ausweis",     en: "ID card",             ru: "удостоверение личности",   ua: "посвідчення особи" },
    { de: "der Vertrag",     en: "contract",            ru: "договор",                  ua: "договір" },
    { de: "das Amt",         en: "(government) office", ru: "ведомство, учреждение",    ua: "відомство, установа" },
    { de: "der Antrag",      en: "application (form)",  ru: "заявление",                ua: "заява" },
    { de: "die Unterschrift", en: "signature",          ru: "подпись",                  ua: "підпис" },
    { de: "ausfüllen",       en: "to fill out",         ru: "заполнять",                ua: "заповнювати" },
    { de: "unterschreiben",  en: "to sign",             ru: "подписывать",              ua: "підписувати" },
  ],

  verbFocus: ["werden", "ausfüllen", "unterschreiben", "bestehen", "studieren"],
  receptiveVerbs: ["bestehen"],

  tasks: [
    { type: "grammar", grammarFocus: "Futur I: plans", drill: "futur-plaene",
      text: { en: "Learn Futur I: werden + infinitive to talk about plans (Ich werde studieren).",
              ru: "Выучите Futur I: werden + инфинитив, чтобы говорить о планах (Ich werde studieren).",
              ua: "Вивчіть Futur I: werden + інфінітив, щоб говорити про плани (Ich werde studieren)." } },
    { type: "grammar", grammarFocus: "Futur I: assumptions", drill: "futur-vermutung",
      text: { en: "Use Futur I for assumptions with wohl/wahrscheinlich (Er wird wohl im Büro sein).",
              ru: "Используйте Futur I для предположений с wohl/wahrscheinlich (Er wird wohl im Büro sein).",
              ua: "Використовуйте Futur I для припущень з wohl/wahrscheinlich (Er wird wohl im Büro sein)." } },
    { type: "read", grammarFocus: "Präteritum (recognition)",
      text: { en: "Read a short A2 text and hunt for strong Präteritum forms (ging, kam, fuhr); recognise them without producing them yourself.",
              ru: "Прочитайте короткий текст A2 и найдите сильные формы Präteritum (ging, kam, fuhr); учитесь узнавать их, не образуя сами.",
              ua: "Прочитайте короткий текст A2 і знайдіть сильні форми Präteritum (ging, kam, fuhr); учіться впізнавати їх, не утворюючи самостійно." } },
    { type: "write",
      text: { en: "Write 8 sentences about your future plans (studies, job) using werden + infinitive.",
              ru: "Напишите 8 предложений о своих планах на будущее (учёба, работа) с werden + инфинитив.",
              ua: "Напишіть 8 речень про свої плани на майбутнє (навчання, робота) з werden + інфінітивом." },
      checklist: [
        { en: "Use werden + infinitive at least four times.", ru: "Используйте werden + инфинитив минимум четыре раза.", ua: "Використайте werden + інфінітив щонайменше чотири рази." },
        { en: "Mention one plan about work or an exam (bestehen).", ru: "Упомяните один план о работе или экзамене (bestehen).", ua: "Згадайте один план про роботу чи іспит (bestehen)." },
        { en: "Add one assumption with wohl or wahrscheinlich.", ru: "Добавьте одно предположение с wohl или wahrscheinlich.", ua: "Додайте одне припущення з wohl або wahrscheinlich." },
      ] },
    { type: "review", drill: "futur-plaene",
      text: { en: "Review week 14: dictate the werden-forms and talk about your school years out loud for a minute.",
              ru: "Повторение недели 14: продиктуйте формы werden и расскажите вслух о школьных годах за минуту.",
              ua: "Повторення тижня 14: продиктуйте форми werden і розкажіть уголос про шкільні роки за хвилину." } },
  ],

  canDo: [
    { en: "I can talk about my plans using Futur I (werden + infinitive).", ru: "Я могу говорить о своих планах с помощью Futur I (werden + инфинитив).", ua: "Я можу говорити про свої плани за допомогою Futur I (werden + інфінітив)." },
    { en: "I can express an assumption with Futur I and wohl/wahrscheinlich.", ru: "Я могу выразить предположение с помощью Futur I и wohl/wahrscheinlich.", ua: "Я можу висловити припущення за допомогою Futur I і wohl/wahrscheinlich." },
    { en: "I can recognise strong Präteritum forms while reading.", ru: "Я могу узнавать сильные формы Präteritum при чтении.", ua: "Я можу впізнавати сильні форми Präteritum під час читання." },
    { en: "I can write about my future studies and work.", ru: "Я могу написать о своей будущей учёбе и работе.", ua: "Я можу написати про своє майбутнє навчання і роботу." },
    { en: "I can name key words for studies, work and bureaucracy.", ru: "Я могу назвать ключевые слова об учёбе, работе и бюрократии.", ua: "Я можу назвати ключові слова про навчання, роботу й бюрократію." },
  ],

  drills: {
    "futur-plaene": {
      level: "A2",
      concept: { en: "Futur I for plans (werden + infinitive)", ru: "Futur I для планов (werden + инфинитив)", ua: "Futur I для планів (werden + інфінітив)" },
      prompt:  { en: "Put the verb into Futur I (werden + infinitive).", ru: "Поставьте глагол в Futur I (werden + инфинитив).", ua: "Поставте дієслово у Futur I (werden + інфінітив)." },
      items: [
        { type: "cloze",  de: "Nächstes Jahr ___ ich Informatik studieren. (werden)", answer: "werde" },
        { type: "choice", de: "___ du die Prüfung bestehen?", answer: "Wirst", options: ["Wird", "Wirst", "Werdet"] },
        { type: "order",  answer: ["Wir", "werden", "einen", "Vertrag", "unterschreiben"] },
      ],
    },
    "futur-vermutung": {
      level: "A2",
      concept: { en: "Futur I for assumptions", ru: "Futur I для предположений", ua: "Futur I для припущень" },
      prompt:  { en: "Complete the assumption with werden and wohl.", ru: "Дополните предположение с werden и wohl.", ua: "Доповніть припущення з werden і wohl." },
      items: [
        { type: "cloze",  de: "Er ist nicht da. Er ___ wohl im Amt sein. (werden)", answer: "wird" },
        { type: "choice", de: "Maria ___ wahrscheinlich noch arbeiten.", answer: "wird", options: ["wird", "werden", "werdet"] },
        { type: "order",  answer: ["Das", "Formular", "wird", "wohl", "schwer", "sein"] },
      ],
    },
  },
};

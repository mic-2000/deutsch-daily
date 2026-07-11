/* Week 31 — Job applications; Relativsätze II (Dativ, preposition + relative, dessen/deren) (B1, phase B1.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 151–155.
   Vocab is a NEW Bewerbung set (14); the relative-clause chain builds on Relativsätze I from week 22
   and the verb-preposition rections already learned in week 21. */
module.exports = {
  n: 31,
  phase: 'B1.2',
  level: 'B1',
  theme:      { en: 'Job applications; relative clauses II', ru: 'Заявка на работу; Relativsätze II', ua: 'Заявка на роботу; Relativsätze II' },
  grammar:    { en: 'Relative clauses in the dative, preposition + relative pronoun, dessen/deren', ru: 'Relativsätze в дативе, предлог + относительное местоимение, dessen/deren', ua: 'Relativsätze в давальному, прийменник + відносний займенник, dessen/deren' },
  vocabTheme: { en: 'job application', ru: 'заявка на работу', ua: 'заявка на роботу' },

  vocab: [
    { de: 'die Bewerbung',            en: 'job application',        ru: 'заявление о приёме на работу',     ua: 'заявка на роботу' },
    { de: 'das Anschreiben',          en: 'cover letter',           ru: 'сопроводительное письмо',          ua: 'супровідний лист' },
    { de: 'der Lebenslauf',           en: 'CV / résumé',            ru: 'резюме / автобиография',           ua: 'резюме / автобіографія' },
    { de: 'das Vorstellungsgespräch', en: 'job interview',          ru: 'собеседование',                    ua: 'співбесіда' },
    { de: 'die Stelle',               en: 'position / job',         ru: 'должность / место работы',         ua: 'посада / робоче місце' },
    { de: 'die Stellenanzeige',       en: 'job advertisement',      ru: 'объявление о вакансии',            ua: 'оголошення про вакансію' },
    { de: 'der Arbeitgeber',          en: 'employer',               ru: 'работодатель',                     ua: 'роботодавець' },
    { de: 'der Arbeitnehmer',         en: 'employee',               ru: 'работник / наёмный работник',      ua: 'працівник / найманий працівник' },
    { de: 'die Berufserfahrung',      en: 'professional experience', ru: 'профессиональный опыт',           ua: 'професійний досвід' },
    { de: 'die Kenntnisse',           en: 'knowledge / skills',     ru: 'знания / навыки',                  ua: 'знання / навички' },
    { de: 'der Arbeitsvertrag',       en: 'employment contract',    ru: 'трудовой договор',                 ua: 'трудовий договір' },
    { de: 'das Gehalt',               en: 'salary',                 ru: 'зарплата / оклад',                 ua: 'зарплата / оклад' },
    { de: 'die Probezeit',            en: 'probation period',       ru: 'испытательный срок',               ua: 'випробувальний термін' },
    { de: 'die Kündigung',            en: 'notice / termination',   ru: 'увольнение / расторжение договора', ua: 'звільнення / розірвання договору' },
  ],

  verbFocus: ['sich bewerben', 'sich vorbereiten', 'kündigen', 'vereinbaren'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Relative clauses in the dative', drill: 'relativ-dativ',
      text: { en: 'Relative clauses with a dative relative pronoun: der Kollege, dem ich helfe / die Frau, der ich danke.',
              ru: 'Relativsätze с относительным местоимением в дативе: der Kollege, dem ich helfe / die Frau, der ich danke.',
              ua: 'Relativsätze з відносним займенником у давальному: der Kollege, dem ich helfe / die Frau, der ich danke.' } },
    { type: 'grammar', grammarFocus: 'Preposition + relative pronoun', drill: 'relativ-praeposition',
      text: { en: 'Put the preposition before the relative pronoun: das Projekt, an dem ich arbeite / der Kunde, auf den ich warte.',
              ru: 'Ставьте предлог перед относительным местоимением: das Projekt, an dem ich arbeite / der Kunde, auf den ich warte.',
              ua: 'Ставте прийменник перед відносним займенником: das Projekt, an dem ich arbeite / der Kunde, auf den ich warte.' } },
    { type: 'grammar', grammarFocus: 'dessen / deren', drill: 'relativ-dessen-deren',
      text: { en: 'The genitive relative pronouns dessen (masc./neut.) and deren (fem./plural): der Mann, dessen Auto hier steht.',
              ru: 'Относительные местоимения в генитиве dessen (муж./ср.) и deren (жен./мн.): der Mann, dessen Auto hier steht.',
              ua: 'Відносні займенники в генітиві dessen (чол./сер.) і deren (жін./мн.): der Mann, dessen Auto hier steht.' } },
    { type: 'write',
      text: { en: 'Write 8 definitions using relative clauses, then describe your dream job in 80–100 words.',
              ru: 'Напишите 8 определений через Relativsätze, затем опишите работу мечты в 80–100 словах.',
              ua: 'Напишіть 8 визначень через Relativsätze, потім опишіть роботу мрії у 80–100 словах.' },
      checklist: [
        { en: 'Use at least one dative relative pronoun (dem/der/denen).', ru: 'Используйте минимум одно относительное местоимение в дативе (dem/der/denen).', ua: 'Використайте щонайменше один відносний займенник у давальному (dem/der/denen).' },
        { en: 'Use a preposition + relative pronoun once (bei der …, mit dem …).', ru: 'Используйте предлог + относительное местоимение один раз (bei der …, mit dem …).', ua: 'Використайте прийменник + відносний займенник один раз (bei der …, mit dem …).' },
        { en: 'Name at least three application words (Bewerbung, Lebenslauf, Gehalt …).', ru: 'Назовите минимум три слова о заявке (Bewerbung, Lebenslauf, Gehalt …).', ua: 'Назвіть щонайменше три слова про заявку (Bewerbung, Lebenslauf, Gehalt …).' },
      ] },
    { type: 'review', drill: 'relativ-dativ',
      text: { en: 'Review week 31: a relative-clause cloze, then talk about a job application and interview out loud.',
              ru: 'Повторение недели 31: клоуз на Relativsätze, затем вслух расскажите о заявке и собеседовании.',
              ua: 'Повторення тижня 31: клоуз на Relativsätze, потім вголос розкажіть про заявку та співбесіду.' } },
  ],

  canDo: [
    { en: 'I can use relative clauses with a dative pronoun (der Kollege, dem ich helfe).', ru: 'Я могу использовать Relativsätze с местоимением в дативе (der Kollege, dem ich helfe).', ua: 'Я можу використовувати Relativsätze із займенником у давальному (der Kollege, dem ich helfe).' },
    { en: 'I can combine a preposition with a relative pronoun (das Projekt, an dem ich arbeite).', ru: 'Я могу соединить предлог с относительным местоимением (das Projekt, an dem ich arbeite).', ua: 'Я можу поєднати прийменник з відносним займенником (das Projekt, an dem ich arbeite).' },
    { en: 'I can use the relative pronouns dessen and deren.', ru: 'Я могу использовать относительные местоимения dessen и deren.', ua: 'Я можу використовувати відносні займенники dessen і deren.' },
    { en: 'I can define things and describe my dream job with relative clauses.', ru: 'Я могу давать определения и описывать работу мечты с помощью Relativsätze.', ua: 'Я можу давати визначення й описувати роботу мрії за допомогою Relativsätze.' },
    { en: 'I can talk about a job application and an interview.', ru: 'Я могу рассказать о заявке на работу и о собеседовании.', ua: 'Я можу розповісти про заявку на роботу та про співбесіду.' },
  ],

  drills: {
    'relativ-dativ': {
      level: 'B1',
      concept: { en: 'Relative pronoun in the dative case', ru: 'Относительное местоимение в дативе', ua: 'Відносний займенник у давальному' },
      prompt:  { en: 'Insert the dative relative pronoun or build the sentence.', ru: 'Вставьте относительное местоимение в дативе или соберите предложение.', ua: 'Вставте відносний займенник у давальному або складіть речення.' },
      items: [
        { type: 'cloze',  de: 'Das ist der Kollege, ___ ich oft helfe. (helfen + Dativ)', answer: 'dem' },
        { type: 'choice', de: 'Die Frau, ___ ich das Formular gebe, arbeitet hier. (die Frau, Dativ)', answer: 'der', options: ['der', 'die', 'dem'] },
        { type: 'order',  answer: ['Das', 'ist', 'der', 'Chef,', 'dem', 'ich', 'danke'] },
      ],
    },
    'relativ-praeposition': {
      level: 'B1',
      concept: { en: 'Preposition placed before the relative pronoun', ru: 'Предлог перед относительным местоимением', ua: 'Прийменник перед відносним займенником' },
      prompt:  { en: 'Fill in the relative pronoun after the preposition.', ru: 'Вставьте относительное местоимение после предлога.', ua: 'Вставте відносний займенник після прийменника.' },
      items: [
        { type: 'cloze',  de: 'Das ist das Projekt, an ___ ich arbeite. (das Projekt, an + Dativ)', answer: 'dem' },
        { type: 'choice', de: 'Der Kunde, auf ___ ich warte, kommt gleich. (warten auf + Akkusativ)', answer: 'den', options: ['den', 'dem', 'der'] },
        { type: 'cloze',  de: 'Die Kollegin, mit ___ ich spreche, ist neu. (mit + Dativ)', answer: 'der' },
      ],
    },
    'relativ-dessen-deren': {
      level: 'B1',
      concept: { en: 'Genitive relative pronouns dessen and deren', ru: 'Относительные местоимения в генитиве dessen и deren', ua: 'Відносні займенники в генітиві dessen і deren' },
      prompt:  { en: 'Choose dessen (masc./neut.) or deren (fem./plural).', ru: 'Выберите dessen (муж./ср.) или deren (жен./мн.).', ua: 'Виберіть dessen (чол./сер.) або deren (жін./мн.).' },
      items: [
        { type: 'cloze',  de: 'Das ist der Mann, ___ Auto hier steht. (der Mann → masc.)', answer: 'dessen' },
        { type: 'choice', de: 'Die Firma, ___ Chef ich kenne, sucht Personal. (die Firma → fem.)', answer: 'deren', options: ['dessen', 'deren', 'denen'] },
        { type: 'cloze',  de: 'Das ist die Kollegin, ___ Mann Arzt ist. (die Kollegin → fem.)', answer: 'deren' },
      ],
    },
  },

  dialogue: {
    slug: 'w31-vorstellungsgespraech',
    level: 'B1',
    vocabularyMaxWeek: 31,
    title: { en: 'The job interview', ru: 'Собеседование', ua: 'Співбесіда' },
    lines: [
      { speaker: 'A', de: 'Guten Tag! Sie haben sich auf die Stelle als Ingenieur beworben, richtig?' },
      { speaker: 'B', de: 'Ja, genau. Ich habe meine Bewerbung letzte Woche geschickt.' },
      { speaker: 'A', de: 'Ihr Lebenslauf ist interessant. Welche Berufserfahrung haben Sie?' },
      { speaker: 'B', de: 'Ich habe fünf Jahre in einer Firma gearbeitet, die Maschinen herstellt.' },
      { speaker: 'A', de: 'Und warum möchten Sie Ihre jetzige Stelle kündigen?' },
      { speaker: 'B', de: 'Ich suche eine Aufgabe, bei der ich mehr Verantwortung habe.' },
    ],
    questions: [
      { de: 'Der Bewerber hat sich auf eine Stelle als Ingenieur beworben.', answer: true, text: { en: 'The applicant applied for a position as an engineer.', ru: 'Кандидат подал заявку на должность инженера.', ua: 'Кандидат подав заявку на посаду інженера.' } },
      { de: 'Der Bewerber hat noch keine Berufserfahrung.', answer: false, text: { en: 'The applicant has no professional experience yet.', ru: 'У кандидата ещё нет профессионального опыта.', ua: 'У кандидата ще немає професійного досвіду.' } },
      { de: 'Der Bewerber möchte eine Aufgabe mit mehr Verantwortung.', answer: true, text: { en: 'The applicant wants a job with more responsibility.', ru: 'Кандидат хочет работу с большей ответственностью.', ua: 'Кандидат хоче роботу з більшою відповідальністю.' } },
    ],
  },
};

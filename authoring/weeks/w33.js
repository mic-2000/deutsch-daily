/* Week 33 — Media & ecology; reported speech (B1, phase B1.2). Days 161–165. Reuses v1 W21 (media) + NEW ecology. */
module.exports = {
  n: 33,
  phase: 'B1.2',
  level: 'B1',
  theme:      { en: 'Media & ecology; reported speech', ru: 'СМИ, экология; косвенная речь', ua: 'ЗМІ, екологія; непряма мова' },
  grammar:    { en: 'Indirekte Rede (X sagt, dass + Indikativ); Konjunktiv I receptive only', ru: 'Косвенная речь (X sagt, dass + Indikativ); Konjunktiv I только рецептивно', ua: 'Непряма мова (X sagt, dass + Indikativ); Konjunktiv I лише рецептивно' },
  vocabTheme: { en: 'media, ecology', ru: 'СМИ, экология', ua: 'ЗМІ, екологія' },

  vocab: [
    { de: 'die Nachricht',    en: 'news item',        ru: 'новость',         ua: 'новина' },
    { de: 'die Zeitung',      en: 'newspaper',        ru: 'газета',          ua: 'газета' },
    { de: 'die Zeitschrift',  en: 'magazine',         ru: 'журнал',          ua: 'журнал' },
    { de: 'der Artikel',      en: 'article',          ru: 'статья',          ua: 'стаття' },
    { de: 'die Sendung',      en: 'broadcast',        ru: 'передача',        ua: 'передача' },
    { de: 'die Werbung',      en: 'advertising',      ru: 'реклама',         ua: 'реклама' },
    { de: 'die Meldung',      en: 'report',           ru: 'сообщение',       ua: 'повідомлення' },
    { de: 'die Schlagzeile',  en: 'headline',         ru: 'заголовок',       ua: 'заголовок' },
    { de: 'die Umwelt',       en: 'environment',      ru: 'окружающая среда', ua: 'довкілля' },
    { de: 'der Klimawandel',  en: 'climate change',   ru: 'изменение климата', ua: 'зміна клімату' },
    { de: 'der Müll',         en: 'rubbish / waste',  ru: 'мусор',           ua: 'сміття' },
    { de: 'die Energie',      en: 'energy',           ru: 'энергия',         ua: 'енергія' },
    { de: 'die Natur',        en: 'nature',           ru: 'природа',         ua: 'природа' },
    { de: 'umweltfreundlich', en: 'eco-friendly',     ru: 'экологичный',     ua: 'екологічний' },
    { de: 'die Verschmutzung', en: 'pollution',       ru: 'загрязнение',     ua: 'забруднення' },
    { de: 'nachhaltig',       en: 'sustainable',      ru: 'устойчивый',      ua: 'сталий' },
  ],

  verbFocus: ['berichten', 'behaupten', 'bestätigen', 'melden', 'erwähnen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Reported speech', drill: 'indirekte-rede',
      text: { en: 'Reported speech: X sagt, dass + Indikativ (the everyday B1 form).', ru: 'Косвенная речь: X sagt, dass + Indikativ (обычная форма B1).', ua: 'Непряма мова: X sagt, dass + Indikativ (звична форма B1).' } },
    { type: 'grammar', grammarFocus: 'Konjunktiv I (receptive)', drill: 'konjunktiv-1-rezeptiv',
      text: { en: 'Recognise Konjunktiv I in the news (er sei / habe) — recognition only, do not produce.', ru: 'Узнавайте Konjunktiv I в новостях (er sei / habe) — только распознавание.', ua: 'Розпізнавайте Konjunktiv I у новинах (er sei / habe) — лише розпізнавання.' } },
    { type: 'listen',
      text: { en: 'Integration: a two-voice news dialogue (TTS) with three comprehension checks.', ru: 'Интеграция: диалог-новость в два голоса (TTS) с тремя проверками.', ua: 'Інтеграція: діалог-новина у два голоси (TTS) з трьома перевірками.' } },
    { type: 'write',
      text: { en: 'Retell a news item — 80–100 words using "X berichtet, dass …".', ru: 'Перескажите новость — 80–100 слов через «X berichtet, dass …».', ua: 'Перекажіть новину — 80–100 слів через «X berichtet, dass …».' },
      checklist: [
        { en: 'Use reported speech at least 3 times.', ru: 'Используйте косвенную речь хотя бы 3 раза.', ua: 'Використайте непряму мову щонайменше 3 рази.' },
        { en: 'Include one ecology term.', ru: 'Включите один экологический термин.', ua: 'Включіть один екологічний термін.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: revisit verb-preposition pairs II (W32) and Passiv (W28).', ru: 'День повторения: повтор глагольно-предложных пар II (W32) и Passiv (W28).', ua: 'День повторення: повтор дієслівно-прийменникових пар II (W32) і Passiv (W28).' } },
  ],

  canDo: [
    { en: 'I can report what someone said with dass + Indikativ.', ru: 'Я могу передать чужие слова через dass + Indikativ.', ua: 'Я можу передати чужі слова через dass + Indikativ.' },
    { en: 'I can recognise Konjunktiv I in news reports.', ru: 'Я могу узнавать Konjunktiv I в новостях.', ua: 'Я можу розпізнавати Konjunktiv I у новинах.' },
    { en: 'I can follow a short news dialogue.', ru: 'Я могу понять короткий диалог-новость.', ua: 'Я можу зрозуміти короткий діалог-новину.' },
    { en: 'I can retell a news item in my own words.', ru: 'Я могу пересказать новость своими словами.', ua: 'Я можу переказати новину своїми словами.' },
    { en: 'I can talk about media and the environment.', ru: 'Я могу говорить о СМИ и окружающей среде.', ua: 'Я можу говорити про ЗМІ й довкілля.' },
  ],

  drills: {
    'indirekte-rede': {
      level: 'B1',
      concept: { en: 'Reported speech with dass', ru: 'Косвенная речь с dass', ua: 'Непряма мова з dass' },
      prompt:  { en: 'Turn direct speech into reported speech.', ru: 'Преобразуйте прямую речь в косвенную.', ua: 'Перетворіть пряму мову на непряму.' },
      items: [
        { type: 'cloze',  de: 'Er sagt, dass er müde ___. ("Ich bin müde")', answer: 'ist' },
        { type: 'order',  answer: ['Sie', 'berichtet,', 'dass', 'es', 'regnet'] },
        { type: 'choice', de: 'Der Politiker behauptet, dass die Wirtschaft ___.', answer: 'wächst', options: ['wächst', 'wachsen', 'gewachsen'] },
      ],
    },
    'konjunktiv-1-rezeptiv': {
      level: 'B1',
      concept: { en: 'Recognising Konjunktiv I', ru: 'Распознавание Konjunktiv I', ua: 'Розпізнавання Konjunktiv I' },
      prompt:  { en: 'Which sentence uses Konjunktiv I (news style)?', ru: 'В каком предложении Konjunktiv I (стиль новостей)?', ua: 'У якому реченні Konjunktiv I (стиль новин)?' },
      items: [
        { type: 'choice', de: 'Wähle die Nachrichtenform:', answer: 'Er sei krank.', options: ['Er ist krank.', 'Er sei krank.', 'Er war krank.'] },
        { type: 'choice', de: 'Wähle die Nachrichtenform:', answer: 'Sie habe das gesagt.', options: ['Sie hat das gesagt.', 'Sie habe das gesagt.', 'Sie hatte das gesagt.'] },
        { type: 'cloze',  de: 'Der Minister sagt, er ___ optimistisch. (news: sein → KI)', answer: 'sei' },
      ],
    },
  },

  dialogue: {
    slug: 'w33-nachrichten',
    level: 'B1',
    vocabularyMaxWeek: 33,
    title: { en: 'In the news', ru: 'В новостях', ua: 'У новинах' },
    lines: [
      { speaker: 'A', de: 'Hast du die Nachricht über den Klimawandel gelesen?' },
      { speaker: 'B', de: 'Ja. Die Zeitung berichtet, dass die Stadt mehr recyceln will.' },
      { speaker: 'A', de: 'Der Bürgermeister behauptet, dass das der Umwelt hilft.' },
      { speaker: 'B', de: 'Das stimmt, aber es kostet auch viel Energie.' },
    ],
    questions: [
      { de: 'Die Zeitung berichtet über Recycling.', answer: true, text: { en: 'The newspaper reports on recycling.', ru: 'Газета сообщает о переработке.', ua: 'Газета повідомляє про переробку.' } },
      { de: 'Der Bürgermeister ist gegen die Idee.', answer: false, text: { en: 'The mayor is against the idea.', ru: 'Мэр против этой идеи.', ua: 'Мер проти цієї ідеї.' } },
      { de: 'B erwähnt, dass es viel Energie kostet.', answer: true, text: { en: 'B mentions that it uses a lot of energy.', ru: 'B упоминает, что это требует много энергии.', ua: 'B згадує, що це потребує багато енергії.' } },
    ],
  },
};

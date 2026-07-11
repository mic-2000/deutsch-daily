/* Week 34 — Written B1 + B1.2 consolidation (B1, phase B1.2). Days 166–170. Day 170 = cumulative B1 milestone.
   Reuses Redemittel (v1 W24) + NEW letter formulas. */
module.exports = {
  n: 34,
  phase: 'B1.2',
  level: 'B1',
  theme:      { en: 'Written B1 + B1.2 consolidation', ru: 'Письменный B1 + консолидация B1.2', ua: 'Письмовий B1 + консолідація B1.2' },
  grammar:    { en: 'Pro/contra structure + Redemittel; formal letter formulas; review W31–33', ru: 'Структура Pro/Contra + Redemittel; формулы писем; повтор W31–33', ua: 'Структура Pro/Contra + Redemittel; формули листів; повтор W31–33' },
  vocabTheme: { en: 'discourse markers, letter formulas', ru: 'связки, формулы писем', ua: 'зв’язки, формули листів' },

  vocab: [
    { de: 'Zuerst möchte ich …',              en: 'First of all I would like to …',   ru: 'Прежде всего я хотел бы …',      ua: 'Перш за все я хотів би …' },
    { de: 'Einerseits …',                     en: 'On one hand …',                    ru: 'С одной стороны …',             ua: 'З одного боку …' },
    { de: 'Andererseits …',                   en: 'On the other hand …',              ru: 'С другой стороны …',            ua: 'З іншого боку …' },
    { de: 'Ein weiterer Punkt ist …',         en: 'Another point is …',               ru: 'Ещё один момент …',             ua: 'Ще один момент …' },
    { de: 'Zusammenfassend kann man sagen …', en: 'In conclusion one can say …',      ru: 'Подводя итог, можно сказать …', ua: 'Підсумовуючи, можна сказати …' },
    { de: 'Da bin ich anderer Meinung',       en: 'I disagree with that',             ru: 'Тут я другого мнения',          ua: 'Тут я іншої думки' },
    { de: 'Das sehe ich genauso',             en: 'I see it the same way',            ru: 'Я вижу это так же',             ua: 'Я бачу це так само' },
    { de: 'Es kommt darauf an',               en: 'It depends',                       ru: 'Смотря по обстоятельствам',     ua: 'Залежить від обставин' },
    { de: 'Sehr geehrte Damen und Herren',    en: 'Dear Sir or Madam',                ru: 'Уважаемые дамы и господа',      ua: 'Шановні пані та панове' },
    { de: 'Mit freundlichen Grüßen',          en: 'Kind regards',                     ru: 'С уважением',                   ua: 'З повагою' },
    { de: 'Ich schreibe Ihnen, weil …',       en: 'I am writing to you because …',    ru: 'Я пишу вам, потому что …',      ua: 'Я пишу вам, тому що …' },
    { de: 'Ich freue mich auf Ihre Antwort',  en: 'I look forward to your reply',     ru: 'Жду вашего ответа',             ua: 'Чекаю на вашу відповідь' },
    { de: 'Liebe Grüße',                      en: 'Best wishes (informal)',           ru: 'С наилучшими пожеланиями (неформально)', ua: 'З найкращими побажаннями (неформально)' },
    { de: 'die Stellungnahme',                en: 'statement / opinion piece',        ru: 'заявление / мнение',            ua: 'заява / думка' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'grammar', grammarFocus: 'Pro/contra structure', drill: 'pro-contra',
      text: { en: 'Structure a pro/contra text with Redemittel (einerseits … andererseits …).', ru: 'Структура текста Pro/Contra с Redemittel (einerseits … andererseits …).', ua: 'Структура тексту Pro/Contra з Redemittel (einerseits … andererseits …).' } },
    { type: 'grammar', grammarFocus: 'Letter formulas', drill: 'briefformeln',
      text: { en: 'Formal vs. semi-formal letter formulas (Sehr geehrte … / Liebe Grüße).', ru: 'Формальные vs. полуформальные формулы писем (Sehr geehrte … / Liebe Grüße).', ua: 'Формальні vs. напівформальні формули листів (Sehr geehrte … / Liebe Grüße).' } },
    { type: 'write',
      text: { en: 'Write a pro/contra essay — 80–100 words with ≥1 wegen/trotz, ≥1 Relativsatz, ≥1 Komparativ.', ru: 'Напишите эссе Pro/Contra — 80–100 слов с ≥1 wegen/trotz, ≥1 Relativsatz, ≥1 Komparativ.', ua: 'Напишіть есе Pro/Contra — 80–100 слів із ≥1 wegen/trotz, ≥1 Relativsatz, ≥1 Komparativ.' },
      checklist: [
        { en: 'Use einerseits … andererseits …', ru: 'Используйте einerseits … andererseits …', ua: 'Використайте einerseits … andererseits …' },
        { en: 'End with a conclusion (Zusammenfassend …).', ru: 'Завершите выводом (Zusammenfassend …).', ua: 'Завершіть висновком (Zusammenfassend …).' },
      ] },
    { type: 'review',
      text: { en: 'Review W33: reported speech + Konjunktiv I recognition drills.', ru: 'Повторение W33: косвенная речь + распознавание Konjunktiv I.', ua: 'Повторення W33: непряма мова + розпізнавання Konjunktiv I.' } },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE: cumulative B1 test — 20 points from weeks 25–33 with a debrief.', ru: 'КОНТРОЛЬНАЯ ТОЧКА: кумулятивный B1-тест — 20 пунктов недель 25–33 с разбором.', ua: 'КОНТРОЛЬНА ТОЧКА: кумулятивний B1-тест — 20 пунктів тижнів 25–33 з розбором.' } },
  ],

  canDo: [
    { en: 'I can structure a balanced pro/contra text.', ru: 'Я могу структурировать сбалансированный текст Pro/Contra.', ua: 'Я можу структурувати збалансований текст Pro/Contra.' },
    { en: 'I can use the right formal or informal letter formulas.', ru: 'Я могу использовать правильные формулы для формального или неформального письма.', ua: 'Я можу використовувати правильні формули для формального чи неформального листа.' },
    { en: 'I can write a B1-level opinion essay.', ru: 'Я могу написать эссе-мнение уровня B1.', ua: 'Я можу написати есе-думку рівня B1.' },
    { en: 'I can report speech and spot Konjunktiv I.', ru: 'Я могу передавать речь и замечать Konjunktiv I.', ua: 'Я можу передавати мову й помічати Konjunktiv I.' },
    { en: 'I can pass a cumulative B1 grammar test.', ru: 'Я могу пройти кумулятивный тест по грамматике B1.', ua: 'Я можу пройти кумулятивний тест з граматики B1.' },
  ],

  drills: {
    'pro-contra': {
      level: 'B1',
      concept: { en: 'Pro/contra discourse markers', ru: 'Связки Pro/Contra', ua: 'Слова-зв’язки Pro/Contra' },
      prompt:  { en: 'Choose the right discourse marker.', ru: 'Выберите правильную связку.', ua: 'Виберіть правильне слово-зв’язку.' },
      items: [
        { type: 'choice', de: '___ ist das Auto praktisch, andererseits teuer.', answer: 'Einerseits', options: ['Einerseits', 'Andererseits', 'Trotzdem'] },
        { type: 'cloze',  de: '___ kann man sagen, dass beide Seiten Recht haben. (in conclusion)', answer: 'Zusammenfassend' },
        { type: 'choice', de: 'Ein ___ Punkt ist der Preis.', answer: 'weiterer', options: ['weiterer', 'weitere', 'weiteres'] },
      ],
    },
    'briefformeln': {
      level: 'B1',
      concept: { en: 'Formal vs. informal letter formulas', ru: 'Формулы формальных и неформальных писем', ua: 'Формули формальних і неформальних листів' },
      prompt:  { en: 'Choose the fitting formula.', ru: 'Выберите подходящую формулу.', ua: 'Виберіть відповідну формулу.' },
      items: [
        { type: 'choice', de: 'Formeller Brief, Anrede:', answer: 'Sehr geehrte Damen und Herren', options: ['Hallo', 'Sehr geehrte Damen und Herren', 'Liebe Grüße'] },
        { type: 'choice', de: 'Formeller Brief, Schluss:', answer: 'Mit freundlichen Grüßen', options: ['Mit freundlichen Grüßen', 'Tschüss', 'Liebe Grüße'] },
        { type: 'cloze',  de: 'Ich freue mich auf Ihre ___. (reply)', answer: 'Antwort' },
      ],
    },
  },

  dialogue: {
    slug: 'w34-schriftlich',
    level: 'B1',
    vocabularyMaxWeek: 34,
    title: { en: 'Planning an essay', ru: 'Планирование эссе', ua: 'Планування есе' },
    lines: [
      { speaker: 'A', de: 'Wie fange ich den Text an?' },
      { speaker: 'B', de: 'Zuerst möchte ich das Thema vorstellen, dann Pro und Contra.' },
      { speaker: 'A', de: 'Und der Schluss?' },
      { speaker: 'B', de: 'Zusammenfassend kann man die eigene Meinung schreiben.' },
    ],
    questions: [
      { de: 'Man beginnt mit der Vorstellung des Themas.', answer: true, text: { en: 'You begin by introducing the topic.', ru: 'Начинают с представления темы.', ua: 'Починають із представлення теми.' } },
      { de: 'Die eigene Meinung kommt am Anfang.', answer: false, text: { en: 'Your own opinion comes at the beginning.', ru: 'Своё мнение идёт в начале.', ua: 'Власна думка йде на початку.' } },
      { de: 'Der Text enthält Pro und Contra.', answer: true, text: { en: 'The text contains pros and cons.', ru: 'Текст содержит за и против.', ua: 'Текст містить за і проти.' } },
    ],
  },
};

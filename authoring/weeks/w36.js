/* Week 36 — Exam: Schreiben + Sprechen; final rehearsal (B1, phase Pruefung). Days 176–180. Day 180 = final milestone. */
module.exports = {
  n: 36,
  phase: 'Pruefung',
  level: 'B1',
  theme:      { en: 'Exam: Schreiben + Sprechen', ru: 'Экзамен: Schreiben + Sprechen', ua: 'Іспит: Schreiben + Sprechen' },
  grammar:    { en: 'No new grammar — writing and speaking formats + general rehearsal', ru: 'Без новой грамматики — форматы Schreiben/Sprechen + генеральная репетиция', ua: 'Без нової граматики — формати Schreiben/Sprechen + генеральна репетиція' },
  vocabTheme: { en: 'exam readiness', ru: 'готовность к экзамену', ua: 'готовність до іспиту' },

  vocab: [
    { de: 'die Prüfung',        en: 'exam',              ru: 'экзамен',        ua: 'іспит' },
    { de: 'die Aufgabe',        en: 'task',              ru: 'задание',        ua: 'завдання' },
    { de: 'die Präsentation',   en: 'presentation',      ru: 'презентация',    ua: 'презентація' },
    { de: 'das Argument',       en: 'argument',          ru: 'аргумент',       ua: 'аргумент' },
    { de: 'die Meinung',        en: 'opinion',           ru: 'мнение',         ua: 'думка' },
    { de: 'das Thema',          en: 'topic',             ru: 'тема',           ua: 'тема' },
    { de: 'das Ergebnis',       en: 'result',            ru: 'результат',      ua: 'результат' },
    { de: 'der Vorschlag',      en: 'proposal',          ru: 'предложение',    ua: 'пропозиція' },
    { de: 'die Einleitung',     en: 'introduction',      ru: 'введение',       ua: 'вступ' },
    { de: 'der Schluss',        en: 'conclusion',        ru: 'заключение',     ua: 'висновок' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'write',
      text: { en: 'Schreiben Teil 1: a formal letter of about 80 words following the exam format.', ru: 'Schreiben Teil 1: формальное письмо ~80 слов по формату экзамена.', ua: 'Schreiben Teil 1: формальний лист ~80 слів за форматом іспиту.' },
      checklist: [
        { en: 'Use Sehr geehrte … and Mit freundlichen Grüßen.', ru: 'Используйте Sehr geehrte … и Mit freundlichen Grüßen.', ua: 'Використайте Sehr geehrte … і Mit freundlichen Grüßen.' },
        { en: 'Cover all prompt points.', ru: 'Раскройте все пункты задания.', ua: 'Розкрийте всі пункти завдання.' },
      ] },
    { type: 'write',
      text: { en: 'Schreiben Teil 2–3: a forum post and a semi-formal letter.', ru: 'Schreiben Teil 2–3: пост на форуме и полуформальное письмо.', ua: 'Schreiben Teil 2–3: пост на форумі та напівформальний лист.' } },
    { type: 'speak',
      text: { en: 'Sprechen Teil 1: plan something together with the AI partner (or a written dialogue).', ru: 'Sprechen Teil 1: спланируйте что-то с AI-партнёром (или письменный диалог).', ua: 'Sprechen Teil 1: сплануйте щось із AI-партнером (або письмовий діалог).' } },
    { type: 'speak',
      text: { en: 'Sprechen Teil 2: give a short presentation on a topic and record yourself.', ru: 'Sprechen Teil 2: короткая презентация по теме с самозаписью.', ua: 'Sprechen Teil 2: коротка презентація за темою із самозаписом.' } },
    { type: 'test', milestone: true,
      text: { en: 'FINAL MILESTONE: Sprechen Teil 3 + a full exam rehearsal — the A1→B1 graduation check.', ru: 'ФИНАЛЬНАЯ КОНТРОЛЬНАЯ ТОЧКА: Sprechen Teil 3 + генеральная репетиция — итоговая проверка A1→B1.', ua: 'ФІНАЛЬНА КОНТРОЛЬНА ТОЧКА: Sprechen Teil 3 + генеральна репетиція — підсумкова перевірка A1→B1.' } },
  ],

  canDo: [
    { en: 'I can write a formal B1 letter.', ru: 'Я могу написать формальное письмо уровня B1.', ua: 'Я можу написати формальний лист рівня B1.' },
    { en: 'I can write a forum post and a semi-formal letter.', ru: 'Я могу написать пост на форуме и полуформальное письмо.', ua: 'Я можу написати пост на форумі та напівформальний лист.' },
    { en: 'I can plan something in conversation.', ru: 'Я могу что-то спланировать в разговоре.', ua: 'Я можу щось спланувати в розмові.' },
    { en: 'I can give a short presentation on a topic.', ru: 'Я могу сделать короткую презентацию по теме.', ua: 'Я можу зробити коротку презентацію за темою.' },
    { en: 'I can complete a full B1 exam rehearsal.', ru: 'Я могу пройти полную репетицию экзамена B1.', ua: 'Я можу пройти повну репетицію іспиту B1.' },
  ],

  drills: {},

  dialogue: {
    slug: 'w36-sprechen-planen',
    level: 'B1',
    vocabularyMaxWeek: 36,
    title: { en: 'Planning together (Sprechen Teil 1)', ru: 'Совместное планирование (Sprechen Teil 1)', ua: 'Спільне планування (Sprechen Teil 1)' },
    lines: [
      { speaker: 'A', de: 'Wir sollen zusammen eine Feier für einen Kollegen planen.' },
      { speaker: 'B', de: 'Gute Idee. Ich würde vorschlagen, dass wir sie im Büro machen.' },
      { speaker: 'A', de: 'Einverstanden. Wer kümmert sich um das Essen?' },
      { speaker: 'B', de: 'Das kann ich übernehmen. Und du organisierst die Getränke.' },
    ],
    questions: [
      { de: 'Die beiden planen eine Feier.', answer: true, text: { en: 'The two are planning a party.', ru: 'Они планируют праздник.', ua: 'Вони планують свято.' } },
      { de: 'Die Feier soll im Restaurant stattfinden.', answer: false, text: { en: 'The party should take place at a restaurant.', ru: 'Праздник должен пройти в ресторане.', ua: 'Свято має відбутися в ресторані.' } },
      { de: 'B kümmert sich um das Essen.', answer: true, text: { en: 'B takes care of the food.', ru: 'B берёт на себя еду.', ua: 'B бере на себе їжу.' } },
    ],
  },
};

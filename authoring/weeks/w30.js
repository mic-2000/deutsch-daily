/* Week 30 — B1.1 consolidation (B1, phase B1.1). Days 146–150. Day 150 = B1-mid milestone. Reuses abstract vocab (v1 W23). */
module.exports = {
  n: 30,
  phase: 'B1.1',
  level: 'B1',
  theme:      { en: 'B1.1 consolidation', ru: 'Консолидация B1.1', ua: 'Консолідація B1.1' },
  grammar:    { en: 'Review Genitiv + Adjektivdeklination; Aktiv→Passiv, Indikativ→KII, Mittelfeld', ru: 'Повторение Genitiv + Adjektivdeklination; Aktiv→Passiv, Indikativ→KII, Mittelfeld', ua: 'Повторення Genitiv + Adjektivdeklination; Aktiv→Passiv, Indikativ→KII, Mittelfeld' },
  vocabTheme: { en: 'abstract vocabulary', ru: 'абстрактная лексика', ua: 'абстрактна лексика' },

  vocab: [
    { de: 'die Gelegenheit',  en: 'opportunity',        ru: 'возможность',    ua: 'нагода' },
    { de: 'die Bedeutung',    en: 'meaning',            ru: 'значение',       ua: 'значення' },
    { de: 'der Unterschied',  en: 'difference',         ru: 'разница',        ua: 'різниця' },
    { de: 'die Wirkung',      en: 'effect',             ru: 'воздействие',    ua: 'вплив' },
    { de: 'der Zusammenhang', en: 'connection',         ru: 'взаимосвязь',    ua: 'взаємозв’язок' },
    { de: 'der Eindruck',     en: 'impression',         ru: 'впечатление',    ua: 'враження' },
    { de: 'die Notwendigkeit', en: 'necessity',         ru: 'необходимость',  ua: 'необхідність' },
    { de: 'die Entwicklung',  en: 'development',        ru: 'развитие',       ua: 'розвиток' },
    { de: 'die Lösung',       en: 'solution',           ru: 'решение',        ua: 'розв’язання' },
    { de: 'das Ziel',         en: 'goal',               ru: 'цель',           ua: 'мета' },
    { de: 'die Erfahrung',    en: 'experience',         ru: 'опыт',           ua: 'досвід' },
    { de: 'der Zweifel',      en: 'doubt',              ru: 'сомнение',       ua: 'сумнів' },
    { de: 'abstrakt',         en: 'abstract',           ru: 'абстрактный',    ua: 'абстрактний' },
  ],

  verbFocus: [],

  tasks: [
    { type: 'review', drill: 'kasus-wdh-b1',
      text: { en: 'Consolidation: Genitiv and Adjektivdeklination across all three declension types.', ru: 'Консолидация: Genitiv и Adjektivdeklination во всех трёх типах.', ua: 'Консолідація: Genitiv і Adjektivdeklination в усіх трьох типах.' } },
    { type: 'review',
      text: { en: 'Consolidation drills: Aktiv→Passiv, Indikativ→KII, and Mittelfeld order (Ich gebe es ihm).', ru: 'Дриллы: Aktiv→Passiv, Indikativ→KII и порядок Mittelfeld (Ich gebe es ihm).', ua: 'Дрили: Aktiv→Passiv, Indikativ→KII і порядок Mittelfeld (Ich gebe es ihm).' } },
    { type: 'read',
      text: { en: 'Reading day: an original B1 reading text; the rest of the abstract set is receptive.', ru: 'День чтения: оригинальный текст уровня B1; остаток абстрактного набора — рецептивно.', ua: 'День читання: оригінальний текст рівня B1; решта абстрактного набору — рецептивно.' } },
    { type: 'write',
      text: { en: 'Grammar check + an 80-word text with at least one Genitiv and one Relativsatz.', ru: 'Грамматическая проверка + текст на 80 слов с минимум одним Genitiv и одним Relativsatz.', ua: 'Граматична перевірка + текст на 80 слів із щонайменше одним Genitiv і одним Relativsatz.' },
      checklist: [
        { en: 'Include at least one Genitiv construction.', ru: 'Включите хотя бы одну конструкцию Genitiv.', ua: 'Включіть щонайменше одну конструкцію Genitiv.' },
        { en: 'Include at least one Relativsatz.', ru: 'Включите хотя бы один Relativsatz.', ua: 'Включіть щонайменше один Relativsatz.' },
      ] },
    { type: 'test', milestone: true,
      text: { en: 'MILESTONE: B1-mid self-test across weeks 25–29; mistakes go to the trainer.', ru: 'КОНТРОЛЬНАЯ ТОЧКА: самотест B1-mid по неделям 25–29; ошибки → в тренажёр.', ua: 'КОНТРОЛЬНА ТОЧКА: самотест B1-mid за тижнями 25–29; помилки → у тренажер.' } },
  ],

  canDo: [
    { en: 'I can use the Genitiv confidently.', ru: 'Я могу уверенно использовать Genitiv.', ua: 'Я можу впевнено використовувати Genitiv.' },
    { en: 'I can transform active sentences into passive and KII.', ru: 'Я могу превращать активные предложения в пассив и KII.', ua: 'Я можу перетворювати активні речення на пасив і KII.' },
    { en: 'I can read an abstract B1 text.', ru: 'Я могу читать абстрактный текст уровня B1.', ua: 'Я можу читати абстрактний текст рівня B1.' },
    { en: 'I can write a text with complex structures.', ru: 'Я могу написать текст со сложными структурами.', ua: 'Я можу написати текст зі складними структурами.' },
    { en: 'I can gauge my mid-B1 level.', ru: 'Я могу оценить свой уровень середины B1.', ua: 'Я можу оцінити свій рівень середини B1.' },
  ],

  drills: {
    'kasus-wdh-b1': {
      level: 'B1',
      concept: { en: 'Review: Genitiv and adjective endings', ru: 'Повторение: Genitiv и окончания прилагательных', ua: 'Повторення: Genitiv і закінчення прикметників' },
      prompt:  { en: 'Choose the correct form.', ru: 'Выберите правильную форму.', ua: 'Виберіть правильну форму.' },
      items: [
        { type: 'cloze',  de: 'das Auto ___ Mannes (Genitiv, der Mann)', answer: 'des' },
        { type: 'choice', de: 'Ich trinke ___ Wein. (gut, ohne Artikel, Akk. m.)', answer: 'guten', options: ['guter', 'guten', 'gutes'] },
        { type: 'cloze',  de: 'trotz ___ Wetters (Genitiv, das Wetter)', answer: 'des' },
      ],
    },
  },

  dialogue: {
    slug: 'w30-b1-mid',
    level: 'B1',
    vocabularyMaxWeek: 30,
    title: { en: 'Talking about goals', ru: 'Разговор о целях', ua: 'Розмова про цілі' },
    lines: [
      { speaker: 'A', de: 'Was ist dein Ziel für dieses Jahr?' },
      { speaker: 'B', de: 'Meine Erfahrung mit Sprachen ist gut, deshalb möchte ich die B1-Prüfung machen.' },
      { speaker: 'A', de: 'Das ist eine gute Gelegenheit. Wo liegt der Unterschied zu A2?' },
      { speaker: 'B', de: 'Bei B1 muss man längere Texte verstehen und schreiben.' },
    ],
    questions: [
      { de: 'B möchte die B1-Prüfung machen.', answer: true, text: { en: 'B wants to take the B1 exam.', ru: 'B хочет сдать экзамен B1.', ua: 'B хоче скласти іспит B1.' } },
      { de: 'Bei B1 sind die Texte kürzer als bei A2.', answer: false, text: { en: 'B1 texts are shorter than A2 texts.', ru: 'Тексты B1 короче, чем тексты A2.', ua: 'Тексти B1 коротші за тексти A2.' } },
      { de: 'A findet, dass das eine gute Gelegenheit ist.', answer: true, text: { en: 'A thinks this is a good opportunity.', ru: 'A считает это хорошей возможностью.', ua: 'A вважає це гарною нагодою.' } },
    ],
  },
};

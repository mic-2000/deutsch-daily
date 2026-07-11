/* Week 32 — Discussion; verb-preposition rections II + da(r)-/wo(r)- forms and correlatives (B1, phase B1.2).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 156–160.
   Vocab is a NEW set of verb-preposition pairs (part 2) plus correlative connectives (16); it extends the
   rections learned in week 21 and feeds the da(r)-/wo(r)- day and the discussion task. */
module.exports = {
  n: 32,
  phase: 'B1.2',
  level: 'B1',
  theme:      { en: 'Discussion; verb-preposition rections II', ru: 'Дискуссия; глагольные рекции II', ua: 'Дискусія; дієслівні рекції II' },
  grammar:    { en: 'More verb-preposition pairs, da(r)-/wo(r)- forms, correlative conjunctions', ru: 'Новые глагольно-предложные пары, da(r)-/wo(r)-, коррелятивные союзы', ua: 'Нові дієслівно-прийменникові пари, da(r)-/wo(r)-, корелятивні сполучники' },
  vocabTheme: { en: 'verb-preposition pairs, discussion', ru: 'глагольно-предложные пары, дискуссия', ua: 'дієслівно-прийменникові пари, дискусія' },

  vocab: [
    { de: 'sich beschweren über',    en: 'to complain about',       ru: 'жаловаться на',            ua: 'скаржитися на' },
    { de: 'Angst haben vor',         en: 'to be afraid of',         ru: 'бояться (чего-л.)',        ua: 'боятися (чогось)' },
    { de: 'hoffen auf',              en: 'to hope for',             ru: 'надеяться на',             ua: 'сподіватися на' },
    { de: 'sich ärgern über',        en: 'to be annoyed about',     ru: 'раздражаться из-за',       ua: 'дратуватися через' },
    { de: 'leiden unter',            en: 'to suffer from',          ru: 'страдать от',              ua: 'страждати від' },
    { de: 'abhängen von',            en: 'to depend on',            ru: 'зависеть от',              ua: 'залежати від' },
    { de: 'sich beschäftigen mit',   en: 'to occupy oneself with',  ru: 'заниматься (чем-л.)',      ua: 'займатися (чимось)' },
    { de: 'sich gewöhnen an',        en: 'to get used to',          ru: 'привыкать к',              ua: 'звикати до' },
    { de: 'bestehen auf',            en: 'to insist on',            ru: 'настаивать на',            ua: 'наполягати на' },
    { de: 'halten von',              en: 'to think of / rate',      ru: 'быть какого-либо мнения о / относиться к', ua: 'бути певної думки про / ставитися до' },
    { de: 'sich verlassen auf',      en: 'to rely on',              ru: 'полагаться на',            ua: 'покладатися на' },
    { de: 'zweifeln an',             en: 'to doubt',                ru: 'сомневаться в',            ua: 'сумніватися в' },
    { de: 'reagieren auf',           en: 'to react to',             ru: 'реагировать на',           ua: 'реагувати на' },
    { de: 'entweder … oder',         en: 'either … or',             ru: 'или … или',                ua: 'або … або' },
    { de: 'sowohl … als auch',       en: 'both … and',              ru: 'как … так и',              ua: 'як … так і' },
    { de: 'nicht nur … sondern auch', en: 'not only … but also',    ru: 'не только … но и',         ua: 'не тільки … але й' },
  ],

  verbFocus: ['sich beschweren', 'leiden', 'abhängen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'Verb-preposition rections II', drill: 'verben-praeposition-2',
      text: { en: 'More verb-preposition pairs: sich beschweren über, hoffen auf, leiden unter, abhängen von.',
              ru: 'Новые глагольно-предложные пары: sich beschweren über, hoffen auf, leiden unter, abhängen von.',
              ua: 'Нові дієслівно-прийменникові пари: sich beschweren über, hoffen auf, leiden unter, abhängen von.' } },
    { type: 'grammar', grammarFocus: 'da(r)- / wo(r)- forms', drill: 'da-wo-komposita',
      text: { en: 'Replace a thing with da(r)- (darauf, davon) and ask about it with wo(r)- (worauf, wovon).',
              ru: 'Заменяйте предмет формой da(r)- (darauf, davon) и спрашивайте о нём через wo(r)- (worauf, wovon).',
              ua: 'Замінюйте предмет формою da(r)- (darauf, davon) і питайте про нього через wo(r)- (worauf, wovon).' } },
    { type: 'grammar', grammarFocus: 'Correlative conjunctions', drill: 'korrelativ-konjunktionen',
      text: { en: 'Link ideas with entweder … oder, sowohl … als auch, nicht nur … sondern auch.',
              ru: 'Связывайте идеи через entweder … oder, sowohl … als auch, nicht nur … sondern auch.',
              ua: 'Поєднуйте ідеї через entweder … oder, sowohl … als auch, nicht nur … sondern auch.' } },
    { type: 'speak',
      text: { en: 'Take part in a short discussion: state an opinion and react using worauf/darauf. With a key, roleplay it with the AI; otherwise write the replies.',
              ru: 'Поучаствуйте в короткой дискуссии: выскажите мнение и отреагируйте через worauf/darauf. С ключом — ролевая с AI; без ключа — впишите реплики.',
              ua: 'Візьміть участь у короткій дискусії: висловте думку та відреагуйте через worauf/darauf. З ключем — рольова з AI; без ключа — впишіть репліки.' },
      checklist: [
        { en: 'Use at least two verb-preposition pairs from this week.', ru: 'Используйте минимум две глагольно-предложные пары этой недели.', ua: 'Використайте щонайменше дві дієслівно-прийменникові пари цього тижня.' },
        { en: 'Use one da(r)- or wo(r)- form (darauf, worauf …).', ru: 'Используйте одну форму da(r)- или wo(r)- (darauf, worauf …).', ua: 'Використайте одну форму da(r)- або wo(r)- (darauf, worauf …).' },
        { en: 'Link two ideas with a correlative conjunction.', ru: 'Свяжите две идеи коррелятивным союзом.', ua: 'Поєднайте дві ідеї корелятивним сполучником.' },
      ] },
    { type: 'review', drill: 'verben-praeposition-2',
      text: { en: 'Review week 32: a rection cloze, then complain about something and react to an opinion out loud.',
              ru: 'Повторение недели 32: клоуз на рекции, затем вслух пожалуйтесь на что-нибудь и отреагируйте на мнение.',
              ua: 'Повторення тижня 32: клоуз на рекції, потім вголос поскаржтеся на щось і відреагуйте на думку.' } },
  ],

  canDo: [
    { en: 'I can use more verb-preposition pairs (sich beschweren über, hoffen auf).', ru: 'Я могу использовать больше глагольно-предложных пар (sich beschweren über, hoffen auf).', ua: 'Я можу використовувати більше дієслівно-прийменникових пар (sich beschweren über, hoffen auf).' },
    { en: 'I can use da(r)- and wo(r)- forms (darauf, worauf).', ru: 'Я могу использовать формы da(r)- и wo(r)- (darauf, worauf).', ua: 'Я можу використовувати форми da(r)- і wo(r)- (darauf, worauf).' },
    { en: 'I can link ideas with correlative conjunctions (entweder … oder, sowohl … als auch).', ru: 'Я могу связывать идеи коррелятивными союзами (entweder … oder, sowohl … als auch).', ua: 'Я можу поєднувати ідеї корелятивними сполучниками (entweder … oder, sowohl … als auch).' },
    { en: 'I can take part in a short discussion and express my opinion.', ru: 'Я могу участвовать в короткой дискуссии и выражать своё мнение.', ua: 'Я можу брати участь у короткій дискусії та висловлювати свою думку.' },
    { en: 'I can complain about something and react to an opinion.', ru: 'Я могу пожаловаться на что-либо и отреагировать на мнение.', ua: 'Я можу поскаржитися на щось і відреагувати на думку.' },
  ],

  drills: {
    'verben-praeposition-2': {
      level: 'B1',
      concept: { en: 'Fixed verb-preposition pairs (part 2)', ru: 'Устойчивые глагольно-предложные пары (часть 2)', ua: 'Сталі дієслівно-прийменникові пари (частина 2)' },
      prompt:  { en: 'Fill in the correct preposition.', ru: 'Вставьте правильный предлог.', ua: 'Вставте правильний прийменник.' },
      items: [
        { type: 'cloze',  de: 'Ich beschwere mich ___ den Lärm. (sich beschweren über)', answer: 'über' },
        { type: 'choice', de: 'Der Erfolg hängt ___ deiner Arbeit ab. (abhängen von)', answer: 'von', options: ['von', 'auf', 'an'] },
        { type: 'cloze',  de: 'Alle hoffen ___ besseres Wetter. (hoffen auf)', answer: 'auf' },
      ],
    },
    'da-wo-komposita': {
      level: 'B1',
      concept: { en: 'Pronominal adverbs da(r)- and wo(r)-', ru: 'Местоименные наречия da(r)- и wo(r)-', ua: 'Займенникові прислівники da(r)- і wo(r)-' },
      prompt:  { en: 'Form the da(r)-/wo(r)- word for the thing.', ru: 'Образуйте слово da(r)-/wo(r)- для предмета.', ua: 'Утворіть слово da(r)-/wo(r)- для предмета.' },
      items: [
        { type: 'cloze',  de: 'Ich warte auf den Bus. Ich warte ___. (auf + Sache)', answer: 'darauf' },
        { type: 'choice', de: '___ denkst du? — An die Prüfung. (denken an + Sache)', answer: 'Woran', options: ['Woran', 'Auf wen', 'Woraus'] },
        { type: 'cloze',  de: 'Ich interessiere mich für Musik. Ich interessiere mich ___. (für + Sache)', answer: 'dafür' },
      ],
    },
    'korrelativ-konjunktionen': {
      level: 'B1',
      concept: { en: 'Correlative (two-part) conjunctions', ru: 'Коррелятивные (двойные) союзы', ua: 'Корелятивні (подвійні) сполучники' },
      prompt:  { en: 'Complete the two-part conjunction or build the sentence.', ru: 'Дополните двойной союз или соберите предложение.', ua: 'Доповніть подвійний сполучник або складіть речення.' },
      items: [
        { type: 'cloze',  de: 'Wir fahren ___ nach Berlin oder nach Hamburg. (either … or)', answer: 'entweder' },
        { type: 'choice', de: 'Er spricht sowohl Deutsch ___ auch Englisch. (both … and)', answer: 'als', options: ['als', 'wie', 'so'] },
        { type: 'order',  answer: ['Sie', 'ist', 'nicht', 'nur', 'klug,', 'sondern', 'auch', 'fleißig'] },
      ],
    },
  },

  dialogue: {
    slug: 'w32-diskussion',
    level: 'B1',
    vocabularyMaxWeek: 32,
    title: { en: 'A disagreement at the office', ru: 'Спор в офисе', ua: 'Суперечка в офісі' },
    lines: [
      { speaker: 'A', de: 'Worüber beschwerst du dich schon wieder?' },
      { speaker: 'B', de: 'Ich ärgere mich über die neuen Regeln. Alles hängt jetzt von der Technik ab.' },
      { speaker: 'A', de: 'Ich sehe das anders. Ich halte viel von den neuen Regeln.' },
      { speaker: 'B', de: 'Wirklich? Ich leide eher unter dem Stress.' },
      { speaker: 'A', de: 'Wir sollten uns entweder daran gewöhnen oder mit dem Chef reden.' },
      { speaker: 'B', de: 'Einverstanden. Ich verlasse mich auf dich.' },
    ],
    questions: [
      { de: 'B ärgert sich über die neuen Regeln.', answer: true, text: { en: 'B is annoyed about the new rules.', ru: 'B раздражают новые правила.', ua: 'B дратують нові правила.' } },
      { de: 'A hält nichts von den neuen Regeln.', answer: false, text: { en: 'A thinks nothing of the new rules.', ru: 'A ничего хорошего не думает о новых правилах.', ua: 'A нічого доброго не думає про нові правила.' } },
      { de: 'B verlässt sich auf A.', answer: true, text: { en: 'B relies on A.', ru: 'B полагается на A.', ua: 'B покладається на A.' } },
    ],
  },
};

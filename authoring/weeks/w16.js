/* Week 16 — Opinions; Nebensätze I (A2, phase A2.1). Days 76–80. Reuses v1 W12 (opinions). */
module.exports = {
  n: 16,
  phase: 'A2.1',
  level: 'A2',
  theme:      { en: 'Opinions; subordinate clauses I', ru: 'Мнения; придаточные I', ua: 'Думки; підрядні I' },
  grammar:    { en: 'weil (verb-final) vs. denn; dass clauses; ob and w-words in indirect questions; clause in front', ru: 'weil (глагол в конец) vs. denn; придаточные с dass; ob и w-слова в косвенных вопросах; придаточное впереди', ua: 'weil (дієслово в кінець) vs. denn; підрядні з dass; ob і w-слова в непрямих питаннях; підрядне спереду' },
  vocabTheme: { en: 'opinions, arguments', ru: 'мнения, аргументы', ua: 'думки, аргументи' },

  vocab: [
    { de: 'meiner Meinung nach', en: 'in my opinion',   ru: 'по моему мнению',  ua: 'на мою думку' },
    { de: 'Ich denke, dass …',   en: 'I think that …',  ru: 'я думаю, что …',   ua: 'я думаю, що …' },
    { de: 'Ich glaube, dass …',  en: 'I believe that …', ru: 'я считаю, что …', ua: 'я вважаю, що …' },
    { de: 'der Grund',           en: 'reason',          ru: 'причина',          ua: 'причина' },
    { de: 'der Vorteil',         en: 'advantage',       ru: 'преимущество',     ua: 'перевага' },
    { de: 'der Nachteil',        en: 'disadvantage',    ru: 'недостаток',       ua: 'недолік' },
    { de: 'das Beispiel',        en: 'example',         ru: 'пример',           ua: 'приклад' },
    { de: 'zum Beispiel',        en: 'for example',     ru: 'например',         ua: 'наприклад' },
    { de: 'außerdem',            en: 'moreover',        ru: 'кроме того',       ua: 'крім того' },
    { de: 'trotzdem',            en: 'nevertheless',    ru: 'тем не менее',     ua: 'проте' },
    { de: 'deshalb',             en: 'therefore',       ru: 'поэтому',          ua: 'тому' },
    { de: 'obwohl',              en: 'although',        ru: 'хотя',             ua: 'хоча' },
    { de: 'weil',                en: 'because',         ru: 'потому что',       ua: 'тому що' },
    { de: 'dass',                en: 'that',            ru: 'что',              ua: 'що' },
    { de: 'ob',                  en: 'whether',         ru: 'ли',               ua: 'чи' },
    { de: 'einverstanden',       en: 'in agreement',    ru: 'согласен',         ua: 'згоден' },
  ],

  verbFocus: ['denken', 'glauben', 'meinen', 'hoffen'],

  tasks: [
    { type: 'grammar', grammarFocus: 'weil vs. denn', drill: 'weil-verbfinal',
      text: { en: 'weil sends the verb to the end; contrast with denn (verb-second).', ru: 'weil отправляет глагол в конец; контраст с denn (V2).', ua: 'weil відправляє дієслово в кінець; контраст із denn (V2).' } },
    { type: 'grammar', grammarFocus: 'dass / ob', drill: 'dass-ob',
      text: { en: 'dass clauses; ob and w-words in indirect questions (wann/wo/wie …).', ru: 'Придаточные с dass; ob и w-слова в косвенных вопросах (wann/wo/wie …).', ua: 'Підрядні з dass; ob і w-слова в непрямих питаннях (wann/wo/wie …).' } },
    { type: 'grammar', grammarFocus: 'Clause in front', drill: 'nebensatz-vorne',
      text: { en: 'Subordinate clause in front: Weil …, verb comes first in the main clause.', ru: 'Придаточное впереди: Weil …, глагол главного идёт первым.', ua: 'Підрядне спереду: Weil …, дієслово головного йде першим.' } },
    { type: 'write',
      text: { en: 'Write an opinion — 60–80 words with at least 3 weil/dass clauses.', ru: 'Напишите мнение — 60–80 слов с минимум 3 придаточными weil/dass.', ua: 'Напишіть думку — 60–80 слів із щонайменше 3 підрядними weil/dass.' },
      checklist: [
        { en: 'Use weil at least twice.', ru: 'Используйте weil хотя бы дважды.', ua: 'Використайте weil щонайменше двічі.' },
        { en: 'Give one advantage and one disadvantage.', ru: 'Назовите одно преимущество и один недостаток.', ua: 'Назвіть одну перевагу й один недолік.' },
      ] },
    { type: 'review',
      text: { en: 'Review day: opinion phrases; revisit Komparativ (W15) and modal Präteritum (W13).', ru: 'День повторения: фразы мнения; повтор Komparativ (W15) и модальных Präteritum (W13).', ua: 'День повторення: фрази думки; повтор Komparativ (W15) і модальних Präteritum (W13).' } },
  ],

  canDo: [
    { en: 'I can give a reason with weil.', ru: 'Я могу назвать причину с weil.', ua: 'Я можу назвати причину з weil.' },
    { en: 'I can report what someone says with dass/ob.', ru: 'Я могу передать чужие слова с dass/ob.', ua: 'Я можу передати чужі слова з dass/ob.' },
    { en: 'I can start a sentence with a subordinate clause.', ru: 'Я могу начать предложение с придаточного.', ua: 'Я можу почати речення з підрядного.' },
    { en: 'I can write my opinion with reasons.', ru: 'Я могу написать своё мнение с аргументами.', ua: 'Я можу написати свою думку з аргументами.' },
    { en: 'I can weigh advantages and disadvantages.', ru: 'Я могу взвесить плюсы и минусы.', ua: 'Я можу зважити плюси й мінуси.' },
  ],

  drills: {
    'weil-verbfinal': {
      level: 'A2',
      concept: { en: 'weil sends the verb to the end', ru: 'weil отправляет глагол в конец', ua: 'weil відправляє дієслово в кінець' },
      prompt:  { en: 'Complete the weil-clause.', ru: 'Завершите придаточное с weil.', ua: 'Завершіть підрядне з weil.' },
      items: [
        { type: 'cloze',  de: 'Ich bleibe zu Hause, weil ich krank ___. (sein)', answer: 'bin' },
        { type: 'order',  answer: ['weil', 'ich', 'keine', 'Zeit', 'habe'] },
        { type: 'choice', de: 'Ich lerne Deutsch, ___ ich in Berlin wohne.', answer: 'weil', options: ['weil', 'denn', 'aber'] },
      ],
    },
    'dass-ob': {
      level: 'A2',
      concept: { en: 'dass and ob clauses', ru: 'придаточные с dass и ob', ua: 'підрядні з dass і ob' },
      prompt:  { en: 'Choose dass or ob.', ru: 'Выберите dass или ob.', ua: 'Виберіть dass або ob.' },
      items: [
        { type: 'choice', de: 'Ich weiß nicht, ___ er kommt.', answer: 'ob', options: ['dass', 'ob', 'weil'] },
        { type: 'choice', de: 'Ich glaube, ___ das richtig ist.', answer: 'dass', options: ['dass', 'ob', 'denn'] },
        { type: 'order',  answer: ['Ich', 'hoffe,', 'dass', 'du', 'kommst'] },
      ],
    },
    'nebensatz-vorne': {
      level: 'A2',
      concept: { en: 'Subordinate clause in front position', ru: 'Придаточное в начале', ua: 'Підрядне на початку' },
      prompt:  { en: 'Reorder so the clause comes first.', ru: 'Переставьте так, чтобы придаточное было впереди.', ua: 'Переставте так, щоб підрядне було спереду.' },
      items: [
        { type: 'order',  answer: ['Weil', 'es', 'regnet,', 'bleibe', 'ich', 'zu', 'Hause'] },
        { type: 'cloze',  de: 'Weil ich müde bin, ___ ich früh ins Bett. (gehen)', answer: 'gehe' },
        { type: 'choice', de: 'Wenn es schneit, ___ wir Ski.', answer: 'fahren', options: ['fahren', 'wir fahren', 'gefahren'] },
      ],
    },
  },

  dialogue: {
    slug: 'w16-meinung',
    level: 'A2',
    vocabularyMaxWeek: 16,
    title: { en: 'A little argument', ru: 'Небольшой спор', ua: 'Невелика суперечка' },
    lines: [
      { speaker: 'A', de: 'Ich denke, dass Autos in der Stadt verboten sein sollten.' },
      { speaker: 'B', de: 'Wirklich? Warum?' },
      { speaker: 'A', de: 'Weil sie die Luft schmutzig machen.' },
      { speaker: 'B', de: 'Das stimmt, aber viele Leute brauchen ihr Auto für die Arbeit.' },
    ],
    questions: [
      { de: 'Person A ist gegen Autos in der Stadt.', answer: true, text: { en: 'Person A is against cars in the city.', ru: 'Человек A против машин в городе.', ua: 'Людина A проти машин у місті.' } },
      { de: 'Person B ist völlig einverstanden.', answer: false, text: { en: 'Person B fully agrees.', ru: 'Человек B полностью согласен.', ua: 'Людина B повністю згодна.' } },
      { de: 'A nennt einen Grund für die Meinung.', answer: true, text: { en: 'A gives a reason for the opinion.', ru: 'A называет причину мнения.', ua: 'A називає причину думки.' } },
    ],
  },
};

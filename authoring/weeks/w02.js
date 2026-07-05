/* Week 2 — Family and numbers (A1, phase A1.1).
   Curriculum source: private/curriculum-redesign-2026-07.md §6 days 6–10. */
module.exports = {
  n: 2,
  phase: "A1.1",
  level: "A1",
  theme:      { en: "Family and numbers", ru: "Семья и числа", ua: "Сім'я та числа" },
  grammar:    { en: "Possessive articles (Nominativ), plural formation (5 patterns), numbers 1–1000",
                ru: "Притяжательные артикли (Nominativ), образование множественного числа (5 моделей), числа 1–1000",
                ua: "Присвійні артиклі (Nominativ), утворення множини (5 моделей), числа 1–1000" },
  vocabTheme: { en: "family, numbers", ru: "семья, числа", ua: "сім'я, числа" },

  vocab: [
    // family (reused from old v1 W1)
    { de: "die Familie",   en: "family",   ru: "семья",     ua: "сім'я" },
    { de: "die Eltern",    en: "parents",  ru: "родители",  ua: "батьки" },
    { de: "der Vater",     en: "father",   ru: "отец",      ua: "батько" },
    { de: "die Mutter",    en: "mother",   ru: "мать",      ua: "мати" },
    { de: "der Sohn",      en: "son",      ru: "сын",       ua: "син" },
    { de: "die Tochter",   en: "daughter", ru: "дочь",      ua: "дочка" },
    { de: "der Bruder",    en: "brother",  ru: "брат",      ua: "брат" },
    { de: "die Schwester", en: "sister",   ru: "сестра",    ua: "сестра" },
    { de: "das Kind",      en: "child",    ru: "ребёнок",   ua: "дитина" },
    // numbers (eins/zwei/drei/zehn/zwanzig/hundert reused; vier–neun, elf, zwölf, tausend NEW)
    { de: "eins",    en: "one",      ru: "один",     ua: "один" },
    { de: "zwei",    en: "two",      ru: "два",      ua: "два" },
    { de: "drei",    en: "three",    ru: "три",      ua: "три" },
    { de: "vier",    en: "four",     ru: "четыре",   ua: "чотири" },
    { de: "fünf",    en: "five",     ru: "пять",     ua: "п'ять" },
    { de: "sechs",   en: "six",      ru: "шесть",    ua: "шість" },
    { de: "sieben",  en: "seven",    ru: "семь",     ua: "сім" },
    { de: "acht",    en: "eight",    ru: "восемь",   ua: "вісім" },
    { de: "neun",    en: "nine",     ru: "девять",   ua: "дев'ять" },
    { de: "zehn",    en: "ten",      ru: "десять",   ua: "десять" },
    { de: "elf",     en: "eleven",   ru: "одиннадцать", ua: "одинадцять" },
    { de: "zwölf",   en: "twelve",   ru: "двенадцать",  ua: "дванадцять" },
    { de: "zwanzig", en: "twenty",   ru: "двадцать",  ua: "двадцять" },
    { de: "hundert", en: "hundred",  ru: "сто",      ua: "сто" },
    { de: "tausend", en: "thousand", ru: "тысяча",   ua: "тисяча" },
  ],

  verbFocus: ["arbeiten", "leben", "fragen", "antworten", "glauben", "wissen"],

  tasks: [
    { type: "grammar", grammarFocus: "Possessivartikel (Nominativ)", drill: "possessiv-nom",
      text: { en: "Learn the possessive articles in the nominative: mein/dein/sein/ihr/unser/euer.",
              ru: "Выучите притяжательные артикли в Nominativ: mein/dein/sein/ihr/unser/euer.",
              ua: "Вивчіть присвійні артиклі в Nominativ: mein/dein/sein/ihr/unser/euer." } },
    { type: "grammar", grammarFocus: "Pluralbildung", drill: "plural-modelle",
      text: { en: "Learn the five plural patterns (-e, -er, -(e)n, -s, umlaut) with family words.",
              ru: "Выучите пять моделей множественного числа (-e, -er, -(e)n, -s, умлаут) на словах о семье.",
              ua: "Вивчіть п'ять моделей множини (-e, -er, -(e)n, -s, умлаут) на словах про сім'ю." } },
    { type: "grammar", grammarFocus: "Zahlen 1–1000", drill: "zahlen-1-1000",
      text: { en: "Learn the numbers from 1 to 1000, including the -zig tens and hundert/tausend.",
              ru: "Выучите числа от 1 до 1000, включая десятки на -zig и hundert/tausend.",
              ua: "Вивчіть числа від 1 до 1000, включно з десятками на -zig та hundert/tausend." } },
    { type: "write",
      text: { en: "Write 5–7 sentences about your family using mein and dein.",
              ru: "Напишите 5–7 предложений о своей семье с mein и dein.",
              ua: "Напишіть 5–7 речень про свою сім'ю з mein і dein." },
      checklist: [
        { en: "Use at least three family words.", ru: "Используйте минимум три слова о семье.", ua: "Використайте щонайменше три слова про сім'ю." },
        { en: "Use mein and dein at least once each.", ru: "Используйте mein и dein хотя бы по разу.", ua: "Використайте mein і dein хоча б по разу." },
        { en: "Include at least one number (an age).", ru: "Добавьте хотя бы одно число (возраст).", ua: "Додайте хоча б одне число (вік)." },
      ] },
    { type: "review", drill: "plural-modelle",
      text: { en: "Review week 2 and do a number dictation: write down the numbers you hear.",
              ru: "Повторите неделю 2 и сделайте диктант чисел: запишите числа, которые слышите.",
              ua: "Повторіть тиждень 2 і зробіть диктант чисел: запишіть числа, які чуєте." } },
  ],

  canDo: [
    { en: "I can name family members with the right possessive article.", ru: "Я могу назвать членов семьи с правильным притяжательным артиклем.", ua: "Я можу назвати членів сім'ї з правильним присвійним артиклем." },
    { en: "I can form the plural of common nouns.", ru: "Я могу образовать множественное число распространённых существительных.", ua: "Я можу утворити множину поширених іменників." },
    { en: "I can count and say numbers up to 1000.", ru: "Я могу считать и называть числа до 1000.", ua: "Я можу рахувати й називати числа до 1000." },
    { en: "I can write a few sentences about my family.", ru: "Я могу написать несколько предложений о своей семье.", ua: "Я можу написати кілька речень про свою сім'ю." },
    { en: "I can understand and write down numbers I hear.", ru: "Я могу понять и записать числа на слух.", ua: "Я можу зрозуміти й записати числа на слух." },
  ],

  drills: {
    "possessiv-nom": {
      level: "A1",
      concept: { en: "Possessive articles in the nominative", ru: "Притяжательные артикли в Nominativ", ua: "Присвійні артиклі в Nominativ" },
      prompt:  { en: "Choose or fill in the correct possessive article.", ru: "Выберите или вставьте правильный притяжательный артикль.", ua: "Виберіть або вставте правильний присвійний артикль." },
      items: [
        { type: "cloze",  de: "Das ist ___ Bruder. (ich)", answer: "mein" },
        { type: "choice", de: "___ Mutter heißt Anna. (du)", answer: "Deine", options: ["Dein", "Deine", "Deiner"] },
        { type: "cloze",  de: "Das ist ___ Kind. (sie, 3. Sg.)", answer: "ihr" },
      ],
    },
    "plural-modelle": {
      level: "A1",
      concept: { en: "Forming the plural (five patterns)", ru: "Образование множественного числа (5 моделей)", ua: "Утворення множини (5 моделей)" },
      prompt:  { en: "Write the plural form.", ru: "Напишите форму множественного числа.", ua: "Напишіть форму множини." },
      items: [
        { type: "cloze",  de: "ein Kind – zwei ___", answer: "Kinder" },
        { type: "cloze",  de: "eine Schwester – zwei ___", answer: "Schwestern" },
        { type: "choice", de: "der Vater – die ___", answer: "Väter", options: ["Vaters", "Väter", "Vatern"] },
      ],
    },
    "zahlen-1-1000": {
      level: "A1",
      concept: { en: "Numbers from 1 to 1000", ru: "Числа от 1 до 1000", ua: "Числа від 1 до 1000" },
      prompt:  { en: "Write the number as a word.", ru: "Запишите число словом.", ua: "Запишіть число словом." },
      items: [
        { type: "cloze",  de: "7 = ___", answer: "sieben" },
        { type: "cloze",  de: "12 = ___", answer: "zwölf" },
        { type: "choice", de: "21 = ___", answer: "einundzwanzig", options: ["zwanzigeins", "einundzwanzig", "zwanzigundeins"] },
      ],
    },
  },
};

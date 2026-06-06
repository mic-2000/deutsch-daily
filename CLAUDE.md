# Технический хендофф: инструменты для изучения немецкого (A1 → B1)

Документ для другой модели/разработчика. Описывает два автономных HTML-файла, их назначение, архитектуру, структуры данных, ключевые функции, дизайн-систему, ограничения среды и баги, которые уже были найдены и исправлены (чтобы не вносить их повторно).

---

## 1. Контекст и общая система

Пользователь учит немецкий, цель — сдать экзамен **Goethe-Zertifikat B1**, старт около A1, план на 6 месяцев. Вся система состоит из трёх частей, работающих вместе:

1. **`planner.html`** — планировщик по дням. Показывает задачу на день и копирует её в буфер как готовый промпт для чата.
2. **`vocab.html`** — тренажёр словаря с тремя режимами и интервальным повторением.
3. **Чат с языковой моделью** — пользователь вставляет скопированный план дня, модель выдаёт учебный материал и упражнения.

Учебная программа: 24 недели, 3 фазы.
- **Фаза 1 (нед. 1–8):** A1→A2 — падежи (Akkusativ, Dativ, Genitiv-intro), модальные глаголы, Perfekt, отделяемые приставки, Imperativ.
- **Фаза 2 (нед. 9–16):** A2 — Präteritum, придаточные (weil/dass/wenn/als), сравнение, рефлексивные глаголы, склонение прилагательных (intro).
- **Фаза 3 (нед. 17–24):** B1 — полное склонение прилагательных, пассив, Konjunktiv II, Relativsätze, косвенная речь, глаголы с управлением + тренировка формата экзамена.

Стек: **vanilla HTML/CSS/JS, без фреймворков и бандлера**. Деплой на Vercel (https); сборка `npm run build` → `node build.js` подставляет креды Supabase в `assets/js/supabase.js`. Единственная внешняя загрузка — шрифты Google Fonts (Fraunces + Manrope) через `<link>`. Прогресс хранится в `localStorage` и синхронизируется в Supabase. Язык интерфейса — RU/UA/EN, учебный контент — немецкий с переводом.

### Структура проекта

```
deutsch-daily/
├── index.html          # роутер: сессия есть → planner.html, нет → auth.html
├── auth.html           # вход/регистрация (email + Google OAuth)
├── planner.html        # планировщик (тонкий: разметка + логика страницы)
├── vocab.html          # тренажёр словаря (тонкий)
├── assets/
│   ├── css/  base.css · components.css · planner.css · vocab.css · auth.css
│   └── js/   i18n.js · utils.js · supabase.js · cloud-sync.js
├── data/   weeks.js (WEEKS) · vocab.js (VOCAB)
├── locales/  ru.js · ua.js · en.js   (window.LOCALE_*  = { ui, vocab })
├── build.js · package.json · vercel.json · CLAUDE.md
```

**Порядок подключения скриптов** (planner/vocab): supabase CDN → locales/ru,ua,en → assets/js/i18n → utils → supabase → cloud-sync → data/(weeks|vocab) → инлайн-скрипт страницы. `index.html`/`auth.html` подключают только нужное подмножество.

**Общий JS:** `assets/js/supabase.js` (клиент `sb` + плейсхолдеры кредов), `assets/js/utils.js` (`esc`, `showToast(msg, duration?)`), `assets/js/cloud-sync.js` (`initApp` / `saveToCloud` / `saveLangToCloud` / `logout` + глобал `currentUser`). Каждая страница задаёт `CLOUD_FIELD` (`planner_data`/`vocab_data`), `getCloudPayload()`, `applyCloudData(d)` и определяет `load()` / `render()`.

**Общий CSS:** `base.css` (токены `:root`, reset, header/footer/info-box/toast/container), `components.css` (user-bar, nav-tabs, lang-switcher). Ширина контейнера задаётся в `planner.css` (820px) / `auth.css` (480px); `base.css` по умолчанию 920px (vocab).

---

## 2. Общая дизайн-система (в `assets/css/base.css`)

CSS-переменные в `:root` (файл `assets/css/base.css`):

```css
--paper: #F2EDE3;     /* основной фон (тёплая бумага) */
--paper-2: #E8E0D0;   /* вторичный фон */
--paper-3: #FAF6EC;   /* карточки/панели */
--ink: #1C1A17;       /* основной текст */
--ink-soft: #4A453D;  /* приглушённый текст */
--line: #BFB5A0;      /* границы */
--accent: #B5512A;    /* терракота (главный акцент) */
--accent-2: #8C3F1F;  /* тёмная терракота (hover) */
--green: #4A7C3A;     /* успех / выучено */
--gold: #C5963B;      /* в процессе */
/* только в тренажёре — цвета родов: */
--der: #2F5C8F;       /* синий */
--die: #A23B2D;       /* красный */
--das: #3F7A3A;       /* зелёный */
--serif: 'Fraunces', Georgia, serif;
--sans: 'Manrope', system-ui, sans-serif;
```

Эстетика: редакторская/типографическая, крупные serif-заголовки (Fraunces, light 300), тело Manrope. Минимум скруглений, тонкие рамки, табличные цифры (`font-variant-numeric: tabular-nums`). Адаптив через `@media (max-width: 600–720px)`.

---

## 3. `planner.html`

### Назначение
Один учебный день = одна основная задача. Большая кнопка копирует план дня как готовое сообщение для чата. Связывает трекер и диалог в ежедневный цикл.

### Структуры данных

```js
const WEEKS = [
  { n:1, theme:"...", grammar:"...", vocab:"...", tasks:[
    ["test","..."], ["grammar","..."], ["listen","..."], ["write","..."], ["speak","..."]
  ]},
  // ... 24 недели
];
```
- `tasks` — массив пар `[type, text]`. Словарь (`vocab`) — это **ежедневная привычка**, отдельной задачей-днём НЕ является; хранится строкой в `vocab` недели.
- `type` ∈ `test | grammar | listen | write | speak | read | review`.
- `TYPE_LABEL` — словарь перевода типов в русские подписи («Грамматика», «Аудирование», …).

```js
// Плоский список дней: одна задача = один день
const DAYS = [];
WEEKS.forEach(w => w.tasks.forEach(([type,text]) =>
  DAYS.push({ day: DAYS.length+1, week:w.n, weekTheme:w.theme,
              grammar:w.grammar, vocab:w.vocab, type, text })));
const TOTAL_DAYS = DAYS.length; // ~118 дней
```

### Состояние и хранилище
```js
let state = { currentDay:1, viewingDay:1, completed:{} };
// localStorage key: 'de-tagesplan-v1', сохраняет { currentDay, completed }
```
- `currentDay` — день, на котором пользователь сейчас (продвигается при «Готово»).
- `viewingDay` — просматриваемый день (листание стрелками не меняет currentDay).
- `completed` — объект `{ dayNumber: true }`.

### Ключевая фича: текст для буфера
```js
function buildPlanText(d){
  return `🇩🇪 Немецкий A1→B1 · День ${d.day} из ${TOTAL_DAYS} · Неделя ${d.week}
Тема недели: ${d.weekTheme}
Грамматика недели: ${d.grammar}

📋 Задача на сегодня — [${TYPE_LABEL[d.type]}]:
${d.text}

📌 Ежедневно также:
• Словарь: квиз по словам недели ${d.week} (${d.vocab}) — 10–15 мин в тренажёре

➡️ Дай мне подробный материал по сегодняшней задаче (с таблицами, примерами и конкретными ссылками) и 2–3 коротких упражнения, чтобы я мог проверить себя.`;
}
```
Этот текст пользователь вставляет в чат, и модель отвечает учебным материалом.

### Функции
- `copyPlan(day)` — копирует через `navigator.clipboard.writeText` с **фолбэком на `document.execCommand('copy')`** (важно для `file://`).
- `goDay(n)`, `goToCurrent()`, `jumpWeek(weekNum)` — навигация.
- `toggleDone(day)` — отмечает день; если это текущий, продвигает `currentDay`.
- `render()` — единственная функция рендера (перерисовывает весь `#app`).
- Клавиатура: `←/→` — листать дни, `C` (рус «С» тоже) — копировать.
- `showToast(msg)` — всплывающее уведомление снизу.

---

## 4. `vocab.html`

### Назначение
Тренажёр словаря. 24 недельных набора (~600 слов). Три режима упражнений вперемешку + интервальное повторение по Лейтнеру + озвучка.

### Структура словаря
```js
const VOCAB = {
  1: { theme:"Begrüßung, Familie, Zahlen", words:[ ["Hallo","привет"], ["der Vater","отец"], ... ] },
  // ... недели 2..24
};
```
- Каждое слово — пара `[de, ru]`.
- Существительные хранятся **с артиклем**: `"der Vater"`.
- Глаголы недели 5 имеют форму Perfekt через тире: `"gehen — gegangen (sein)"` (учитывается при озвучке — берётся часть до `—`).

### Состояние и хранилище
```js
let state = {
  selectedWeek: 1,
  mastery: {},   // "week-idx": { box, due, right, wrong, seen }
  modes: { flashcard:true, article:true, spelling:true },
  session: null, // активная тренировка
  confirm: null, // данные модального подтверждения
};
const KEY = 'de-vocab-trainer-v2';
function serialize(){ return { app:'deutsch-vokabeltrainer', version:2, savedAt:..., selectedWeek, modes, mastery }; }
```

### Интервальное повторение (Лейтнер, 5 коробок)
```js
const DAY = 86400000;
const BOX_INTERVAL = { 1:1*DAY, 2:2*DAY, 3:4*DAY, 4:8*DAY, 5:16*DAY };
const MAX_BOX = 5;

function updateCard(week, idx, correct){
  const c = getCard(week, idx); // дефолт { box:0, due:0, right:0, wrong:0, seen:0 }
  c.seen++;
  if (correct){ c.right++; c.box = Math.min(MAX_BOX, c.box + 1); } // +1 коробка за правильный (new 0→1)
  else { c.wrong++; c.box = 1; }                                   // ошибка → коробка 1
  c.due = Date.now() + BOX_INTERVAL[c.box];
  state.mastery[key(week,idx)] = c; save();
}
```
- Правило прогресса: **каждый правильный ответ = +1 коробка**. Новое слово (box 0) → 1 кубик за первый правильный. Коробка 5 = выучено (нужно 5 правильных).
- `isDue`: слово без записи всегда «пора»; иначе `due <= now`.
- `isMastered`: `box >= 5`.
- В UI коробка отображается полоской из 5 сегментов (`.box-bar`). Полоска **кликабельна** → сброс одного слова.

### Три режима упражнений
`availableModes(de)` определяет, какие режимы доступны для слова:
- **flashcard** — всегда.
- **article** — только если `parseArticle(de)` дал совпадение (`/^(der|die|das)\s+(.+)$/`).
- **spelling** — если «ядро» слова (без артикля) не содержит пробелов/`?`/`…`/`—`/`/` и длиной ≥2.

`pickMode(week, idx)` — случайный режим из (включённые ∩ доступные); лёгкий уклон: при box≥3 чаще spelling (продакшн), при box≤1 чаще article.

**flashcard:** показывает немецкое слово → «Показать перевод» (при показе автоозвучка) → самооценка «Знал/Не знал». **Листается сразу** после оценки.

**article:** показывает слово без артикля → кнопки `der/die/das` с цветовой кодировкой (der=синий, die=красный, das=зелёный) → фидбек + «Дальше». Озвучка появляется только ПОСЛЕ ответа (чтобы не подсказывала).

**spelling:** показывает русское слово → ввод немецкого → проверка. Сравнение через `normalize()` (lowercase, trim, ä→ae/ö→oe/ü→ue/ß→ss, схлопывание пробелов); забытый артикль засчитывается как верное с примечанием. При ошибке — посимвольное сравнение через `diffChars()`.

```js
// LCS-диф: подсвечивает лишние/неверные буквы в ответе (diff-bad, красное зачёркивание)
// и пропущенные буквы в правильном (diff-miss, зелёная подсветка). Сравнение регистронезависимое.
function diffChars(a, b){ /* классический LCS по dp-таблице */ }
```

### Сессия (тренировка)
```js
function startSession(scope){ /* scope = {type:'week',week:N} | {type:'review-all'} */ }
```
- `week`: просроченные слова недели + до 12 новых; если пусто — вся неделя.
- `review-all`: все слова со всех недель, у которых `seen>0 && !mastered && due<=now` (главная кнопка «Повторить пору»).
- Очередь перемешивается, кап 25 карточек.
- `answer(correct)`: вызывает `updateCard`; неверные карточки **один раз** возвращаются в конец очереди как flashcard; flashcard листается сразу, article/spelling показывают фидбек и ждут «Дальше».
- `uniqueRight/uniqueTotal` — счёт «с первого раза» для финального экрана.

### Озвучка (Web Speech API)
```js
let GERMAN_VOICE = null;
function pickVoice(){ /* ищет голос с lang ~ de */ }
window.speechSynthesis.onvoiceschanged = pickVoice; // голоса грузятся асинхронно!
function speak(text, btnEl){ /* SpeechSynthesisUtterance, lang='de-DE', rate=0.88 */ }
function speakWord(week, idx, btnEl){ /* берёт часть слова до '—' */ }
```

### Хранение/синхронизация прогресса
- **localStorage** — автозагрузка внутри одного браузера.
- **Экспорт/импорт** (`exportProgress` через Blob-скачивание, `importProgress` через `<input type=file>` + `applyData`) — работают **везде**, основной способ переноса между браузерами.
- **File System Access API** (`createSyncFile`/`openSyncFile`/`writeToFile`) — автосохранение в подключённый файл. **Доступно только по http/https**, см. ограничения. `save()` дополнительно пишет в `fileHandle`, если он подключён.
  ```js
  const FSA_API = !!(window.showOpenFilePicker && window.showSaveFilePicker);
  const FSA = FSA_API && (location.protocol === 'http:' || location.protocol === 'https:');
  ```

### Сброс прогресса
- `resetWord(week,idx)` / `resetAll()` → через **внутримодальное** подтверждение `askConfirm/confirmYes/confirmNo` (НЕ нативный `confirm()`, см. ограничения).

### Функции рендера
- `render()` — если есть `state.session` → `renderSession()`, иначе домашний экран. Подтверждающее модальное окно дорисовывается в конец home-разметки.
- `renderFlashcard / renderArticle / renderSpelling` — режимы.
- `renderEnd()` — итог тренировки.
- Клавиатура: flashcard — `Space`/`1`/`2`/`←`/`→`; article — `1`/`2`/`3`, `Enter`=дальше; spelling — печать + `Enter`; `Esc` — выход.

---

## 5. Ограничения среды `file://` (КРИТИЧНО — главный источник багов)

Пользователь открывает файлы двойным кликом, то есть по протоколу `file://`. В этом режиме браузеры применяют жёсткие ограничения. **Любой новый функционал нужно проверять на `file://`, а не только на http.**

1. **File System Access API заблокирован** на `file://` — `showOpenFilePicker/showSaveFilePicker` бросают `SecurityError`. → Кнопки автосинхронизации показывать только при `location.protocol === 'http(s):'`.
2. **`confirm()`/`alert()` могут молча подавляться** на `file://` (возвращают false/undefined без диалога). → Использовать собственные модальные окна на странице.
3. **`navigator.clipboard`** может быть недоступен/требовать secure context. → Фолбэк через скрытый `<textarea>` + `document.execCommand('copy')`.
4. **`fetch()` локальных файлов заблокирован** → нельзя молча подгрузить прогресс с диска при загрузке страницы. Истинный «автозагруз из файла по умолчанию» для `file://` невозможен; только клик-импорт.
5. **`speechSynthesis.getVoices()`** возвращает пустой массив при первом вызове → слушать `onvoiceschanged`.
6. **localStorage привязан к origin/браузеру** → не шарится между браузерами → нужен экспорт/импорт.
7. **Любые ошибки в обработчиках не должны проглатываться молча** — показывать `showToast`, иначе «при клике ничего не происходит».

---

## 6. Уже исправленные баги (НЕ вносить повторно)

1. **Flashcard не листался.** `answer()` ставил `answered=true`, но `renderFlashcard` смотрел только на `revealed` → залипание + кнопки «Дальше» в этом режиме не было. Каждый повторный клик «Знал» накручивал коробку (слово «Hallo» доехало до box 5). **Фикс:** в режиме flashcard `answer()` сразу вызывает `nextCard()`.
2. **Правильная кнопка артикля становилась невидимой.** На неё накладывались `chosen-correct` (белый текст) и `reveal-correct` (зелёный текст); зелёный побеждал по порядку CSS → зелёный текст на зелёном фоне. **Фикс:** `reveal-correct` добавляется только если пользователь выбрал ДРУГУЮ (неверную) кнопку.
3. **Введённый ответ в spelling пропадал** после проверки (поле показывало плейсхолдер). **Фикс:** проставлять `value` в input при `answered` + показывать явное сравнение «твой ответ / правильно» с `diffChars`.
4. **Прогресс прыгал 0→2** за первый правильный ответ (было `eff = box||1; box = eff+1`). **Фикс:** `box = min(5, box+1)` (new 0→1, по кубику за ответ).
5. **Кнопки сброса не работали** — зависели от нативного `confirm()` (блокируется на `file://`). **Фикс:** внутристраничное модальное подтверждение.
6. **Кнопки «Создать/Открыть файл» не работали** — FSA заблокирован на `file://`, ошибка проглатывалась. **Фикс:** показывать только по http(s); в `catch` показывать toast (кроме `AbortError` = отмена пользователем).

---

## 7. Конвенции для дальнейших правок

- Рендер — полная перерисовка `#app` через шаблонные строки; никаких фреймворков. Обработчики — инлайновые `onclick` (функции должны быть в глобальной области `<script>`).
- Любой пользовательский ввод/слово экранировать через `esc()` перед вставкой в `innerHTML`.
- После правок проверять синтаксис: извлечь содержимое `<script>` и прогнать `node --check`.
- Сохранять единый дизайн-токен-набор и шрифты.
- Бамп версии хранилища (`KEY`/`version`) только при несовместимом изменении формата; иначе потеряется прогресс пользователя. При смене формата — писать миграцию.
- Тестировать на `file://`, а не только на http.

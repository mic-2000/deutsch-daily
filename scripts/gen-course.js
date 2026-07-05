#!/usr/bin/env node
/* scripts/gen-course.js — Course v2 generator.
 *
 * Reads the single authoring source (authoring/course.js + authoring/weeks/w01..w36.js) and emits
 * the runtime data + locale files the app will use after the Course v2 cutover (step 7):
 *
 *   data/v2/weeks.js          const WEEKS            (object tasks + phase/level; base text = EN)
 *   data/v2/vocab.js          const VOCAB           (German words only, index source)
 *   data/v2/grammar-drills.js const GRAMMAR_DRILLS  (German items + answers, keyed by slug)
 *   data/v2/dialogues.js      const DIALOGUES       (German lines + meta, keyed by slug)
 *   data/v2/manifest.js       const COURSE_MANIFEST (version/weeks/days — parity anchor)
 *   locales/v2/{en,ru,ua}.js  window.LOCALE_<L>_V2  (index-matched overlays, keyed drills/dialogues)
 *
 * Alignment is structural: every user-facing string is authored once (co-locating de/en/ru/ua), so
 * the emitted parallel arrays cannot drift. This script validates the authoring invariants and
 * fails loudly; tests/course-v2-align.test.js verifies the emitted output as a backstop (Gate 4).
 *
 * Usage: node scripts/gen-course.js   (or: npm run gen:course)
 *   --check   validate + report only, do not write files (used in CI/pre-commit)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');
const PARTIAL = process.argv.includes('--partial'); // dev: generate from the w01..wNN authored so far
const LANGS = ['en', 'ru', 'ua'];

/* ---- load authoring source --------------------------------------------------------------- */
const course = require(path.join(ROOT, 'authoring/course.js'));

function loadWeeks() {
  const dir = path.join(ROOT, 'authoring/weeks');
  const weeks = [];
  for (let n = 1; n <= course.TOTAL_WEEKS; n++) {
    const file = path.join(dir, `w${String(n).padStart(2, '0')}.js`);
    if (!fs.existsSync(file)) {
      if (PARTIAL) break; // dev: stop at the first not-yet-authored week (weeks must be contiguous from 1)
      fail(`missing authoring/weeks/w${String(n).padStart(2, '0')}.js`);
    }
    const w = require(file);
    if (w.n !== n) fail(`w${String(n).padStart(2, '0')}.js declares n=${w.n}, expected ${n}`);
    weeks.push(w);
  }
  if (!PARTIAL && weeks.length !== course.TOTAL_WEEKS) fail(`expected ${course.TOTAL_WEEKS} weeks, loaded ${weeks.length}`);
  return weeks;
}

/* Read data/verbs.js (a classic `const VERBS = {…}` script) into an object, for verbFocus checks. */
function loadVerbs() {
  const src = fs.readFileSync(path.join(ROOT, 'data/verbs.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;this.VERBS = VERBS;', sandbox);
  return sandbox.VERBS || {};
}

/* ---- validation helpers ------------------------------------------------------------------ */
const errors = [];
function fail(msg) { console.error('✗ ' + msg); process.exit(1); }
function err(msg) { errors.push(msg); }

/* A "T3" = { en, ru, ua } localized string (no German). Returns it validated, or records an error. */
function t3(obj, where) {
  if (!obj || typeof obj !== 'object') { err(`${where}: expected {en,ru,ua}, got ${JSON.stringify(obj)}`); return {}; }
  for (const l of LANGS) {
    if (typeof obj[l] !== 'string' || obj[l].trim() === '') err(`${where}.${l} is missing/blank`);
  }
  return obj;
}

/* ---- per-week validation ----------------------------------------------------------------- */
function validateWeek(w) {
  const at = `w${String(w.n).padStart(2, '0')}`;
  if (!course.BANDS.includes(w.level)) err(`${at}: invalid level "${w.level}"`);
  if (!course.PHASES.some((p) => p.id === w.phase)) err(`${at}: invalid phase "${w.phase}"`);
  t3(w.theme, `${at}.theme`);
  t3(w.grammar, `${at}.grammar`);
  t3(w.vocabTheme, `${at}.vocabTheme`);

  // vocab: each a T4 with non-empty de/en/ru/ua; de unique within the week
  if (!Array.isArray(w.vocab) || w.vocab.length === 0) err(`${at}: vocab must be a non-empty array`);
  const seenDe = new Set();
  (w.vocab || []).forEach((v, i) => {
    if (typeof v.de !== 'string' || v.de.trim() === '') err(`${at}.vocab[${i}].de is missing/blank`);
    if (seenDe.has(v.de)) err(`${at}.vocab[${i}] duplicate German "${v.de}" within week`);
    seenDe.add(v.de);
    for (const l of LANGS) if (typeof v[l] !== 'string' || v[l].trim() === '') err(`${at}.vocab[${i}].${l} blank (de="${v.de}")`);
  });

  // tasks: exactly TASKS_PER_WEEK; each drill (if any) resolves in this week's drills
  if (!Array.isArray(w.tasks) || w.tasks.length !== course.TASKS_PER_WEEK)
    err(`${at}: expected ${course.TASKS_PER_WEEK} tasks, got ${w.tasks ? w.tasks.length : 0}`);
  (w.tasks || []).forEach((task, i) => {
    if (!course.TASK_TYPES.includes(task.type)) err(`${at}.tasks[${i}]: invalid type "${task.type}"`);
    t3(task.text, `${at}.tasks[${i}].text`);
    // task.drill resolution is checked course-globally in emit() (review days point at earlier weeks' slugs).
    if (task.checklist) task.checklist.forEach((c, j) => t3(c, `${at}.tasks[${i}].checklist[${j}]`));
  });

  // canDo: exactly TASKS_PER_WEEK T3s
  if (!Array.isArray(w.canDo) || w.canDo.length !== course.TASKS_PER_WEEK)
    err(`${at}: expected ${course.TASKS_PER_WEEK} canDo entries, got ${w.canDo ? w.canDo.length : 0}`);
  (w.canDo || []).forEach((c, i) => t3(c, `${at}.canDo[${i}]`));

  // drills: each has level/concept/prompt/items; items typed with an answer
  for (const slug of Object.keys(w.drills || {})) {
    const d = w.drills[slug];
    if (!course.BANDS.includes(d.level)) err(`${at}.drills.${slug}: invalid level "${d.level}"`);
    t3(d.concept, `${at}.drills.${slug}.concept`);
    t3(d.prompt, `${at}.drills.${slug}.prompt`);
    if (!Array.isArray(d.items) || d.items.length === 0) err(`${at}.drills.${slug}: items must be non-empty`);
    (d.items || []).forEach((it, i) => {
      if (!course.DRILL_ITEM_TYPES.includes(it.type)) err(`${at}.drills.${slug}.items[${i}]: invalid type "${it.type}"`);
      if (it.type === 'order') { if (!Array.isArray(it.answer) || it.answer.length < 2) err(`${at}.drills.${slug}.items[${i}]: order needs answer[]`); }
      else if (typeof it.answer !== 'string' || it.answer.trim() === '') err(`${at}.drills.${slug}.items[${i}]: missing answer`);
      if (it.type !== 'order' && (typeof it.de !== 'string' || it.de.trim() === '')) err(`${at}.drills.${slug}.items[${i}]: missing German prompt (de)`);
      if (it.type === 'choice' && (!Array.isArray(it.options) || it.options.length < 2)) err(`${at}.drills.${slug}.items[${i}]: choice needs options[]`);
    });
  }

  // dialogue (optional)
  if (w.dialogue) {
    const dl = w.dialogue;
    if (!dl.slug) err(`${at}.dialogue: missing slug`);
    if (!course.BANDS.includes(dl.level)) err(`${at}.dialogue: invalid level "${dl.level}"`);
    t3(dl.title, `${at}.dialogue.title`);
    if (!Array.isArray(dl.lines) || dl.lines.length === 0) err(`${at}.dialogue: lines must be non-empty`);
    (dl.lines || []).forEach((ln, i) => { if (typeof ln.de !== 'string' || ln.de.trim() === '') err(`${at}.dialogue.lines[${i}].de blank`); });
    if (!Array.isArray(dl.questions) || dl.questions.length === 0) err(`${at}.dialogue: questions must be non-empty`);
    (dl.questions || []).forEach((q, i) => {
      if (typeof q.de !== 'string' || q.de.trim() === '') err(`${at}.dialogue.questions[${i}].de blank`);
      if (typeof q.answer !== 'boolean') err(`${at}.dialogue.questions[${i}].answer must be boolean`);
    });
  }
}

/* ---- emit ------------------------------------------------------------------------------- */
const BANNER = (extra) =>
  `/* GENERATED by scripts/gen-course.js — DO NOT EDIT.\n` +
  `   Source of truth: authoring/. Regenerate with: npm run gen:course\n` +
  (extra ? `   ${extra}\n` : '') + `*/\n`;

function j(v) { return JSON.stringify(v, null, 2); }

function emit(weeks) {
  // ---- data/v2/weeks.js (base = EN) ----
  const weeksBase = weeks.map((w) => {
    const o = { n: w.n, phase: w.phase, level: w.level, theme: w.theme.en, grammar: w.grammar.en, vocab: w.vocabTheme.en };
    o.verbFocus = w.verbFocus || [];
    if (w.receptiveVerbs && w.receptiveVerbs.length) o.receptiveVerbs = w.receptiveVerbs;
    o.tasks = w.tasks.map((t) => {
      const task = { type: t.type, text: t.text.en };
      if (t.grammarFocus) task.grammarFocus = t.grammarFocus;
      if (t.drill) task.drill = t.drill;
      if (t.checklist) task.checklist = t.checklist.map((c) => c.en);
      if (t.milestone) task.milestone = true;
      return task;
    });
    return o;
  });

  // ---- data/v2/vocab.js ----
  const vocabBase = {};
  weeks.forEach((w) => { vocabBase[w.n] = { theme: w.vocabTheme.en, words: w.vocab.map((v) => v.de) }; });

  // ---- data/v2/grammar-drills.js (slugs unique course-wide) ----
  const drillsBase = {};
  const seenDrill = new Set();
  weeks.forEach((w) => {
    for (const slug of Object.keys(w.drills || {})) {
      if (seenDrill.has(slug)) err(`duplicate drill slug "${slug}" (w${w.n})`);
      seenDrill.add(slug);
      const d = w.drills[slug];
      drillsBase[slug] = { level: d.level, week: w.n, concept: d.concept.en, items: d.items };
    }
  });

  // ---- data/v2/dialogues.js ----
  const dialoguesBase = {};
  const seenDia = new Set();
  weeks.forEach((w) => {
    if (!w.dialogue) return;
    const dl = w.dialogue;
    if (seenDia.has(dl.slug)) err(`duplicate dialogue slug "${dl.slug}" (w${w.n})`);
    seenDia.add(dl.slug);
    dialoguesBase[dl.slug] = {
      week: w.n, level: dl.level, vocabularyMaxWeek: dl.vocabularyMaxWeek || w.n,
      checks: dl.questions.length, lines: dl.lines, questions: dl.questions.map((q) => ({ de: q.de, answer: q.answer })),
    };
  });

  // ---- locales/v2/<lang>.js ----
  const locales = {};
  for (const lang of LANGS) {
    const loc = { vocab: {}, weeks: {}, drills: {}, dialogues: {} };
    weeks.forEach((w) => {
      loc.vocab[w.n] = w.vocab.map((v) => v[lang]);
      loc.weeks[w.n] = {
        theme: w.theme[lang], grammar: w.grammar[lang], vocab: w.vocabTheme[lang],
        tasks: w.tasks.map((t) => t.text[lang]),
        canDo: w.canDo.map((c) => c[lang]),
      };
      for (const slug of Object.keys(w.drills || {})) loc.drills[slug] = { concept: w.drills[slug].concept[lang], prompt: w.drills[slug].prompt[lang] };
      if (w.dialogue) loc.dialogues[w.dialogue.slug] = { title: w.dialogue.title[lang] };
    });
    locales[lang] = loc;
  }

  // every task.drill must resolve to a drill defined somewhere in the course (review days point back)
  weeks.forEach((w) => w.tasks.forEach((t, i) => {
    if (t.drill && !(t.drill in drillsBase)) err(`w${String(w.n).padStart(2, '0')}.tasks[${i}].drill "${t.drill}" is not defined in any week`);
  }));

  const manifest = { courseVersion: course.COURSE_VERSION, weeks: weeks.length, days: weeks.reduce((s, w) => s + w.tasks.length, 0) };

  return { weeksBase, vocabBase, drillsBase, dialoguesBase, locales, manifest };
}

function writeFile(rel, contents) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents, 'utf8');
  console.log('  wrote ' + rel);
}

/* ---- main -------------------------------------------------------------------------------- */
const weeks = loadWeeks();
weeks.forEach(validateWeek);
if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); fail(`${errors.length} authoring error(s)`); }

const out = emit(weeks);
if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); fail(`${errors.length} emit error(s)`); }

// verbFocus report (reconciled against data/verbs.js — gaps are fixed in verbs.js, not here)
const VERBS = loadVerbs();
const focus = new Set();
const receptive = new Set();
weeks.forEach((w) => { (w.verbFocus || []).forEach((k) => focus.add(k)); (w.receptiveVerbs || []).forEach((k) => receptive.add(k)); });
const missing = [...focus].filter((k) => !(k in VERBS) && !receptive.has(k)).sort();
const unbanded = Object.keys(VERBS).filter((k) => !course.BANDS.includes(VERBS[k].band)).sort();

console.log(`Course v2: ${weeks.length} weeks, ${out.manifest.days} days, ` +
  `${Object.keys(out.vocabBase).reduce((s, k) => s + out.vocabBase[k].words.length, 0)} vocab words, ` +
  `${Object.keys(out.drillsBase).length} drills, ${Object.keys(out.dialoguesBase).length} dialogues, ` +
  `${focus.size} distinct verbFocus keys.`);
if (missing.length) console.warn(`⚠ ${missing.length} verbFocus keys missing from VERBS (add them + a band in data/verbs.js):\n  ${missing.join(', ')}`);
if (unbanded.length) console.warn(`⚠ ${unbanded.length} VERBS entries missing a band (add band A1/A2/B1):\n  ${unbanded.length > 30 ? unbanded.slice(0, 30).join(', ') + ' …' : unbanded.join(', ')}`);

if (CHECK_ONLY) { console.log('--check: no files written.'); process.exit(0); }

writeFile('data/v2/weeks.js', BANNER('const WEEKS — object tasks; base text is English (the T() default).') + 'const WEEKS = ' + j(out.weeksBase) + ';\n');
writeFile('data/v2/vocab.js', BANNER() + 'const VOCAB = ' + j(out.vocabBase) + ';\n');
writeFile('data/v2/grammar-drills.js', BANNER() + 'const GRAMMAR_DRILLS = ' + j(out.drillsBase) + ';\n');
writeFile('data/v2/dialogues.js', BANNER() + 'const DIALOGUES = ' + j(out.dialoguesBase) + ';\n');
writeFile('data/v2/manifest.js', BANNER() + 'const COURSE_MANIFEST = ' + j(out.manifest) + ';\n');
for (const lang of LANGS) writeFile(`locales/v2/${lang}.js`, BANNER() + `window.LOCALE_${lang.toUpperCase()}_V2 = ` + j(out.locales[lang]) + ';\n');
console.log('✓ Course v2 generated.');

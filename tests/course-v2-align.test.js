/* tests/course-v2-align.test.js — Gate 4 (Generated Data Alignment) for Course v2.
 *
 * These verify the GENERATED files (data/v2/*, locales/v2/*) that scripts/gen-course.js emits from
 * the single authoring source (authoring/). The generator already guarantees index alignment by
 * construction; this is the CI backstop that a stale or hand-edited generated file can't slip past.
 * Run `npm run gen:course` first if these fail after editing authoring/.
 *
 * Mirrors private/curriculum-redesign-2026-07-v2.md Gate 4 + §14 "Data Tests".
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadPage, ROOT } = require('./harness');

const course = require(path.join(ROOT, 'authoring/course.js'));
const BAND_ORDER = { A1: 1, A2: 2, B1: 3 };

// data/v2 is generated; if it isn't there yet, fail with a clear instruction rather than a load error.
const V2_DIR = path.join(ROOT, 'data/v2');
if (!fs.existsSync(path.join(V2_DIR, 'weeks.js'))) {
  test('Course v2 generated data exists', () => {
    assert.fail('data/v2/* not generated — run `npm run gen:course`');
  });
} else {
  const r = loadPage({
    extraFiles: [
      'data/v2/manifest.js', 'data/v2/weeks.js', 'data/v2/vocab.js',
      'data/v2/grammar-drills.js', 'data/v2/dialogues.js', 'data/verbs.js',
      'locales/v2/en.js', 'locales/v2/ru.js', 'locales/v2/ua.js',
    ],
    exports: ['COURSE_MANIFEST', 'WEEKS', 'VOCAB', 'PLURALS', 'GRAMMAR_DRILLS', 'DIALOGUES', 'VERBS'],
  });
  const { COURSE_MANIFEST, WEEKS, VOCAB, PLURALS, GRAMMAR_DRILLS, DIALOGUES, VERBS } = r;
  const LOC = { en: r.sandbox.LOCALE_EN_V2, ru: r.sandbox.LOCALE_RU_V2, ua: r.sandbox.LOCALE_UA_V2 };

  test('manifest: 36 weeks, 180 days, course version 2', () => {
    assert.equal(COURSE_MANIFEST.courseVersion, course.COURSE_VERSION);
    assert.equal(COURSE_MANIFEST.weeks, course.TOTAL_WEEKS);
    assert.equal(COURSE_MANIFEST.days, course.TOTAL_DAYS);
  });

  test('WEEKS: 36 weeks, sequential n, exactly 5 tasks each, 180 days total', () => {
    assert.equal(WEEKS.length, course.TOTAL_WEEKS, 'week count');
    let days = 0;
    WEEKS.forEach((w, i) => {
      assert.equal(w.n, i + 1, `week[${i}].n`);
      assert.ok(course.BANDS.includes(w.level), `week ${w.n} level "${w.level}"`);
      assert.ok(course.PHASES.some((p) => p.id === w.phase), `week ${w.n} phase "${w.phase}"`);
      assert.equal(w.tasks.length, course.TASKS_PER_WEEK, `week ${w.n} task count`);
      days += w.tasks.length;
    });
    assert.equal(days, course.TOTAL_DAYS, 'total days');
  });

  test('every task.drill resolves in GRAMMAR_DRILLS', () => {
    for (const w of WEEKS) {
      w.tasks.forEach((t, i) => {
        if (t.drill) assert.ok(t.drill in GRAMMAR_DRILLS, `week ${w.n} task[${i}] drill "${t.drill}" missing`);
      });
    }
  });

  test('review/test days point back — their drill was introduced in an earlier-or-same week', () => {
    for (const w of WEEKS) {
      w.tasks.forEach((t, i) => {
        if ((t.type === 'review' || t.type === 'test' || t.milestone) && t.drill) {
          const introWeek = GRAMMAR_DRILLS[t.drill].week;
          assert.ok(introWeek <= w.n, `week ${w.n} task[${i}] reviews forward drill "${t.drill}" (introduced w${introWeek})`);
        }
      });
    }
  });

  test('every verbFocus key exists in VERBS (or is declared receptive)', () => {
    for (const w of WEEKS) {
      const receptive = new Set(w.receptiveVerbs || []);
      (w.verbFocus || []).forEach((k) => {
        assert.ok(k in VERBS || receptive.has(k), `week ${w.n} verbFocus "${k}" not in VERBS and not receptive`);
      });
    }
  });

  test('every verb in VERBS has a valid band (A1/A2/B1)', () => {
    const bad = Object.keys(VERBS).filter((k) => !course.BANDS.includes(VERBS[k].band));
    assert.deepEqual(bad, [], 'verbs missing/invalid band');
  });

  test('verbFocus never introduces a verb above the week\'s band', () => {
    for (const w of WEEKS) {
      const receptive = new Set(w.receptiveVerbs || []);
      (w.verbFocus || []).forEach((k) => {
        if (!(k in VERBS) || receptive.has(k)) return;
        assert.ok(BAND_ORDER[VERBS[k].band] <= BAND_ORDER[w.level],
          `week ${w.n} (${w.level}) introduces "${k}" (band ${VERBS[k].band}) as new — above the week's band`);
      });
    }
  });

  test('no drill introduces grammar above the band of the week that first teaches it', () => {
    // The earliest week whose task carries a slug is where that grammar is introduced; reviews in
    // later weeks point back (guarded above). WEEKS is n-ordered, so the first hit is the lowest week.
    const introWeek = {};
    for (const w of WEEKS) {
      for (const t of w.tasks) {
        if (t.drill && !(t.drill in introWeek)) introWeek[t.drill] = w.n;
      }
    }
    for (const slug of Object.keys(GRAMMAR_DRILLS)) {
      const wn = introWeek[slug];
      if (wn === undefined) continue; // drill defined but not referenced by any week task
      const week = WEEKS[wn - 1];
      const drillLevel = GRAMMAR_DRILLS[slug].level;
      assert.ok(BAND_ORDER[drillLevel] <= BAND_ORDER[week.level],
        `drill "${slug}" (level ${drillLevel}) is introduced in week ${wn} (${week.level}) — above the week's band`);
    }
  });

  test('VOCAB words are index-matched to every locale (same length, no blanks)', () => {
    for (const n of Object.keys(VOCAB)) {
      const base = VOCAB[n].words.length;
      assert.ok(base > 0, `VOCAB[${n}] is empty`);
      for (const lang of Object.keys(LOC)) {
        const arr = (LOC[lang].vocab || {})[n];
        assert.ok(Array.isArray(arr), `${lang}.vocab[${n}] missing`);
        assert.equal(arr.length, base, `${lang}.vocab[${n}] length ${arr.length} != VOCAB ${base}`);
        arr.forEach((t, i) => assert.ok(t != null && t !== '', `${lang}.vocab[${n}][${i}] blank (de="${VOCAB[n].words[i]}")`));
      }
    }
  });

  test('PLURALS: generated from authoring, every key a real noun, every value a "die …" form', () => {
    const pluralsSrc = require(path.join(ROOT, 'authoring/plurals.js'));
    const words = new Set();
    for (const n of Object.keys(VOCAB)) VOCAB[n].words.forEach((w) => words.add(w));
    const isNoun = (de) => /^(der|die|das)\s/.test(de);

    // emitted PLURALS = the authoring PLURALS (every key resolves; every value is a plural article form)
    for (const [sg, pl] of Object.entries(PLURALS)) {
      assert.ok(words.has(sg), `PLURALS key "${sg}" is not a VOCAB word`);
      assert.ok(isNoun(sg), `PLURALS key "${sg}" is not a noun`);
      assert.match(pl, /^die\s+\S/, `PLURALS["${sg}"] = "${pl}" must start with "die "`);
    }
    // coverage gate: every noun-shaped vocab word is classified (has a plural, or explicitly NO_PLURAL)
    const noPlural = new Set(pluralsSrc.NO_PLURAL || []);
    const uncovered = [...words].filter((de) => isNoun(de) && !(de in PLURALS) && !noPlural.has(de));
    assert.deepEqual(uncovered, [], 'every noun must be in authoring/plurals.js PLURALS or NO_PLURAL');
    // NO_PLURAL entries are real nouns and never also carry a plural
    for (const de of noPlural) {
      assert.ok(words.has(de), `NO_PLURAL "${de}" is not a VOCAB word`);
      assert.ok(!(de in PLURALS), `NO_PLURAL "${de}" also appears in PLURALS`);
    }
  });

  test('week tasks + canDo are index-matched to every locale (5 tasks, 5 non-empty canDo)', () => {
    for (const w of WEEKS) {
      for (const lang of Object.keys(LOC)) {
        const wl = (LOC[lang].weeks || {})[w.n];
        assert.ok(wl, `${lang}.weeks[${w.n}] missing`);
        assert.equal(wl.tasks.length, w.tasks.length, `${lang}.weeks[${w.n}].tasks length`);
        wl.tasks.forEach((t, i) => assert.ok(t && t !== '', `${lang}.weeks[${w.n}].tasks[${i}] blank`));
        assert.equal(wl.canDo.length, course.TASKS_PER_WEEK, `${lang}.weeks[${w.n}].canDo length`);
        wl.canDo.forEach((c, i) => assert.ok(c && c !== '', `${lang}.weeks[${w.n}].canDo[${i}] blank`));
        for (const f of ['theme', 'grammar', 'vocab']) assert.ok(wl[f] && wl[f] !== '', `${lang}.weeks[${w.n}].${f} blank`);
      }
    }
  });

  test('every grammar-drill slug has a localized concept + prompt in all three locales', () => {
    for (const slug of Object.keys(GRAMMAR_DRILLS)) {
      for (const lang of Object.keys(LOC)) {
        const d = (LOC[lang].drills || {})[slug];
        assert.ok(d, `${lang}.drills["${slug}"] missing`);
        assert.ok(d.concept && d.concept !== '', `${lang}.drills["${slug}"].concept blank`);
        assert.ok(d.prompt && d.prompt !== '', `${lang}.drills["${slug}"].prompt blank`);
      }
      const d = GRAMMAR_DRILLS[slug];
      assert.ok(course.BANDS.includes(d.level), `drill "${slug}" level`);
      assert.ok(Array.isArray(d.items) && d.items.length > 0, `drill "${slug}" items`);
    }
  });

  test('every dialogue slug has a localized title in all three locales; checks == questions', () => {
    for (const slug of Object.keys(DIALOGUES)) {
      const dl = DIALOGUES[slug];
      assert.equal(dl.checks, dl.questions.length, `dialogue "${slug}" checks != questions`);
      for (const lang of Object.keys(LOC)) {
        const d = (LOC[lang].dialogues || {})[slug];
        assert.ok(d && d.title && d.title !== '', `${lang}.dialogues["${slug}"].title missing/blank`);
      }
    }
  });
}

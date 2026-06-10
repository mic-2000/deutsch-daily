/* tests/data-align.test.js — index/key alignment between the German base data and all three
 * locales. This is the runtime invariant ARCHITECTURE.md §13 used to flag as "unvalidated":
 *   • VOCAB[week].words  ↔  locale.vocab[week]   (index-matched, same length, no blanks)
 *   • WEEKS[n].tasks     ↔  locale.weeks[n].tasks (index-matched, same length)
 *   • VERBS keys         ↔  locale.verbs (key-matched, full coverage, no orphans)
 * A shifted index or a forgotten translation silently blanks/mismatches the UI — these guard it.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

const r = loadPage({
  extraFiles: ['data/weeks.js', 'data/vocab.js', 'data/verbs.js', 'locales/en.js', 'locales/ru.js', 'locales/ua.js'],
  exports: ['WEEKS', 'VOCAB', 'VERBS', 'LOCALE_EN', 'LOCALE_RU', 'LOCALE_UA'],
});
const { WEEKS, VOCAB, VERBS } = r;
const LOC = { en: r.LOCALE_EN, ru: r.LOCALE_RU, ua: r.LOCALE_UA };

test('VOCAB words are index-matched to every locale (same length, no blanks)', () => {
  for (const w of Object.keys(VOCAB)) {
    const base = VOCAB[w].words.length;
    for (const lang of Object.keys(LOC)) {
      const arr = (LOC[lang].vocab || {})[w];
      assert.ok(Array.isArray(arr), `${lang}.vocab[${w}] is missing`);
      assert.equal(arr.length, base, `${lang}.vocab[${w}] length ${arr.length} != VOCAB ${base}`);
      arr.forEach((t, i) => assert.ok(t != null && t !== '', `${lang}.vocab[${w}][${i}] is blank (de="${VOCAB[w].words[i]}")`));
    }
  }
});

test('WEEKS tasks are index-matched to every locale (same length)', () => {
  for (const wk of WEEKS) {
    for (const lang of Object.keys(LOC)) {
      const wl = (LOC[lang].weeks || {})[wk.n];
      assert.ok(wl && Array.isArray(wl.tasks), `${lang}.weeks[${wk.n}].tasks is missing`);
      assert.equal(wl.tasks.length, wk.tasks.length, `${lang}.weeks[${wk.n}].tasks length ${wl.tasks.length} != WEEKS ${wk.tasks.length}`);
    }
  }
});

test('every VERBS key has a non-empty gloss in every locale, with no orphan glosses', () => {
  const keys = Object.keys(VERBS);
  for (const lang of Object.keys(LOC)) {
    const g = LOC[lang].verbs || {};
    const missing = keys.filter((k) => !(k in g) || g[k] == null || g[k] === '');
    const orphan = Object.keys(g).filter((k) => !(k in VERBS));
    assert.deepEqual(missing, [], `${lang}.verbs missing/blank glosses`);
    assert.deepEqual(orphan, [], `${lang}.verbs has glosses for unknown verb keys`);
  }
});

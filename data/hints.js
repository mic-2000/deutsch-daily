/* hints.js — error-explanation RULES for the trainers (DEV-15). A small, self-contained,
   language-agnostic rule engine: given a MISSED card, decide which grammar rule explains the right
   answer and hand back 1–2 German example words. The localized rule PROSE lives in locales/*.ui as
   the `hint_article` / `hint_plural` / `hint_verb` keys (per the T() convention) — this file owns
   ONLY the matching + the German examples, so it carries no user-facing sentences of its own.

   window.HINTS API — every function returns { key, args, examples } or null. null means "no rule
   confidently applies", so the trainer shows nothing rather than a shaky hint (Plan DEV-15: "no hint
   on rule-less words"). `key` is a locale key; `args` are extra params for its T() template; the
   trainer appends the joined `examples` as the last param.

     articleHint(core, gender)         noun gender by suffix. GENDER-GATED: only a rule whose gender
                                       equals the word's actual article fires, so a suffix with
                                       exceptions (e.g. -or → der, but das Labor) can never mis-teach —
                                       a mismatching gender simply skips.
     pluralHint(sgWithArt, plWithArt)  plural-formation class (ending ± umlaut), from the singular vs
                                       plural forms; unclassifiable (irregular/Latin) → null.
     verbStemHint(infinitive, praes)   present-tense stem-vowel change class (a→ä, e→i, e→ie, au→äu,
                                       o→ö), from the infinitive vs the stored 3rd-sg present. Regular
                                       verbs (no vowel shift) → null.

   Pure: no DOM, no network, no globals beyond `window` — safe to load anywhere and to unit-test. */
window.HINTS = (function () {
  'use strict';

  /* ---------- article gender by suffix ----------
     Gender-gated at match time (see articleHint). `ex` are German examples WITH their article, so the
     locale template can list them verbatim. Kept to high-reliability, teachable suffixes. */
  const ARTICLE_RULES = [
    { id: 'ung',    suf: 'ung',    gender: 'die', ex: ['die Zeitung', 'die Wohnung'] },
    { id: 'heit',   suf: 'heit',   gender: 'die', ex: ['die Freiheit', 'die Gesundheit'] },
    { id: 'keit',   suf: 'keit',   gender: 'die', ex: ['die Möglichkeit', 'die Schwierigkeit'] },
    { id: 'schaft', suf: 'schaft', gender: 'die', ex: ['die Freundschaft', 'die Mannschaft'] },
    { id: 'ion',    suf: 'ion',    gender: 'die', ex: ['die Nation', 'die Information'] },
    { id: 'taet',   suf: 'tät',    gender: 'die', ex: ['die Universität', 'die Qualität'] },
    { id: 'ik',     suf: 'ik',     gender: 'die', ex: ['die Musik', 'die Politik'] },
    { id: 'ei',     suf: 'ei',     gender: 'die', ex: ['die Bäckerei', 'die Polizei'] },
    { id: 'ie',     suf: 'ie',     gender: 'die', ex: ['die Familie', 'die Energie'] },
    { id: 'ur',     suf: 'ur',     gender: 'die', ex: ['die Natur', 'die Kultur'] },
    { id: 'chen',   suf: 'chen',   gender: 'das', ex: ['das Mädchen', 'das Brötchen'] },
    { id: 'lein',   suf: 'lein',   gender: 'das', ex: ['das Fräulein', 'das Büchlein'] },
    { id: 'ment',   suf: 'ment',   gender: 'das', ex: ['das Dokument', 'das Instrument'] },
    { id: 'um',     suf: 'um',     gender: 'das', ex: ['das Museum', 'das Zentrum'] },
    { id: 'ling',   suf: 'ling',   gender: 'der', ex: ['der Frühling', 'der Lehrling'] },
    { id: 'ismus',  suf: 'ismus',  gender: 'der', ex: ['der Tourismus', 'der Journalismus'] },
    { id: 'or',     suf: 'or',     gender: 'der', ex: ['der Motor', 'der Doktor'] },
  ];

  function articleHint(core, gender) {
    if (!core || !gender) return null;
    const c = String(core).toLowerCase().trim();
    for (const r of ARTICLE_RULES) {
      // core must be longer than the suffix (so "das Ei" / "das Tor" don't match -ei / -or), and the
      // rule's gender must equal the word's real article (kills every suffix exception).
      if (r.gender === gender && c.length > r.suf.length && c.endsWith(r.suf)) {
        return { key: 'hint_article', args: [r.suf, gender], examples: r.ex };
      }
    }
    return null;
  }

  /* ---------- plural formation class ---------- */
  const PLURAL_EX = {
    e:         ['der Tag → die Tage', 'das Jahr → die Jahre'],
    e_umlaut:  ['der Stuhl → die Stühle', 'die Stadt → die Städte'],
    er:        ['das Kind → die Kinder', 'das Ei → die Eier'],
    er_umlaut: ['das Buch → die Bücher', 'das Haus → die Häuser'],
    n:         ['die Frau → die Frauen', 'die Blume → die Blumen'],
    nen:       ['die Lehrerin → die Lehrerinnen', 'die Freundin → die Freundinnen'],
    s:         ['das Auto → die Autos', 'das Hotel → die Hotels'],
    umlaut:    ['der Vater → die Väter', 'die Mutter → die Mütter'],
    same:      ['das Fenster → die Fenster', 'der Lehrer → die Lehrer'],
  };
  function deumlaut(s) { return s.replace(/äu/g, 'au').replace(/[äöü]/g, (m) => ({ 'ä': 'a', 'ö': 'o', 'ü': 'u' }[m])); }
  function stripArt(s) { const m = String(s).match(/^(?:der|die|das)\s+(.+)$/i); return (m ? m[1] : String(s)).trim(); }

  function pluralHint(sgWithArt, plWithArt) {
    const sg = stripArt(sgWithArt).toLowerCase();
    const pl = stripArt(plWithArt).toLowerCase();
    if (!sg || !pl) return null;
    const sgBase = deumlaut(sg), plBase = deumlaut(pl);
    // Umlaut = the plural introduces an umlauted vowel the singular didn't have.
    const umlaut = /[äöü]/.test(pl) && !/[äöü]/.test(sg);
    // Ending = what the (de-umlauted) plural adds to the (de-umlauted) singular stem. If the plural
    // stem doesn't extend the singular stem, it's an irregular/Latin plural we don't classify.
    let ending;
    if (plBase === sgBase) ending = '';
    else if (plBase.startsWith(sgBase)) ending = plBase.slice(sgBase.length);
    else return null;
    let cls;
    if (ending === '') cls = umlaut ? 'umlaut' : 'same';
    else if (ending === 'e') cls = umlaut ? 'e_umlaut' : 'e';
    else if (ending === 'er') cls = umlaut ? 'er_umlaut' : 'er';
    else if (ending === 'n' || ending === 'en') cls = 'n';
    else if (ending === 'nen') cls = 'nen';
    else if (ending === 's') cls = 's';
    else return null;
    return { key: 'hint_plural', args: [cls], examples: PLURAL_EX[cls] };
  }

  /* ---------- present-tense stem-vowel change ---------- */
  const VERB_CHANGE = { a_ae: 'a → ä', au_aeu: 'au → äu', o_oe: 'o → ö', e_ie: 'e → ie', e_i: 'e → i' };
  const VERB_EX = {
    a_ae:   ['fahren → er fährt', 'schlafen → er schläft'],
    au_aeu: ['laufen → er läuft'],
    o_oe:   ['stoßen → er stößt'],
    e_ie:   ['sehen → er sieht', 'lesen → er liest'],
    e_i:    ['geben → er gibt', 'nehmen → er nimmt'],
  };
  function infStem(inf) { inf = String(inf).toLowerCase(); return inf.endsWith('en') ? inf.slice(0, -2) : inf.endsWith('n') ? inf.slice(0, -1) : inf; }
  function praesStem(praes) { const p = String(praes).toLowerCase().trim(); return p.endsWith('t') ? p.slice(0, -1) : p; }

  function verbStemHint(inf, praes) {
    if (!inf || !praes) return null;
    const a = infStem(inf), b = praesStem(praes);
    let cls = null;
    if (/äu/.test(b) && /au/.test(a) && !/äu/.test(a)) cls = 'au_aeu';
    else if (/ä/.test(b) && /a/.test(a) && !/ä/.test(a)) cls = 'a_ae';
    else if (/ö/.test(b) && /o/.test(a) && !/ö/.test(a)) cls = 'o_oe';
    else if (/ie/.test(b) && !/ie/.test(a) && /e/.test(a)) cls = 'e_ie';
    else if (/i/.test(b) && !/i/.test(a) && /e/.test(a)) cls = 'e_i';
    if (!cls) return null;
    return { key: 'hint_verb', args: [VERB_CHANGE[cls]], examples: VERB_EX[cls] };
  }

  return { articleHint, pluralHint, verbStemHint };
})();

/* planner-data.js — curriculum day model, shared by /planner and the /today daily-flow wizard.

   Flattens the 24-week WEEKS curriculum (data/weeks.js) into a flat list of study days (one task =
   one day) and overlays the active UI language. Top-level `const`/`function` in a classic script
   live in the shared global lexical scope (same pattern as leitner.js `MAX_BOX`), so both the
   planner inline script and the /today host see DAYS / TOTAL_DAYS / getLocalizedDay directly.

   Depends on globals: WEEKS (data/weeks.js, must load first), getLang (i18n.js). */

/* Flatten weeks into days (one task = one day) */
const DAYS = [];
WEEKS.forEach(w => {
  w.tasks.forEach(([type, text], taskIdx) => {
    DAYS.push({
      day: DAYS.length + 1,
      week: w.n,
      weekTheme: w.theme,
      grammar: w.grammar,
      vocab: w.vocab,
      type, text, taskIdx
    });
  });
});
const TOTAL_DAYS = DAYS.length;

/* Return a day object with content translated to the active UI language */
function getLocalizedDay(d) {
  const localeObj = window['LOCALE_' + getLang().toUpperCase()] || window.LOCALE_EN || {};
  const weekLoc = (localeObj.weeks || {})[d.week];
  if (!weekLoc) return d;
  return {
    ...d,
    weekTheme: weekLoc.theme   || d.weekTheme,
    grammar:   weekLoc.grammar || d.grammar,
    vocab:     weekLoc.vocab   || d.vocab,
    text:      (weekLoc.tasks && weekLoc.tasks[d.taskIdx] != null) ? weekLoc.tasks[d.taskIdx] : d.text,
  };
}

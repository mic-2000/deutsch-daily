/* planner-data.js — curriculum day model, shared by /planner and the /today daily-flow wizard.

   Flattens the 36-week WEEKS curriculum (data/weeks.js — Course v2) into a flat list of study days
   (one task = one day) and overlays the active UI language. Top-level `const`/`function` in a classic
   script live in the shared global lexical scope (same pattern as leitner.js `MAX_BOX`), so both the
   planner inline script and the /today host see DAYS / TOTAL_DAYS / getLocalizedDay directly.

   A task is either a Course-v2 object `{ type, text, grammarFocus?, drill?, checklist? }` or a legacy
   v1 tuple `[type, text]`; `taskFields()` normalizes both so a mixed dataset works during a cutover.

   Depends on globals: WEEKS (data/weeks.js, must load first), getLang (i18n.js). */

/* Normalize a task entry (v2 object or v1 [type, text] tuple) to { type, text, drill? }.
   `drill` is the keyed grammar-drill slug (v2 object tasks only; tuples never carry one) — /today's
   grammar step resolves it against GRAMMAR_DRILLS to run an interactive drill. */
function taskFields(task) {
  return Array.isArray(task) ? { type: task[0], text: task[1], drill: null }
                             : { type: task.type, text: task.text, drill: task.drill || null };
}

/* Flatten weeks into days (one task = one day) */
const DAYS = [];
WEEKS.forEach(w => {
  w.tasks.forEach((task, taskIdx) => {
    const { type, text, drill } = taskFields(task);
    DAYS.push({
      day: DAYS.length + 1,
      week: w.n,
      weekTheme: w.theme,
      grammar: w.grammar,
      vocab: w.vocab,
      type, text, drill, taskIdx
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

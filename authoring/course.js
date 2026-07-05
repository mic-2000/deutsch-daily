/* authoring/course.js — Course v2 meta: the shape of the 36-week course the generator emits.
   These values become COURSE_VERSION/BAND_WEEKS in the generated data and must match the v2
   targets documented in assets/js/course-consts.js and private/curriculum-redesign-2026-07-v2.md §7.
   Consumed only by scripts/gen-course.js and tests/course-v2-align.test.js — never by the app. */
module.exports = {
  COURSE_VERSION: 2,
  TOTAL_WEEKS: 36,
  TASKS_PER_WEEK: 5,
  TOTAL_DAYS: 180,

  /* Inclusive [firstWeek, lastWeek] span of each CEFR band. */
  BAND_WEEKS: { A1: [1, 12], A2: [13, 24], B1: [25, 36] },

  /* Onboarding start week per self-declared level (first week of that band). */
  WEEK_FOR_LEVEL: { A1: 1, A2: 13, B1: 25 },

  /* Six learning phases + exam prep, each closed by a consolidation/milestone week. */
  PHASES: [
    { id: 'A1.1',     weeks: [1, 6],   milestoneDay: 30 },
    { id: 'A1.2',     weeks: [7, 12],  milestoneDay: 60 },
    { id: 'A2.1',     weeks: [13, 18], milestoneDay: 90 },
    { id: 'A2.2',     weeks: [19, 24], milestoneDay: 120 },
    { id: 'B1.1',     weeks: [25, 30], milestoneDay: 150 },
    { id: 'B1.2',     weeks: [31, 34], milestoneDay: 170 },
    { id: 'Pruefung', weeks: [35, 36], milestoneDay: 180 },
  ],

  /* Valid values used by validation in the generator and the alignment tests. */
  BANDS: ['A1', 'A2', 'B1'],
  TASK_TYPES: ['grammar', 'review', 'listen', 'write', 'speak', 'test', 'read'],
  DRILL_ITEM_TYPES: ['cloze', 'choice', 'order'],
};

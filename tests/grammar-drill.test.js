/* tests/grammar-drill.test.js — the GrammarDrill engine + its wiring into the /today grammar step.
 *
 * GrammarDrill (assets/js/grammar-drill.js) runs one keyed Course-v2 drill (GRAMMAR_DRILLS[slug]) as
 * a short interactive session inside /today's grammar step. Guards:
 *   • the engine is a namespace present on /today, and GRAMMAR_DRILLS + the locale drills block load;
 *   • drillForDay() resolves the current day's slug against GRAMMAR_DRILLS;
 *   • the grammar step offers the drill; starting it paints a session with localized copy (no raw keys);
 *   • the three item types (cloze / choice / order) grade correctly;
 *   • working the drill to its end advances the flow (onSessionEnd → the vocab session);
 *   • an unknown/empty drill leaves no session so the host can auto-skip without a deadlock.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function fresh(exports) {
  return loadPage({ page: 'today.html', extraFiles: ['locales/en.js'], exports });
}

/* Answer the current drill item correctly, whatever its type, then advance. */
function answerCurrentCorrect(GD) {
  const s = GD.state.session;
  const item = s.queue[s.pos];
  if (item.type === 'choice') GD.choose(item.options.indexOf(item.answer));
  else if (item.type === 'order') {
    item.answer.forEach((tok) => {
      const idx = item.tokens.findIndex((x, k) => x === tok && item.picked.indexOf(k) === -1);
      GD.pickToken(idx);
    });
    GD.check();
  } else { GD.setInput(String(item.answer)); GD.check(); }
  GD.next();
}

test('GrammarDrill is a namespace on /today and the drill data + locale block load', () => {
  const t = fresh(['GrammarDrill', 'GRAMMAR_DRILLS']);
  assert.equal(typeof t.GrammarDrill, 'object');
  assert.equal(typeof t.GrammarDrill.startSession, 'function');
  assert.equal(typeof t.GRAMMAR_DRILLS, 'object');
  assert.ok(t.GRAMMAR_DRILLS['praesens-endungen'], 'a known week-1 drill is present');
  const meta = t.GrammarDrill.drillLocale('praesens-endungen');
  assert.ok(meta.prompt && meta.concept, 'the active locale carries the keyed concept + prompt');
});

test('drillForDay resolves the current day\'s drill slug', () => {
  const t = fresh(['drillForDay', 'planner']);
  assert.equal(t.drillForDay(), 'praesens-endungen', 'day 1 → week-1 present-tense drill');
  t.planner.currentDay = 4;                         // day 4 (week 1, "write" task) has no drill
  assert.equal(t.drillForDay(), null, 'a drill-less day resolves to null');
});

test('the grammar step offers the drill; startGrammarDrill paints a localized session', () => {
  const t = fresh(['startFlow', 'startGrammarDrill', 'GrammarDrill']);
  t.startFlow();                                    // grammar step
  assert.match(t.app.innerHTML, /grammar-card/, 'concept card shown first');
  assert.match(t.app.innerHTML, /Practise the drill/, 'a practice CTA is offered when the day has a drill');
  t.startGrammarDrill();
  assert.ok(t.GrammarDrill.state.session, 'a drill session started');
  const html = t.app.innerHTML;
  assert.match(html, /session-bg/, 'the drill session chrome is painted');
  assert.match(html, /1 \/ 3/, 'the drill counter reflects the 3 items');
  assert.doesNotMatch(html, /drill_[a-z_]+/, 'no raw drill i18n key leaks');
  assert.doesNotMatch(html, /today_[a-z_]+/, 'no raw today i18n key leaks');
});

test('cloze grading: the right answer scores, a wrong one reveals the answer', () => {
  const t = fresh(['GrammarDrill']);
  const GD = t.GrammarDrill;
  GD.startSession({ slug: 'praesens-endungen' });   // item 0 is cloze, answer "wohne"
  GD.setInput('wohne');
  GD.check();
  assert.equal(GD.state.session.lastCorrect, true, 'correct cloze answer graded true');
  assert.match(t.app.innerHTML, /Correct!/);
  GD.next();
  // item 1 is cloze "lernst" — answer wrong on purpose
  GD.setInput('lernt');
  GD.check();
  assert.equal(GD.state.session.lastCorrect, false, 'wrong cloze answer graded false');
  assert.match(t.app.innerHTML, /Answer:/, 'the correct answer is revealed on a miss');
});

test('choice grading: picking the correct option scores it', () => {
  const t = fresh(['GrammarDrill']);
  const GD = t.GrammarDrill;
  GD.startSession({ slug: 'praesens-endungen' });
  GD.next(); GD.next();                              // advance to item 2 (choice, answer "kommt")
  const item = GD.state.session.queue[2];
  assert.equal(item.type, 'choice');
  GD.choose(item.options.indexOf(item.answer));
  assert.equal(GD.state.session.lastCorrect, true);
});

test('order grading: assembling the tokens in the answer order scores it', () => {
  const t = fresh(['GrammarDrill']);
  const GD = t.GrammarDrill;
  GD.startSession({ slug: 'nominativ-artikel' });   // week-1 drill whose item 2 is an "order" task
  const s = GD.state.session;
  const orderIdx = s.queue.findIndex((it) => it.type === 'order');
  assert.ok(orderIdx >= 0, 'the drill has an order item');
  s.pos = orderIdx;
  const item = s.queue[orderIdx];
  item.answer.forEach((tok) => {
    const idx = item.tokens.findIndex((x, k) => x === tok && item.picked.indexOf(k) === -1);
    GD.pickToken(idx);
  });
  assert.equal(GD.assembled(item), item.answer.join(' '), 'the assembled sentence matches the answer');
  GD.check();
  assert.equal(GD.state.session.lastCorrect, true);
});

test('finishing the drill advances the flow into the vocab session', () => {
  const t = fresh(['startFlow', 'startGrammarDrill', 'GrammarDrill', 'VocabTrainer']);
  t.startFlow();
  t.startGrammarDrill();
  const GD = t.GrammarDrill;
  const n = GD.state.session.queue.length;
  for (let i = 0; i < n; i++) answerCurrentCorrect(GD);   // work every item → end screen
  assert.ok(GD.state.session, 'still on the end screen (pos === length)');
  assert.equal(GD.state.session.pos, n);
  GD.closeSession();                                       // embedded → onSessionEnd → nextStep
  assert.equal(GD.state.session, null, 'drill session cleared');
  assert.ok(t.VocabTrainer.state.session, 'the flow advanced to the vocab session');
});

test('an all-correct run reports full marks to the host', () => {
  const t = fresh(['GrammarDrill']);
  const GD = t.GrammarDrill;
  let summary = null;
  GD.init({ embedded: true, onSessionEnd: (r) => { summary = r; } });
  GD.startSession({ slug: 'praesens-endungen' });
  const n = GD.state.session.queue.length;
  for (let i = 0; i < n; i++) answerCurrentCorrect(GD);
  GD.closeSession();
  assert.ok(summary, 'a summary was reported');
  assert.equal(summary.right, n, 'all items correct');
  assert.equal(summary.total, n, 'total = item count');
  assert.equal(summary.completed, true, 'completed = worked to the end');
});

test('an unknown or empty drill leaves no session (host can auto-skip)', () => {
  const t = fresh(['GrammarDrill', 'startGrammarDrill', 'planner']);
  const GD = t.GrammarDrill;
  GD.startSession({ slug: 'no-such-drill' });
  assert.equal(GD.state.session, null, 'no session for an unknown slug');
  // and via the host: a drill-less day auto-skips grammar rather than deadlocking
  t.planner.currentDay = 4;                         // day 4 (week 1 "write" task) has no drill
  t.startGrammarDrill();                            // no flow running → activeDay = currentDay = 4
  assert.equal(GD.state.session, null, 'startGrammarDrill starts nothing on a drill-less day');
});

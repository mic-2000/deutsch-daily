/* tests/weak-spots.test.js — the cross-track weak-spots round (Plan §11 Phase 6, item 14).
 *
 * A "weak spot" (assets/js/leitner.js) is a card the learner keeps getting wrong: SEEN at least
 * once, MISSED at least once, and NOT yet mastered; `leitnerWeakness` ranks the worst first. Each
 * trainer exposes a `weak` session scope + a `weakCount()`; GrammarDrill exposes `weakReviewSlugs`.
 * /today stitches them into ONE optional remedial round (vocab → verbs → grammar), reusing the same
 * engines and never blocking day completion.
 *
 * Guards:
 *   • VocabTrainer weak scope = worst word + plural cards, verb-words excluded, mastered excluded;
 *   • VerbsTrainer weak scope = worst verbs first, capped;
 *   • GrammarDrill.weakReviewSlugs = weakest existing topics first, capped;
 *   • buildSteps adds an optional `weak` step on 10/15/20+ only when the learner has weak cards;
 *   • the round runs the families in turn and the day still completes (weak is never required);
 *   • bailing (× on a sub-session) ends the round without starting the next family;
 *   • an enabled-but-empty round (weak cards cleared mid-flow) auto-skips, never deadlocks.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* A weak Leitner card: seen + missed `wrong` times, not mastered (box < 5). */
function weakCard(wrong, box) { return { box: box || 1, due: 0, right: 1, wrong, seen: 1 + wrong }; }

function fresh(exports) {
  return loadPage({ page: 'today.html', extraFiles: ['locales/en.js'], exports });
}

/* Work a trainer session to its end screen, then close it (embedded → onSessionEnd advances). */
function finishSession(engine) {
  const s = engine.state.session;
  s.pos = s.queue.length;
  engine.closeSession();
}

/* ==========================================================================
   VocabTrainer weak scope (words + plurals; verb-words + mastered excluded)
   ========================================================================== */
test('VocabTrainer weak scope: worst word + plural cards, worst-first; verb-words & mastered excluded', () => {
  const t = loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['VocabTrainer', 'VOCAB'] });
  const V = t.VocabTrainer;
  V.state.modes.plural = true;                                   // plurals count only when the track is on

  const wIdx = t.VOCAB[1].words.findIndex((w) => !V.verbKeyForWord(w));
  assert.ok(wIdx >= 0, 'week 1 has a non-verb word');
  const wIdx2 = t.VOCAB[1].words.findIndex((w, i) => i !== wIdx && !V.verbKeyForWord(w));
  assert.ok(wIdx2 >= 0, 'a second non-verb word');
  let plIdx = -1;
  for (let i = 0; i < t.VOCAB[1].words.length; i++) { if (V.plHasPlural(1, i)) { plIdx = i; break; } }
  assert.ok(plIdx >= 0, 'week 1 has a plural noun');
  let vw = null;
  for (const w in t.VOCAB) { const i = t.VOCAB[w].words.findIndex((x) => V.verbKeyForWord(x)); if (i >= 0) { vw = { w: +w, i }; break; } }
  assert.ok(vw, 'a verb-word exists in VOCAB');

  V.state.mastery[V.key(1, wIdx)] = weakCard(3);                 // weak word (worst)
  V.state.mastery[V.key(1, wIdx2)] = { box: 5, due: 0, right: 5, wrong: 2, seen: 7 };  // mastered → NOT weak
  V.state.pluralMastery[V.key(1, plIdx)] = weakCard(2);         // weak plural (milder)
  // a verb-word's mastery lives in the shared verb store — its weakness belongs to the VERB round
  V.setVerbStore({ mastery: { [V.verbKeyForWord(t.VOCAB[vw.w].words[vw.i])]: weakCard(4) } });

  assert.equal(V.weakCount(), 2, 'the weak word + weak plural — not the verb-word, not the mastered card');
  const scored = V.collectWeakCards();
  assert.equal(scored[0].kind, 'word', 'the worst (3 misses) is first');
  assert.equal(scored[1].kind, 'plural', 'the milder plural (2 misses) is second');

  V.startSession({ type: 'weak' });
  assert.ok(V.state.session, 'a weak session was built');
  assert.equal(V.state.session.scope.type, 'weak');
  assert.equal(V.state.session.queue.length, 2);
  assert.match(t.app.innerHTML, /weak spots/, 'the session counter carries the weak-spots label');

  V.state.modes.plural = false;                                 // plural track off → plural drops out
  assert.equal(V.weakCount(), 1, 'only the weak word counts when plurals are off');
});

test('VocabTrainer weak scope honours the cap (keeps the worst)', () => {
  const t = loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['VocabTrainer', 'VOCAB'] });
  const V = t.VocabTrainer;
  const nonVerb = t.VOCAB[1].words.map((w, i) => (!V.verbKeyForWord(w) ? i : -1)).filter((i) => i >= 0).slice(0, 3);
  assert.ok(nonVerb.length >= 3, 'three non-verb words to seed');
  V.state.mastery[V.key(1, nonVerb[0])] = weakCard(5);          // worst
  V.state.mastery[V.key(1, nonVerb[1])] = weakCard(2);
  V.state.mastery[V.key(1, nonVerb[2])] = weakCard(1);
  V.startSession({ type: 'weak', cap: 1 });
  assert.equal(V.state.session.queue.length, 1, 'cap: 1 → a single card');
  assert.equal(V.state.session.queue[0].idx, nonVerb[0], 'the cap keeps the worst card');
});

/* ==========================================================================
   VerbsTrainer weak scope
   ========================================================================== */
test('VerbsTrainer weak scope: worst verbs first, capped; never-missed & mastered excluded', () => {
  const t = loadPage({ page: 'verbs.html', extraFiles: ['locales/en.js'], exports: ['VerbsTrainer'] });
  const V = t.VerbsTrainer;
  V.state.mastery['gehen'] = weakCard(4);                        // weak (worst)
  V.state.mastery['kommen'] = weakCard(1, 2);                    // weak (milder)
  V.state.mastery['sein'] = { box: 2, due: 0, right: 5, wrong: 0, seen: 5 };   // never missed → not weak
  V.state.mastery['haben'] = { box: 5, due: 0, right: 6, wrong: 2, seen: 8 };  // mastered → not weak

  assert.equal(V.weakCount(), 2);
  assert.equal(V.collectWeakKeys().join(','), 'gehen,kommen', 'worst first');
  V.startSession({ type: 'weak', cap: 1 });
  assert.ok(V.state.session);
  assert.equal(V.state.session.scope.type, 'weak');
  assert.equal(V.state.session.queue.length, 1);
  assert.equal(V.state.session.queue[0].key, 'gehen', 'the cap keeps the worst verb');
});

/* ==========================================================================
   GrammarDrill weak-review topics
   ========================================================================== */
test('GrammarDrill.weakReviewSlugs: weakest existing topics first, unknown dropped, capped', () => {
  const GD = fresh(['GrammarDrill']).GrammarDrill;
  const map = {
    'praesens-endungen': weakCard(4),                            // weak (worst)
    'sein-haben': weakCard(1, 2),                                // weak (milder)
    'nominativ-artikel': { box: 2, due: 0, right: 5, wrong: 0, seen: 5 },   // never missed → not weak
    'akk-artikel': { box: 5, due: 0, right: 6, wrong: 3, seen: 9 },         // mastered → not weak
    'no-such-drill': weakCard(9),                                // weak but unknown slug → dropped
  };
  assert.equal(GD.weakReviewSlugs(map).join(','), 'praesens-endungen,sein-haben', 'weakest first; unknown/never-missed/mastered excluded');
  assert.equal(GD.weakReviewSlugs(map, 1).join(','), 'praesens-endungen', 'capped to the limit');
  assert.equal(GD.weakReviewSlugs(null).length, 0, 'a missing map yields nothing');
  assert.equal(GD.weakReviewSlugs({}).length, 0, 'an empty map yields nothing');
});

/* ==========================================================================
   /today — the weak-spots step wiring
   ========================================================================== */
test('buildSteps adds an optional weak step (10/15/20+, only when weak cards exist)', () => {
  const t = fresh(['buildSteps', 'hasWeakSpots', 'VerbsTrainer']);
  assert.equal(t.hasWeakSpots(), false, 'nothing weak on a fresh account');
  assert.ok(!t.buildSteps(1, {}).some((s) => s.id === 'weak'), 'no weak step without weak cards');

  t.VerbsTrainer.state.mastery['gehen'] = weakCard(3);
  assert.equal(t.hasWeakSpots(), true, 'a missed verb is a weak spot');
  const std = t.buildSteps(1, {});                               // default 15-min path (day 1 also has listen)
  assert.equal(std.map((s) => s.id).join(','), 'grammar,vocab,verbs,listen,weak,done', 'weak sits right before done');
  assert.equal(std.find((s) => s.id === 'weak').required, false, 'the weak round never blocks the day');
  assert.ok(!t.buildSteps(2, { minutes: '5' }).some((s) => s.id === 'weak'), 'no weak round on the 5-min light track');
});

test('the weak round runs after the required blocks and the day still completes', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner']);
  t.VerbsTrainer.state.mastery['gehen'] = weakCard(3);          // one weak family: verbs
  t.startFlow();                                                // grammar (weak step is in the plan)
  const day = t.planner.currentDay;
  t.nextStep();                                                 // → vocab session
  finishSession(t.VocabTrainer);                               // → verb session
  finishSession(t.VerbsTrainer);                               // → listen block
  t.finishListen();                                            // → weak step → starts the verbs weak sub-session
  assert.ok(t.VerbsTrainer.state.session, 'the weak round opened a verbs sub-session');
  assert.equal(t.VerbsTrainer.state.session.scope.type, 'weak');
  assert.match(t.app.innerHTML, /weak spots/, 'the weak-spots label is shown');
  finishSession(t.VerbsTrainer);                               // weak sub-session done → round done → done step
  assert.match(t.app.innerHTML, /flow-done/, 'the flow reached the done screen');
  assert.equal(t.planner.completed[day], true, 'the day completes — the optional weak round does not gate it');
  assert.equal(t.planner.currentDay, day + 1, 'currentDay advanced');
});

test('bailing out of a weak sub-session ends the round without starting the next family', () => {
  const t = loadPage({ page: 'today.html', extraFiles: ['locales/en.js'],
    exports: ['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner', 'VOCAB'] });
  const V = t.VocabTrainer;
  // two weak families → the round would run vocab THEN verbs
  const nvi = t.VOCAB[1].words.findIndex((w) => !V.verbKeyForWord(w));   // a non-verb word (vocab family)
  assert.ok(nvi >= 0);
  V.state.mastery[V.key(1, nvi)] = weakCard(3);
  t.VerbsTrainer.state.mastery['gehen'] = weakCard(3);                   // a weak verb (verbs family)

  t.startFlow();
  const day = t.planner.currentDay;
  t.nextStep();                                                 // → vocab session
  finishSession(t.VocabTrainer);                               // → verb session
  finishSession(t.VerbsTrainer);                               // → listen
  t.finishListen();                                            // → weak step → vocab weak sub-session (first family)
  assert.ok(t.VocabTrainer.state.session, 'the round started with the vocab family');
  assert.equal(t.VocabTrainer.state.session.scope.type, 'weak');

  t.VocabTrainer.closeSession();                               // bail (× before the end) → round ends
  assert.equal(t.VerbsTrainer.state.session, null, 'the verbs family was NOT started after bailing');
  assert.match(t.app.innerHTML, /flow-done/, 'bailing advances straight to done');
  assert.equal(t.planner.completed[day], true, 'the day still completes (weak round is optional)');
});

test('an enabled-but-empty weak round auto-skips (no deadlock) when weak cards clear mid-flow', () => {
  const t = fresh(['startFlow', 'nextStep', 'VocabTrainer', 'VerbsTrainer', 'finishListen', 'planner']);
  t.VerbsTrainer.state.mastery['gehen'] = weakCard(3);          // weak at plan time → weak step enabled
  t.startFlow();
  const day = t.planner.currentDay;
  t.nextStep();                                                 // → vocab
  finishSession(t.VocabTrainer);                               // → verbs
  finishSession(t.VerbsTrainer);                               // → listen
  delete t.VerbsTrainer.state.mastery['gehen'];                // learner has no weak cards anymore
  t.finishListen();                                            // → weak step → re-scan is empty → auto-skip → done
  assert.equal(t.VerbsTrainer.state.session, null, 'no weak sub-session was opened');
  assert.match(t.app.innerHTML, /flow-done/, 'the empty round skipped straight to done');
  assert.equal(t.planner.completed[day], true, 'the day completes cleanly');
});

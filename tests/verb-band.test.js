/* tests/verb-band.test.js — band-gated introduction of NEW verbs (Plan §6, §14 Trainer).
 *
 * VerbsTrainer.startSession introduces NEW (never-seen) verbs only up to the learner's current
 * CEFR band, derived from the session scope's `week` via course-consts.js (BAND_WEEKS / levelOfWeek).
 * Already-seen DUE verbs stay reviewable regardless of band, and the standalone /verbs page (no
 * `week` in scope) is unrestricted. Guards:
 *   • an A1 week only introduces A1 new verbs;
 *   • a B1 week introduces new verbs of any band;
 *   • a seen+due above-band verb is still queued from an A1 week;
 *   • omitting `week` (the /verbs free-explore path) applies no band gate.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

function fresh() {
  return loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['startSession', 'state', 'VERBS', 'levelOfWeek'],
  });
}

const queueKeys = (t) => t.state.session.queue.map((c) => c.key);
// A never-mastered card that is due right now (seen>0, due in the past).
const seenDueCard = () => ({ box: 1, due: 0, right: 1, wrong: 0, seen: 1 });

test('course-consts is wired: levelOfWeek maps weeks to bands', () => {
  const t = fresh();
  assert.equal(t.levelOfWeek(1), 'A1');
  assert.equal(t.levelOfWeek(13), 'A2');
  assert.equal(t.levelOfWeek(25), 'B1');
});

test('an A1 week introduces ONLY A1 new verbs', () => {
  const t = fresh();
  t.startSession({ type: 'filter', filter: 'all', week: 1 });
  const keys = queueKeys(t);
  assert.ok(keys.length > 0, 'a session started');
  for (const k of keys) {
    assert.equal(t.VERBS[k].band, 'A1', `${k} (band ${t.VERBS[k].band}) should not be introduced in an A1 week`);
  }
});

test('a B1 week introduces new verbs of any band (no A1 ceiling)', () => {
  const t = fresh();
  t.startSession({ type: 'filter', filter: 'all', week: 25 });
  const bands = queueKeys(t).map((k) => t.VERBS[k].band);
  assert.ok(bands.some((b) => b !== 'A1'), 'B1 week should surface above-A1 verbs');
});

test('a seen+due above-band verb stays reviewable from an A1 week', () => {
  const t = fresh();
  const b1 = Object.keys(t.VERBS).find((k) => t.VERBS[k].band === 'B1');
  t.state.mastery[b1] = seenDueCard();
  t.startSession({ type: 'filter', filter: 'all', week: 1 });
  assert.ok(queueKeys(t).includes(b1), `due ${b1} (B1) must remain reviewable even in an A1 week`);
});

test('omitting week (the /verbs free-explore path) applies no band gate', () => {
  const t = fresh();
  t.startSession({ type: 'filter', filter: 'all' });   // no week → ungated
  const bands = queueKeys(t).map((k) => t.VERBS[k].band);
  assert.ok(bands.some((b) => b !== 'A1'), 'ungated session should include above-A1 verbs');
});

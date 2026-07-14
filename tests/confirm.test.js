/* tests/confirm.test.js — in-page confirm modal (never the native confirm()).
 * The plan moves askConfirm/confirmYes/confirmNo into a shared helper. Behaviour locked:
 *   - askConfirm stages { message, action } on state.confirm and re-renders
 *   - confirmNo clears it without mutating progress
 *   - confirmYes('all') wipes all mastery
 *   - confirmYes({key}) deletes one record
 * (docs/architecture/14-fixed-bugs.md bug #5: reset buttons must work via this modal, not confirm().)
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');

/* Normalise cross-realm sandbox objects before structural comparison. */
const plain = (x) => JSON.parse(JSON.stringify(x));

function verbs() {
  return loadPage({
    page: 'verbs.html',
    extraFiles: ['locales/en.js'],
    exports: ['askConfirm', 'confirmYes', 'confirmNo', 'updateCard', 'resetAll', 'resetVerb', 'state'],
  });
}

test('askConfirm stages a pending action on state.confirm', () => {
  const v = verbs();
  v.askConfirm('Reset?', 'all');
  assert.deepEqual(plain(v.state.confirm), { message: 'Reset?', action: 'all' });
});

test('confirmNo cancels without touching progress', () => {
  const v = verbs();
  v.updateCard('gehen', true);
  v.askConfirm('Reset?', 'all');
  v.confirmNo();
  assert.equal(v.state.confirm, null);
  assert.ok(v.state.mastery['gehen'], 'progress preserved on cancel');
});

test('confirmYes with "all" wipes every mastery record', () => {
  const v = verbs();
  v.updateCard('gehen', true);
  v.updateCard('kommen', true);
  v.resetAll(); // stages 'all'
  v.confirmYes();
  assert.equal(v.state.confirm, null);
  assert.deepEqual(plain(v.state.mastery), {});
});

test('confirmYes with a single-key action deletes only that record', () => {
  const v = verbs();
  v.updateCard('gehen', true);
  v.updateCard('kommen', true);
  v.resetVerb('gehen'); // stages { key: 'gehen' }
  v.confirmYes();
  assert.equal(v.state.mastery['gehen'], undefined);
  assert.ok(v.state.mastery['kommen'], 'other records untouched');
});

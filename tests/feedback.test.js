/* tests/feedback.test.js — feedback loop (DEV-10).
 *
 * Guards assets/js/feedback.js: the PURE one-time auto-prompt decision (feedbackShouldPrompt), the
 * footer entry point + modal markup rendered with real locale strings (no raw i18n keys leaking),
 * the anonymous/attributed insert payload (submitFeedbackToCloud), and that appFooter surfaces the
 * button on an app page. feedback.js is dual-mode (browser global script + CommonJS), so the pure
 * bits are required directly and the DOM-facing bits run through the page harness.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./harness');
const { feedbackShouldPrompt, FB_PROMPT_AFTER_DAYS } = require('../assets/js/feedback');

/* ---- feedbackShouldPrompt: pure one-time-prompt decision (planner_data flag) ---- */

test('feedbackShouldPrompt: false for a missing / non-object planner', () => {
  assert.equal(feedbackShouldPrompt(null), false);
  assert.equal(feedbackShouldPrompt(undefined), false);
  assert.equal(feedbackShouldPrompt('nope'), false);
  assert.equal(feedbackShouldPrompt({}), false, 'no dayStats at all → not yet');
});

test('feedbackShouldPrompt: false below the day threshold, true at it', () => {
  const days = (n) => { const d = {}; for (let i = 1; i <= n; i++) d[i] = { completedAt: '2026-07-0' + i }; return d; };
  assert.equal(feedbackShouldPrompt({ dayStats: days(FB_PROMPT_AFTER_DAYS - 1) }), false);
  assert.equal(feedbackShouldPrompt({ dayStats: days(FB_PROMPT_AFTER_DAYS) }), true, 'exactly at the threshold prompts');
  assert.equal(feedbackShouldPrompt({ dayStats: days(FB_PROMPT_AFTER_DAYS + 5) }), true, 'past the threshold still prompts (until the flag is set)');
});

test('feedbackShouldPrompt: the one-time flag suppresses it forever after', () => {
  const days = (n) => { const d = {}; for (let i = 1; i <= n; i++) d[i] = { completedAt: 'x' }; return d; };
  assert.equal(feedbackShouldPrompt({ dayStats: days(FB_PROMPT_AFTER_DAYS + 2), feedbackPrompted: true }), false);
});

/* ---- footer entry point + modal markup (real locale strings, no raw keys) ---- */

function loadFeedback() {
  return loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['feedbackButton', 'appFooter', '_fbModalHtml', '_fbState', 'submitFeedbackToCloud', 'render'],
  });
}

test('feedbackButton: renders the localized link that opens the modal', () => {
  const p = loadFeedback();
  const html = p.feedbackButton();
  assert.match(html, /onclick="openFeedback\(\)"/, 'wired to openFeedback');
  assert.match(html, /class="fb-link"/, 'default class');
  assert.match(html, /Feedback/, 'localized label resolved');
  assert.match(p.feedbackButton('lp-foot-link'), /class="lp-foot-link"/, 'custom class honoured');
});

test('appFooter surfaces the feedback button on an app page', () => {
  const p = loadFeedback();
  const html = p.appFooter({});
  assert.match(html, /openFeedback\(\)/, 'footer includes the feedback entry point');
  assert.match(html, /f-right/, 'button lives in the footer right slot');
});

test('vocab render() paints the feedback button into the footer', () => {
  const p = loadFeedback();
  p.render();
  assert.match(p.app.innerHTML, /openFeedback\(\)/, 'the rendered page carries the feedback link');
});

test('feedback modal: renders the note field, 1–5 moods and actions, no raw keys', () => {
  const p = loadFeedback();
  const html = p._fbModalHtml();
  assert.match(html, /id="fb-text"/, 'note textarea present');
  for (let n = 1; n <= 5; n++) assert.match(html, new RegExp('data-m="' + n + '"'), 'mood ' + n + ' present');
  assert.match(html, /onclick="setFeedbackMood\(3\)"/, 'moods are tappable');
  assert.match(html, /onclick="submitFeedback\(\)"/, 'send action present');
  assert.match(html, /onclick="closeFeedback\(\)"/, 'cancel/close actions present');
  assert.match(html, /Send feedback/, 'localized title resolved');
  assert.doesNotMatch(html, /feedback_[a-z0-9_]+/, 'no raw feedback_* i18n keys leaked');
});

test('feedback modal: the auto-prompt shows the softer prompt lead', () => {
  const p = loadFeedback();
  p._fbState.prompt = false;
  assert.doesNotMatch(p._fbModalHtml(), /20 seconds/, 'the plain modal is not the prompt copy');
  p._fbState.prompt = true;
  assert.match(p._fbModalHtml(), /20 seconds/, 'the prompt lead is used when opened as a prompt');
});

/* ---- submitFeedbackToCloud: anonymous vs attributed, error handling ---- */

function loadWithFakeSb() {
  const inserts = [];
  const sb = { from: (table) => ({ insert: async (row) => { inserts.push({ table, row }); return { error: null }; } }) };
  const p = loadPage({
    page: 'vocab.html',
    extraFiles: ['locales/en.js'],
    exports: ['submitFeedbackToCloud'],
    shims: { sb },
  });
  return { p, inserts, sb };
}

test('submitFeedbackToCloud: anonymous submission carries a null user_id', async () => {
  const { p, inserts } = loadWithFakeSb();
  p.sandbox.currentUser = null;
  const ok = await p.submitFeedbackToCloud({ page: 'landing', text: 'nice app', mood: 5 });
  assert.equal(ok, true);
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].table, 'feedback');
  // The row is built inside the vm sandbox (foreign prototype), so assert fields, not deepEqual.
  assert.equal(inserts[0].row.user_id, null, 'anonymous → null user_id');
  assert.equal(inserts[0].row.page, 'landing');
  assert.equal(inserts[0].row.text, 'nice app');
  assert.equal(inserts[0].row.mood, 5);
});

test('submitFeedbackToCloud: a signed-in submission is attributed to the user', async () => {
  const { p, inserts } = loadWithFakeSb();
  p.sandbox.currentUser = { id: 'user-123' };
  const ok = await p.submitFeedbackToCloud({ page: 'today', text: 'bug here', mood: null });
  assert.equal(ok, true);
  assert.equal(inserts[0].row.user_id, 'user-123');
  assert.equal(inserts[0].row.mood, null, 'an unset mood stays null (optional)');
});

test('submitFeedbackToCloud: returns false (never throws) on a cloud error', async () => {
  const p = loadPage({
    page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['submitFeedbackToCloud'],
    shims: { sb: { from: () => ({ insert: async () => ({ error: { message: 'boom' } }) }) } },
  });
  assert.equal(await p.submitFeedbackToCloud({ page: 'x', text: 'y', mood: 1 }), false);
});

test('submitFeedbackToCloud: returns false when the cloud client is absent', async () => {
  const p = loadPage({ page: 'vocab.html', extraFiles: ['locales/en.js'], exports: ['submitFeedbackToCloud'], shims: { sb: undefined } });
  assert.equal(await p.submitFeedbackToCloud({ page: 'x', text: 'y', mood: 1 }), false);
});

/* ---- locale parity: every feedback_* key exists in all three locales ---- */

test('locales: feedback_* keys are present in en / ru / ua', () => {
  const fs = require('fs');
  const path = require('path');
  const keys = [
    'feedback_link', 'feedback_title', 'feedback_lead', 'feedback_prompt_lead', 'feedback_mood_label',
    'feedback_mood_1', 'feedback_mood_2', 'feedback_mood_3', 'feedback_mood_4', 'feedback_mood_5',
    'feedback_placeholder', 'feedback_cancel', 'feedback_send', 'feedback_sending', 'feedback_close',
    'feedback_thanks', 'feedback_empty', 'feedback_error',
  ];
  for (const loc of ['en', 'ru', 'ua']) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'locales', loc + '.js'), 'utf8');
    for (const k of keys) assert.match(src, new RegExp('\\b' + k + ':'), `${loc}.js defines ${k}`);
  }
});

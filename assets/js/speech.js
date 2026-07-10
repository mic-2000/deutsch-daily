/* speech.js — shared German text-to-speech (Web Speech API).
 * Used by the vocabulary and verb trainers. Picks a German voice once (voices load async, so we
 * also re-pick on `onvoiceschanged`) and exposes speak(); each page keeps its own small wrapper
 * (speakWord / speakVerb) that builds the utterance text and passes its preferred rate.
 *
 * Depends on T() (i18n.js) and showToast() (utils.js) — load this AFTER both.
 */
let GERMAN_VOICE = null;
function pickVoice() {
  if (!window.speechSynthesis) return;
  const vs = window.speechSynthesis.getVoices();
  GERMAN_VOICE = vs.find(v => /de[-_]/i.test(v.lang)) || vs.find(v => /german|deutsch/i.test(v.name)) || null;
}
if (window.speechSynthesis) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

/* Speak German text. `rate` defaults to 0.9; pass a slower rate for single-word prompts.
 * `btnEl`, if given, gets a `speaking` class for the duration of the utterance. */
function speak(text, btnEl, rate) {
  if (!window.speechSynthesis) { showToast(T('toast_no_speech')); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE'; u.rate = rate || 0.9; u.pitch = 1;
  if (GERMAN_VOICE) u.voice = GERMAN_VOICE;
  if (btnEl) {
    btnEl.classList.add('speaking');
    u.onend = () => btnEl.classList.remove('speaking');
    u.onerror = () => btnEl.classList.remove('speaking');
  }
  window.speechSynthesis.speak(u);
}

/* Is browser text-to-speech usable at all? (The Web Speech API + its utterance ctor are present.)
 * /today's listen block gates on this: no TTS → the block is skipped, never a deadlock. */
function ttsAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
}

/* Speak several German lines in sequence (a dialogue). Queues one utterance per line WITHOUT
 * cancelling between them (a single cancel() up front clears any prior speech, so the lines don't
 * pile up on repeat presses). `opts.btnEl` gets a `speaking` class for the whole run; `opts.rate`
 * sets the pace (default 0.9); `opts.onEnd` fires after the last line. Returns false (and toasts)
 * when speech is unavailable or there is nothing to say. */
function speakLines(lines, opts) {
  opts = opts || {};
  if (!window.speechSynthesis) { showToast(T('toast_no_speech')); return false; }
  const list = (lines || []).filter(t => t != null && String(t).trim() !== '');
  if (!list.length) return false;
  window.speechSynthesis.cancel();
  const btn = opts.btnEl;
  if (btn) btn.classList.add('speaking');
  const done = () => { if (btn) btn.classList.remove('speaking'); if (typeof opts.onEnd === 'function') opts.onEnd(); };
  list.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'de-DE'; u.rate = opts.rate || 0.9; u.pitch = 1;
    if (GERMAN_VOICE) u.voice = GERMAN_VOICE;
    if (i === list.length - 1) { u.onend = done; u.onerror = done; }
    window.speechSynthesis.speak(u);
  });
  return true;
}

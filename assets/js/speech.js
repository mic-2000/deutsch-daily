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

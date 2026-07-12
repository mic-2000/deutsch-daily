/* feedback.js — DEV-10 feedback loop.

   A tiny "💬 Feedback" footer entry point + an in-page modal (a free-text note + an optional 1–5
   mood) that writes to the `feedback` table (see schema.sql). Loaded on the guest landing
   (anonymous submissions) and on every app page (attributed to the signed-in user).

   The modal is a self-managed overlay appended to <body> — deliberately NOT part of any page's
   #app re-render — so this one module serves the landing and all seven app pages without threading
   markup + handlers through each render(). A page's own re-render can't wipe it.

   Depends on globals: T (i18n.js), esc / showToast / track (utils.js), sb (supabase.js).
   currentUser (cloud-sync.js) is OPTIONAL — absent on the landing → the row is anonymous.

   The one-time auto-prompt after N completed days (feedbackShouldPrompt) is a PURE decision; the
   caller (/today) owns the planner_data.feedbackPrompted flag and its persistence.
*/

// Cap the note so a paste can't balloon the row (also enforced by the textarea maxlength).
const FB_MAX_LEN = 2000;
// Auto-prompt once the learner has completed this many days (planner_data.dayStats entries).
const FB_PROMPT_AFTER_DAYS = 3;
const FB_EMOJI = { 1: '😞', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };

// Transient per-open UI state (never persisted). mood 0 = none picked (mood is optional).
const _fbState = { mood: 0, sending: false, prompt: false };

function _fbOverlay() { return document.getElementById('fb-overlay'); }

/* The footer button markup. Reused by appFooter (header.js, app pages) and the landing footer. */
function feedbackButton(cls) {
  return '<button type="button" class="' + (cls || 'fb-link') + '" onclick="openFeedback()">💬 ' + T('feedback_link') + '</button>';
}

/* Current page id for the `page` column ('today' | 'planner' | … | 'landing'). Root → 'landing'. */
function _fbPageId() {
  let p = (typeof location !== 'undefined' && location.pathname) || '';
  p = p.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
  return p || 'landing';
}

function _fbModalHtml() {
  const moods = [1, 2, 3, 4, 5].map((n) =>
    '<button type="button" class="fb-mood-btn" data-m="' + n + '" onclick="setFeedbackMood(' + n + ')"' +
    ' aria-label="' + esc(T('feedback_mood_' + n)) + '" title="' + esc(T('feedback_mood_' + n)) + '">' + FB_EMOJI[n] + '</button>'
  ).join('');
  const lead = _fbState.prompt ? T('feedback_prompt_lead') : T('feedback_lead');
  return '<div class="fb-box" role="dialog" aria-modal="true" aria-label="' + esc(T('feedback_title')) + '">' +
    '<button type="button" class="fb-close" onclick="closeFeedback()" aria-label="' + esc(T('feedback_close')) + '">×</button>' +
    '<h3 class="fb-title">' + T('feedback_title') + '</h3>' +
    '<p class="fb-lead">' + lead + '</p>' +
    '<div class="fb-moods" role="group" aria-label="' + esc(T('feedback_mood_label')) + '">' + moods + '</div>' +
    '<textarea id="fb-text" class="fb-text" rows="4" maxlength="' + FB_MAX_LEN + '" placeholder="' + esc(T('feedback_placeholder')) + '"></textarea>' +
    '<div class="fb-err" id="fb-err" role="alert"></div>' +
    '<div class="fb-actions">' +
      '<button type="button" class="fb-btn" onclick="closeFeedback()">' + T('feedback_cancel') + '</button>' +
      '<button type="button" class="fb-btn accent" id="fb-send" onclick="submitFeedback()">' + T('feedback_send') + '</button>' +
    '</div></div>';
}

/* Open the modal. isPrompt=true renders the softer auto-prompt lead ("2 questions, 20 seconds"). */
function openFeedback(isPrompt) {
  _fbState.mood = 0; _fbState.sending = false; _fbState.prompt = !!isPrompt;
  if (_fbOverlay()) return;                     // already open — don't stack overlays
  const wrap = document.createElement('div');
  wrap.id = 'fb-overlay';
  wrap.className = 'fb-bg';
  wrap.setAttribute('onclick', 'if(event.target===this)closeFeedback()');
  wrap.innerHTML = _fbModalHtml();
  document.body.appendChild(wrap);
  track('feedback_open', { page: _fbPageId(), prompt: isPrompt ? 1 : 0 });
  const ta = document.getElementById('fb-text');
  if (ta && ta.focus) { try { ta.focus(); } catch (e) {} }
}

function closeFeedback() {
  const o = _fbOverlay();
  if (o && o.parentNode) o.parentNode.removeChild(o);
}

/* Pick a mood 1..5 (tapping the selected one clears it — mood stays optional). Toggles the button
   classes in place so the textarea's content is never lost to a re-render. */
function setFeedbackMood(n) {
  _fbState.mood = (_fbState.mood === n) ? 0 : n;
  const btns = document.querySelectorAll('#fb-overlay .fb-mood-btn');
  for (let i = 0; i < btns.length; i++) {
    const on = (+btns[i].getAttribute('data-m') === _fbState.mood);
    btns[i].classList[on ? 'add' : 'remove']('sel');
  }
}

function _fbShowErr(msg) {
  const el = document.getElementById('fb-err');
  if (el) el.textContent = msg || '';
}

/* Insert the submission. Returns true on success, false on any error (never throws). Anonymous when
   there is no signed-in user (the landing). RLS forbids attributing a row to another user. */
async function submitFeedbackToCloud(row) {
  try {
    if (typeof sb === 'undefined' || !sb) return false;
    const uid = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null;
    const payload = { user_id: uid, page: row.page || null, text: row.text || '', mood: row.mood || null };
    const { error } = await sb.from('feedback').insert(payload);
    return !error;
  } catch (e) { return false; }
}

async function submitFeedback() {
  if (_fbState.sending) return;
  const ta = document.getElementById('fb-text');
  const text = ((ta && ta.value) || '').trim();
  if (!text && !_fbState.mood) { _fbShowErr(T('feedback_empty')); return; }
  _fbState.sending = true; _fbShowErr('');
  const btn = document.getElementById('fb-send');
  if (btn) { btn.disabled = true; btn.textContent = T('feedback_sending'); }
  const ok = await submitFeedbackToCloud({ page: _fbPageId(), text: text.slice(0, FB_MAX_LEN), mood: _fbState.mood || null });
  if (ok) {
    track('feedback_sent', { page: _fbPageId(), mood: _fbState.mood || 0, prompt: _fbState.prompt ? 1 : 0 });
    closeFeedback();
    if (typeof showToast === 'function') showToast(T('feedback_thanks'));
  } else {
    _fbState.sending = false;
    if (btn) { btn.disabled = false; btn.textContent = T('feedback_send'); }
    _fbShowErr(T('feedback_error'));
  }
}

/* Pure: should /today auto-prompt for feedback now? True once the learner has completed
   FB_PROMPT_AFTER_DAYS days (each writes a planner_data.dayStats entry) and hasn't been prompted
   yet. The caller sets planner.feedbackPrompted + persists, so it fires at most once. */
function feedbackShouldPrompt(planner) {
  if (!planner || typeof planner !== 'object' || planner.feedbackPrompted) return false;
  const ds = planner.dayStats;
  const done = (ds && typeof ds === 'object') ? Object.keys(ds).length : 0;
  return done >= FB_PROMPT_AFTER_DAYS;
}

/* Dual-mode: browser global script (functions above are global for inline onclick) + CommonJS so
   tests can require the pure helpers without the DOM. Mirrors stats.js's export shape. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { feedbackShouldPrompt, feedbackButton, submitFeedbackToCloud, FB_PROMPT_AFTER_DAYS, FB_MAX_LEN };
}

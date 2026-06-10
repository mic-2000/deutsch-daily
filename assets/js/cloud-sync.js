/* cloud-sync.js — shared Supabase session + progress sync.
   Requires: supabase.js (sb), i18n.js (setLang), utils.js (showToast, T).
   The page must define these globals before initApp() runs:
     CLOUD_FIELD        — column on `progress` ('planner_data' | 'vocab_data' | 'verbs_data')
     applyCloudData(d)  — apply the loaded field payload to state
     getCloudPayload()  — return the object to persist into CLOUD_FIELD
     render()           — re-render the UI

   Cloud is the source of truth. Writes are still made directly to Supabase; if a write FAILS
   (offline / transient error) it is parked in an offline OUTBOX (localStorage['cloud_outbox'])
   and replayed when connectivity returns (the `online` event, tab refocus, or next init). The
   outbox is a transient retry buffer — NOT a progress store — and is emptied as soon as its
   queued writes succeed. See the OUTBOX section below.
*/
let currentUser = null;

/* ==========================================================================
   OFFLINE OUTBOX — replay failed writes when back online.
   Shape: { uid, progress?: {user_id, <columns…>, updated_at},
            lessons?: { "<day>": {op:'upsert', messages} | {op:'delete'} } }
   Progress upserts are idempotent (PK = user_id) so partial field-updates MERGE into one row;
   lesson writes dedupe per day (latest op wins).
   ========================================================================== */
const OUTBOX_KEY = 'cloud_outbox';
let _offlineNotified = false;

function _readOutbox() { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY)) || {}; } catch (e) { return {}; } }
function _writeOutbox(o) {
  const empty = !o || (!o.progress && !(o.lessons && Object.keys(o.lessons).length));
  if (empty) { localStorage.removeItem(OUTBOX_KEY); return; }
  o.uid = currentUser && currentUser.id;
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(o));
}

function _queueProgress(fields) {
  const o = _readOutbox();
  o.progress = Object.assign({ user_id: currentUser.id }, o.progress, fields, { updated_at: new Date().toISOString() });
  _writeOutbox(o);
  _notifyOffline();
}
function _queueLesson(day, entry) {
  const o = _readOutbox();
  o.lessons = o.lessons || {};
  o.lessons[day] = entry; // latest write per day wins (upsert or delete)
  _writeOutbox(o);
  _notifyOffline();
}
function _notifyOffline() {
  if (_offlineNotified) return;
  _offlineNotified = true;
  if (typeof showToast === 'function' && typeof T === 'function') showToast(T('toast_offline_saved'));
}

/* Replay queued writes. Safe to call anytime; a no-op when the outbox is empty. */
async function flushOutbox() {
  if (!currentUser) return;
  const o = _readOutbox();
  if (o.uid && o.uid !== currentUser.id) { localStorage.removeItem(OUTBOX_KEY); return; } // foreign/stale queue
  if (!o.progress && !(o.lessons && Object.keys(o.lessons).length)) return;
  let allOk = true;

  if (o.progress) {
    try {
      const row = Object.assign({}, o.progress, { user_id: currentUser.id });
      const { error } = await sb.from('progress').upsert(row, { onConflict: 'user_id' });
      if (error) throw error;
      delete o.progress;
    } catch (e) { allOk = false; }
  }
  if (o.lessons) {
    for (const day of Object.keys(o.lessons)) {
      const entry = o.lessons[day];
      try {
        if (entry.op === 'delete') {
          const { error } = await sb.from('lessons').delete().eq('user_id', currentUser.id).eq('day', +day);
          if (error) throw error;
        } else {
          const { error } = await sb.from('lessons').upsert({
            user_id: currentUser.id, day: +day, messages: entry.messages, updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,day' });
          if (error) throw error;
        }
        delete o.lessons[day];
      } catch (e) { allOk = false; }
    }
    if (o.lessons && !Object.keys(o.lessons).length) delete o.lessons;
  }
  _writeOutbox(o);

  if (allOk && _offlineNotified) {
    _offlineNotified = false;
    if (typeof showToast === 'function' && typeof T === 'function') showToast(T('toast_sync_restored'));
  }
}

/* Try a live progress upsert; on failure, queue the field(s) for replay. */
async function _pushProgress(fields) {
  if (!currentUser) return;
  try {
    const row = Object.assign({ user_id: currentUser.id }, fields, { updated_at: new Date().toISOString() });
    const { error } = await sb.from('progress').upsert(row, { onConflict: 'user_id' });
    if (error) throw error;
    if (_offlineNotified) flushOutbox(); // back online mid-session — drain anything queued earlier
  } catch (e) {
    _queueProgress(fields);
  }
}

async function initApp() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    localStorage.setItem('auth_redirect', location.href);
    location.href = 'index.html';
    return;
  }
  currentUser = session.user;
  flushOutbox(); // replay anything stranded from a previous offline session (or clear a foreign queue)

  // Resolve language + progress from the cloud BEFORE the first render, so the page renders once
  // in the correct language (no flash) and only that one locale is fetched.
  let lang = getLang();
  try {
    const { data } = await sb.from('progress')
      .select(CLOUD_FIELD + ', lang')
      .eq('user_id', session.user.id)
      .single();
    const payload = data && data[CLOUD_FIELD];
    if (payload && Object.keys(payload).length) applyCloudData(payload); // skip empty default ({}::jsonb)
    if (data && data.lang && LANG_NAMES[data.lang]) lang = data.lang;
  } catch(e) { /* offline or no record yet */ }

  // Load theme (separate query so a missing column can't break the main load)
  try {
    const { data } = await sb.from('progress')
      .select('theme')
      .eq('user_id', session.user.id)
      .single();
    if (data && data.theme && typeof setTheme === 'function') setTheme(data.theme, true);
  } catch(e) { /* theme column may not exist yet */ }

  // Shared verb mastery (cross-cutting: vocabulary ↔ verb trainer). Loaded if the page consumes it
  // via applyVerbProgress(d). The verbs page loads it through its own CLOUD_FIELD instead.
  if (typeof applyVerbProgress === 'function') {
    try {
      const { data } = await sb.from('progress').select('verbs_data').eq('user_id', session.user.id).single();
      if (data && data.verbs_data) applyVerbProgress(data.verbs_data);
    } catch(e) { /* verbs_data column may not exist yet */ }
  }

  // Account-saved Gemini key (opt-in, planner only). Adopt it into localStorage so this device
  // works without re-pasting. Separate query so a missing column can't break the main load.
  if (typeof applyCloudKey === 'function') {
    try {
      const { data } = await sb.from('progress').select('gemini_key').eq('user_id', session.user.id).single();
      if (data) applyCloudKey(data.gemini_key || '');
    } catch(e) { /* gemini_key column may not exist yet */ }
  }

  // setLang(skipSave) loads the resolved locale, syncs it into localStorage, and renders once.
  if (lang !== getLang()) { await setLang(lang, true); }
  else { await loadLocale(lang).catch(()=>{}); render(); }
}

async function saveToCloud()        { return _pushProgress({ [CLOUD_FIELD]: getCloudPayload() }); }
async function saveLangToCloud(code) { return _pushProgress({ lang: code }); }
async function saveThemeToCloud(theme) { return _pushProgress({ theme: theme }); }
// Persist the shared verb-mastery store (verbs_data). Used by the vocabulary page, which writes
// verb progress here so it stays in sync with the verb trainer (which owns verbs_data directly).
async function saveVerbsToCloud(payload) { return _pushProgress({ verbs_data: payload }); }
// Persist the user's Gemini key on their account (opt-in, planner only). Pass '' to clear it.
async function saveGeminiKeyToCloud(key) { return _pushProgress({ gemini_key: key || null }); }

async function logout() {
  await sb.auth.signOut();
  location.href = '/';
}

/* ==========================================================================
   LESSONS — per-day AI chat history (table `lessons`).
   Row key: (user_id, day). day < 0 stores the weekly summary for week (-day).
   ========================================================================== */
async function loadLessonsFromCloud() {
  if (!currentUser) return [];
  try {
    const { data } = await sb.from('lessons')
      .select('day, messages')
      .eq('user_id', currentUser.id);
    return data || [];
  } catch(e) { return []; }
}

async function saveLessonToCloud(day, messages) {
  if (!currentUser) return;
  try {
    const { error } = await sb.from('lessons').upsert({
      user_id: currentUser.id, day: day, messages: messages, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,day' });
    if (error) throw error;
    if (_offlineNotified) flushOutbox();
  } catch(e) { _queueLesson(day, { op: 'upsert', messages: messages }); }
}

async function deleteLessonFromCloud(day) {
  if (!currentUser) return;
  try {
    const { error } = await sb.from('lessons').delete().eq('user_id', currentUser.id).eq('day', day);
    if (error) throw error;
    if (_offlineNotified) flushOutbox();
  } catch(e) { _queueLesson(day, { op: 'delete' }); }
}

/* Replay the outbox as soon as the browser reports connectivity / the tab is refocused. */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', function () { flushOutbox(); });
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () { if (!document.hidden) flushOutbox(); });
  }
}

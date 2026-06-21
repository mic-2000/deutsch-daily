/* cloud-sync.js — shared Supabase session + progress sync.
   Requires: supabase.js (sb), i18n.js (setLang), utils.js (showToast, T).
   The page must define these globals before initApp() runs:
     CLOUD_FIELD        — column on `progress` ('planner_data' | 'vocab_data' | 'verbs_data').
                          OPTIONAL: a page that owns a separate table (e.g. collections.html) may
                          omit it (and getCloudPayload/applyCloudData) and just define render().
     applyCloudData(d)  — apply the loaded field payload to state   (omit if no CLOUD_FIELD)
     getCloudPayload()  — return the object to persist into CLOUD_FIELD  (omit if no CLOUD_FIELD)
     render()           — re-render the UI

   Cloud is the source of truth. Writes are still made directly to Supabase; if a write FAILS
   (offline / transient error) it is parked in an offline OUTBOX (localStorage['cloud_outbox'])
   and replayed when connectivity returns (the `online` event, tab refocus, or next init). The
   outbox is a transient retry buffer — NOT a progress store — and is emptied as soon as its
   queued writes succeed. See the OUTBOX section below.

   Symmetrically, the last successful cloud READ is mirrored into localStorage['cloud_cache'] so a
   COLD start with no network can still show the user's data (the outbox only protects writes). It
   is likewise a transient mirror — NOT a source of truth: every successful read/write overwrites
   it, and it is wiped on logout or when a different user signs in. See the READ MIRROR section.
*/
let currentUser = null;

/* ==========================================================================
   OFFLINE OUTBOX — replay failed writes when back online.
   Shape: { uid, progress?: {user_id, <columns…>, updated_at},
            lessons?:     { "<day>": {op:'upsert', messages} | {op:'delete'} },
            collections?: { "<id>":  {op:'upsert', row}      | {op:'delete'} } }
   Progress upserts are idempotent (PK = user_id) so partial field-updates MERGE into one row;
   lesson writes dedupe per day; collection upserts MERGE row columns per id (so a queued
   create + later mastery update collapse into one correct row). Latest op wins.
   ========================================================================== */
const OUTBOX_KEY = 'cloud_outbox';
let _offlineNotified = false;

function _outboxEmpty(o) {
  return !o || (!o.progress
    && !(o.lessons && Object.keys(o.lessons).length)
    && !(o.collections && Object.keys(o.collections).length));
}
function _readOutbox() { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY)) || {}; } catch (e) { return {}; } }
function _writeOutbox(o) {
  if (_outboxEmpty(o)) { localStorage.removeItem(OUTBOX_KEY); return; }
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
function _queueCollection(id, entry) {
  const o = _readOutbox();
  o.collections = o.collections || {};
  if (entry.op === 'delete') {
    o.collections[id] = { op: 'delete' };
  } else { // merge row columns onto any prior pending upsert (create + later mastery → one row)
    const prev = o.collections[id];
    const prevRow = (prev && prev.op === 'upsert') ? prev.row : {};
    o.collections[id] = { op: 'upsert', row: Object.assign({}, prevRow, entry.row) };
  }
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
  if (_outboxEmpty(o)) return;
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
  if (o.collections) {
    for (const id of Object.keys(o.collections)) {
      const entry = o.collections[id];
      try {
        if (entry.op === 'delete') {
          const { error } = await sb.from('collections').delete().eq('id', id).eq('user_id', currentUser.id);
          if (error) throw error;
        } else {
          const row = Object.assign({}, entry.row, { id: id, user_id: currentUser.id, updated_at: new Date().toISOString() });
          const { error } = await sb.from('collections').upsert(row, { onConflict: 'id' });
          if (error) throw error;
        }
        delete o.collections[id];
      } catch (e) { allOk = false; }
    }
    if (o.collections && !Object.keys(o.collections).length) delete o.collections;
  }
  _writeOutbox(o);

  if (allOk && _offlineNotified) {
    _offlineNotified = false;
    if (typeof showToast === 'function' && typeof T === 'function') showToast(T('toast_sync_restored'));
  }
}

/* ==========================================================================
   OFFLINE READ MIRROR — replay the last successful cloud READ on a cold offline start.
   The outbox protects writes; this protects reads. Shape: { uid, progress:{<columns>},
   lessons:[…], collections:[…] }. NOT a source of truth — overwritten by every successful
   read/write, scoped to the signed-in user, and cleared on logout / foreign user (clearCloudCache).
   ========================================================================== */
const CACHE_KEY = 'cloud_cache';
function _readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; } }
function _ownCache() { // the cache for the current user, or {} if empty / belongs to someone else
  const c = _readCache();
  return (currentUser && c.uid === currentUser.id) ? c : {};
}
function _cacheWrite(patch) {
  if (!currentUser) return;
  const c = Object.assign(_ownCache(), patch, { uid: currentUser.id });
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) { /* quota — the mirror is best-effort */ }
}
function _cacheProgress(fields) { _cacheWrite({ progress: Object.assign({}, _ownCache().progress, fields) }); }
function clearCloudCache() { localStorage.removeItem(CACHE_KEY); }

/* Try a live progress upsert; on failure, queue the field(s) for replay. */
async function _pushProgress(fields) {
  if (!currentUser) return;
  try {
    const row = Object.assign({ user_id: currentUser.id }, fields, { updated_at: new Date().toISOString() });
    const { error } = await sb.from('progress').upsert(row, { onConflict: 'user_id' });
    if (error) throw error;
    _cacheProgress(fields); // keep the offline read mirror current with this write
    if (_offlineNotified) flushOutbox(); // back online mid-session — drain anything queued earlier
  } catch (e) {
    _queueProgress(fields);
  }
}

async function initApp() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    localStorage.setItem('auth_redirect', location.href);
    location.href = '/login';
    return;
  }
  currentUser = session.user;
  flushOutbox(); // replay anything stranded from a previous offline session (or clear a foreign queue)
  { const _c = _readCache(); if (_c.uid && _c.uid !== currentUser.id) clearCloudCache(); } // drop a foreign read mirror

  // Resolve language + progress from the cloud BEFORE the first render, so the page renders once
  // in the correct language (no flash) and only that one locale is fetched.
  let lang = getLang();
  const hasField = (typeof CLOUD_FIELD !== 'undefined' && CLOUD_FIELD); // a table-only page (collections) has none
  try {
    const { data, error } = await sb.from('progress')
      .select((hasField ? CLOUD_FIELD + ', ' : '') + 'lang')
      .eq('user_id', session.user.id)
      .single();
    if (error) throw error;
    if (hasField && typeof applyCloudData === 'function') {
      const payload = data && data[CLOUD_FIELD];
      if (payload && Object.keys(payload).length) applyCloudData(payload); // skip empty default ({}::jsonb)
    }
    if (data && data.lang && LANG_NAMES[data.lang]) lang = data.lang;
    if (data) _cacheProgress(hasField ? { [CLOUD_FIELD]: data[CLOUD_FIELD], lang: data.lang } : { lang: data.lang });
  } catch(e) { // offline (or no record yet) — fall back to the last cached read
    const p = _ownCache().progress;
    if (p) {
      if (hasField && typeof applyCloudData === 'function' && p[CLOUD_FIELD] && Object.keys(p[CLOUD_FIELD]).length) applyCloudData(p[CLOUD_FIELD]);
      if (p.lang && LANG_NAMES[p.lang]) lang = p.lang;
    }
  }

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
      const { data, error } = await sb.from('progress').select('verbs_data').eq('user_id', session.user.id).single();
      if (error) throw error;
      if (data && data.verbs_data) { applyVerbProgress(data.verbs_data); _cacheProgress({ verbs_data: data.verbs_data }); }
    } catch(e) { // offline (or column missing) — restore the mirrored verb mastery
      const p = _ownCache().progress;
      if (p && p.verbs_data) applyVerbProgress(p.verbs_data);
    }
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

async function saveToCloud()        { if (typeof CLOUD_FIELD === 'undefined' || !CLOUD_FIELD) return; return _pushProgress({ [CLOUD_FIELD]: getCloudPayload() }); }
async function saveLangToCloud(code) { return _pushProgress({ lang: code }); }
async function saveThemeToCloud(theme) { return _pushProgress({ theme: theme }); }
// Persist the shared verb-mastery store (verbs_data). Used by the vocabulary page, which writes
// verb progress here so it stays in sync with the verb trainer (which owns verbs_data directly).
async function saveVerbsToCloud(payload) { return _pushProgress({ verbs_data: payload }); }
// Persist the user's Gemini key on their account (opt-in, planner only). Pass '' to clear it.
async function saveGeminiKeyToCloud(key) { return _pushProgress({ gemini_key: key || null }); }

async function logout() {
  await sb.auth.signOut();
  clearCloudCache(); // the mirror is per-user — don't leave it for the next sign-in
  location.href = '/';
}

/* ==========================================================================
   LESSONS — per-day AI chat history (table `lessons`).
   Row key: (user_id, day). day < 0 stores the weekly summary for week (-day).
   ========================================================================== */
async function loadLessonsFromCloud() {
  if (!currentUser) return [];
  try {
    const { data, error } = await sb.from('lessons')
      .select('day, messages')
      .eq('user_id', currentUser.id);
    if (error) throw error;
    _cacheWrite({ lessons: data || [] });
    return data || [];
  } catch(e) { return _ownCache().lessons || []; } // offline — last cached lessons
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

/* ==========================================================================
   COLLECTIONS — user-supplied word sets (table `collections`, one row per set).
   ids are client-generated (crypto.randomUUID). `words` is rewritten only on edit;
   training answers go through saveCollectionMastery (writes only the `mastery` column).
   ========================================================================== */
async function loadCollectionsFromCloud() {
  if (!currentUser) return [];
  try {
    const { data, error } = await sb.from('collections')
      .select('id, name, words, mastery, created_at, updated_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    _cacheWrite({ collections: data || [] });
    return data || [];
  } catch(e) { return _ownCache().collections || []; } // offline — last cached collections
}

async function saveCollectionToCloud(c) {
  if (!currentUser || !c || !c.id) return;
  const row = { id: c.id, user_id: currentUser.id, name: c.name, words: c.words || [], mastery: c.mastery || {}, updated_at: new Date().toISOString() };
  try {
    const { error } = await sb.from('collections').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    if (_offlineNotified) flushOutbox();
  } catch(e) { _queueCollection(c.id, { op: 'upsert', row: { name: row.name, words: row.words, mastery: row.mastery } }); }
}

/* Hot path: persist only the mastery column after a training answer (leaves words/name untouched). */
async function saveCollectionMastery(id, mastery) {
  if (!currentUser || !id) return;
  const row = { id: id, user_id: currentUser.id, mastery: mastery || {}, updated_at: new Date().toISOString() };
  try {
    const { error } = await sb.from('collections').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    if (_offlineNotified) flushOutbox();
  } catch(e) { _queueCollection(id, { op: 'upsert', row: { mastery: row.mastery } }); }
}

async function deleteCollectionFromCloud(id) {
  if (!currentUser || !id) return;
  try {
    const { error } = await sb.from('collections').delete().eq('id', id).eq('user_id', currentUser.id);
    if (error) throw error;
    if (_offlineNotified) flushOutbox();
  } catch(e) { _queueCollection(id, { op: 'delete' }); }
}

/* Replay the outbox as soon as the browser reports connectivity / the tab is refocused. */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', function () { flushOutbox(); });
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () { if (!document.hidden) flushOutbox(); });
  }
}

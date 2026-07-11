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
// Pending account-deletion timestamp (ISO) or null. Loaded on init and surfaced everywhere so the
// user can still cancel within the 30-day recovery window (see schema.sql purge_deleted_accounts).
let accountDeletionAt = null;
// First-run onboarding answers loaded from the `onboarding` column ({ done, level, goal, minutes,
// hardest, … } or {} ). Set by initApp; read by ai-config (goal/hardest → AI prompt) and /today
// (minutes → session length). A brand-new user (NO progress row) is gated into /welcome by initApp.
let userOnboarding = {};

// Course v2 cutover (curriculum-redesign-2026-07-v2.md §2/§7): a v1 planner_data row (no
// courseVersion, day numbers keyed to the old 24-week order) is reset to a clean v2 course state on
// first v2 load. Old day numbers / completed / lessons are intentionally NOT remapped; safe trainer
// progress (verbs_data by infinitive key, vocab modes/levels) is kept by the trainer pages. These
// constants are local so this module stays independent of course-consts.js (not loaded everywhere).
const COURSE_V2 = 2;
const V2_START_DAY = { A1: 1, A2: 61, B1: 121 }; // first day of each band ((week-1)*5+1, WEEK_FOR_LEVEL {A1:1,A2:13,B1:25})

// Onboarding version. Bumped when the course changes enough that every EXISTING user should re-pick
// their preferences (level/goal/minutes/hardest) — the answers now feed the new 180-day v2 plan.
// saveOnboardingToCloud stamps the current version; initApp re-gates any row whose stamp is below it
// exactly once (after they re-onboard, the fresh stamp lifts the gate). Old rows have no stamp (→ 0),
// so v2 re-onboards everyone once; brand-new accounts are still gated by row absence. (redesign §2.)
const ONBOARDING_VERSION = 2;
function _onboardingOutdated(o) { return (+(o && o.onbVersion) || 0) < ONBOARDING_VERSION; }

// ISO timestamp of this account's v1→v2 reset (planner_data.migratedFrom.at), or null when the
// account was never migrated (native v2 / brand new). Captured from the loaded planner_data on
// initApp — see _noteMigratedAt — and consumed by (a) loadLessonsFromCloud, to hide legacy
// lesson/summary rows keyed to the OLD day/week numbers (redesign §2 Lessons Policy, Gate 6), and
// (b) the vocab engine via courseMigratedAt(), to reset stale index-keyed v1 mastery (§2/§6).
let _migratedAt = null;
function _noteMigratedAt(pd) {
  _migratedAt = (pd && pd.migratedFrom && typeof pd.migratedFrom.at === 'string') ? pd.migratedFrom.at : null;
}
function courseMigratedAt() { return _migratedAt; }

/* Return a clean v2 planner_data for a pre-v2 payload; the same object back if it's already v2. */
function _migratePlannerV2(d) {
  if (!d || d.courseVersion === COURSE_V2) return d;
  const level = (userOnboarding && userOnboarding.level) || 'A1';
  const start = V2_START_DAY[level] || 1;
  return {
    courseVersion: COURSE_V2,
    currentDay: start,
    viewingDay: start,
    completed: {},
    dayStats: {},
    grammarReview: {},
    migratedFrom: {
      courseVersion: 1,
      at: new Date().toISOString(),
      oldCurrentDay: (typeof d.currentDay === 'number') ? d.currentDay : null,
      oldCompletedCount: (d.completed && typeof d.completed === 'object')
        ? Object.keys(d.completed).filter(k => d.completed[k]).length : 0,
    },
  };
}

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
  let isNewUser = false; // confirmed NO progress row (set only on a successful read — never on a network error)
  let needsReonboarding = false; // existing row whose onboarding stamp predates ONBOARDING_VERSION (success-read only)
  const hasField = (typeof CLOUD_FIELD !== 'undefined' && CLOUD_FIELD); // a table-only page (collections) has none
  try {
    // maybeSingle() returns { data: null, error: null } when the row doesn't exist (no throw), which
    // lets us tell a brand-new account (no row) apart from an offline read (error → catch).
    // Field pages whose column ISN'T planner_data also fetch it: the v1→v2 course reset must be
    // visible on every page, so the vocab engine can consult courseMigratedAt() (redesign §2/§6).
    const alsoPlanner = (hasField && CLOUD_FIELD !== 'planner_data') ? 'planner_data, ' : '';
    const { data, error } = await sb.from('progress')
      .select((hasField ? CLOUD_FIELD + ', ' : '') + alsoPlanner + 'lang, onboarding')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    isNewUser = !data;
    userOnboarding = (data && data.onboarding) || {};
    // A returning user whose onboarding predates the current version re-onboards once (see above).
    // Computed only on a successful read, so an offline read (→ catch) can never trap anyone.
    needsReonboarding = !isNewUser && _onboardingOutdated(userOnboarding);
    // Course v2 cutover: reset a pre-v2 planner_data to a clean v2 state and lock it in — on
    // whichever field page the account loads first. An empty ({}::jsonb) row stays untouched:
    // that's a v2-native account, not a migration candidate.
    if (hasField && data && data.planner_data && Object.keys(data.planner_data).length) {
      const migrated = _migratePlannerV2(data.planner_data);
      if (migrated !== data.planner_data) { data.planner_data = migrated; _pushProgress({ planner_data: migrated }); }
      _noteMigratedAt(data.planner_data); // reset timestamp: hides legacy lessons, resets stale v1 vocab
    }
    if (hasField && typeof applyCloudData === 'function') {
      const payload = data && data[CLOUD_FIELD];
      if (payload && Object.keys(payload).length) applyCloudData(payload); // skip empty default ({}::jsonb)
    }
    if (data && data.lang && LANG_NAMES[data.lang]) lang = data.lang;
    if (data) _cacheProgress(hasField ? { [CLOUD_FIELD]: data[CLOUD_FIELD], lang: data.lang } : { lang: data.lang });
  } catch(e) { // offline (or transient error) — fall back to the last cached read; do NOT gate
    const p = _ownCache().progress;
    if (p) {
      if (hasField && typeof applyCloudData === 'function' && p[CLOUD_FIELD] && Object.keys(p[CLOUD_FIELD]).length) applyCloudData(p[CLOUD_FIELD]);
      if (CLOUD_FIELD === 'planner_data' && p[CLOUD_FIELD]) _noteMigratedAt(p[CLOUD_FIELD]); // keep hiding legacy lessons offline too
      if (p.lang && LANG_NAMES[p.lang]) lang = p.lang;
    }
  }

  // Onboarding gate → /welcome. Fires for a brand-new account (no progress row yet) AND, once, for an
  // existing account whose onboarding stamp predates ONBOARDING_VERSION (the v2 course rebuild wants
  // every existing user to re-pick their preferences). Both signals are set only on a successful read,
  // so an offline read (caught above, both flags stay false) never traps anyone. /welcome and /login
  // are excluded → no loop; re-onboarding writes a fresh stamp, so the gate never fires again. (§20.)
  if ((isNewUser || needsReonboarding) && !/welcome|login/.test(location.pathname)) {
    location.href = '/welcome';
    return;
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

  // Pending account-deletion flag (recovery window). Separate query so a missing column can't break
  // the main load. Surfaced on every page so the user is reminded they can still cancel.
  try {
    const { data } = await sb.from('progress').select('deletion_requested_at').eq('user_id', session.user.id).single();
    accountDeletionAt = (data && data.deletion_requested_at) || null;
  } catch(e) { /* deletion_requested_at column may not exist yet */ }
  if (typeof applyDeletionStatus === 'function') applyDeletionStatus(accountDeletionAt);
  if (accountDeletionAt && typeof showToast === 'function' && typeof T === 'function') showToast(T('settings_deletion_pending_toast'));

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
// Persist the vocabulary progress (vocab_data) by itself. Used by the /today wizard, which drives
// the vocab engine without owning vocab_data as its CLOUD_FIELD (it owns planner_data); the /vocab
// page keeps writing vocab_data via saveToCloud + its CLOUD_FIELD.
async function saveVocabToCloud(payload) { return _pushProgress({ vocab_data: payload }); }
// Persist the onboarding answers + completion flag (written by the /welcome wizard). Writing the row
// is what lifts the first-run gate above (the row then exists on the next initApp); stamping the
// current ONBOARDING_VERSION is what lifts the re-onboarding gate (so it fires at most once per bump).
async function saveOnboardingToCloud(payload) { const stamped = Object.assign({}, payload || {}, { onbVersion: ONBOARDING_VERSION }); userOnboarding = stamped; return _pushProgress({ onboarding: stamped }); }
// Persist the user's Gemini key on their account (opt-in, planner only). Pass '' to clear it.
async function saveGeminiKeyToCloud(key) { return _pushProgress({ gemini_key: key || null }); }
// Stamp (ISO string) or clear (null) the account-deletion request. Server-side purge runs 30 days later.
async function saveDeletionRequestToCloud(ts) { accountDeletionAt = ts || null; return _pushProgress({ deletion_requested_at: ts || null }); }

async function logout() {
  await sb.auth.signOut();
  clearCloudCache(); // the mirror is per-user — don't leave it for the next sign-in
  location.href = '/';
}

/* ==========================================================================
   LESSONS — per-day AI chat history (table `lessons`).
   Row key: (user_id, day). day < 0 stores the weekly summary for week (-day).
   ========================================================================== */
/* Course v2 cutover (redesign §2 Lessons Policy, Gate 6): a v1→v2 reset keeps old AI-lesson and
   weekly-summary rows in the DB, but they are keyed to the OLD day/week numbers, so surfacing them
   under the unrelated new days would be wrong. Drop any row written BEFORE the reset
   (updated_at < migratedFrom.at). ISO-8601 strings sort chronologically, so a lexical compare is
   correct. Rows with no updated_at can't be proven legacy, so they're kept; native/never-migrated
   accounts (_migratedAt null) keep everything. */
function _hideLegacyLessons(rows) {
  if (!_migratedAt || !Array.isArray(rows)) return rows;
  return rows.filter(r => !(r && r.updated_at && r.updated_at < _migratedAt));
}

async function loadLessonsFromCloud() {
  if (!currentUser) return [];
  let rows;
  try {
    const { data, error } = await sb.from('lessons')
      .select('day, messages, updated_at')
      .eq('user_id', currentUser.id);
    if (error) throw error;
    _cacheWrite({ lessons: data || [] });
    rows = data || [];
  } catch(e) { rows = _ownCache().lessons || []; } // offline — last cached lessons
  return _hideLegacyLessons(rows);
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

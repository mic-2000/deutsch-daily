/* cloud-sync.js — shared Supabase session + progress sync.
   Requires: supabase.js (sb), i18n.js (setLang).
   The page must define these globals before initApp() runs:
     CLOUD_FIELD        — string column on the `progress` table ('planner_data' | 'vocab_data')
     applyCloudData(d)  — apply the loaded field payload to state
     getCloudPayload()  — return the object to persist into CLOUD_FIELD
     render()           — re-render the UI
*/
let currentUser = null;

async function initApp() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    localStorage.setItem('auth_redirect', location.href);
    location.href = 'index.html';
    return;
  }
  currentUser = session.user;

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

  // setLang(skipSave) loads the resolved locale, syncs it into localStorage, and renders once.
  if (lang !== getLang()) { await setLang(lang, true); }
  else { await loadLocale(lang).catch(()=>{}); render(); }
}

async function saveToCloud() {
  if (!currentUser) return;
  try {
    await sb.from('progress').upsert({
      user_id: currentUser.id,
      [CLOUD_FIELD]: getCloudPayload(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(e) { /* ignore */ }
}

async function saveLangToCloud(code) {
  if (!currentUser) return;
  try {
    await sb.from('progress').upsert({
      user_id: currentUser.id,
      lang: code,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(e) {}
}

async function saveThemeToCloud(theme) {
  if (!currentUser) return;
  try {
    await sb.from('progress').upsert({
      user_id: currentUser.id,
      theme: theme,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(e) {}
}

// Persist the shared verb-mastery store (verbs_data). Used by the vocabulary page, which writes
// verb progress here so it stays in sync with the verb trainer (which owns verbs_data directly).
async function saveVerbsToCloud(payload) {
  if (!currentUser) return;
  try {
    await sb.from('progress').upsert({
      user_id: currentUser.id,
      verbs_data: payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch(e) {}
}

async function logout() {
  await sb.auth.signOut();
  location.href = '/';
}

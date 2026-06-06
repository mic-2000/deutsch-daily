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

  // Load from cloud
  try {
    const { data } = await sb.from('progress')
      .select(CLOUD_FIELD + ', lang')
      .eq('user_id', session.user.id)
      .single();
    const payload = data && data[CLOUD_FIELD];
    if (payload && Object.keys(payload).length) applyCloudData(payload); // skip empty default ({}::jsonb)
    if (data && data.lang) setLang(data.lang, true);
  } catch(e) { /* offline or no record yet */ }

  // Load theme (separate query so a missing column can't break the main load)
  try {
    const { data } = await sb.from('progress')
      .select('theme')
      .eq('user_id', session.user.id)
      .single();
    if (data && data.theme && typeof setTheme === 'function') setTheme(data.theme, true);
  } catch(e) { /* theme column may not exist yet */ }

  render();
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

async function logout() {
  await sb.auth.signOut();
  location.href = '/';
}

/* gemini-key.js — shared key-entry UX (window.GeminiKey).
   One home for: normalising a pasted Gemini key, a live validity check, friendly error messages,
   the "connect your AI tutor" modal, and the save/remove path. The storage helpers
   (_storeGeminiKey / keySynced / _setKeySync / applyCloudKey) live here too and stay GLOBAL so
   cloud-sync.js's `typeof applyCloudKey === 'function'` adoption check and existing call sites keep
   working unchanged.
   Depends on: gemini.js (getGeminiKey), ai-config.js (AI_MODEL_ID), i18n.js (T), utils.js (esc),
   cloud-sync.js (saveGeminiKeyToCloud). Load AFTER those in the page <head>. */

/* ---- key storage (moved out of planner.html / settings.html; kept global) ---- */
function _storeGeminiKey(k){ if(k) localStorage.setItem('gemini_key', k.trim()); else localStorage.removeItem('gemini_key'); }
/* Whether the user opted to keep the key on their account (synced across devices). */
function keySynced(){ return localStorage.getItem('gemini_key_sync') === '1'; }
function _setKeySync(on){ if(on) localStorage.setItem('gemini_key_sync','1'); else localStorage.removeItem('gemini_key_sync'); }
/* Called by cloud-sync.initApp when the account carries a saved key — adopt it locally so this
   device works without re-pasting; clear the synced flag if the account no longer has one. */
function applyCloudKey(key){ if(key){ _storeGeminiKey(key); _setKeySync(true); } else _setKeySync(false); }

window.GeminiKey = (function(){
  const GEMINI_HOST = 'https://generativelanguage.googleapis.com';
  function _T(k, ...a){ return (typeof T === 'function') ? T(k, ...a) : k; }
  function _esc(s){ return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }

  function get(){ return (typeof getGeminiKey === 'function') ? getGeminiKey() : (localStorage.getItem('gemini_key') || ''); }

  /* Clean up the most common paste mistakes: surrounding quotes/whitespace, and extra text or a
     full AI Studio URL pasted around the key — pull out the bare key token when present. Prefix-
     agnostic: works for AIza…, AQ.… and any future Google key format. */
  function normalize(raw){
    let s = String(raw == null ? '' : raw).trim();
    if(!s) return '';
    s = s.replace(/^['"`]+|['"`]+$/g, '').trim();
    if(/\s/.test(s)){
      // Pasted with surrounding text/URL — grab the longest key-shaped token.
      const tokens = s.match(/[A-Za-z0-9._-]{20,}/g);
      if(tokens && tokens.length) return tokens.sort((a, b) => b.length - a.length)[0];
    }
    return s;
  }

  /* Light format gate — catches obviously-wrong input (empty, too short, contains spaces) before we
     spend a network round-trip. Prefix-agnostic on purpose: the real authority is validate(), so we
     never reject a valid key just because of its prefix or exact length. */
  function looksValid(key){ return /^[A-Za-z0-9._-]{20,}$/.test(key || ''); }

  /* Live check: a minimal generateContent ping (1-char prompt, maxOutputTokens:1). Uses its own
     fetch because geminiRequest() takes no generationConfig. The endpoint is already proven
     CORS-safe (every real lesson uses it) and costs ~nothing.
     → { ok:true } | { ok:false, reason:'format'|'invalid'|'network' } */
  async function validate(key){
    if(!looksValid(key)) return { ok:false, reason:'format' };
    const model = (typeof AI_MODEL_ID !== 'undefined') ? AI_MODEL_ID : 'gemini-3.1-flash-lite';
    try {
      const res = await fetch(
        GEMINI_HOST + '/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key),
        { method:'POST', headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ contents:[{ role:'user', parts:[{ text:'.' }] }], generationConfig:{ maxOutputTokens:1 } }) }
      );
      const data = await res.json().catch(() => ({}));
      if(res.ok && !(data && data.error)) return { ok:true };
      const err = data && data.error;
      const status = (err && err.status) || '';
      // A real key that's merely rate-limited right now still authenticates → accept it.
      if(status === 'RESOURCE_EXHAUSTED' || res.status === 429) return { ok:true };
      return { ok:false, reason:'invalid' };
    } catch(e){
      return { ok:false, reason:'network' };
    }
  }

  /* Map an API/network error thrown by geminiRequest() to actionable localized copy. */
  function friendlyError(err){
    const msg = (err && (err.message || err.toString())) || '';
    const lc = msg.toLowerCase();
    if((err instanceof TypeError) || lc.includes('failed to fetch') || lc.includes('networkerror') || lc.includes('load failed'))
      return _T('ai_err_network');
    if(lc.includes('api_key_invalid') || lc.includes('api key not valid') || lc.includes('not valid') || lc.includes('permission_denied'))
      return _T('ai_err_badkey');
    if(lc.includes('resource_exhausted') || lc.includes('quota') || lc.includes('429') || lc.includes('rate limit'))
      return _T('ai_err_quota');
    return msg || _T('ai_error');
  }

  /* Store + cloud-sync the key without re-validating (used by remove + the offline path). */
  function _commit(key, wantSync){
    const wasSynced = keySynced();
    _storeGeminiKey(key);
    _setKeySync(!!key && !!wantSync);
    if(typeof saveGeminiKeyToCloud === 'function'){
      if(key && wantSync) saveGeminiKeyToCloud(key);
      else if(wasSynced) saveGeminiKeyToCloud('');
    }
  }

  /* normalize → format gate → validate → store. On a network failure we save anyway (defensive:
     the key is probably fine; real calls will recheck online) and flag warn:'network'. On a bad
     format/invalid key nothing is stored, so the caller keeps the dialog open and shows the reason.
     An empty key is treated as remove. */
  async function save(rawKey, wantSync){
    const key = normalize(rawKey);
    if(!key){ remove(); return { ok:true, removed:true }; }
    if(!looksValid(key)) return { ok:false, reason:'format' };
    const v = await validate(key);
    if(v.ok){ _commit(key, wantSync); if(typeof track === 'function') track('ai_key_added', { synced: !!wantSync }); return { ok:true, key }; }
    if(v.reason === 'network'){ _commit(key, wantSync); if(typeof track === 'function') track('ai_key_added', { synced: !!wantSync }); return { ok:true, key, warn:'network' }; }
    return { ok:false, reason: v.reason };
  }

  function remove(){ _commit('', false); }

  /* ---- modal ---- */
  let _opts = { withRemove:true, onClose:null, onSaved:null };

  /* Returns the overlay markup. opts.onClose / opts.onSaved are stashed and fired by the global
     GeminiKey.* handlers the buttons call (inline onclick can't capture a closure). */
  function renderModal(opts){
    _opts = Object.assign({ withRemove:true, onClose:null, onSaved:null }, opts || {});
    const cur = _esc(get());
    return `<div class="ai-key-bg" onclick="if(event.target===this)GeminiKey.close()">
  <div class="ai-key-box">
    <h3>${_T('ai_key_title')}</h3>
    <p>${_T('ai_key_desc')}</p>
    <input id="geminiKeyInput" class="ai-key-input" type="password"
      placeholder="${_T('ai_key_placeholder')}" value="${cur}"
      onkeydown="if(event.key==='Enter')GeminiKey.submit()">
    <div class="ai-key-status" id="geminiKeyStatus"></div>
    <label class="ai-key-sync">
      <input type="checkbox" id="geminiKeySync" ${keySynced() ? 'checked' : ''}>
      <span>${_T('ai_key_sync_label')}</span>
    </label>
    <div class="ai-key-sync-hint">${_T('ai_key_sync_hint')}</div>
    <div class="ai-key-actions">
      <button class="btn done" id="geminiKeySave" onclick="GeminiKey.submit()">${_T('ai_key_save')}</button>
      <button class="btn" onclick="GeminiKey.close()">${_T('ai_key_cancel')}</button>
      ${(_opts.withRemove && get()) ? `<button class="btn" style="margin-left:auto;color:var(--die)" onclick="GeminiKey.removeKey()">${_T('ai_key_remove')}</button>` : ''}
    </div>
  </div>
</div>`;
  }

  function _status(cls, text){
    const el = document.getElementById('geminiKeyStatus');
    if(el){ el.className = 'ai-key-status ' + cls; el.textContent = text; }
  }

  /* Modal Save: show "checking…", validate+store, then ✓ / ✗ inline. On success fire onSaved after a
     short beat so the ✓ is visible; on a format/invalid key keep the dialog open with the reason. */
  async function submit(){
    const inp = document.getElementById('geminiKeyInput');
    const syncEl = document.getElementById('geminiKeySync');
    const saveBtn = document.getElementById('geminiKeySave');
    const wantSync = !!(syncEl && syncEl.checked);
    _status('warn', _T('ai_key_checking'));
    if(saveBtn) saveBtn.disabled = true;
    const r = await save(inp ? inp.value : '', wantSync);
    if(saveBtn) saveBtn.disabled = false;
    if(r.ok){
      _status('ok', r.warn === 'network' ? _T('ai_key_offline') : _T('ai_key_ok'));
      const cb = _opts && _opts.onSaved;
      setTimeout(() => { if(typeof cb === 'function') cb(r); }, 650);
      return;
    }
    _status('err', _T(r.reason === 'format' ? 'ai_key_format' : 'ai_key_invalid'));
  }

  function close(){ const cb = _opts && _opts.onClose; if(typeof cb === 'function') cb(); }
  function removeKey(){ remove(); const cb = _opts && (_opts.onSaved || _opts.onClose); if(typeof cb === 'function') cb({ ok:true, removed:true }); }

  return { get, normalize, looksValid, validate, friendlyError, save, remove, renderModal, submit, close, removeKey };
})();

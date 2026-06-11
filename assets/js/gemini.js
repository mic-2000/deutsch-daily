/* gemini.js — minimal shared Gemini client (used by planner.html AI chat + collections.html
   AI translation). The user-provided key lives in localStorage['gemini_key'] (never required to
   reach our server — requests go straight from the browser to Google). Key-management UI / cloud
   sync of the key stays in planner.html; this file is just the read + request. */

function getGeminiKey() { return localStorage.getItem('gemini_key') || ''; }

/* One chat-style request. `messages` is [{ role:'user'|'model', text }]. Returns reply text; throws
   on API error. Model ids come from ai-config.js (AI_MODEL_ID / AI_PRO_MODEL_ID). */
async function geminiRequest(model, systemPrompt, messages) {
  const key = getGeminiKey();
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      })
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API error');
  return (data.candidates && data.candidates[0] && data.candidates[0].content &&
          data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text) || '';
}

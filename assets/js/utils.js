/* utils.js — small shared helpers (HTML escaping, toasts, German text compare, confirm staging). */
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

let _toastTimer;
function showToast(msg, duration){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration || 2600);
}

/* Normalize a German answer for comparison: lowercase, trim, fold umlauts/ß, collapse spaces. */
function normalize(s){ return String(s).toLowerCase().trim().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/\s+/g,' '); }

/* Character-level diff (LCS). Highlights extra/wrong chars in `a` (diff-bad) and missing chars
   in `b` (diff-miss). Matching is case-insensitive so capitalization isn't flagged as an error. */
function diffChars(a, b){
  const A = [...a], B = [...b];
  const al = A.map(c=>c.toLowerCase()), bl = B.map(c=>c.toLowerCase());
  const m = A.length, n = B.length;
  const dp = Array.from({length:m+1}, ()=>new Array(n+1).fill(0));
  for (let i=m-1;i>=0;i--) for (let j=n-1;j>=0;j--){
    dp[i][j] = al[i]===bl[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j], dp[i][j+1]);
  }
  let i=0, j=0, aHtml='', bHtml='';
  while (i<m && j<n){
    if (al[i]===bl[j]){ aHtml+=esc(A[i]); bHtml+=esc(B[j]); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]){ aHtml+=`<span class="diff-bad">${esc(A[i])}</span>`; i++; }
    else { bHtml+=`<span class="diff-miss">${esc(B[j])}</span>`; j++; }
  }
  while (i<m){ aHtml+=`<span class="diff-bad">${esc(A[i])}</span>`; i++; }
  while (j<n){ bHtml+=`<span class="diff-miss">${esc(B[j])}</span>`; j++; }
  return { aHtml, bHtml };
}

/* In-page confirm staging (never the native confirm()). Pages stage a pending action on their
   own `state.confirm`, then supply their own confirmYes handler; these centralize the shape. */
function stageConfirm(state, message, action){ state.confirm = { message, action }; }
function clearConfirm(state){ state.confirm = null; }

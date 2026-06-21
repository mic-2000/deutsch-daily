/* verbs-trainer.js — the irregular-verb trainer ENGINE, extracted from views/verbs.html so it can
   be reused by both the standalone /verbs page and the /today daily-flow wizard.

   Single namespace object `window.VerbsTrainer`. Verb forms live in data/verbs.js (global VERBS);
   glosses in locales/<lang>.verbs[key]. Mastery is keyed by the verb key (Infinitiv, reflexive →
   "sich <inf>") in the shared `verbs_data` cloud column — the SAME store the vocab trainer writes.
   Template `onclick`/`onkeydown` strings reference the namespace (`VerbsTrainer.answer(true)`) so it
   can coexist with VocabTrainer on /today without colliding on global names.

   Host wiring via init():
     VerbsTrainer.init({
       embedded,       // false on /verbs (home + sessions); true on /today (sessions only)
       onSave,         // persist verbs_data (default: global saveToCloud)
       onSessionEnd,   // embedded only: called when a session is finished/closed → advance flow
     });

   On /today the two engines must share ONE mastery map (verbs_data.mastery). The host calls
   VerbsTrainer.setMasteryStore(map) and VocabTrainer.setVerbStore({mastery: map}) with the same
   object. Depends on globals: T/getLang (i18n), esc/showToast/normalize/diffChars/stageConfirm/
   clearConfirm (utils), leitner* / MAX_BOX (leitner), speak (speech), VERBS (data). */
window.VerbsTrainer = (function () {
  'use strict';

  let cfg = { embedded: false, onSave: null, onSessionEnd: null };
  function init(opts) { Object.assign(cfg, opts || {}); }

  function appEl() { return document.getElementById('app'); }

  /* ---------- helpers ---------- */
  function verbGloss(key) {
    const loc = window['LOCALE_' + getLang().toUpperCase()];
    const v = loc && loc.verbs && loc.verbs[key];
    if (v !== undefined && v !== '') return v;
    const en = window.LOCALE_EN && window.LOCALE_EN.verbs;
    return (en && en[key]) || '';
  }
  function auxHtml(aux) { return `<span class="aux ${aux}">${aux}</span>`; }
  function triadHtml(key) { const e = VERBS[key]; return `<span class="t-inf">${esc(key)}</span> <span class="t-sep">·</span> <span class="t-praet">${esc(e.praet)}</span> <span class="t-sep">·</span> ${auxHtml(e.aux)} ${esc(e.pp)}`; }

  /* ---------- speech (shared core in assets/js/speech.js) ---------- */
  function speakVerb(key, btn) { const e = VERBS[key]; speak(`${key}, ${e.praet}, ${e.aux} ${e.pp}`, btn, 0.9); }

  /* ==========================================================================
     LEITNER (box model in assets/js/leitner.js; keyed by verb key)
     ========================================================================== */
  function getCard(k) { return state.mastery[k] || leitnerBlank(); }
  function isDue(k, now) { return leitnerIsDue(state.mastery[k], now); }
  function isSeen(k) { return leitnerIsSeen(state.mastery[k]); }
  function cardBox(k) { return leitnerBoxOf(state.mastery[k]); }
  function isMastered(k) { return leitnerIsMastered(state.mastery[k]); }
  function updateCard(k, correct) {
    const c = getCard(k);
    leitnerApply(c, correct);
    state.mastery[k] = c; save();
  }

  /* ==========================================================================
     STATE + CLOUD
     ========================================================================== */
  let state = { mastery: {}, modes: { triad: true, cloze: true, table: true }, filter: 'all', sel: {}, session: null, confirm: null };
  function serialize() { return { app: 'deutsch-verbtrainer', version: 1, savedAt: new Date().toISOString(), modes: state.modes, sel: state.sel, mastery: state.mastery }; }
  function applyData(d) { if (!d || typeof d !== 'object') return; if (d.mastery && typeof d.mastery === 'object') state.mastery = d.mastery; if (d.modes) state.modes = Object.assign(state.modes, d.modes); if (d.sel && typeof d.sel === 'object') state.sel = d.sel; }
  function setMasteryStore(map) { if (map && typeof map === 'object') state.mastery = map; }   // /today: share verbs_data.mastery with VocabTrainer
  function save() { if (cfg.onSave) cfg.onSave(); else if (typeof saveToCloud === 'function') saveToCloud(); }

  /* ---------- reset (in-page confirm, never native confirm()) ---------- */
  function resetVerb(k) { askConfirm(T('confirm_reset_word'), { key: k }); }
  function resetAll() { askConfirm(T('confirm_reset_all'), 'all'); }
  function askConfirm(message, action) { stageConfirm(state, message, action); render(); }
  function confirmNo() { clearConfirm(state); render(); }
  function confirmYes() {
    const a = state.confirm && state.confirm.action; clearConfirm(state);
    if (a === 'all') { state.mastery = {}; save(); render(); showToast(T('toast_progress_reset')); }
    else if (a && typeof a === 'object') { delete state.mastery[a.key]; save(); render(); showToast(T('toast_word_reset')); }
    else render();
  }

  /* ==========================================================================
     MODES
     ========================================================================== */
  function availableModes(key) { const e = VERBS[key]; const m = ['triad']; if (!e.refl) { m.push('cloze', 'table'); } return m; }
  function pickMode(key) {
    const avail = availableModes(key).filter(m => state.modes[m]);
    if (!avail.length) return 'triad';
    const box = cardBox(key);
    const want = box >= 4 ? 'table' : box >= 2 ? 'cloze' : 'triad';
    if (avail.includes(want)) return want;
    return avail.includes('triad') ? 'triad' : avail[0];
  }
  function makeCard(key) {
    const mode = pickMode(key);
    const clozeField = (mode === 'cloze') ? (Math.random() < 0.5 ? 'praet' : 'pp') : null;
    return { key, mode, clozeField, requeued: false, firstTry: null, val: '', aux: null };
  }

  /* ==========================================================================
     FILTER + STATS
     ========================================================================== */
  function filterKeys(filter) {
    const all = Object.keys(VERBS);
    if (filter === 'sein') return all.filter(k => VERBS[k].aux === 'sein');
    if (filter === 'sep') return all.filter(k => VERBS[k].sep);
    if (filter === 'refl') return all.filter(k => VERBS[k].refl);
    return all;
  }
  function stats() {
    const now = Date.now(); const all = Object.keys(VERBS);
    let mastered = 0, learning = 0, due = 0;
    for (const k of all) {
      if (isMastered(k)) mastered++; else if (isSeen(k)) learning++;
      if (isSeen(k) && !isMastered(k) && isDue(k, now)) due++;
    }
    return { total: all.length, mastered, learning, due };
  }

  /* ==========================================================================
     SESSION
     ========================================================================== */
  function startSession(scope) {
    const now = Date.now();
    let keys;
    if (scope.type === 'due') {
      keys = Object.keys(VERBS).filter(k => isSeen(k) && !isMastered(k) && isDue(k, now));
    } else if (scope.type === 'selected') {
      keys = Object.keys(state.sel).filter(k => VERBS[k]);
    } else {
      const base = filterKeys(scope.filter || 'all');
      const due = base.filter(k => isSeen(k) && isDue(k, now) && !isMastered(k));
      const neu = base.filter(k => !isSeen(k));
      keys = due.concat(neu.slice(0, 15));
      if (!keys.length) keys = base.slice(0);
    }
    keys = keys.sort(() => Math.random() - 0.5).slice(0, scope.type === 'selected' ? 40 : 20);
    if (!keys.length) { showToast(T('toast_no_words')); return; }
    state.session = { scope, queue: keys.map(makeCard), pos: 0, uniqueRight: 0, uniqueTotal: keys.length, answered: false, revealed: false, lastCorrect: null };
    render();
  }
  function answer(correct) {
    const s = state.session; if (!s) return;
    const card = s.queue[s.pos];
    if (card.firstTry === null) { card.firstTry = correct; if (correct) s.uniqueRight++; }
    updateCard(card.key, correct);
    if (!correct && !card.requeued) { s.queue.push({ ...card, mode: 'triad', clozeField: null, requeued: true, firstTry: card.firstTry }); }
    if (card.mode === 'triad') { nextCard(); return; }
    s.lastCorrect = correct; s.answered = true; s.revealed = true; render();
    setTimeout(() => { const b = document.getElementById('cardAudio'); if (b) speakVerb(card.key, b); }, 150);
  }
  function nextCard() {
    const s = state.session; if (!s) return;
    s.pos++; s.answered = false; s.revealed = false; s.lastCorrect = null;
    render();
    setTimeout(() => { const inp = document.getElementById('vInput'); if (inp) inp.focus(); }, 50);
  }
  function closeSession() {
    const s = state.session;
    const summary = s ? { right: s.uniqueRight || 0, total: s.uniqueTotal || 0 } : null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.session = null;
    if (cfg.embedded && typeof cfg.onSessionEnd === 'function') cfg.onSessionEnd(summary);
    else render();
  }

  function revealTriad() {
    state.session.revealed = true; render();
    const card = state.session.queue[state.session.pos];
    setTimeout(() => { const b = document.getElementById('cardAudio'); if (b) speakVerb(card.key, b); }, 120);
  }

  function submitCloze() {
    const s = state.session; if (!s || s.answered) return;
    const card = s.queue[s.pos]; const inp = document.getElementById('vInput');
    card.val = inp ? inp.value : '';
    const target = VERBS[card.key][card.clozeField];
    const correct = normalize(card.val) === normalize(target);
    answer(correct);
  }
  function submitTable() {
    const s = state.session; if (!s || s.answered) return;
    const card = s.queue[s.pos]; const e = VERBS[card.key];
    const pIn = document.getElementById('praetIn'), ppIn = document.getElementById('ppIn');
    card.valPraet = pIn ? pIn.value : ''; card.valPp = ppIn ? ppIn.value : '';
    const okP = normalize(card.valPraet) === normalize(e.praet);
    const okPp = normalize(card.valPp) === normalize(e.pp);
    const okAux = card.aux === e.aux;
    answer(okP && okPp && okAux);
  }
  function chooseAux(a) { const s = state.session; if (!s || s.answered) return; s.queue[s.pos].aux = a; render(); setTimeout(() => { const i = document.getElementById('praetIn'); if (i && !i.value) i.focus(); }, 20); }

  /* ==========================================================================
     RENDER — dispatcher + HOME
     ========================================================================== */
  function render() {
    if (state.session) { renderSession(); return; }
    if (cfg.embedded) return;   // /today owns the screen between sessions
    renderHome();
  }

  function renderHome() {
    const g = stats();
    const fk = filterKeys(state.filter);

    let html = `
${appHeader('verbs', { cat: 'vocab_title_cat', h1: 'Unregelmäßige <em>Verben</em>', subtitle: 'verbs_subtitle' })}

<section class="container stats">
  <div><div class="stat-label">${T('stat_total')}</div><div class="stat-big num">${g.total}</div><div class="stat-sub">${T('verbs_total_sub')}</div></div>
  <div><div class="stat-label">${T('stat_mastered')}</div><div class="stat-big green num">${g.mastered}</div><div class="stat-sub">${T('stat_mastered_sub', Math.round(g.mastered/g.total*100))}</div></div>
  <div><div class="stat-label">${T('stat_learning')}</div><div class="stat-big num">${g.learning}</div><div class="stat-sub">${T('stat_learning_sub')}</div></div>
  <div><div class="stat-label">${T('stat_due')}</div><div class="stat-big accent num">${g.due}</div><div class="stat-sub">${T('stat_due_sub')}</div></div>
</section>

<main class="container">
  <div class="due-banner">
    <div class="due-banner-text">
      ${g.due>0 ? T('due_title', g.due) : T('due_all_done')}
      <small>${g.due>0 ? T('due_hint') : T('due_all_done_hint')}</small>
    </div>
    <button class="btn on-dark big" onclick="VerbsTrainer.startSession({type:'due'})" ${g.due===0?'disabled':''}>${T('due_btn')}</button>
  </div>

  <div class="settings-bar">
    <span class="settings-label">${T('settings_modes')}</span>
    ${modeChip('triad', T('mode_triad'))}
    ${modeChip('cloze', T('mode_cloze'))}
    ${modeChip('table', T('mode_table'))}
  </div>

  <div class="settings-bar">
    <span class="settings-label">${T('filter_label')}</span>
    ${filterChip('all', T('filter_all'))}
    ${filterChip('sein', 'sein')}
    ${filterChip('sep', T('filter_sep'))}
    ${filterChip('refl', T('filter_refl'))}
    <button class="btn accent" style="margin-left:auto" onclick="VerbsTrainer.startSession({type:'filter',filter:'${state.filter}'})">${T('verb_train')} (${fk.length})</button>
  </div>

  <div class="select-bar">
    <button class="chip" onclick="VerbsTrainer.selectAllFiltered()">${T('sel_select_all')} (${fk.length})</button>
    <button class="chip" onclick="VerbsTrainer.clearSelection()">${T('sel_clear')}</button>
    <span class="sel-count" id="selCount">${T('sel_selected', selCount())}</span>
    <button class="btn accent" id="trainSelBtn" ${selCount()?'':'disabled'} onclick="VerbsTrainer.startSession({type:'selected'})" style="margin-left:auto">${T('sel_train')}</button>
  </div>

  <div class="verb-list">
    ${(()=>{
      const selKeys = fk.filter(k => state.sel[k]);
      const restKeys = fk.filter(k => !state.sel[k]);
      const verbRowHtml = k => {
        const e=VERBS[k]; const box=cardBox(k); const mastered=box>=MAX_BOX;
        const segs=[1,2,3,4,5].map(b=>`<div class="box-seg ${b<=box?'fill':''} ${b<=box&&mastered?'full':''}"></div>`).join('');
        return `<div class="verb-row ${mastered?'mastered':''}">
          <input type="checkbox" class="verb-check" ${state.sel[k]?'checked':''} onclick="VerbsTrainer.toggleSelect(${jk(k)}, this)">
          <div class="verb-main">
            <div class="verb-de">${esc(k)} <span class="t-sep">·</span> ${esc(e.praet)} <span class="t-sep">·</span> ${auxHtml(e.aux)} ${esc(e.pp)}</div>
            <div class="verb-gloss">${esc(verbGloss(k))}</div>
          </div>
          <button class="box-bar" onclick="VerbsTrainer.resetVerb(${jk(k)})" title="${T('box_title', box)}">${segs}</button>
          <button class="mini-audio" onclick="VerbsTrainer.speakVerb(${jk(k)},this)" title="Aussprache">🔊</button>
        </div>`;
      };
      let out = '';
      if(selKeys.length){
        out += `<div class="verb-list-sep">${T('sel_section_selected')} (${selKeys.length})</div>`;
        out += selKeys.map(verbRowHtml).join('');
        out += `<div class="verb-list-sep">${T('sel_section_rest')} (${restKeys.length})</div>`;
      }
      out += restKeys.map(verbRowHtml).join('');
      return out;
    })()}
  </div>

  <div class="info-box">${T('verbs_info')}</div>
</main>

${appFooter({ right: `<button onclick="VerbsTrainer.resetAll()" style="font-size:12px;color:var(--ink-soft);text-decoration:underline;text-underline-offset:3px;background:none;border:none;cursor:pointer">${T('reset_all')}</button>` })}`;

    if(state.confirm){
      html += `
<div class="confirm-bg" onclick="if(event.target===this)VerbsTrainer.confirmNo()">
  <div class="confirm-box">
    <div class="confirm-msg">${esc(state.confirm.message)}</div>
    <div class="confirm-actions">
      <button class="btn" onclick="VerbsTrainer.confirmNo()">${T('confirm_no')}</button>
      <button class="btn accent" onclick="VerbsTrainer.confirmYes()">${T('confirm_yes')}</button>
    </div>
  </div>
</div>`;
    }
    appEl().innerHTML = html;
  }

  function modeChip(mode, label) {
    const on = state.modes[mode];
    return `<button class="chip ${on?'on':''}" onclick="VerbsTrainer.toggleMode('${mode}')"><span class="chip-check">${on?'✓':''}</span>${label}</button>`;
  }
  function toggleMode(mode) {
    const others = Object.keys(state.modes).filter(m => m !== mode).some(m => state.modes[m]);
    if (state.modes[mode] && !others) { showToast(T('toast_at_least_one_mode')); return; }
    state.modes[mode] = !state.modes[mode]; save(); render();
  }
  function filterChip(f, label) { return `<button class="chip ${state.filter===f?'on':''}" onclick="VerbsTrainer.setFilter('${f}')">${label}</button>`; }
  function setFilter(f) { state.filter = f; render(); }

  /* ---------- hand-picked selection ---------- */
  function jk(k) { return JSON.stringify(k).replace(/"/g, '&quot;'); }
  function selCount() { return Object.keys(state.sel).length; }
  function toggleSelect(k, el) { if (el.checked) state.sel[k] = true; else delete state.sel[k]; updateSelBar(); save(); }
  function selectAllFiltered() { filterKeys(state.filter).forEach(k => state.sel[k] = true); document.querySelectorAll('.verb-check').forEach(c => c.checked = true); updateSelBar(); save(); }
  function clearSelection() { state.sel = {}; document.querySelectorAll('.verb-check').forEach(c => c.checked = false); updateSelBar(); save(); }
  function updateSelBar() {
    const c = document.getElementById('selCount'); if (c) c.textContent = T('sel_selected', selCount());
    const b = document.getElementById('trainSelBtn'); if (b) b.disabled = selCount() === 0;
  }

  /* ==========================================================================
     RENDER — SESSION
     ========================================================================== */
  function renderSession() {
    const s = state.session;
    if (s.pos >= s.queue.length) { renderEnd(); return; }
    const card = s.queue[s.pos];
    const progress = (s.pos / s.queue.length) * 100;
    const modeLabel = { triad: T('mode_triad'), cloze: T('mode_cloze'), table: T('mode_table') }[card.mode];
    let body = card.mode === 'triad' ? renderTriad(card, s) : card.mode === 'cloze' ? renderCloze(card, s) : renderTable(card, s);

    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-top"><div class="container session-top-row">
    <span class="session-mode-badge ${card.mode}">${modeLabel}</span>
    <span class="session-counter">${s.pos+1} / ${s.queue.length}</span>
    <button class="session-close" onclick="VerbsTrainer.closeSession()">×</button>
  </div>
  <div class="container"><div class="session-progress"><div class="session-progress-fill" style="width:${progress}%"></div></div></div>
  </div>
  <div class="session-body"><div class="card">${body}</div></div>
</div>`;
    if ((card.mode === 'cloze' || card.mode === 'table') && !s.answered) {
      setTimeout(() => { const inp = document.getElementById(card.mode === 'cloze' ? 'vInput' : 'praetIn'); if (inp) inp.focus(); }, 30);
    }
  }

  function renderTriad(card, s) {
    return `
    <div class="card-prompt-label">${T('verb_recall')}</div>
    <div class="card-word">${esc(card.key)}</div>
    <div class="card-sub">${esc(verbGloss(card.key))}</div>
    ${s.revealed ? `
      <div class="triad">${triadHtml(card.key)}</div>
      <button class="audio-btn" id="cardAudio" onclick="VerbsTrainer.speakVerb(${jk(card.key)},this)">🔊</button>
      <div class="card-actions">
        <button class="mark wrong" onclick="VerbsTrainer.answer(false)">${T('flashcard_wrong')}</button>
        <button class="mark right" onclick="VerbsTrainer.answer(true)">${T('flashcard_right')}</button>
      </div>
      <div class="kbd-hint">${T('flashcard_hint')}</div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="VerbsTrainer.revealTriad()">${T('verb_show_forms')}</button></div>
      <div class="kbd-hint">${T('verb_recall_hint')}</div>
    `}`;
  }

  function renderCloze(card, s) {
    const e = VERBS[card.key];
    const field = card.clozeField;
    const target = e[field];
    const slot = s.answered
      ? `<span class="cloze-slot ${s.lastCorrect?'ok':'bad'}">${esc(target)}</span>`
      : `<input class="spell-input cloze-input" id="vInput" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="…" onkeydown="if(event.key==='Enter'){event.preventDefault();VerbsTrainer.submitCloze();}">`;
    const praetCell = field === 'praet' ? slot : `<span>${esc(e.praet)}</span>`;
    const ppCell = field === 'pp' ? slot : `<span>${esc(e.pp)}</span>`;
    let feedback = '';
    if (s.answered && !s.lastCorrect) {
      const d = diffChars((card.val || '').trim(), target);
      feedback = `<div class="spell-compare">
      <div class="cmp-row"><span class="cmp-label">${T('spelling_your')}</span><span class="cmp-val">${(card.val||'').trim()?d.aHtml:('<span class="spell-empty">'+T('spelling_empty')+'</span>')}</span></div>
      <div class="cmp-row"><span class="cmp-label">${T('spelling_right_ans')}</span><span class="cmp-val">${d.bHtml}</span></div>
    </div>`;
    }
    return `
    <div class="card-prompt-label">${T('verb_fill_form')} · ${field==='praet'?'Präteritum':'Partizip II'}</div>
    <div class="card-sub" style="margin-bottom:14px">${esc(card.key)} — ${esc(verbGloss(card.key))}</div>
    <div class="cloze-line">
      <span class="t-inf">${esc(card.key)}</span> <span class="t-sep">·</span>
      ${praetCell} <span class="t-sep">·</span>
      ${auxHtml(e.aux)} ${ppCell}
    </div>
    ${s.answered ? `
      ${s.lastCorrect?`<div class="feedback ok">${T('spelling_correct')} <span class="correct-answer">${triadHtml(card.key)}</span></div>`:feedback}
      <button class="audio-btn" id="cardAudio" onclick="VerbsTrainer.speakVerb(${jk(card.key)},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VerbsTrainer.nextCard()">${T('article_next')}</button></div>
      <div class="kbd-hint">${T('article_hint_next')}</div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="VerbsTrainer.submitCloze()">${T('spelling_check')}</button></div>
      <div class="kbd-hint">ä=ae, ö=oe, ü=ue, ß=ss · Enter</div>
    `}`;
  }

  function renderTable(card, s) {
    const e = VERBS[card.key];
    const auxBtns = ['haben', 'sein'].map(a => {
      let cls = 'aux-btn ' + a;
      if (s.answered) { if (a === card.aux) cls += (a === e.aux ? ' chosen-correct' : ' chosen-wrong'); else if (a === e.aux) cls += ' reveal-correct'; }
      else if (a === card.aux) cls += ' chosen';
      return `<button class="${cls}" ${s.answered?'disabled':''} onclick="VerbsTrainer.chooseAux('${a}')">${a}</button>`;
    }).join('');
    const cmp = (val, target) => { const d = diffChars((val || '').trim(), target); return (val || '').trim() ? (normalize(val) === normalize(target) ? esc(target) : d.aHtml) : '<span class="spell-empty">—</span>'; };
    return `
    <div class="card-prompt-label">${T('verb_table_prompt')}</div>
    <div class="card-word" style="font-size:34px">${esc(card.key)}</div>
    <div class="card-sub" style="margin-bottom:16px">${esc(verbGloss(card.key))}</div>
    <div class="form-grid">
      <label>Präteritum</label>
      ${s.answered?`<div class="form-shown ${normalize(card.valPraet||'')===normalize(e.praet)?'ok':'bad'}">${cmp(card.valPraet,e.praet)}</div>`:`<input class="spell-input" id="praetIn" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="…" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('ppIn').focus();}">`}
      <label>Partizip II</label>
      ${s.answered?`<div class="form-shown ${normalize(card.valPp||'')===normalize(e.pp)?'ok':'bad'}">${cmp(card.valPp,e.pp)}</div>`:`<input class="spell-input" id="ppIn" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="…" onkeydown="if(event.key==='Enter'){event.preventDefault();VerbsTrainer.submitTable();}">`}
    </div>
    <div class="aux-row"><span class="aux-label">${T('verb_aux')}:</span> <div class="aux-btns">${auxBtns}</div></div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect?'ok':'bad'}">${s.lastCorrect?T('article_correct'):T('article_wrong')} <span class="correct-answer">${triadHtml(card.key)}</span></div>
      <button class="audio-btn" id="cardAudio" onclick="VerbsTrainer.speakVerb(${jk(card.key)},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VerbsTrainer.nextCard()">${T('article_next')}</button></div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="VerbsTrainer.submitTable()">${T('spelling_check')}</button></div>
      <div class="kbd-hint">${T('verb_table_hint')}</div>
    `}`;
  }

  function renderEnd() {
    const s = state.session;
    const pct = s.uniqueTotal ? Math.round(s.uniqueRight / s.uniqueTotal * 100) : 0;
    const actions = cfg.embedded
      ? `<button class="btn primary big" onclick="VerbsTrainer.closeSession()">${T('today_continue')}</button>
         <button class="btn big" style="margin-left:8px" onclick='VerbsTrainer.startSession(${JSON.stringify(s.scope)})'>${T('end_again')}</button>`
      : `<button class="btn primary big" onclick="VerbsTrainer.closeSession()">${T('end_back')}</button>
         <button class="btn big" style="margin-left:8px" onclick='VerbsTrainer.startSession(${JSON.stringify(s.scope)})'>${T('end_again')}</button>`;
    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-body"><div class="session-end">
    <div class="card-prompt-label">${T('end_title')}</div>
    <div class="end-score num">${s.uniqueRight}<span style="font-size:24px;color:var(--ink-soft)">/${s.uniqueTotal}</span></div>
    <div class="end-detail">${T('end_score', s.uniqueRight, s.uniqueTotal)}</div>
    ${actions}
  </div></div>
</div>`;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* ==========================================================================
     KEYBOARD (host registers one listener → handleKeydown)
     ========================================================================== */
  function handleKeydown(e) {
    const s = state.session; if (!s) return;
    if (s.pos >= s.queue.length) { if (e.key === 'Escape') closeSession(); return; }
    if (e.key === 'Escape') { closeSession(); return; }
    const card = s.queue[s.pos];
    if (e.target && (e.target.id === 'vInput' || e.target.id === 'praetIn' || e.target.id === 'ppIn')) return;
    if (card.mode === 'triad') {
      if (e.key === ' ') { e.preventDefault(); if (!s.revealed) revealTriad(); }
      else if (s.revealed) { if (e.key === '1' || e.key === 'ArrowLeft') answer(false); else if (e.key === '2' || e.key === 'ArrowRight') answer(true); }
    } else if (s.answered && e.key === 'Enter') { nextCard(); }
  }

  /* ==========================================================================
     PUBLIC API
     ========================================================================== */
  return {
    init,
    render, renderHome, startSession,
    answer, nextCard, revealTriad, submitCloze, submitTable, chooseAux, closeSession,
    toggleMode, setFilter, toggleSelect, selectAllFiltered, clearSelection,
    resetAll, resetVerb, askConfirm, confirmYes, confirmNo,
    speakVerb, handleKeydown,
    serialize, applyData, setMasteryStore,
    /* introspection (used by tests + the /today host) */
    verbGloss, triadHtml, auxHtml, jk, selCount,
    availableModes, pickMode, makeCard, filterKeys, stats,
    updateCard, getCard, isDue, isSeen, cardBox, isMastered,
    get state() { return state; },
  };
})();

/* vocab-trainer.js — the vocabulary trainer ENGINE, extracted from views/vocab.html so it can be
   reused by both the standalone /vocab page and the /today daily-flow wizard.

   It is a single namespace object `window.VocabTrainer`. All of the trainer's domain logic lives
   here: VOCAB helpers, the Leitner routing (incl. the shared verb store), the independent plural
   track, the session state machine, every sub-renderer, and the keyboard handler. Template
   `onclick`/`onkeydown` strings reference the namespace (`VocabTrainer.answer(true)`) so two engines
   (this one + VerbsTrainer) can coexist on one page without colliding on global names.

   The host page wires the engine via init():
     VocabTrainer.init({
       embedded,        // false on /vocab (home + sessions); true on /today (sessions only)
       onSaveVocab,     // persist vocab_data  (default: global saveToCloud)
       onSaveVerbs,     // persist verbs_data  (default: global saveVerbsToCloud(verbStore))
       onSessionEnd,    // embedded only: called when a session is finished/closed → advance flow
     });

   Cloud contract helpers (serialize / applyData / applyVerbProgress) live here; the host's
   getCloudPayload()/applyCloudData() delegate to them. Depends on globals from the shared modules:
   T/getLang (i18n), esc/showToast/normalize/diffChars/track/stageConfirm/clearConfirm (utils),
   leitner* / MAX_BOX (leitner), speak (speech), VOCAB/PLURALS/VERBS (data). */
window.VocabTrainer = (function () {
  'use strict';

  /* ---- host wiring (set by init) ---- */
  let cfg = { embedded: false, onSaveVocab: null, onSaveVerbs: null, onSessionEnd: null };
  function init(opts) { Object.assign(cfg, opts || {}); }

  function appEl() { return document.getElementById('app'); }

  /* ==========================================================================
     HELPERS
     ========================================================================== */
  function getTranslation(week, idx) {
    const lang = getLang();
    const locale = window['LOCALE_' + lang.toUpperCase()];
    const wt = locale && locale.vocab && locale.vocab[week];
    if (wt && wt[idx] !== undefined) return wt[idx];
    const enWt = window.LOCALE_EN && window.LOCALE_EN.vocab && window.LOCALE_EN.vocab[week];
    return (enWt && enWt[idx] !== undefined) ? enWt[idx] : '';
  }

  function parseArticle(de) {
    const m = de.match(/^(der|die|das)\s+(.+)$/);
    return m ? { article: m[1], core: m[2] } : null;
  }
  function availableModes(de) {
    const modes = ['flashcard'];
    const art = parseArticle(de);
    if (art) modes.push('article');
    const core = art ? art.core : de;
    if (!/[\s?…—\/]/.test(core) && core.length >= 2) modes.push('spelling');
    return modes;
  }
  function deColored(de) {
    const art = parseArticle(de);
    if (!art) return esc(de);
    return `<span class="art ${art.article}">${art.article}</span> ${esc(art.core)}`;
  }

  /* Show all THREE principal parts — Infinitiv — Präteritum — Partizip II (+ "(sein)") — for any
     word that is a known verb, pulled live from VERBS so irregular verbs display the full set. */
  function verbForms(de) {
    const inf = de.split('—')[0].trim();
    const v = (typeof VERBS !== 'undefined') ? VERBS[inf] : null;
    if (!v || !v.praet || !v.pp) return de;
    return `${inf} — ${v.praet} — ${v.pp}${v.aux === 'sein' ? ' (sein)' : ''}`;
  }

  /* speech: shared core (GERMAN_VOICE/pickVoice/speak) lives in assets/js/speech.js */
  function speakWord(week, idx, btnEl) {
    const de = VOCAB[week].words[idx].split('—')[0].trim();
    speak(de, btnEl, 0.88);
  }

  /* ==========================================================================
     LEITNER SPACED REPETITION (box model in assets/js/leitner.js)
     ========================================================================== */
  function key(week, idx) { return week + '-' + idx; }

  /* Cross-cutting verb progress: if a word is one of our master verbs, its mastery lives in the
     shared `verbs_data` store (keyed by verb key) — the SAME record the verb trainer uses. */
  let verbStore = { mastery: {} };
  function applyVerbProgress(d) { if (d && typeof d === 'object') { verbStore = d; if (!verbStore.mastery || typeof verbStore.mastery !== 'object') verbStore.mastery = {}; } }
  function setVerbStore(d) { applyVerbProgress(d); }
  function saveVerbStore() { verbStore.savedAt = new Date().toISOString(); if (cfg.onSaveVerbs) cfg.onSaveVerbs(); else if (typeof saveVerbsToCloud === 'function') saveVerbsToCloud(verbStore); }
  function verbKeyForWord(de) { const core = String(de).split('—')[0].trim(); return (typeof VERBS !== 'undefined' && VERBS[core]) ? core : null; }
  function vkOf(week, idx) { return verbKeyForWord(VOCAB[week].words[idx]); }
  function mRec(week, idx) { const vk = vkOf(week, idx); return vk ? verbStore.mastery[vk] : state.mastery[key(week, idx)]; }

  function getCard(week, idx) { return mRec(week, idx) || leitnerBlank(); }
  function isDue(week, idx, now) { return leitnerIsDue(mRec(week, idx), now); }
  function isSeen(week, idx) { return leitnerIsSeen(mRec(week, idx)); }
  function cardBox(week, idx) { return leitnerBoxOf(mRec(week, idx)); }
  function isMastered(week, idx) { return leitnerIsMastered(mRec(week, idx)); }

  function updateCard(week, idx, correct) {
    const c = getCard(week, idx);
    leitnerApply(c, correct);
    const vk = vkOf(week, idx);
    if (vk) { verbStore.mastery[vk] = c; saveVerbStore(); }
    else { state.mastery[key(week, idx)] = c; save(); }
  }

  /* ==========================================================================
     PLURAL TRAINER — a SECOND, independent Leitner track for the same nouns.
     ========================================================================== */
  function plHasPlural(week, idx) { return !!PLURALS[VOCAB[week].words[idx]]; }
  function plRec(week, idx) { return state.pluralMastery[key(week, idx)]; }
  function plCard(week, idx) { return plRec(week, idx) || leitnerBlank(); }
  function plIsDue(week, idx, now) { return leitnerIsDue(plRec(week, idx), now); }
  function plIsSeen(week, idx) { return leitnerIsSeen(plRec(week, idx)); }
  function plBox(week, idx) { return leitnerBoxOf(plRec(week, idx)); }
  function plIsMastered(week, idx) { return leitnerIsMastered(plRec(week, idx)); }
  function updatePlural(week, idx, correct) {
    const c = plCard(week, idx);
    leitnerApply(c, correct);
    state.pluralMastery[key(week, idx)] = c;
    save();
  }
  function speakPlural(week, idx, btnEl) { const pl = PLURALS[VOCAB[week].words[idx]]; if (pl) speak(pl, btnEl, 0.88); }

  function umlautify(str) {
    const i = str.lastIndexOf('au');
    if (i >= 0) return str.slice(0, i) + 'äu' + str.slice(i + 2);
    const map = { a: 'ä', o: 'ö', u: 'ü' };
    for (let j = str.length - 1; j >= 0; j--) {
      const lo = str[j].toLowerCase();
      if (map[lo]) return str.slice(0, j) + (str[j] === str[j].toUpperCase() ? map[lo].toUpperCase() : map[lo]) + str.slice(j + 1);
    }
    return str;
  }
  function pluralDistractors(sgCore, plCore) {
    const cands = new Set([
      sgCore + 'e', sgCore + 'en', sgCore + 'er', sgCore + 'n', sgCore + 's',
      umlautify(sgCore) + 'e', umlautify(sgCore) + 'er', sgCore,
    ]);
    const arr = [...cands].filter(x => x && x !== plCore);
    arr.sort(() => Math.random() - 0.5);
    return arr.slice(0, 2);
  }
  function makePluralOptions(de, pl) {
    const sgCore = (parseArticle(de) || { core: de }).core;
    const plCore = (parseArticle(pl) || { core: pl }).core;
    const opts = [pl, ...pluralDistractors(sgCore, plCore).map(c => 'die ' + c)];
    return opts.sort(() => Math.random() - 0.5);
  }
  function pickPluralMode(week, idx) {
    const box = plBox(week, idx);
    if (box >= 3 && Math.random() < 0.6) return 'pl_input';
    if (box <= 1) return Math.random() < 0.5 ? 'pl_flash' : 'pl_choose';
    const pool = ['pl_flash', 'pl_choose', 'pl_input'];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function makePluralCard(week, idx) {
    const de = VOCAB[week].words[idx];
    const ru = getTranslation(week, idx);
    const pl = PLURALS[de];
    return { week, idx, kind: 'plural', de, ru, pl, mode: pickPluralMode(week, idx),
             options: makePluralOptions(de, pl), requeued: false, firstTry: null };
  }
  function collectPluralCards(weeks, now, newCap) {
    const due = [], neu = [];
    for (const w of weeks) {
      const words = VOCAB[w].words;
      for (let i = 0; i < words.length; i++) {
        if (!plHasPlural(+w, i)) continue;
        if (plIsMastered(+w, i) && !plIsDue(+w, i, now)) continue;
        if (plIsSeen(+w, i)) { if (plIsDue(+w, i, now)) due.push([+w, i]); }
        else neu.push([+w, i]);
      }
    }
    return due.map(([w, i]) => makePluralCard(w, i))
              .concat(neu.slice(0, newCap).map(([w, i]) => makePluralCard(w, i)));
  }
  function allPluralCards(weeks) {
    const out = [];
    for (const w of weeks) { VOCAB[w].words.forEach((_, i) => { if (plHasPlural(+w, i)) out.push(makePluralCard(+w, i)); }); }
    return out;
  }

  function resetAll() { askConfirm(T('confirm_reset_all'), 'all'); }
  function resetWord(week, idx) { askConfirm(T('confirm_reset_word'), { week, idx }); }
  function askConfirm(message, action) { stageConfirm(state, message, action); render(); }
  function confirmNo() { clearConfirm(state); render(); }
  function confirmYes() {
    const a = state.confirm && state.confirm.action;
    clearConfirm(state);
    if (a === 'all') { state.mastery = {}; state.pluralMastery = {}; save(); render(); showToast(T('toast_progress_reset')); }
    else if (a && typeof a === 'object') {
      const vk = vkOf(a.week, a.idx);
      if (vk) { delete verbStore.mastery[vk]; saveVerbStore(); }
      else { delete state.mastery[key(a.week, a.idx)]; save(); }
      delete state.pluralMastery[key(a.week, a.idx)];
      save();
      render(); showToast(T('toast_word_reset'));
    }
    else render();
  }

  /* ==========================================================================
     STATE
     ========================================================================== */
  let state = {
    selectedWeek: 1,
    mastery: {},
    pluralMastery: {},
    modes: { flashcard: true, article: true, spelling: true, plural: false },
    levels: { A1: false, A2: false, B1: false },
    session: null,
    confirm: null,
  };

  function levelOfWeek(w) { w = +w; return w <= 8 ? 'A1' : w <= 16 ? 'A2' : 'B1'; }
  function activeLevels() { return Object.keys(state.levels).filter(l => state.levels[l]); }
  function weeksForLevels(levels) { return Object.keys(VOCAB).filter(w => levels.includes(levelOfWeek(w))); }
  function levelWordCount(levels) { let n = 0; for (const w in VOCAB) { if (levels.includes(levelOfWeek(w))) n += VOCAB[w].words.length; } return n; }

  /* Cloud contract (host's getCloudPayload/applyCloudData delegate here) */
  function serialize() {
    return { app: 'deutsch-vokabeltrainer', version: 2, savedAt: new Date().toISOString(),
             selectedWeek: state.selectedWeek, modes: state.modes, levels: state.levels,
             mastery: state.mastery, pluralMastery: state.pluralMastery };
  }
  function applyData(d) {
    if (!d || typeof d !== 'object' || !d.mastery || typeof d.mastery !== 'object') {
      showToast(T('toast_file_bad')); return false;
    }
    state.mastery = d.mastery;
    state.pluralMastery = (d.pluralMastery && typeof d.pluralMastery === 'object') ? d.pluralMastery : {};
    if (d.modes) state.modes = Object.assign({ flashcard: true, article: true, spelling: true, plural: false }, d.modes);
    if (d.levels) state.levels = Object.assign({ A1: false, A2: false, B1: false }, d.levels);
    if (d.selectedWeek) state.selectedWeek = d.selectedWeek;
    save(); render();
    return true;
  }

  function save() { if (cfg.onSaveVocab) cfg.onSaveVocab(); else if (typeof saveToCloud === 'function') saveToCloud(); }

  /* ---- Manual export / import (works in every browser) ---- */
  function exportProgress() {
    const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deutsch-fortschritt.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(T('toast_file_saved'));
  }
  function importProgress() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = () => {
      const file = inp.files && inp.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { try { if (applyData(JSON.parse(reader.result))) showToast(T('toast_file_loaded')); } catch (e) { showToast(T('toast_file_read_err')); } };
      reader.readAsText(file);
    };
    inp.click();
  }

  /* ==========================================================================
     STATS
     ========================================================================== */
  function weekStats(week) {
    const n = VOCAB[week].words.length;
    let mastered = 0, learning = 0, neu = 0;
    for (let i = 0; i < n; i++) {
      if (isMastered(week, i)) mastered++;
      else if (isSeen(week, i)) learning++;
      else neu++;
    }
    return { total: n, mastered, learning, neu };
  }
  function globalStats() {
    const now = Date.now();
    let total = 0, mastered = 0, learning = 0, due = 0;
    const plural = !!state.modes.plural;
    for (const w in VOCAB) {
      const words = VOCAB[w].words;
      for (let i = 0; i < words.length; i++) {
        total++;
        if (isMastered(w, i)) mastered++;
        else if (isSeen(w, i)) learning++;
        if (isSeen(w, i) && !isMastered(w, i) && isDue(w, i, now)) due++;
        if (plural && plHasPlural(+w, i) && plIsSeen(+w, i) && !plIsMastered(+w, i) && plIsDue(+w, i, now)) due++;
      }
    }
    return { total, mastered, learning, due };
  }

  /* ==========================================================================
     SESSION BUILDER
     ========================================================================== */
  function pickMode(week, idx) {
    const avail = availableModes(VOCAB[week].words[idx]);
    const enabled = avail.filter(m => state.modes[m]);
    const pool = enabled.length ? enabled : ['flashcard'];
    const box = cardBox(week, idx);
    if (box >= 3 && pool.includes('spelling') && Math.random() < 0.6) return 'spelling';
    if (box <= 1 && pool.includes('article') && Math.random() < 0.5) return 'article';
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function makeCard(week, idx) {
    const de = VOCAB[week].words[idx];
    const ru = getTranslation(week, idx);
    return { week, idx, kind: 'word', de, ru, mode: pickMode(week, idx), requeued: false, firstTry: null };
  }

  function startSession(scope) {
    const now = Date.now();
    const usePlural = !!state.modes.plural;
    let list = [];
    if (scope.type === 'week') {
      const words = VOCAB[scope.week].words;
      const due = [], neu = [];
      for (let i = 0; i < words.length; i++) {
        if (isMastered(scope.week, i) && !isDue(scope.week, i, now)) continue;
        if (isSeen(scope.week, i)) { if (isDue(scope.week, i, now)) due.push(i); }
        else neu.push(i);
      }
      list = due.map(i => makeCard(scope.week, i)).concat(neu.slice(0, 12).map(i => makeCard(scope.week, i)));
      if (usePlural) list = list.concat(collectPluralCards([scope.week], now, 8));
      if (list.length === 0) {
        list = words.map((_, i) => makeCard(scope.week, i));
        if (usePlural) list = list.concat(allPluralCards([scope.week]));
      }
    } else if (scope.type === 'levels') {
      const weeks = weeksForLevels(scope.levels);
      const due = [], neu = [];
      for (const w of weeks) {
        const words = VOCAB[w].words;
        for (let i = 0; i < words.length; i++) {
          if (isMastered(w, i) && !isDue(w, i, now)) continue;
          if (isSeen(w, i)) { if (isDue(w, i, now)) due.push([+w, i]); }
          else neu.push([+w, i]);
        }
      }
      list = due.map(([w, i]) => makeCard(w, i)).concat(neu.slice(0, 20).map(([w, i]) => makeCard(w, i)));
      if (usePlural) list = list.concat(collectPluralCards(weeks, now, 12));
      if (list.length === 0) {
        for (const w of weeks) { VOCAB[w].words.forEach((_, i) => list.push(makeCard(+w, i))); }
        if (usePlural) list = list.concat(allPluralCards(weeks));
      }
    } else {
      for (const w in VOCAB) {
        const words = VOCAB[w].words;
        for (let i = 0; i < words.length; i++) {
          if (isSeen(w, i) && !isMastered(w, i) && isDue(w, i, now)) list.push(makeCard(+w, i));
        }
      }
      if (usePlural) list = list.concat(collectPluralCards(Object.keys(VOCAB), now, 0));
    }
    list = list.sort(() => Math.random() - 0.5).slice(0, 25);
    if (list.length === 0) { showToast(T('toast_no_words')); return; }

    state.session = { scope, queue: list, pos: 0, revealed: false, answered: false, lastCorrect: null, uniqueRight: 0, uniqueTotal: list.length, spellValue: '' };
    render();
  }

  function answer(correct) {
    const s = state.session; if (!s) return;
    const card = s.queue[s.pos];
    track('word_review', { mode: card.mode, correct });
    if (card.firstTry === null) { card.firstTry = correct; if (correct) s.uniqueRight++; }
    if (card.kind === 'plural') updatePlural(card.week, card.idx, correct);
    else updateCard(card.week, card.idx, correct);
    if (!correct && !card.requeued) {
      s.queue.push({ ...card, mode: card.kind === 'plural' ? 'pl_flash' : 'flashcard', requeued: true });
    }

    if (card.mode === 'flashcard' || card.mode === 'pl_flash') { nextCard(); return; }

    s.lastCorrect = correct;
    s.answered = true;
    s.revealed = true;
    render();
    setTimeout(() => { const b = document.getElementById('cardAudio');
      if (card.kind === 'plural') speakPlural(card.week, card.idx, b); else speakWord(card.week, card.idx, b); }, 150);
  }

  function nextCard() {
    const s = state.session; if (!s) return;
    s.pos++;
    s.revealed = false; s.answered = false; s.lastCorrect = null; s.spellValue = '';
    render();
    setTimeout(() => { const inp = document.getElementById('spellInput'); if (inp) inp.focus(); }, 50);
  }

  function revealFlash() {
    state.session.revealed = true;
    render();
    const card = state.session.queue[state.session.pos];
    setTimeout(() => { const b = document.getElementById('cardAudio'); speakWord(card.week, card.idx, b); }, 120);
  }

  function submitSpelling() {
    const s = state.session; if (!s || s.answered) return;
    const card = s.queue[s.pos];
    const inp = document.getElementById('spellInput');
    const val = inp ? inp.value : '';
    s.spellValue = val;
    const art = parseArticle(card.de);
    const u = normalize(val);
    const full = normalize(card.de);
    let correct = false, note = '';
    if (u === full) { correct = true; }
    else if (art) {
      const core = normalize(art.core);
      const noArt = u.replace(/^(der|die|das)\s+/, '');
      if (noArt === core) {
        if (u === core) { correct = true; note = T('note_almost', `<span class="correct-answer">${art.article}</span>`); }
        else { correct = false; note = T('note_core_correct'); }
      }
    }
    if (!correct && art && normalize(art.core) === u) { correct = true; note = T('note_no_article', `<span class="correct-answer">${art.article}</span>`, esc(art.core)); }
    if (!correct && art) {
      const noArt = u.replace(/^(der|die|das)\s+/, '');
      if (noArt === normalize(art.core) && u !== normalize(art.core)) note = T('note_core_correct');
    }

    s.spellCorrect = correct; s.spellNote = note;
    answer(correct);
  }

  function closeSession() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.session = null;
    if (cfg.embedded && typeof cfg.onSessionEnd === 'function') cfg.onSessionEnd();
    else render();
  }

  /* ==========================================================================
     RENDER — dispatcher + HOME
     ========================================================================== */
  function render() {
    if (state.session) { renderSession(); return; }
    if (cfg.embedded) return;   // /today owns the screen between sessions
    renderHome();
  }

  function renderHome() {
    const g = globalStats();
    const week = state.selectedWeek;
    const wk = VOCAB[week];
    const ws = weekStats(week);

    let html = `
${appHeader('vocab', { cat: 'vocab_title_cat', h1: 'Vokabel<em>trainer</em>', subtitle: 'vocab_subtitle' })}

<section class="container stats">
  <div><div class="stat-label">${T('stat_total')}</div><div class="stat-big num">${g.total}</div><div class="stat-sub">${T('stat_total_sub')}</div></div>
  <div><div class="stat-label">${T('stat_mastered')}</div><div class="stat-big green num">${g.mastered}</div><div class="stat-sub">${T('stat_mastered_sub', Math.round(g.mastered/g.total*100))}</div></div>
  <div><div class="stat-label">${T('stat_learning')}</div><div class="stat-big num">${g.learning}</div><div class="stat-sub">${T('stat_learning_sub')}</div></div>
  <div><div class="stat-label">${T('stat_due')}</div><div class="stat-big accent num">${g.due}</div><div class="stat-sub">${T('stat_due_sub')}</div></div>
</section>

<main class="container">

  <div class="due-banner">
    <div class="due-banner-text">
      ${g.due > 0 ? T('due_title', g.due) : T('due_all_done')}
      <small>${g.due > 0 ? T('due_hint') : T('due_all_done_hint')}</small>
    </div>
    <button class="btn on-dark big" onclick="VocabTrainer.startSession({type:'review-all'})" ${g.due===0?'disabled':''}>${T('due_btn')}</button>
  </div>

  <div class="settings-bar">
    <span class="settings-label">${T('settings_modes')}</span>
    ${modeChip('flashcard', T('mode_flashcard'))}
    ${modeChip('article', T('mode_article'))}
    ${modeChip('spelling', T('mode_spelling'))}
    ${modeChip('plural', T('mode_plural'))}
  </div>

  <div class="settings-bar">
    <span class="settings-label">${T('settings_sync')}</span>
    <button class="chip" onclick="VocabTrainer.exportProgress()">${T('settings_save_file')}</button>
    <button class="chip" onclick="VocabTrainer.importProgress()">${T('settings_load_file')}</button>
  </div>

  <div class="settings-bar">
    <span class="settings-label">${T('levels_label')}</span>
    ${levelChip('A1')}
    ${levelChip('A2')}
    ${levelChip('B1')}
    <button class="btn accent" ${activeLevels().length?'':'disabled'} style="margin-left:auto" onclick='VocabTrainer.startSession({type:"levels",levels:${JSON.stringify(activeLevels())}})'>${T('train_levels', levelWordCount(activeLevels()))}</button>
  </div>

  <div class="week-tabs">
    <div class="tabs-label">
      <span class="uppercase-mini">${T('tabs_label')}</span>
      <span class="uppercase-mini">${T('tabs_legend')}</span>
    </div>
    <div class="tabs-grid">
      ${(activeLevels().length ? weeksForLevels(activeLevels()) : Object.keys(VOCAB)).map(w=>{
        const s = weekStats(w);
        let dot = '';
        if (s.mastered === s.total) dot = '<span class="wt-dot" style="background:var(--green)"></span>';
        else if (s.mastered + s.learning > 0) dot = '<span class="wt-dot" style="background:var(--gold)"></span>';
        const cls = +w === week ? 'wt active' : 'wt';
        return `<button class="${cls}" onclick="VocabTrainer.selectWeek(${w})">${w}${dot}</button>`;
      }).join('')}
    </div>
  </div>

  <div class="wk-header">
    <div class="wk-num num">W${String(week).padStart(2,'0')}</div>
    <div class="wk-meta">
      <div class="wk-theme">${esc(wk.theme)}</div>
      <div class="wk-count">${T('words_count', ws.total, ws.mastered, ws.learning, ws.neu)}</div>
    </div>
    <button class="btn accent big" onclick="VocabTrainer.startSession({type:'week',week:${week}})">${T('train_week', week)}</button>
  </div>

  <div class="vocab-list">
    ${wk.words.map((w,i)=>{
      const box = cardBox(week,i);
      const mastered = box >= MAX_BOX;
      const segs = [1,2,3,4,5].map(b=>`<div class="box-seg ${b<=box?'fill':''} ${b<=box&&mastered?'full':''}"></div>`).join('');
      return `<div class="vocab-row ${mastered?'mastered':''}">
        <div class="vocab-de">${deColored(verbForms(w))}</div>
        <div class="vocab-ru">${esc(getTranslation(week,i))}</div>
        <button class="box-bar" onclick="VocabTrainer.resetWord(${week},${i})" title="${T('box_title', box)}">${segs}</button>
        <button class="mini-audio" onclick="VocabTrainer.speakWord(${week},${i},this)" title="Произношение">🔊</button>
      </div>`;
    }).join('')}
  </div>

  <div class="info-box">${T('vocab_info')}</div>
</main>

${appFooter({ right: `<button onclick="VocabTrainer.resetAll()" style="font-size:12px;color:var(--ink-soft);text-decoration:underline;text-underline-offset:3px;background:none;border:none;cursor:pointer">${T('reset_all')}</button>` })}`;

    if (state.confirm) {
      html += `
<div class="confirm-bg" onclick="if(event.target===this)VocabTrainer.confirmNo()">
  <div class="confirm-box">
    <div class="confirm-msg">${esc(state.confirm.message)}</div>
    <div class="confirm-actions">
      <button class="btn" onclick="VocabTrainer.confirmNo()">${T('confirm_no')}</button>
      <button class="btn accent" onclick="VocabTrainer.confirmYes()">${T('confirm_yes')}</button>
    </div>
  </div>
</div>`;
    }

    appEl().innerHTML = html;
  }

  function modeChip(mode, label) {
    const on = state.modes[mode];
    return `<button class="chip ${on?'on':''}" onclick="VocabTrainer.toggleMode('${mode}')"><span class="chip-check">${on?'✓':''}</span>${label}</button>`;
  }
  function toggleMode(mode) {
    if (mode !== 'plural') {
      const others = ['flashcard', 'article', 'spelling'].filter(m => m !== mode).some(m => state.modes[m]);
      if (state.modes[mode] && !others) { showToast(T('toast_at_least_one_mode')); return; }
    }
    state.modes[mode] = !state.modes[mode]; save(); render();
  }
  function levelChip(lvl) {
    const on = state.levels[lvl];
    return `<button class="chip ${on?'on':''}" onclick="VocabTrainer.toggleLevel('${lvl}')"><span class="chip-check">${on?'✓':''}</span>${lvl}</button>`;
  }
  function toggleLevel(lvl) {
    state.levels[lvl] = !state.levels[lvl];
    const act = activeLevels();
    if (act.length && !act.includes(levelOfWeek(state.selectedWeek))) {
      const ws = weeksForLevels(act);
      if (ws.length) state.selectedWeek = +ws[0];
    }
    save(); render();
  }
  function selectWeek(w) { state.selectedWeek = +w; save(); render(); }

  /* ==========================================================================
     RENDER — SESSION
     ========================================================================== */
  function renderSession() {
    const s = state.session;
    if (s.pos >= s.queue.length) { renderEnd(); return; }
    const card = s.queue[s.pos];
    const progress = (s.pos / s.queue.length) * 100;
    const modeLabel = { flashcard: T('mode_flashcard'), article: T('mode_article').split(' ')[0], spelling: T('mode_spelling').split(' ')[0],
                        pl_flash: T('mode_plural'), pl_choose: T('mode_plural'), pl_input: T('mode_plural') }[card.mode];
    const badgeClass = card.kind === 'plural' ? 'plural' : card.mode;

    let bodyHtml = '';
    if (card.mode === 'flashcard') bodyHtml = renderFlashcard(card, s);
    else if (card.mode === 'article') bodyHtml = renderArticle(card, s);
    else if (card.mode === 'spelling') bodyHtml = renderSpelling(card, s);
    else if (card.mode === 'pl_flash') bodyHtml = renderPluralFlash(card, s);
    else if (card.mode === 'pl_choose') bodyHtml = renderPluralChoose(card, s);
    else bodyHtml = renderPluralInput(card, s);

    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-top"><div class="container session-top-row">
    <span class="session-mode-badge ${badgeClass}">${modeLabel}</span>
    <span class="session-counter">${s.pos+1} / ${s.queue.length}${s.scope.type==='review-all'? T('session_review') : T('session_week', s.scope.week)}</span>
    <button class="session-close" onclick="VocabTrainer.closeSession()">×</button>
  </div>
  <div class="container"><div class="session-progress"><div class="session-progress-fill" style="width:${progress}%"></div></div></div>
  </div>
  <div class="session-body"><div class="card">${bodyHtml}</div></div>
</div>`;

    if ((card.mode === 'spelling' || card.mode === 'pl_input') && !s.answered) {
      setTimeout(() => { const inp = document.getElementById('spellInput'); if (inp) { inp.focus(); inp.value = s.spellValue || ''; } }, 30);
    }
  }

  function renderFlashcard(card, s) {
    return `
    <div class="card-prompt-label">${T('flashcard_prompt')}</div>
    <button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakWord(${card.week},${card.idx},this)">🔊</button>
    <div class="card-word">${deColored(verbForms(card.de))}</div>
    <div class="card-sub">${s.revealed ? esc(card.ru) : '&nbsp;'}</div>
    <div class="card-actions">
      ${!s.revealed
        ? `<button class="reveal-btn" onclick="VocabTrainer.revealFlash()">${T('flashcard_show')}</button>`
        : `<button class="mark wrong" onclick="VocabTrainer.answer(false)">${T('flashcard_wrong')}</button>
           <button class="mark right" onclick="VocabTrainer.answer(true)">${T('flashcard_right')}</button>`}
    </div>
    <div class="kbd-hint">${T('flashcard_hint')}</div>`;
  }

  function renderArticle(card, s) {
    const art = parseArticle(card.de);
    const arts = ['der', 'die', 'das'];
    let btns = arts.map(a => {
      let cls = 'art-btn ' + a;
      if (s.answered) {
        if (a === s.chosenArticle) {
          cls += (a === art.article) ? ' chosen-correct' : ' chosen-wrong';
        } else if (a === art.article) {
          cls += ' reveal-correct';
        }
      }
      return `<button class="${cls}" ${s.answered?'disabled':''} onclick="VocabTrainer.chooseArticle('${a}')">${a}</button>`;
    }).join('');
    return `
    <div class="card-prompt-label">${T('article_prompt')}</div>
    <div class="card-word">${esc(art.core)}</div>
    <div class="art-btns">${btns}</div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect?'ok':'bad'}">
        ${s.lastCorrect ? T('article_correct') : T('article_wrong')} <span class="correct-answer"><span class="art ${art.article}" style="font-weight:600">${art.article}</span> ${esc(art.core)}</span> — ${esc(card.ru)}
      </div>
      <button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakWord(${card.week},${card.idx},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VocabTrainer.nextCard()">${T('article_next')}</button></div>
      <div class="kbd-hint">${T('article_hint_next')}</div>
    ` : `<div class="kbd-hint">${T('article_hint')}</div>`}`;
  }
  function chooseArticle(a) {
    const s = state.session; if (s.answered) return;
    const card = s.queue[s.pos];
    const art = parseArticle(card.de);
    s.chosenArticle = a;
    answer(a === art.article);
  }

  function renderSpelling(card, s) {
    let answeredBlock = '';
    if (s.answered) {
      const userRaw = (s.spellValue || '').trim();
      if (s.spellCorrect) {
        answeredBlock = `
        <div class="feedback ok">${T('spelling_correct')} <span class="correct-answer">${deColored(card.de)}</span>
          ${s.spellNote ? '<br><span class="spell-note">'+s.spellNote+'</span>' : ''}
        </div>`;
      } else {
        const d = diffChars(userRaw, card.de);
        const userShow = userRaw ? `<span class="cmp-val">${d.aHtml}</span>` : `<span class="spell-empty">${T('spelling_empty')}</span>`;
        answeredBlock = `
        <div class="spell-compare">
          <div class="cmp-row"><span class="cmp-label">${T('spelling_your')}</span>${userShow}</div>
          <div class="cmp-row"><span class="cmp-label">${T('spelling_right_ans')}</span><span class="cmp-val">${d.bHtml}</span></div>
          <div class="cmp-ru">${esc(card.ru)}</div>
        </div>`;
      }
    }
    return `
    <div class="card-prompt-label">${T('spelling_prompt')}</div>
    <div class="card-word" style="font-size:40px">${esc(card.ru)}</div>
    <div><input class="spell-input ${s.answered ? (s.spellCorrect?'correct':'wrong') : ''}" id="spellInput"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      ${s.answered ? `disabled value="${esc(s.spellValue||'')}"` : ''} placeholder="der … / …"
      onkeydown="if(event.key==='Enter'){event.preventDefault(); ${s.answered?'VocabTrainer.nextCard()':'VocabTrainer.submitSpelling()'}}"></div>
    ${s.answered ? `
      ${answeredBlock}
      <button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakWord(${card.week},${card.idx},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VocabTrainer.nextCard()">${T('spelling_next')}</button></div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="VocabTrainer.submitSpelling()">${T('spelling_check')}</button></div>
      <div class="kbd-hint">${T('spelling_accept_hint')}</div>
    `}`;
  }

  /* ==========================================================================
     PLURAL TRAINER RENDER (3 rotating modes: reveal / choose / type)
     ========================================================================== */
  function renderPluralFlash(card, s) {
    return `
    <div class="card-prompt-label">${T('plural_flash_prompt')}</div>
    <div class="card-word">${deColored(card.de)}</div>
    <div class="card-sub">${esc(card.ru)}</div>
    <div class="card-word" style="font-size:40px;margin-top:6px">${s.revealed ? deColored(card.pl) : '&nbsp;'}</div>
    ${s.revealed ? `<button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakPlural(${card.week},${card.idx},this)" style="margin-top:6px">🔊</button>` : ''}
    <div class="card-actions">
      ${!s.revealed
        ? `<button class="reveal-btn" onclick="VocabTrainer.revealPlural()">${T('plural_show')}</button>`
        : `<button class="mark wrong" onclick="VocabTrainer.answer(false)">${T('flashcard_wrong')}</button>
           <button class="mark right" onclick="VocabTrainer.answer(true)">${T('flashcard_right')}</button>`}
    </div>
    <div class="kbd-hint">${T('flashcard_hint')}</div>`;
  }
  function revealPlural() {
    state.session.revealed = true;
    render();
    const card = state.session.queue[state.session.pos];
    setTimeout(() => { const b = document.getElementById('cardAudio'); speakPlural(card.week, card.idx, b); }, 120);
  }

  function renderPluralChoose(card, s) {
    const correct = card.pl;
    const btns = card.options.map((opt, i) => {
      let cls = 'pl-btn';
      if (s.answered) {
        if (i === s.chosenPlIdx) { cls += (opt === correct) ? ' chosen-correct' : ' chosen-wrong'; }
        else if (opt === correct) { cls += ' reveal-correct'; }
      }
      return `<button class="${cls}" ${s.answered?'disabled':''} onclick="VocabTrainer.choosePlural(${i})">${deColored(opt)}</button>`;
    }).join('');
    return `
    <div class="card-prompt-label">${T('plural_choose_prompt')}</div>
    <div class="card-word">${deColored(card.de)}</div>
    <div class="card-sub">${esc(card.ru)}</div>
    <div class="pl-opts">${btns}</div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect?'ok':'bad'}">
        ${s.lastCorrect ? T('article_correct') : T('article_wrong')} <span class="correct-answer">${deColored(correct)}</span>
      </div>
      <button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakPlural(${card.week},${card.idx},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VocabTrainer.nextCard()">${T('article_next')}</button></div>
      <div class="kbd-hint">${T('article_hint_next')}</div>
    ` : `<div class="kbd-hint">1 · 2 · 3</div>`}`;
  }
  function choosePlural(i) {
    const s = state.session; if (s.answered) return;
    const card = s.queue[s.pos];
    if (i < 0 || i >= card.options.length) return;
    s.chosenPlIdx = i;
    answer(card.options[i] === card.pl);
  }

  function renderPluralInput(card, s) {
    let answeredBlock = '';
    if (s.answered) {
      const userRaw = (s.spellValue || '').trim();
      if (s.spellCorrect) {
        answeredBlock = `
        <div class="feedback ok">${T('spelling_correct')} <span class="correct-answer">${deColored(card.pl)}</span>
          ${s.spellNote ? '<br><span class="spell-note">'+s.spellNote+'</span>' : ''}
        </div>`;
      } else {
        const d = diffChars(userRaw, card.pl);
        const userShow = userRaw ? `<span class="cmp-val">${d.aHtml}</span>` : `<span class="spell-empty">${T('spelling_empty')}</span>`;
        answeredBlock = `
        <div class="spell-compare">
          <div class="cmp-row"><span class="cmp-label">${T('spelling_your')}</span>${userShow}</div>
          <div class="cmp-row"><span class="cmp-label">${T('spelling_right_ans')}</span><span class="cmp-val">${d.bHtml}</span></div>
          <div class="cmp-ru">${esc(card.ru)}</div>
        </div>`;
      }
    }
    return `
    <div class="card-prompt-label">${T('plural_input_prompt')}</div>
    <div class="card-word">${deColored(card.de)}</div>
    <div class="card-sub">${esc(card.ru)}</div>
    <div><input class="spell-input ${s.answered ? (s.spellCorrect?'correct':'wrong') : ''}" id="spellInput"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      ${s.answered ? `disabled value="${esc(s.spellValue||'')}"` : ''} placeholder="die …"
      onkeydown="if(event.key==='Enter'){event.preventDefault(); ${s.answered?'VocabTrainer.nextCard()':'VocabTrainer.submitPluralInput()'}}"></div>
    ${s.answered ? `
      ${answeredBlock}
      <button class="audio-btn" id="cardAudio" onclick="VocabTrainer.speakPlural(${card.week},${card.idx},this)" style="margin-top:8px">🔊</button>
      <div class="card-actions"><button class="next-btn" onclick="VocabTrainer.nextCard()">${T('spelling_next')}</button></div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="VocabTrainer.submitPluralInput()">${T('spelling_check')}</button></div>
      <div class="kbd-hint">${T('spelling_accept_hint')}</div>
    `}`;
  }
  function submitPluralInput() {
    const s = state.session; if (!s || s.answered) return;
    const card = s.queue[s.pos];
    const inp = document.getElementById('spellInput');
    const val = inp ? inp.value : '';
    s.spellValue = val;
    const u = normalize(val);
    const full = normalize(card.pl);
    const art = parseArticle(card.pl);
    let correct = false, note = '';
    if (u === full) { correct = true; }
    else if (art) {
      const core = normalize(art.core);
      const noArt = u.replace(/^(der|die|das)\s+/, '');
      if (noArt === core) {
        if (u === core) { correct = true; note = T('note_almost', `<span class="correct-answer">${art.article}</span>`); }
        else { correct = false; note = T('note_core_correct'); }
      }
    }
    s.spellCorrect = correct; s.spellNote = note;
    answer(correct);
  }

  function renderEnd() {
    const s = state.session;
    const pct = s.uniqueTotal ? Math.round(s.uniqueRight / s.uniqueTotal * 100) : 0;
    let msg = T('end_msg_inwork');
    if (pct === 100) msg = T('end_msg_perfect');
    else if (pct >= 80) msg = T('end_msg_great');
    else if (pct >= 60) msg = T('end_msg_good');

    const actions = cfg.embedded
      ? `<button class="btn primary big" onclick="VocabTrainer.closeSession()">${T('today_continue')}</button>
         <button class="btn big" style="margin-left:8px" onclick='VocabTrainer.startSession(${JSON.stringify(s.scope)})'>${T('end_again')}</button>`
      : `<button class="btn primary big" onclick="VocabTrainer.closeSession()">${T('end_back')}</button>
         <button class="btn big" style="margin-left:8px" onclick='VocabTrainer.startSession(${JSON.stringify(s.scope)})'>${T('end_again')}</button>`;

    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-body"><div class="session-end">
    <div class="card-prompt-label">${T('end_title')}</div>
    <div class="end-score num">${s.uniqueRight}<span style="font-size:24px;color:var(--ink-soft)">/${s.uniqueTotal}</span></div>
    <div class="end-msg">${msg}</div>
    <div class="end-detail">${T('end_detail', pct, s.queue.length)}</div>
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
    if (e.target && e.target.id === 'spellInput') return;

    if (card.mode === 'flashcard') {
      if (e.key === ' ') { e.preventDefault(); if (!s.revealed) revealFlash(); }
      else if (s.revealed) { if (e.key === '1' || e.key === 'ArrowLeft') answer(false); else if (e.key === '2' || e.key === 'ArrowRight') answer(true); }
    } else if (card.mode === 'article') {
      if (s.answered) { if (e.key === 'Enter') nextCard(); }
      else { if (e.key === '1') chooseArticle('der'); else if (e.key === '2') chooseArticle('die'); else if (e.key === '3') chooseArticle('das'); }
    } else if (card.mode === 'spelling') {
      if (s.answered && e.key === 'Enter') nextCard();
    } else if (card.mode === 'pl_flash') {
      if (e.key === ' ') { e.preventDefault(); if (!s.revealed) revealPlural(); }
      else if (s.revealed) { if (e.key === '1' || e.key === 'ArrowLeft') answer(false); else if (e.key === '2' || e.key === 'ArrowRight') answer(true); }
    } else if (card.mode === 'pl_choose') {
      if (s.answered) { if (e.key === 'Enter') nextCard(); }
      else { const n = parseInt(e.key, 10); if (!isNaN(n) && n >= 1 && n <= card.options.length) choosePlural(n - 1); }
    } else if (card.mode === 'pl_input') {
      if (s.answered && e.key === 'Enter') nextCard();
    }
  }

  /* ==========================================================================
     PUBLIC API
     ========================================================================== */
  return {
    init,
    render, renderHome, startSession,
    answer, nextCard, revealFlash, submitSpelling, chooseArticle,
    revealPlural, choosePlural, submitPluralInput,
    selectWeek, toggleMode, toggleLevel, exportProgress, importProgress,
    resetAll, resetWord, askConfirm, confirmYes, confirmNo, closeSession,
    speakWord, speakPlural, handleKeydown,
    serialize, applyData, applyVerbProgress, setVerbStore,
    /* introspection (used by tests + the /today host) */
    key, getTranslation, parseArticle, availableModes, deColored, verbForms, verbKeyForWord,
    makeCard, pickMode, updateCard, getCard, isDue, isSeen, cardBox, isMastered,
    makePluralCard, makePluralOptions, pluralDistractors, umlautify,
    collectPluralCards, allPluralCards, pickPluralMode,
    updatePlural, plHasPlural, plBox, plIsSeen, plIsMastered, plIsDue, plCard,
    weekStats, globalStats,
    get state() { return state; },
    get verbStore() { return verbStore; },
  };
})();

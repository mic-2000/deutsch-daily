/* grammar-drill.js — the GRAMMAR-DRILL trainer ENGINE. A thin, keyed-drill trainer that runs one
   Course-v2 grammar drill (a slug from GRAMMAR_DRILLS) as a short interactive session, so /today's
   grammar step can be practised, not just read.

   It is a single namespace object `window.GrammarDrill`, mirroring the vocab/verb engines so all
   three can coexist on one page (template `onclick` strings reference `GrammarDrill.check()` etc.).
   The engine itself owns NO persistent cloud state (no serialize/applyData): the Leitner
   grammar-review track lives in `planner_data.grammarReview` ({ slug: card }), owned by /today. The
   engine only REPORTS per-topic results (closeSession's summary → `perSlug`) and computes which topics
   are due (`dueReviewSlugs`), so the host grades one topic-level card per slug. A session runs ONE
   slug (`scope.slug`, the day's drill in the grammar step) or SEVERAL (`scope.slugs`, the review
   step's due topics).

   Drill data model (data/grammar-drills.js, keyed by slug, NOT index-matched):
     GRAMMAR_DRILLS[slug] = { level, week, concept, items: [ item, … ] }
   where each item is one of three types:
     • cloze  { type:'cloze',  de:'Ich ___ in Berlin. (wohnen)', answer:'wohne' }  — type the blank
     • choice { type:'choice', de:'Er ___ aus Italien.', answer:'kommt', options:[…] } — pick one
     • order  { type:'order',  answer:['Wie','heißt','du'] }                        — arrange tokens
   Localised concept + prompt come from the active locale's `drills[slug]` (EN fallback).

   Host wiring via init():
     GrammarDrill.init({
       embedded,       // true on /today (a session inside the flow); false = standalone (unused yet)
       onSessionEnd,   // embedded only: called with { right, total, completed } when the drill ends
     });

   Depends on globals: T/getLang (i18n), esc/normalize/track (utils), GRAMMAR_DRILLS (data). */
window.GrammarDrill = (function () {
  'use strict';

  let cfg = { embedded: false, onSessionEnd: null };
  function init(opts) { Object.assign(cfg, opts || {}); }
  function appEl() { return document.getElementById('app'); }

  /* ---- data access ---- */
  function drillOf(slug) { return (typeof GRAMMAR_DRILLS !== 'undefined' && GRAMMAR_DRILLS[slug]) ? GRAMMAR_DRILLS[slug] : null; }
  function hasDrill(slug) { return !!drillOf(slug); }
  /* Localised { concept, prompt } for a slug, from the active locale's drills block, EN fallback. */
  function drillLocale(slug) {
    const pick = (loc) => (loc && loc.drills && loc.drills[slug]) || null;
    return pick(window['LOCALE_' + getLang().toUpperCase()]) || pick(window.LOCALE_EN) || {};
  }

  /* ---- session state ---- */
  let state = { session: null };

  function shuffled(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

  /* Build a live queue item from a raw drill item (freezes a shuffled option order / token bank). The
     owning slug is tagged on afterwards (startSession), so multi-slug sessions can be graded per topic. */
  function makeItem(raw) {
    const item = { type: raw.type, de: raw.de || '', answer: raw.answer, firstTry: null };
    if (raw.type === 'choice') item.options = shuffled(raw.options || []);
    if (raw.type === 'order') { item.tokens = shuffled(raw.answer || []); item.picked = []; }
    return item;
  }

  /* Start a drill session. Accepts ONE slug (`scope.slug`, the grammar step) or an ORDERED list
     (`scope.slugs`, the review step); each queue item is tagged with its owning slug. `scope.review`
     flags a review session (badge + host routing). Leaves state.session null (renders nothing) when no
     given slug resolves to a non-empty drill, so the /today host can auto-skip without a deadlock. */
  function startSession(scope) {
    scope = scope || {};
    const slugs = Array.isArray(scope.slugs) ? scope.slugs.slice() : (scope.slug ? [scope.slug] : []);
    const queue = [];
    const used = [];
    slugs.forEach((slug) => {
      const dr = drillOf(slug);
      if (!dr || !Array.isArray(dr.items) || dr.items.length === 0) return;
      used.push(slug);
      dr.items.forEach((raw) => { const item = makeItem(raw); item.slug = slug; queue.push(item); });
    });
    if (queue.length === 0) { state.session = null; return; }
    state.session = { slugs: used, queue, pos: 0, answered: false, lastCorrect: null,
                      uniqueRight: 0, uniqueTotal: queue.length, inputValue: '', review: !!scope.review };
    render();
  }

  function closeSession() {
    const s = state.session;
    const summary = s ? summarize(s) : null;
    if (summary && summary.total > 0) {
      const score = Math.round((summary.right / summary.total) * 100);
      const slug = summary.perSlug && summary.perSlug[0] ? summary.perSlug[0].slug : 'unknown';
      track('drill_done', { slug: slug, score: score });
    }
    state.session = null;
    if (cfg.embedded && typeof cfg.onSessionEnd === 'function') cfg.onSessionEnd(summary);
    else render();
  }

  /* Session summary for the host. `completed` = the queue was worked to the end (false when closed
     early via ×) — used exactly as for the vocab/verb engines. `perSlug` tallies each drill topic
     (first-try `right` / `total` / `answered`), so /today can grade ONE topic-level grammar-review
     Leitner card per FULLY worked slug (answered === total). `review` echoes the session kind. */
  function summarize(s) {
    const per = {};
    s.queue.forEach((it) => {
      const p = per[it.slug] || (per[it.slug] = { slug: it.slug, right: 0, total: 0, answered: 0 });
      p.total++;
      if (it.firstTry !== null) { p.answered++; if (it.firstTry) p.right++; }
    });
    return {
      right: s.uniqueRight || 0,
      total: s.uniqueTotal || 0,
      completed: s.pos >= s.queue.length,
      review: !!s.review,
      perSlug: Object.keys(per).map((k) => per[k]),
    };
  }

  /* ---- grammar-review track helpers (state itself lives in planner_data.grammarReview on /today) ---- */
  /* Topic-level pass for a grammar-review card (Plan §8: grade the topic, not each example): the topic
     counts as "known" this session when ≥60% of its items were right on the FIRST try — the same bar
     as the engine's "good" end screen. Only meaningful for a fully worked topic; the host grades only
     those (answered === total). */
  const REVIEW_PASS_RATIO = 0.6;
  function reviewPassed(entry) { return !!(entry && entry.total > 0 && (entry.right / entry.total) >= REVIEW_PASS_RATIO); }

  /* Which grammar-review slugs are DUE. `reviewMap` = planner_data.grammarReview ({ slug: card }); a
     slug is due when its card's `due` is at/behind `now`. Filtered to slugs that still resolve in
     GRAMMAR_DRILLS (a dropped course slug simply stops appearing), ordered most-overdue-first, and
     capped to `limit` WHOLE topics (so every reviewed topic is worked end-to-end and thus gradeable). */
  function dueReviewSlugs(reviewMap, now, limit) {
    if (!reviewMap || typeof reviewMap !== 'object') return [];
    const t = (typeof now === 'number') ? now : Date.now();
    const due = Object.keys(reviewMap)
      .filter((slug) => hasDrill(slug))
      .map((slug) => ({ slug, card: reviewMap[slug] }))
      .filter((x) => x.card && typeof x.card === 'object' && (x.card.due || 0) <= t)
      .sort((a, b) => (a.card.due || 0) - (b.card.due || 0))
      .map((x) => x.slug);
    return (typeof limit === 'number' && limit >= 0) ? due.slice(0, limit) : due;
  }

  /* Which grammar-review slugs are the WEAKEST (Plan §11 Phase 6, item 14): topics whose card is a
     weak spot (seen + missed + not mastered), ranked worst-first by leitnerWeakness, regardless of
     due date. Filtered to slugs that still resolve in GRAMMAR_DRILLS, capped to `limit` WHOLE topics.
     Used by /today's cross-track weak-spots round; the `review` step still uses dueReviewSlugs
     (due-based spacing), so the two selections stay independent. */
  function weakReviewSlugs(reviewMap, limit) {
    if (!reviewMap || typeof reviewMap !== 'object') return [];
    const weak = Object.keys(reviewMap)
      .filter((slug) => hasDrill(slug))
      .map((slug) => ({ slug, card: reviewMap[slug] }))
      .filter((x) => leitnerIsWeak(x.card))
      .sort((a, b) => leitnerWeakness(b.card) - leitnerWeakness(a.card))
      .map((x) => x.slug);
    return (typeof limit === 'number' && limit >= 0) ? weak.slice(0, limit) : weak;
  }

  /* ---- answering ---- */
  function grade(item, correct) {
    if (item.firstTry === null) { item.firstTry = correct; if (correct) state.session.uniqueRight++; }
    const s = state.session;
    s.answered = true; s.lastCorrect = correct;
    track('grammar_drill', { type: item.type, correct });
    render();
  }
  function choose(i) {
    const s = state.session; if (!s || s.answered) return;
    const item = s.queue[s.pos];
    if (i < 0 || i >= item.options.length) return;
    s.chosen = i;
    grade(item, item.options[i] === item.answer);
  }
  /* Keep the cloze value in session state (via oninput) so it survives a re-render and check() has an
     authoritative source that doesn't depend on reading back the live input element. */
  function setInput(v) { if (state.session) state.session.inputValue = v; }
  function check() {
    const s = state.session; if (!s || s.answered) return;
    const item = s.queue[s.pos];
    if (item.type === 'order') { grade(item, normalize(assembled(item)) === normalize(item.answer.join(' '))); return; }
    grade(item, normalize(s.inputValue || '') === normalize(String(item.answer)));
  }
  function next() {
    const s = state.session; if (!s) return;
    s.pos++; s.answered = false; s.lastCorrect = null; s.inputValue = ''; s.chosen = null;
    render();
  }

  /* order helpers */
  function assembled(item) { return item.picked.map((i) => item.tokens[i]).join(' '); }
  function pickToken(i) {
    const s = state.session; if (!s || s.answered) return;
    const item = s.queue[s.pos];
    if (item.picked.indexOf(i) !== -1) return;   // already placed
    item.picked.push(i);
    render();
  }
  function unpickToken(pos) {
    const s = state.session; if (!s || s.answered) return;
    const item = s.queue[s.pos];
    if (pos >= 0 && pos < item.picked.length) { item.picked.splice(pos, 1); render(); }
  }

  /* ==========================================================================
     RENDER
     ========================================================================== */
  function render() {
    const s = state.session;
    if (!s) return;                              // embedded: host owns the screen between drills
    if (s.pos >= s.queue.length) { renderEnd(); return; }
    const item = s.queue[s.pos];
    const meta = drillLocale(item.slug);          // per-item: a review session mixes topics
    const progress = (s.pos / s.queue.length) * 100;
    let body = '';
    if (item.type === 'cloze') body = renderCloze(item, s);
    else if (item.type === 'choice') body = renderChoice(item, s);
    else body = renderOrder(item, s);

    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-top"><div class="container session-top-row">
    <span class="session-mode-badge">${T(s.review ? 'drill_review_badge' : 'drill_badge')}</span>
    <span class="session-counter">${s.pos + 1} / ${s.queue.length}</span>
    <button class="session-close" onclick="GrammarDrill.closeSession()">×</button>
  </div>
  <div class="container"><div class="session-progress"><div class="session-progress-fill" style="width:${progress}%"></div></div></div>
  </div>
  <div class="session-body"><div class="card">
    <div class="card-prompt-label">${esc(meta.prompt || meta.concept || '')}</div>
    ${body}
  </div></div>
</div>`;

    if (item.type === 'cloze' && !s.answered) {
      setTimeout(() => { const inp = document.getElementById('drillInput'); if (inp) { inp.focus(); inp.value = s.inputValue || ''; } }, 30);
    }
  }

  /* Render a cloze sentence: `___` becomes the blank (or the answer once answered). */
  function clozeSentence(de, fill) {
    const slot = fill != null
      ? `<span class="drill-fill">${esc(fill)}</span>`
      : `<span class="drill-blank">_____</span>`;
    return String(de).split('___').map((p) => esc(p)).join(slot);
  }

  function renderCloze(item, s) {
    const answerHtml = `<span class="correct-answer">${esc(String(item.answer))}</span>`;
    return `
    <div class="drill-sentence">${s.answered ? clozeSentence(item.de, item.answer) : clozeSentence(item.de, null)}</div>
    <div><input class="spell-input ${s.answered ? (s.lastCorrect ? 'correct' : 'wrong') : ''}" id="drillInput"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      ${s.answered ? `disabled value="${esc(s.inputValue || '')}"` : ''} placeholder="…"
      oninput="GrammarDrill.setInput(this.value)"
      onkeydown="if(event.key==='Enter'){event.preventDefault(); ${s.answered ? 'GrammarDrill.next()' : 'GrammarDrill.check()'}}"></div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect ? 'ok' : 'bad'}">${s.lastCorrect ? T('drill_correct') : T('drill_wrong', answerHtml)}</div>
      <div class="card-actions"><button class="next-btn" onclick="GrammarDrill.next()">${T('drill_next')}</button></div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" onclick="GrammarDrill.check()">${T('drill_check')}</button></div>
      <div class="kbd-hint">${T('drill_enter_hint')}</div>
    `}`;
  }

  function renderChoice(item, s) {
    const btns = item.options.map((opt, i) => {
      let cls = 'pl-btn';
      if (s.answered) {
        if (i === s.chosen) cls += (opt === item.answer) ? ' chosen-correct' : ' chosen-wrong';
        else if (opt === item.answer) cls += ' reveal-correct';
      }
      return `<button class="${cls}" ${s.answered ? 'disabled' : ''} onclick="GrammarDrill.choose(${i})">${esc(opt)}</button>`;
    }).join('');
    return `
    ${item.de ? `<div class="drill-sentence">${clozeSentence(item.de, s.answered ? item.answer : null)}</div>` : ''}
    <div class="pl-opts">${btns}</div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect ? 'ok' : 'bad'}">${s.lastCorrect ? T('drill_correct') : T('drill_wrong', `<span class="correct-answer">${esc(String(item.answer))}</span>`)}</div>
      <div class="card-actions"><button class="next-btn" onclick="GrammarDrill.next()">${T('drill_next')}</button></div>
    ` : `<div class="kbd-hint">1 · 2 · 3</div>`}`;
  }

  function renderOrder(item, s) {
    const placed = item.picked.map((tokIdx, pos) =>
      `<button class="drill-token placed" ${s.answered ? 'disabled' : ''} onclick="GrammarDrill.unpickToken(${pos})">${esc(item.tokens[tokIdx])}</button>`).join('');
    const bank = item.tokens.map((tok, i) => {
      const used = item.picked.indexOf(i) !== -1;
      return `<button class="drill-token ${used ? 'used' : ''}" ${(used || s.answered) ? 'disabled' : ''} onclick="GrammarDrill.pickToken(${i})">${esc(tok)}</button>`;
    }).join('');
    const full = item.picked.length === item.tokens.length;
    return `
    <div class="drill-order-prompt">${T('drill_order_prompt')}</div>
    <div class="drill-answer">${placed || `<span class="drill-answer-empty">${T('drill_order_empty')}</span>`}</div>
    <div class="drill-bank">${bank}</div>
    ${s.answered ? `
      <div class="feedback ${s.lastCorrect ? 'ok' : 'bad'}">${s.lastCorrect ? T('drill_correct') : T('drill_wrong', `<span class="correct-answer">${esc(item.answer.join(' '))}</span>`)}</div>
      <div class="card-actions"><button class="next-btn" onclick="GrammarDrill.next()">${T('drill_next')}</button></div>
    ` : `
      <div class="card-actions"><button class="reveal-btn" ${full ? '' : 'disabled'} onclick="GrammarDrill.check()">${T('drill_check')}</button></div>
    `}`;
  }

  function renderEnd() {
    const s = state.session;
    const pct = s.uniqueTotal ? Math.round(s.uniqueRight / s.uniqueTotal * 100) : 0;
    let msg = T('drill_end_inwork');
    if (pct === 100) msg = T('drill_end_perfect');
    else if (pct >= 60) msg = T('drill_end_good');
    appEl().innerHTML = `
<div class="session-bg">
  <div class="session-body"><div class="session-end">
    <div class="card-prompt-label">${T('drill_end_title')}</div>
    <div class="end-score num">${s.uniqueRight}<span style="font-size:24px;color:var(--ink-soft)">/${s.uniqueTotal}</span></div>
    <div class="end-msg">${msg}</div>
    <button class="btn primary big" onclick="GrammarDrill.closeSession()">${T('today_continue')}</button>
  </div></div>
</div>`;
  }

  /* ==========================================================================
     KEYBOARD (host routes one listener → handleKeydown)
     ========================================================================== */
  function handleKeydown(e) {
    const s = state.session; if (!s) return;
    if (s.pos >= s.queue.length) { if (e.key === 'Escape' || e.key === 'Enter') closeSession(); return; }
    if (e.key === 'Escape') { closeSession(); return; }
    const item = s.queue[s.pos];
    if (e.target && e.target.id === 'drillInput') return;    // typing in the cloze box
    if (s.answered) { if (e.key === 'Enter') next(); return; }
    if (item.type === 'choice') { const n = parseInt(e.key, 10); if (!isNaN(n) && n >= 1 && n <= item.options.length) choose(n - 1); }
  }

  return {
    init,
    startSession, closeSession, render,
    choose, check, next, setInput, pickToken, unpickToken, handleKeydown,
    hasDrill, drillOf, drillLocale,
    /* grammar-review track (state owned by /today's planner_data.grammarReview) */
    dueReviewSlugs, weakReviewSlugs, reviewPassed,
    /* introspection (tests) */
    makeItem, assembled, summarize,
    get state() { return state; },
  };
})();

/* leitner.js — shared Leitner spaced-repetition box model.
 * Used by the vocabulary trainer (vocab.html) and the verb trainer (verbs.html). The model is
 * key-agnostic: it operates on plain "card" records, so each page keeps its own thin wrappers
 * that build the storage key and choose the store (vocab routes verb-words into the shared
 * verbs_data store; verbs uses state.mastery directly).
 *
 * A card is { box, due, right, wrong, seen }. Boxes 1..5 with doubling intervals; box 5 = mastered.
 */
const DAY = 86400000;
const BOX_INTERVAL = { 1: 1 * DAY, 2: 2 * DAY, 3: 4 * DAY, 4: 8 * DAY, 5: 16 * DAY };
const MAX_BOX = 5;

/* A fresh, never-seen card. */
function leitnerBlank() { return { box: 0, due: 0, right: 0, wrong: 0, seen: 0 }; }

/* Local-date key ("YYYY-MM-DD") used by the trainers' per-day new-card ledgers (newLog). Local, not
   UTC, so the "new cards today" budget rolls over at the learner's own midnight; `d` is optional and
   defaults to now. Shared here so vocab + verb trainers key their ledgers identically. */
function leitnerToday(d) {
  const t = d || new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

/* A card is due when it has never been seen (no record) or its due time has passed. */
function leitnerIsDue(card, now) { return !card || card.due <= now; }
function leitnerIsSeen(card) { return !!(card && card.seen > 0); }
function leitnerBoxOf(card) { return card ? card.box : 0; }
function leitnerIsMastered(card) { return leitnerBoxOf(card) >= MAX_BOX; }

/* "Weak spot" model — shared by the trainers' cross-track weak-spots session (/today, item 14). A
   weak spot is a card the learner keeps getting wrong: SEEN at least once, MISSED at least once, and
   NOT yet mastered. `leitnerWeakness` ranks them (higher = weaker) so the weakest surface first —
   dominated by the miss COUNT, then the miss RATIO, then how far the card still is from mastery.
   Non-weak cards score -Infinity so they sort out of any ranking. Due date is intentionally ignored:
   the point of a weak-spots round is to shore up shaky cards now, not to wait for them to fall due. */
function leitnerIsWeak(card) { return !!(card && card.seen > 0 && card.wrong > 0 && leitnerBoxOf(card) < MAX_BOX); }
function leitnerWeakness(card) {
  if (!leitnerIsWeak(card)) return -Infinity;
  return card.wrong * 10 + (card.wrong / card.seen) * 5 + (MAX_BOX - card.box);
}

/* Record one answer on the card (mutates and returns it):
 *   correct → box = min(MAX_BOX, box + 1)   (new 0→1, one box per correct)
 *   wrong   → depends on opts.wrongPolicy:
 *               'reset' (default) → box = 1              (a miss sends it back to box 1)
 *               'soft'            → box = max(1, box-2)  (a miss drops two boxes, floored at 1)
 * then reschedule due = now + interval(box).
 * The default preserves the historical reset behaviour, so callers that omit opts (e.g.
 * collections) are unaffected; the trainers opt into 'soft' so partial progress on a hard
 * card isn't fully wiped by a single slip. */
function leitnerApply(card, correct, opts) {
  const wrongPolicy = (opts && opts.wrongPolicy) || 'reset';
  card.seen++;
  if (correct) { card.right++; card.box = Math.min(MAX_BOX, card.box + 1); }
  else { card.wrong++; card.box = wrongPolicy === 'soft' ? Math.max(1, card.box - 2) : 1; }
  card.due = Date.now() + BOX_INTERVAL[card.box];
  return card;
}

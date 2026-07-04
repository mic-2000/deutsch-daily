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

/* A card is due when it has never been seen (no record) or its due time has passed. */
function leitnerIsDue(card, now) { return !card || card.due <= now; }
function leitnerIsSeen(card) { return !!(card && card.seen > 0); }
function leitnerBoxOf(card) { return card ? card.box : 0; }
function leitnerIsMastered(card) { return leitnerBoxOf(card) >= MAX_BOX; }

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

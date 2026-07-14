# 14. Already-fixed bugs (do not reintroduce)

> Section §14 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

1. **Flashcard wouldn't advance.** `answer()` set `answered=true`, but `renderFlashcard` only read
   `revealed`, so it stuck and repeated "Knew it" clicks inflated the box. Fix: in flashcard mode
   `answer()` calls `nextCard()` immediately.
2. **Correct article button became invisible.** `chosen-correct` (white text) and `reveal-correct`
   (green text) both applied; green text on green background. Fix: add `reveal-correct` only when
   the user picked a *different* (wrong) button.
3. **Typed spelling answer disappeared after checking.** Fix: set the input `value` when `answered`
   and show an explicit "your answer / correct" comparison via `diffChars`.
4. **Box jumped 0→2 on the first correct answer.** Was `eff = box||1; box = eff+1`. Fix:
   `box = min(5, box+1)` (new 0→1, one box per correct answer).
5. **Reset buttons did nothing** — they depended on the native `confirm()`. Fix: in-page modal
   confirm.
6. **"Create/Open file" buttons did nothing** — File System Access API isn't available everywhere
   and the error was swallowed. Resolution: the FSA auto-sync feature was removed; only Blob
   export/import remains (and any user-facing failures should toast).
7. **Dark theme flashed light on every load / switch.** `theme.js` is external and runs after the
   blocking Supabase CDN script, so the light default could paint first. Fix: an inline `<head>`
   snippet sets `data-theme` from `localStorage` synchronously before any CSS paints (see §4).
8. **Sections felt like different sites** — mismatched container widths (planner 820 vs others 920)
   and four duplicated header blocks. Fix: one `--page-max: 920px` token + a single `appHeader()`
   builder in `header.js` (§4, §11). Don't reintroduce per-page width/header overrides.
9. **Re-queued cards were graded twice.** After a wrong first answer a card is re-queued once as an
   easier reveal; `answer()` called `updateCard`/`updatePlural` unconditionally, so answering the
   re-queue re-ran `leitnerApply` (a second `seen++` and, if correct, a box bump — a wrong-then-right
   card ended at box 2 instead of the demoted box). Fix: grade only when `!card.requeued`, in all
   four `answer()` paths (vocab words + plurals, verbs, collections). Guarded by
   `tests/requeue.test.js`.

# 20. `welcome.html` — first-run onboarding (`/welcome`)

> Section §20 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

A 3-minute onboarding that gives a user a personalized start and an instant first win. Five tap-only
chip questions (**nothing pre-selected** — the learner picks each; "Start" stays disabled until all
four are answered, "Skip" falls back to their previous answers or A1 defaults) → a ~5-card
**mini-lesson** (embedded trainer, **no AI key / network** — Leitner + Web Speech only) → a success
screen → `/today`. Under the **minutes** question a live `.onb-load` panel explains how the daily
workload changes with the picked tariff (`onb_load_5/10/15/20`, mirroring `/today`'s `tariff()`).

**Gating.** `cloud-sync.initApp` redirects to `/welcome` (every app page passes through `initApp`,
so the funnel is caught everywhere; `/welcome` and `/login` are excluded → no loop) when either:
(a) the account has **no `progress` row** (brand-new, detected via `.maybeSingle()` → `data:null`), or
(b) the row's `onboarding.onbVersion` is **below `ONBOARDING_VERSION`** — the v2 course rebuild
re-onboards every existing user **once** so they re-pick preferences for the new 180-day plan.
Completing (or skipping) writes the row **and stamps the current `onbVersion`** (`saveOnboardingToCloud`),
so the gate never fires again until the next bump. Both signals are computed only on a successful read,
so an offline read never traps anyone. Returning (re-onboarding) users also see an `.onb-updated`
notice explaining the course was rebuilt. (See §4 / §5.)

**The five questions → real effects:**
- **Level** (A1/A2/B1) → `VocabTrainer.state.levels` + `planner_data.currentDay` set to the first day
  of that phase (`WEEK_FOR_LEVEL = {A1:1, A2:9, B1:17}`, now sourced from `course-consts.js` → `DAYS.find(d=>d.week===W).day` = day 1/41/80).
- **Language** → `setLang(code)` live (re-localizes the page; persists to `localStorage` + cloud).
- **Minutes/day** → stored in `onboarding`; `/today` reads `userOnboarding.minutes` and caps each
  session queue (`{5:6,10:12,15:18,'20+':25}`) in `startVocabStep`/`startVerbsStep`.
- **Goal** + **Hardest** → stored; appended to the AI tutor + summary prompts via `ai-config`
  (`AI_GOAL_PHRASES`/`AI_HARDEST_PHRASES`, read from the `userOnboarding` global).
- **Hardest** also seeds default vocab `modes` and picks the mini-lesson's exercise: `verbs` →
  `VerbsTrainer` triad; `articles` → article mode; otherwise flashcards. Queue sliced to ~5.

**Persistence on finish/skip:** `saveOnboardingToCloud({done, level, goal, minutes, hardest, at})` (which adds `onbVersion`),
`saveToCloud()` (planner_data start day), `saveVocabToCloud(...)` (mini-lesson mastery is real
practice), and `saveVerbsToCloud(...)` when a verb mini-lesson ran. The page is a thin host like
`/today` (`CLOUD_FIELD='planner_data'`, shared `verbStore` wiring, embedded trainers); chrome in
`welcome.css`, the success screen reuses `today.css` `.flow-done`. Strings are `onb_*` in all three
locales. Guarded by `tests/onboarding.test.js`.

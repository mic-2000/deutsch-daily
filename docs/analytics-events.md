# Analytics Events Taxonomy

Last updated: 2026-07-12. All events fired via `track(name, props)` helper in `assets/js/utils.js`.

## Event Specification

Events are snake_case. Props are flat (no nesting), small (no PII), and always include relevant context.

### Landing & Acquisition

| Event | Props | Fired when | Example |
|---|---|---|---|
| `landing_cta_click` | `section` (hero, pricing, faq, footer) | User clicks any CTA on landing page | user clicks "Start Learning" button |
| `login` | `method` (email, google) | User successfully logs in | auth redirect to /today completes |

### Registration & Onboarding

| Event | Props | Fired when | Example |
|---|---|---|---|
| `register` | `method` (email, google) | User completes registration form | form submitted, user created |
| `onboarding_start` | `level` (A1, A2, B1), `minutes` (5-20), `hardest` (vocab/grammar/verbs) | User arrives at /welcome and sees first question | page loads, before they answer |
| `onboarding_complete` | `level`, `minutes`, `hardest` | User finishes all 5 questions and enters mini-lesson | Start button clicked after last answer |
| `onboarding_skip` | `level`, `minutes`, `hardest` | User skips onboarding (if that's an option) | skip link clicked |
| `welcome_minilesson_done` | (none) | User completes the mini-lesson and is routed to /today | lesson ends |

### Daily Flow

| Event | Props | Fired when | Example |
|---|---|---|---|
| `today_start` | `day` (int, 1–180), `tariff` (5/10/15/20+) | User opens /today and buildSteps() completes | page render finishes |
| `today_block_done` | `block` (grammar/drill/vocab/verbs/ai), `day` (int) | User completes one training block within a day session | "Continue" after vocab trainer |
| `day_complete` | `day` (int), `week` (int, 1–36), `tariff` | recordDayStats() fires (end-of-day marker) | all blocks done or user dismisses |

### Trainers (Vocab, Verbs, Grammar)

| Event | Props | Fired when | Example |
|---|---|---|---|
| `session_end` | `kind` (vocab/verbs), `right` (int), `total` (int) | Trainer session finishes (all cards done or user exits) | vocab trainer done screen |
| `word_review` | `mode` (article/plural/def), `correct` (true/false) | User answers one vocab card | after each card |
| `verb_review` | `mode` (conjugate/translate), `correct` (true/false) | User answers one verb card | after each card |
| `drill_done` | `slug` (cloze/choice/order), `score` (0–100, %) | Grammar drill session ends | grammar step completes in /today |

### AI Features

| Event | Props | Fired when | Example |
|---|---|---|---|
| `ai_message_sent` | `surface` (today/planner/settings) | User sends a message to the AI tutor | chat message submitted |
| `ai_key_added` | `synced` (true/false) | User enters/saves a personal Gemini API key | key field submitted, saved |

### Collections

| Event | Props | Fired when | Example |
|---|---|---|---|
| `collection_created` | `words` (int, count added) | User creates a new personal collection | collection save completed |
| `collection_imported` | `words` (int, count) | User imports a CSV/paste into a collection | import dialog completed |

### Settings & Account

| Event | Props | Fired when | Example |
|---|---|---|---|
| `settings_delete_requested` | (none) | User submits account deletion request | form submitted |
| `settings_delete_cancelled` | (none) | User cancels deletion during recovery window | cancel link clicked |

### Monetization & Paywall

| Event | Props | Fired when | Example |
|---|---|---|---|
| `paywall_view` | `placement` (day15/stats/ai_quota/week3_preview) | Paywall UI rendered to user | /today shows day-15 gate |
| `paywall_click` | `placement`, `action` (checkout/dismiss/learn_more) | User interacts with paywall | "Upgrade" button clicked |
| `checkout_start` | `plan` (monthly/yearly/lifetime) | User clicks checkout link and is routed to provider | external checkout opened |
| `checkout_success` | `plan` | Webhook confirms payment completed | entitlements row created |

## Metrics Derived from Events

See `§5. Metrics Dashboard` in the development plan.

## Guidelines

- **Fire from handlers, never from render()** — prevents spam on re-renders
- **No PII** — no user names, emails, or URLs in props
- **Idempotency** — each action should fire the event exactly once
- **Props are strings or numbers only** — no objects/arrays
- **Always guard against Umami unavailability** — the `track()` helper already does this

## Current Status

- ✅ Implemented (23 events in source, verified 2026-07-12): every event above except the
  Monetization & Paywall section, plus 3 legacy events kept for continuity that predate this
  spec and are not in the tables above: `day1_start`, `ai_lesson_open`, `grammar_drill`.
- 🚧 To implement: `paywall_view`, `paywall_click`, `checkout_start`, `checkout_success` — land
  with DEV-3/4.
- 🚧 Missing from the DEV-1 spec: the `tests/events.test.js` source guard.

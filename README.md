# Deutsch Daily

[![Tests](https://github.com/mic-2000/deutsch-daily/actions/workflows/tests.yml/badge.svg)](https://github.com/mic-2000/deutsch-daily/actions/workflows/tests.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://deutsch-daily-red.vercel.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Personal German learning app (A1 → B1) with a daily task planner, vocabulary trainer and verb conjugation trainer.

**Live:** https://deutsch-daily-red.vercel.app/

## Screenshots

**Daily Planner** — a 24-week curriculum with today's task, grammar focus and a one-click AI lesson.

![Daily Planner](docs/screenshots/Screenshot_2.png)

**Vocabulary Trainer** — spaced repetition (Leitner) with flashcard, article (der/die/das) and spelling modes, plus German text-to-speech.

![Vocabulary Trainer](docs/screenshots/Screenshot_4.png)

**Verb Trainer** — recall all three forms on a shared Leitner schedule.

![Verb Trainer](docs/screenshots/Screenshot_5.png)

## Features

- **Daily Planner** — 24-week curriculum (118 days) with grammar, listening, writing and speaking tasks. Built-in AI chat (Gemini): copy today's plan to get detailed material and exercises.
- **Vocabulary Trainer** — ~500 words across 24 weeks. Spaced repetition (5-box Leitner system) with three modes: flashcards, article (der/die/das), and spelling. German text-to-speech.
- **Verb Trainer** — conjugation practice on a shared Leitner schedule, with German text-to-speech.
- **3 UI languages** — English, Ukrainian, Russian (including all week content).
- **Cloud sync** — progress saved to Supabase; works across devices.
- **Auth** — email/password and Google OAuth.

## Stack

- Vanilla HTML / CSS / JS — no framework, no bundler
- [Supabase](https://supabase.com) — auth + progress storage
- [Vercel](https://vercel.com) — hosting

## Why vanilla JS?

This is a deliberate constraint, not a missing build step. The whole app is plain HTML/CSS/JS
shipped straight to the browser — no framework, no bundler, no transpiler. The goal was to see how
far the raw platform takes you when you lean on it instead of around it:

- **Zero build for the UI** — pages are markup plus one inline `<script>`; the only build step
  injects Supabase credentials.
- **Small, legible surface** — ~6,900 lines total, with shared modules for spaced repetition
  (Leitner), German text-to-speech, i18n and cloud sync.
- **Still tested** — ~100 tests run the pages' real inline scripts in a `vm` sandbox (see below),
  so refactors stay safe without a browser or a framework test runner.

Architecture and conventions are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

## Development

```bash
# Inject Supabase credentials (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
npm run build

# Serve locally (file:// won't work due to Supabase auth)
npx serve .
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Vercel and locally before running the build.

## Tests

```bash
# Full suite (node:test, no browser needed)
npm test

# Regression safety subset
npm run test:regression
```

Tests run the pages' inline scripts in a `vm` sandbox via `tests/harness.js` — covering the Leitner
model, speech, confirm modals, markdown rendering, i18n key parity and render smoke checks.

Every push and pull request to `main` runs the full suite via
[GitHub Actions](.github/workflows/tests.yml).

## License

[MIT](LICENSE)

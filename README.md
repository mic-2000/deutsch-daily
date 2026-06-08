# Deutsch Daily

Personal German learning app (A1 → B1) with a daily task planner, vocabulary trainer and verb conjugation trainer.

**Live:** https://deutsch-daily-red.vercel.app/

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

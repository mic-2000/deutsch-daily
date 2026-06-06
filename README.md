# Deutsch Daily

Personal German learning app (A1 → B1) with a daily task planner and vocabulary trainer.

**Live:** https://deutsch-daily-red.vercel.app/

## Features

- **Daily Planner** — 24-week curriculum (118 days) with grammar, listening, writing and speaking tasks. Copy today's plan into an AI chat to get detailed material and exercises.
- **Vocabulary Trainer** — ~500 words across 24 weeks. Spaced repetition (5-box Leitner system) with three modes: flashcards, article (der/die/das), and spelling.
- **3 UI languages** — Russian, Ukrainian, English (including all week content).
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

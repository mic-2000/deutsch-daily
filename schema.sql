-- Deutsch Daily — Supabase schema
-- Run in the Supabase SQL editor (Dashboard → SQL).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE.

-- -------------------------------------------------------------------------
-- progress  (one row per user — planner + vocab + verbs progress)
-- -------------------------------------------------------------------------
create table if not exists public.progress (
  user_id      uuid        primary key references auth.users(id),
  planner_data jsonb       default '{}'::jsonb,
  vocab_data   jsonb       default '{}'::jsonb,
  verbs_data   jsonb       default '{}'::jsonb,
  lang         text        default 'en'::text,
  theme        text,
  updated_at   timestamptz default now()
);

alter table public.progress enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'progress' and policyname = 'own data'
  ) then
    create policy "own data" on public.progress
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- -------------------------------------------------------------------------
-- lessons  (AI chat history — one row per user × day)
--   day > 0  →  lesson for study day N
--   day < 0  →  weekly summary for week (-day)
-- -------------------------------------------------------------------------
create table if not exists public.lessons (
  user_id    uuid        not null references auth.users(id),
  day        integer     not null,
  messages   jsonb       default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, day)
);

alter table public.lessons enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'lessons' and policyname = 'own lessons'
  ) then
    create policy "own lessons" on public.lessons
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

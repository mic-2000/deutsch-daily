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
  gemini_key   text,                          -- opt-in: user's Gemini API key, synced across devices
  updated_at   timestamptz default now()
);

-- For existing databases (table already created without the column):
alter table public.progress add column if not exists gemini_key text;

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

-- -------------------------------------------------------------------------
-- collections  (user-supplied word sets — one row per collection)
--   words   : [ { id, de, tr, note? }, ... ]   (rewritten only on edit)
--   mastery : { "<word.id>": {box,due,right,wrong,seen} }  (hot path: training)
-- ids are client-generated (crypto.randomUUID); gen_random_uuid() is a fallback.
-- -------------------------------------------------------------------------
create table if not exists public.collections (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id),
  name       text        not null,
  words      jsonb       default '[]'::jsonb,
  mastery    jsonb       default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists collections_user_id_idx on public.collections (user_id);

alter table public.collections enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'collections' and policyname = 'own collections'
  ) then
    create policy "own collections" on public.collections
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

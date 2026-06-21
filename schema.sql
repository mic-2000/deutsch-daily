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
  deletion_requested_at timestamptz,          -- set when the user asks to delete their account; purged after 30 days
  updated_at   timestamptz default now()
);

-- For existing databases (table already created without the column):
alter table public.progress add column if not exists gemini_key text;
alter table public.progress add column if not exists deletion_requested_at timestamptz;

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
-- -------------------------------------------------------------------------
-- Account deletion (30-day recovery window)
--   The client stamps progress.deletion_requested_at = now() when a user asks
--   to delete their account, and clears it (back to null) if they change their
--   mind / sign back in and cancel. The actual hard-delete happens server-side,
--   30 days later, so the request can be undone during the recovery window.
--
--   The client CANNOT delete auth.users rows (RLS + anon key), so the purge
--   must run with elevated rights. The function below is SECURITY DEFINER and
--   removes the user's data + auth row once the window has elapsed. Schedule it
--   daily with pg_cron (Dashboard → Database → Extensions → enable pg_cron).
-- -------------------------------------------------------------------------
create or replace function public.purge_deleted_accounts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  purged integer := 0;
  uid uuid;
begin
  for uid in
    select user_id from public.progress
    where deletion_requested_at is not null
      and deletion_requested_at < now() - interval '30 days'
  loop
    delete from public.lessons     where user_id = uid;
    delete from public.collections where user_id = uid;
    delete from public.progress    where user_id = uid;
    delete from auth.users         where id = uid;   -- removes the login itself
    purged := purged + 1;
  end loop;
  return purged;
end;
$$;

-- Run daily at 03:00 UTC (requires the pg_cron extension):
--   select cron.schedule('purge-deleted-accounts', '0 3 * * *',
--                        $$select public.purge_deleted_accounts()$$);

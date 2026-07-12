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
  onboarding   jsonb       default '{}'::jsonb, -- first-run wizard answers + flag: { done, skipped?, level, goal, minutes, hardest, at }
  updated_at   timestamptz default now()
);

-- For existing databases (table already created without the column):
alter table public.progress add column if not exists gemini_key text;
alter table public.progress add column if not exists deletion_requested_at timestamptz;
alter table public.progress add column if not exists onboarding jsonb default '{}'::jsonb;

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

-- -------------------------------------------------------------------------
-- entitlements  (server-issued plan flag — one row per PAYING user)
--   No row = free. Written ONLY by service-role code (Vercel /api functions handling
--   payment-provider webhooks) — there is deliberately no INSERT/UPDATE policy for the
--   anon/authenticated roles below, so a signed-in user can read but never forge their
--   own plan. The client loads this alongside `progress` (cloud-sync.initApp) into the
--   `userPlan` global and reads it via `hasPremium()`.
-- -------------------------------------------------------------------------
create table if not exists public.entitlements (
  user_id             uuid        primary key references auth.users(id),
  plan                text        not null default 'free',   -- 'free' | 'premium' | 'lifetime'
  status              text        not null default 'active', -- 'active' | 'past_due' | 'cancelled'
  provider            text,                                  -- 'paddle' | 'lemonsqueezy' | 'stripe' | 'manual'
  provider_ref        text,                                  -- provider's subscription/order id
  current_period_end  timestamptz,                           -- null for lifetime / free
  updated_at          timestamptz default now()
);

alter table public.entitlements enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'entitlements' and policyname = 'own entitlements read'
  ) then
    create policy "own entitlements read" on public.entitlements
      for select using (auth.uid() = user_id);
  end if;
end $$;

-- -------------------------------------------------------------------------
-- feedback  (product feedback — one row per submission, DEV-10)
--   user_id null = anonymous (submitted from the guest landing); otherwise the signed-in user.
--   page  = the surface it was sent from ('today' | 'planner' | 'landing' | …), for clustering.
--   text  = free-text note; mood = optional 1..5 (5 = happiest).
--
--   INSERT only. A signed-in user may write their OWN row (user_id = auth.uid()); anyone (incl. the
--   anon role) may write an ANONYMOUS row (user_id null) — so the guest landing can collect feedback.
--   Nobody can forge a row attributed to ANOTHER user. There is deliberately NO select/update/delete
--   policy, so the client can never read feedback back; it is pulled server-side (SQL editor /
--   service role) for the weekly Analytics summary (plan §3 "Feedback collection & analysis loop").
-- -------------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id),   -- nullable: null = anonymous
  page       text,
  text       text        not null,
  mood       smallint    check (mood is null or mood between 1 and 5),
  created_at timestamptz default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'feedback' and policyname = 'insert feedback'
  ) then
    create policy "insert feedback" on public.feedback
      for insert to anon, authenticated
      with check (user_id is null or auth.uid() = user_id);
  end if;
end $$;

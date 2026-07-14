# 5. Auth & cloud-sync flow

> Section §5 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The database is a Supabase Postgres connected to the Vercel project via the Vercel↔Supabase
integration (the integration injects the env vars `build.js` consumes — see §2). The app uses a
single table, `public.progress`, one row per user (confirmed schema):

| Column | Type | Null | Default | Written by | Payload shape |
| --- | --- | --- | --- | --- | --- |
| `user_id` | `uuid` | NO | — | upserts (conflict key) | `session.user.id` — PK, FK → `auth.users(id)` |
| `planner_data` | `jsonb` | yes | `'{}'::jsonb` | planner / today / welcome `getCloudPayload()` | `{ courseVersion:2, currentDay, viewingDay, completed }` — the keys this app owns. Any other keys (e.g. `/today`'s `dayStats`/`grammarReview`/`lastActiveDate` (the streak stamp, DEV-7), the cutover's `migratedFrom`) are **passed through untouched** by every page that saves the column, so they survive a round trip. A pre-v2 row (no `courseVersion`) is reset to a clean v2 state by `initApp` (see above). |
| `vocab_data` | `jsonb` | yes | `'{}'::jsonb` | vocab `getCloudPayload()` → `serialize()` | `{ app, version:2, savedAt, selectedWeek, modes, levels, mastery, pluralMastery }` |
| `verbs_data` | `jsonb` | yes | `'{}'::jsonb` | verbs `getCloudPayload()` **and** vocab `saveVerbStore()` | `{ app, version, savedAt, modes, sel, mastery }` — `mastery` keyed by **verb key**; `sel` = saved training selection |
| `lang` | `text` | yes | `'en'::text` | `saveLangToCloud` | `'ru' \| 'ua' \| 'en'` |
| `theme` | `text` | yes | — | `saveThemeToCloud` | `'light' \| 'dark'` |
| `gemini_key` | `text` | yes | — | `saveGeminiKeyToCloud` (planner, opt-in) | the user's Gemini API key, or `null`. Written only when the user ticks "remember on my account"; cleared (→ `null`) when they untick or remove the key. See §8. |
| `onboarding` | `jsonb` | yes | `'{}'::jsonb` | `saveOnboardingToCloud` (the `/welcome` wizard) | `{ done, skipped?, level, goal, minutes, hardest, at, onbVersion }`. Set on first run and re-written on each re-onboarding; `onbVersion` (stamped by `saveOnboardingToCloud`) drives the once-per-bump re-onboarding gate. Read into the `userOnboarding` global. See §20. |
| `updated_at` | `timestamptz` | yes | `now()` | every upsert | ISO string |

> `verbs_data` was added with `alter table public.progress add column if not exists verbs_data jsonb default '{}'::jsonb;`. RLS is row-level (per `user_id`), so it covers new columns automatically. **Cross-cutting progress is live:** verb `mastery` is keyed by the verb key (e.g. `gehen`), so a verb counts the same wherever it appears. `verbs.html` owns the column via its `CLOUD_FIELD`. `vocab.html` ALSO reads/writes it: `cloud-sync` loads it into a `verbStore` via the page's `applyVerbProgress(d)` hook, and any vocabulary word that resolves to a master-verb key (`verbKeyForWord` strips the `—` form and looks it up in `VERBS`, ~69 of the vocab entries) routes its mastery to `verbStore` and persists via `saveVerbsToCloud`. `sel` (the verb-trainer's saved training selection) round-trips through the same column.

**Constraints & security:**
- `progress_pkey` — PRIMARY KEY (`user_id`). This is what makes the
  `upsert(..., { onConflict: 'user_id' })` calls behave as insert-or-update per user.
- `progress_user_id_fkey` — FOREIGN KEY (`user_id`) → `auth.users(id)`; each row is tied to a
  Supabase auth user.
- **RLS** policy `own data` — `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`:
  a signed-in user can read and write only their own row. (This is why shipping the anon key to the
  browser is safe — it cannot touch other users' rows.) Note: the policy only takes effect if RLS
  is enabled on the table (`alter table public.progress enable row level security`).

The canonical, idempotent DDL lives in **[`schema.sql`](../../schema.sql)** at the repo root (safe to
re-run; uses `if not exists` / guarded `create policy`). Equivalent shape:

```sql
create table public.progress (
  user_id      uuid        primary key references auth.users(id),
  planner_data jsonb       default '{}'::jsonb,
  vocab_data   jsonb       default '{}'::jsonb,
  verbs_data   jsonb       default '{}'::jsonb,
  lang         text        default 'en'::text,
  theme        text,                          -- no default; null → client default 'light'
  gemini_key   text,                          -- opt-in: user's Gemini API key, synced across devices
  updated_at   timestamptz default now()
);
alter table public.progress enable row level security;
create policy "own data" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI chat history (one row per user × day; weekly summaries stored as day = -week)
create table public.lessons (
  user_id    uuid        not null references auth.users(id),
  day        integer     not null,
  messages   jsonb       default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, day)
);
alter table public.lessons enable row level security;
create policy "own lessons" on public.lessons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user-supplied word sets (one row per collection; §16)
create table public.collections (
  id         uuid        primary key default gen_random_uuid(),  -- client-supplied (crypto.randomUUID)
  user_id    uuid        not null references auth.users(id),
  name       text        not null,
  words      jsonb       default '[]'::jsonb,   -- [ {id, de, tr, note?}, ... ]  (rewritten on edit)
  mastery    jsonb       default '{}'::jsonb,   -- { "<word.id>": leitner card }  (per-answer hot path)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.collections enable row level security;
create policy "own collections" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- server-issued plan flag (one row per PAYING user; no row = free; §5 Entitlements)
create table public.entitlements (
  user_id             uuid        primary key references auth.users(id),
  plan                text        not null default 'free',   -- 'free' | 'premium' | 'lifetime'
  status              text        not null default 'active', -- 'active' | 'past_due' | 'cancelled'
  provider            text,                                  -- 'paddle' | 'lemonsqueezy' | 'stripe' | 'manual'
  provider_ref        text,                                  -- provider's subscription/order id
  current_period_end  timestamptz,                           -- null for lifetime / free
  updated_at          timestamptz default now()
);
alter table public.entitlements enable row level security;
create policy "own entitlements read" on public.entitlements
  for select using (auth.uid() = user_id);  -- SELECT only — no anon/authenticated write policy

-- product feedback (one row per submission; user_id null = anonymous / landing; DEV-10)
create table public.feedback (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id),   -- nullable: null = anonymous
  page       text,                                    -- surface it was sent from ('today' | 'landing' | …)
  text       text        not null,
  mood       smallint    check (mood is null or mood between 1 and 5),  -- optional 1..5
  created_at timestamptz default now()
);
alter table public.feedback enable row level security;
create policy "insert feedback" on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);  -- INSERT only; no read/update/delete policy
```

`messages` is a JSON array of `{ role: "user"|"model", text: string }` objects — the full
conversation including the opening system message (the day plan). Day-lesson rows (`day > 0`)
use `AI_MODEL_ID`; summary rows (`day < 0`) use `AI_PRO_MODEL_ID`. The table is append-friendly:
clearing a lesson deletes the row (`deleteLessonFromCloud`); there is no soft-delete.

**Entitlements (table `entitlements`, one row per PAYING user):** the server-of-record plan flag
that everything monetization-related is built on (paywall gating, referral credits, admin comps).
No row means free — a user who never purchased. Rows are written ONLY by service-role code (Vercel
`/api` functions handling payment-provider webhooks); the RLS policy above grants the owner `SELECT`
only, with no `INSERT`/`UPDATE`/`DELETE` policy for the `anon`/`authenticated` roles, so a signed-in
user can read their own plan but can never forge it client-side (writes go through the service-role
key, which bypasses RLS entirely). `cloud-sync.initApp` loads it in a separate query (same pattern as
`theme`/`gemini_key`/`deletion_requested_at` — a missing table/row can't break the main load) into the
`userPlan` global (`{ plan, status, currentPeriodEnd }`, defaulting to free), and `hasPremium()` reads
it: `true` for `plan:'lifetime'` always, or `plan:'premium'` while `current_period_end` is null or in
the future. `status` (`active`/`past_due`/`cancelled`) is stored for display/analytics but doesn't
gate `hasPremium()` itself — a cancelled or past-due subscription still reads premium until
`current_period_end`, so the grace-period/downgrade timing is the webhook's job (DEV-3), not this
helper's. This client-side check is trivially bypassable in devtools by a determined user; that's an
accepted risk for gating **content** (course days, stats page) — the AI proxy enforces its quota
server-side (DEV-5), where bypassing actually costs money.

**Feedback (table `feedback`, one row per submission; DEV-10):** the qualitative-signal loop. Written
by `feedback.js` from the "💬 Feedback" footer entry point on every app page (attributed to the
signed-in user) and from the guest landing (anonymous, `user_id` null). It is **INSERT-only**: the RLS
policy above lets a signed-in user write their own row (`user_id = auth.uid()`) and anyone — including
the `anon` role — write an anonymous row (`user_id` null), but nobody can forge a row attributed to
another user. There is deliberately **no** `SELECT`/`UPDATE`/`DELETE` policy, so the client can never
read feedback back; it is pulled server-side (SQL editor / service role) for the weekly Analytics
summary. `/today` also auto-opens the modal once after the learner completes 3 days (a one-time
`planner_data.feedbackPrompted` flag; the pure `feedbackShouldPrompt(planner)` decides).

**Notes:**
- **Default language is `'en'` on both sides** — the DB column default (`lang 'en'`) matches the
  client default (`i18n.js` `DEFAULT_LANG = 'en'`), so a brand-new user sees English and there's no
  surprise language switch after the first save. `saveToCloud()` does **not** send `lang`; only
  `saveLangToCloud()` (the EN/UA/RU switcher) writes it.
- `planner_data` / `vocab_data` default to `'{}'::jsonb`. `initApp` applies a payload **only when
  non-empty** (`Object.keys(payload).length`), so neither page has to defend against `{}` — and the
  trainer no longer shows a spurious "bad file" toast when a row exists with an empty `vocab_data`
  (e.g. a row first created by the planner). The `mastery` guard inside `applyData` stays, because
  it also protects manual file import.

**Login (`views/login.html`, served at `/login`):**
- On load, `sb.auth.getSession()`; if already signed in → `redirect()` (to
  `localStorage['auth_redirect']` or `/planner`). Otherwise render the form.
- **Deep links from the landing:** `?mode=register` opens the form in register mode; `?email=…`
  prefills the email field (the landing's footer CTA passes both).
- Email/password sign-in (`signInWithPassword`) and sign-up (`signUp`, shows "confirm your email"
  notice). Google OAuth (`signInWithOAuth`, `redirectTo` = production root `/` — the landing then
  forwards the now-signed-in user into the app).
- **Password recovery** — a single page with four `mode`s (`login` | `register` | `reset` |
  `update`). The "Forgot password?" link (login mode) → **`reset`**: enter the email,
  `sb.auth.resetPasswordForEmail(email, { redirectTo: origin + '/login' })` sends a recovery link.
  Clicking that link returns to `/login` with a recovery token; the page detects it (URL
  `#…type=recovery` fast path **and** the `onAuthStateChange` `PASSWORD_RECOVERY` event) and shows
  **`update`** — a new-password field that calls `sb.auth.updateUser({ password })`, then
  `redirect()`s into the app. The recovery case is the one time `initApp`/the page does **not**
  auto-redirect a live session straight to the app. (Guarded by `tests/login.test.js`.)
- Both the **header title block** (an `<a href="/">` around the logo) and an in-box "← Home" link
  (`T('auth_back_home')`) return to the landing.
- Client-side validation: non-empty fields, password ≥ 6 chars (also enforced on the new password).
  Error text via `T(...)`.

**Protected pages (`views/planner.html`, `views/vocab.html`, …):** `initApp()` enforces the session
(redirecting to **`/login`** and remembering where to come back to via `auth_redirect`).

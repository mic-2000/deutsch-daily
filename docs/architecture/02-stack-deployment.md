# 2. Tech stack & deployment

> Section §2 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

- **Vanilla HTML/CSS/JS** — no framework, no bundler, no client build step. Each page is plain
  markup + an inline `<script>` plus a few shared `<script src>` modules.
- **Supabase** (`@supabase/supabase-js@2` from jsDelivr CDN) for auth + per-user progress storage.
- **Google Fonts** (Fraunces + Manrope) via `<link>` — the only other external load.
- **Hosting:** Vercel, static. `vercel.json` keeps `outputDirectory: "."` and adds `rewrites` that
  map the **pretty URLs** `/planner` `/vocab` `/verbs` `/collections` `/stats` to the physical
  `views/<page>.html` files. (`cleanUrls` is intentionally **off** — it makes Vercel redirect
  `.html` paths to extensionless ones, which breaks a rewrite whose destination ends in `.html`.)
  Production URL is
  `https://deutsch-daily-red.vercel.app/` (referenced as the OAuth `redirectTo`).
- **Build:** `npm run build` → `node build.js`. `build.js` (1) reads `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the environment and replaces the `YOUR_PROJECT_ID` /
  `YOUR_ANON_KEY` placeholders inside `assets/js/supabase.js` (exits non-zero if either env var is
  missing), and (2) **stamps the `sw.js` cache `VERSION`** with a monotonic build stamp
  (`<commitSHA8>-<UTC YYYYMMDDHHMM>`, SHA from `VERCEL_GIT_COMMIT_SHA` when present) so every deploy
  busts the old service-worker shell cache automatically — no manual bump. The committed
  `supabase.js` / `sw.js` hold placeholders / a static dev `VERSION`; both are rewritten at deploy
  time on Vercel. (Guarded by `tests/build.test.js`.)

> The app is now an **authenticated HTTPS web app**. It requires a Supabase session, so it does
> not function when opened from the filesystem (`file://`). The heavy `file://` defensiveness in
> the project's history is largely historical — see §12.

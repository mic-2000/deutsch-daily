# 17. PWA — installable app + offline shell

> Section §17 of the [architecture reference](../../ARCHITECTURE.md), split by feature — read only
> the sections you need. A cross-reference like “§19” points to the sibling file `19-*.md`.

The site is an installable **Progressive Web App**: on Android/Chrome it offers *"Install app"* and
launches standalone (no address bar, own icon); on iOS *"Add to Home Screen"* does the same. No
build step or store — it works off the existing Vercel HTTPS deploy.

**Pieces:**
- **`manifest.webmanifest`** (root) — `name`/`short_name`, `display: standalone`, `start_url:
  /planner`, `scope: /`, `orientation: portrait`, `theme_color`/`background_color` `#F2EDE3` (light
  `--paper`), and the icon set. Linked from every page's `<head>`.
- **Icons** — `assets/icon.svg` (rounded, transparent corners → `any`) and `assets/icon-maskable.svg`
  (full-bleed, content inside the maskable safe zone) are the **sources**; `assets/icons/*.png`
  (192/512 `any`, `maskable-512`, `apple-touch-icon` 180) are rendered from them with `rsvg-convert`.
  Regenerate the PNGs if you edit a source SVG.
- **`<head>` tags** (all 6 pages — landing, login + the 4 app pages) — `<link rel="manifest">`, `theme-color` (kept in sync with the
  active light/dark theme by `theme.js`'s `applyTheme()`), `mobile-web-app-capable` /
  `apple-mobile-web-app-*`, and `apple-touch-icon`.
- **`assets/js/pwa.js`** — registers `sw.js` on `window.load` (best-effort; no-op on unsupported
  browsers / insecure origins). Loaded by every page so the shell is cached even before sign-in. It
  also **auto-applies SW updates**: if the page is already controlled by a SW, a `controllerchange`
  (fired when a new `VERSION` activates via `skipWaiting` + `clients.claim`) reloads the page once —
  so a returning visitor on a stale cached build sees the new assets without a manual refresh. The
  reload is guarded against loops and is not attached for first-time visitors (whose initial claim
  must not trigger a reload).
- **`sw.js`** (root, scope `/`) — the service worker.

**Service-worker caching strategy** (one cache per `VERSION`; `build.js` re-stamps `VERSION` on every
deploy (§2) so each deploy gets a fresh cache and old ones are pruned on `activate` — you no longer
hand-bump it for cache refresh, only keep `SHELL_ASSETS` accurate when assets are added/removed):
- **navigations** (HTML pages) → **network-first**, cached page as the offline fallback.
- **same-origin static** (`/assets`, `/data`, `/locales`) → **stale-while-revalidate**.
- **CDN libs + fonts** (Supabase UMD on jsDelivr, Google Fonts) → **cache-first** — the app can't
  boot without the Supabase library, so it must be available offline.
- **Supabase REST/Auth** (`*.supabase.co`) → **never cached**; passes straight to the network.
  Offline *data* is owned by JS, not the SW: failed writes ride `cloud_outbox`, cold-start reads fall
  back to `cloud_cache` (§4–§5). Caching auth/rest here would serve stale or wrong data.

**What works offline:** opening the installed app, the full UI shell, the curriculum/vocab/verb data
and locales, studying, and *writing* progress (queued, synced on reconnect). On a cold start with no
network the read mirror (§5) restores the last-seen progress. **Live Gemini AI lessons and
first-ever sign-in still need a connection.**

> **TWA / Play Store (not done, easy follow-up).** This PWA is the prerequisite for a `.aab` via
> PWABuilder/Bubblewrap (a Trusted Web Activity wrapping the same URL). That additionally needs a
> Play Developer account and a `/.well-known/assetlinks.json` for Digital Asset Links.

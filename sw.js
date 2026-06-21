/* sw.js — service worker: offline app shell for Deutsch Daily (installable PWA).

   Strategy by request kind:
   - navigations (the HTML pages)            → network-first, fall back to the cached page,
                                                so the app still opens with no connection.
   - same-origin assets/data → stale-while-revalidate (instant, refreshes in bg).
   - same-origin locales → network-first (fresh translations land immediately; cache is offline fallback).
   - CDN libs + fonts (Supabase UMD, Google  → cache-first. The app can't boot without the Supabase
     Fonts)                                     library, so it MUST be available offline.
   - Supabase REST/Auth (*.supabase.co)      → never touched here: passed straight to the network.
                                                Offline DATA is handled in JS — failed writes ride
                                                cloud_outbox, cold-start reads fall back to
                                                cloud_cache (see cloud-sync.js). Caching auth/rest
                                                here would serve stale/incorrect data.

   Bump VERSION when shipping changed shell assets; stale caches are pruned on activate. */
const VERSION = 'v9';
const SHELL = 'dd-shell-' + VERSION;
const RUNTIME = 'dd-runtime-' + VERSION;

/* Precached on install. Pretty URLs ('/planner' …) resolve through the vercel.json rewrites. */
const SHELL_ASSETS = [
  '/', '/login', '/today', '/planner', '/vocab', '/verbs', '/collections', '/settings', '/privacy', '/terms',
  '/manifest.webmanifest',
  '/assets/favicon.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/css/base.css', '/assets/css/components.css', '/assets/css/auth.css',
  '/assets/css/landing.css',
  '/assets/css/chat.css', '/assets/css/collections.css', '/assets/css/planner.css',
  '/assets/css/verbs.css', '/assets/css/vocab.css', '/assets/css/settings.css',
  '/assets/css/today.css',
  '/assets/js/ai-config.js', '/assets/js/cloud-sync.js', '/assets/js/gemini.js',
  '/assets/js/header.js', '/assets/js/i18n.js', '/assets/js/leitner.js',
  '/assets/js/legal.js', '/assets/js/markdown.js', '/assets/js/planner-data.js',
  '/assets/js/pwa.js', '/assets/js/speech.js', '/assets/js/supabase.js',
  '/assets/js/theme.js', '/assets/js/utils.js',
  '/assets/js/vocab-trainer.js', '/assets/js/verbs-trainer.js',
  '/data/vocab.js', '/data/verbs.js', '/data/weeks.js',
  '/locales/en.js', '/locales/ru.js', '/locales/ua.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // Add individually so one missing/blocked asset can't abort the whole install (cache.addAll is atomic).
    await Promise.all(SHELL_ASSETS.map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isSupabaseApi(url) {
  return url.hostname.endsWith('.supabase.co');
}
function isCdnAsset(url) {
  return url.hostname === 'cdn.jsdelivr.net'
      || url.hostname === 'fonts.googleapis.com'
      || url.hostname === 'fonts.gstatic.com';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;          // mutations always go to the network
  const url = new URL(req.url);

  if (isSupabaseApi(url)) return;            // auth/rest: never cached — JS owns offline data

  // App pages — network-first (so updates land), cached page as offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) (await caches.open(SHELL)).put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match(req))
            || (await caches.match('/planner'))
            || (await caches.match('/'))
            || Response.error();
      }
    })());
    return;
  }

  // CDN libraries + fonts needed to boot offline — cache-first.
  if (isCdnAsset(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        (await caches.open(RUNTIME)).put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Locales — network-first so freshly shipped translation keys land immediately
  // (stale-while-revalidate would show the previous copy on the first load after a deploy).
  if (url.origin === self.location.origin && url.pathname.startsWith('/locales/')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) (await caches.open(RUNTIME)).put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Same-origin static (assets/data) — stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then((fresh) => {
        if (fresh && fresh.ok) caches.open(RUNTIME).then((c) => c.put(req, fresh.clone()));
        return fresh;
      }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

  // Anything else: default network behaviour.
});

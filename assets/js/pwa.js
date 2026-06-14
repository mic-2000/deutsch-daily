/* pwa.js — register the service worker (offline app shell + "install to home screen").
   Best-effort: a registration failure must never break the page, and the SW is irrelevant
   on unsupported browsers or insecure origins. Loaded by every page (incl. the login page,
   so the shell is cached before sign-in). */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () { /* offline-first is optional */ });
  });
}

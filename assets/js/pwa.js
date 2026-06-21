/* pwa.js — register the service worker (offline app shell + "install to home screen").
   Best-effort: a registration failure must never break the page, and the SW is irrelevant
   on unsupported browsers or insecure origins. Loaded by every page (incl. the login page,
   so the shell is cached before sign-in). */
if ('serviceWorker' in navigator) {
  // Auto-update visitors stuck on an old cached build. If this page is ALREADY controlled by a
  // SW, a `controllerchange` means a NEW version has taken over (sw.js calls skipWaiting +
  // clients.claim on a VERSION bump) — reload once so the freshly-cached CSS/JS is used instead
  // of the stale copy still in the DOM. Guarded against loops; NOT attached for first-time
  // visitors (no controller yet → the initial claim must not trigger a reload).
  if (navigator.serviceWorker.controller) {
    var _reloadingForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (_reloadingForUpdate) return;
      _reloadingForUpdate = true;
      window.location.reload();
    });
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () { /* offline-first is optional */ });
  });
}

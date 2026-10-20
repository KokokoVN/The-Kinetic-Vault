// Self-destruct Service Worker for local development / clean slate
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});

// Fetch: Network First with Cache Fallback
// No fetch interception: let browser handle all network directly

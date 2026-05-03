/**
 * Self-unregistering kill-switch.
 *
 * Earlier versions of this site shipped a hand-rolled service worker that cached
 * the app shell aggressively. That cache now masks the live dev server and the
 * new Workbox-generated production worker. This stub replaces it: on first load
 * it deletes every cache it owns and unregisters itself, so the next reload
 * fetches fresh from the network. The Workbox SW is generated at build time and
 * takes over from there.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const registrations = await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});

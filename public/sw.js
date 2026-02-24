const CACHE_NAME = 'reminder-pwa-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      try { data = event.data.json(); } catch (_) { data = { body: event.data.text() }; }
    }
  } catch (e) {}
  const title = data.title || 'Daily Reminder';
  const body = data.body || 'A new caring message for you 💛';
  const icon = data.icon || '/icons/icon-192.svg';
  const badge = data.badge || '/icons/icon-192.svg';
  const url = data.url || '/';
  event.waitUntil(
    self.registration.showNotification(title, { body, icon, badge, data: { url } })
  );
});

self.addEventListener('notificationclick', (event) => {
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});


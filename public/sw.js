const CACHE_NAME = '4u-pwa-v2';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.webmanifest'];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => {
        console.log('Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => {
      console.log('Service worker activated');
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  
  if (data.type === 'USER_LOGIN') {
    // Store current user in service worker
    self.currentUser = data.userId;
    console.log('User logged in:', self.currentUser);
  } else if (data.type === 'USER_LOGOUT') {
    // Clear current user
    self.currentUser = null;
    console.log('User logged out');
  }
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push event received in service worker:', data);
  
  const title = data.title || 'You received a hug!';
  const body = data.body || 'Someone sent you a hug 🤗';
  const icon = data.icon || '/icons/icon-192.svg';
  const badge = data.badge || '/icons/icon-192.svg';
  const url = data.url || '/';
  
  console.log('Sending notification with:', { title, sender: data.sender, targetUser: data.targetUser });
  
  // Show notification
  event.waitUntil(
    self.registration.showNotification(title, { 
      body, 
      icon, 
      badge,
      vibrate: [200, 100, 200], // Vibrate pattern: 200ms on, 100ms off, 200ms on
      sound: '/notification-sound.mp3', // Sound file (will need to add this)
      requireInteraction: true, // Keep notification until user interacts
      data: { url, sender: data.sender, targetUser: data.targetUser } 
    })
  );
  
  // Also send message to client to show modal (only for receiver)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      console.log('Found clients:', clientList.length);
      clientList.forEach((client, index) => {
        console.log(`Sending message to client ${index}:`, {
          type: 'HUG_RECEIVED',
          sender: data.sender || 'Someone',
          targetUser: data.targetUser
        });
        client.postMessage({
          type: 'HUG_RECEIVED',
          sender: data.sender || 'Someone',
          targetUser: data.targetUser
        });
      });
    })
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


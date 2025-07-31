// Service Worker for Push Notifications
const CACHE_NAME = 'boomquotes-v1';
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  const options = {
    title: 'Daily Quote from BoomQuotes',
    body: 'Your daily dose of inspiration is here!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'daily-quote',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Quote',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // If push event has data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.quote || options.body;
      options.title = pushData.title || options.title;
      if (pushData.author) {
        options.body += ` — ${pushData.author}`;
      }
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise, open a new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-quote-sync') {
    event.waitUntil(
      // Sync daily quote when connection is restored
      fetch('/api/quotes/daily')
        .then(response => response.json())
        .then(quote => {
          // Store quote in IndexedDB or cache for offline access
          return caches.open(CACHE_NAME)
            .then(cache => cache.put('/api/quotes/daily', new Response(JSON.stringify(quote))));
        })
        .catch(error => console.error('Background sync failed:', error))
    );
  }
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});
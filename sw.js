/**
 * Service Worker - Offline Cache Strategy
 */
const CACHE_NAME = 'lulu-shift-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles/main.css',
  './styles/components.css',
  './styles/calendar.css',
  './styles/dark.css',
  './scripts/pwa.js',
  './scripts/dark-mode.js',
  './scripts/gist.js',
  './scripts/calendar.js',
  './scripts/export.js',
  './scripts/app.js',
  './assets/icons/icon-192.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests (GitHub API, etc.)
  if (event.request.url.includes('api.github.com')) return;

  // Skip CDN requests (let them go through normally)
  if (event.request.url.includes('unpkg.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses or cross-origin requests
            if (!response || response.status !== 200) {
              return response;
            }
            if (response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline fallback if available
            return caches.match('./index.html');
          });
      })
  );
});

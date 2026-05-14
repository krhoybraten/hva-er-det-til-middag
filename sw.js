const CACHE_NAME = 'middag-app-v5';

const ASSETS = [
  './',
  './index.html',
  './main.js',
  './css/style.css',
  './manifest.webmanifest',
  './data/dinnerData.js',
  './api/getDinnersByTags.js',
  './api/randomDinner.js',
  './api/tags.js',
  './ui/renderDinnerPlan.js',
  './ui/renderDinnerResult.js',
  './ui/renderTags.js',
  './utils/dinnerUtils.js',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;

        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        throw new Error(`Unable to fetch ${event.request.url}`);
        })
      )
  );
});

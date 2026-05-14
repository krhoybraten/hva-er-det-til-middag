const CACHE_NAME = 'middag-app-v6';
const BASE_PATH = '/hva-er-det-til-middag/';

const ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}main.js`,
  `${BASE_PATH}css/style.css`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}data/dinnerData.js`,
  `${BASE_PATH}api/getDinnersByTags.js`,
  `${BASE_PATH}api/randomDinner.js`,
  `${BASE_PATH}api/tags.js`,
  `${BASE_PATH}ui/renderDinnerPlan.js`,
  `${BASE_PATH}ui/renderDinnerResult.js`,
  `${BASE_PATH}ui/renderTags.js`,
  `${BASE_PATH}utils/dinnerUtils.js`,
  `${BASE_PATH}icons/icon.svg`,
  `${BASE_PATH}icons/icon-180.png`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) return;
  if (!requestUrl.pathname.startsWith(BASE_PATH)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const responseToCache = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache))
          );
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        if (event.request.mode === 'navigate') {
          return caches.match(`${BASE_PATH}index.html`);
        }

        return Response.error();
      })
  );
});

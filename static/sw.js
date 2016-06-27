var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/main.css',
  '/main.js',
  '/moment.min.js',
  '/lodash.min.js',
  '/fmix-logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Для ручки получения твитов используем стратегию "Кэш затем сеть" (запрос по сети всегда)
  if (event.request.url.endsWith('/ajax/get-frontend-tweets')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return fetch(event.request.clone()).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    );
  // Для остальных запросов стандартный подход для offline first
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

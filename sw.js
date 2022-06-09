self.importScripts('data/texts.js');

// Files to cache
const cacheName = 'eePWA-v11';
const contentToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/reset.css',
  '/favicon.ico',
  '/img/logo.png',
  '/img/header-temp-bg.jpg',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-384x384.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/mstile-150x150.png',
];
// const contentToCache = [
//   '/PWA-elencuentro/',
//   '/PWA-elencuentro/index.html',
//   '/PWA-elencuentro/app.js',
//   '/PWA-elencuentro/style.css',
//   '/PWA-elencuentro/reset.css',
//   '/PWA-elencuentro/favicon.ico',
//   '/PWA-elencuentro/img/logo.png',
//   '/PWA-elencuentro/img/header-temp-bg.jpg',
//   '/PWA-elencuentro/icons/android-chrome-192x192.png',
//   '/PWA-elencuentro/icons/android-chrome-384x384.png',
//   '/PWA-elencuentro/icons/apple-touch-icon.png',
//   '/PWA-elencuentro/icons/favicon-16x16.png',
//   '/PWA-elencuentro/icons/favicon-32x32.png',
//   '/PWA-elencuentro/icons/mstile-150x150.png',
// ];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install', e);
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })()
  );
});
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate', e);
  e.waitUntil(
    caches.keys().then((kl) => {
      return Promise.all(
        kl.map((k) => {
          if (k !== cacheName) {
            console.log('[Service Worker] Removing old cache', k);
            return caches.delete(k);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  console.log('[Service Worker] fetch', e);
  if (!(e.request.url.indexOf('http') === 0)) return;
  if (e.request.url.includes('/bibles/')) {
    // response to API requests, Cache Update Refresh strategy
    e.respondWith(caches.match(e.request));
    e.waitUntil(update(e.request)).then(refresh); //TODO: refresh
    //TODO: update et refresh
  } else if (
    new RegExp('\\b' + contentToCache.join('\\b|\\b') + '\\b').test(
      e.request.url
    )
  ) {
    e.respondWith(caches.match(e.request));
  } else {
    // response to static files requests, Cache-First strategy
    e.respondWith(
      (async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) return r;
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })()
    );
  }
});

const delay = (ms) => (_) =>
  new Promise((resolve) => setTimeout(() => resolve(_), ms));

function update(request) {
  return fetch(request.url).then(
    (response) =>
      cache(request, response) // we can put response in cache
        .then(delay(3000)) // add a fake latency of 3 seconds
        .then(() => response) // resolve promise with the Response object
  );
}

function refresh(response) {
  return response
    .json() // read and parse JSON response
    .then((jsonResponse) => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          // report and send new data to client
          client.postMessage(
            JSON.stringify({
              type: response.url,
              data: jsonResponse.data,
            })
          );
        });
      });
      return jsonResponse.data; // resolve promise with new data
    });
}

self.importScripts('data/texts.js');

// Files to cache
const cacheName = 'eePWA-v08';
var CACHE_DYNAMIC_BOOKS = 'dynamic-books-v08';
// var CACHE_DYNAMIC_PASSAGES = 'dynamic-passages-v04';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/feed.js',
  '/data/texts.js',
  '/cta-modal.js',
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
  'https://fonts.gstatic.com/s/nunito/v24/XRXI3I6Li01BKofiOc5wtlZ2di8HDOUhRTM.ttf',
  'https://fonts.gstatic.com/s/nunito/v24/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM.ttf',
  'https://fonts.gstatic.com/s/nunito/v24/XRXI3I6Li01BKofiOc5wtlZ2di8HDGUmRTM.ttf',
];
// const STATIC_FILES = [
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
      await cache.addAll(STATIC_FILES);
    })()
  );
});
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate', e);
  e.waitUntil(
    caches.keys().then((kl) => {
      return Promise.all(
        kl.map((k) => {
          console.log(k);
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
  if (!(e.request.url.indexOf('http') === 0)) return;
  // if (e.request.url.includes('/passages')) {
  //   console.log('[Service Worker] Buscando pasages', e);
  //   e.respondWith(
  //     caches.open(CACHE_DYNAMIC_PASSAGES).then(function (cache) {
  //       return fetch(e.request).then(function (res) {
  //         cache.put(e.request, res.clone());
  //         return res;
  //       });
  //     })
  //   );
  // }
  const url = 'https://httpbin.org/get';
  if (e.request.url.includes(url)) {
    console.log('[Service Worker] Getting Week Info', e);
    e.respondWith(
      caches.open(CACHE_DYNAMIC_BOOKS).then(async function (cache) {
        const res = await fetch(e.request);
        cache.put(e.request, res.clone());
        return res;
      })
    );
  } else if (
    new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(e.request.url)
  ) {
    console.log('Respondiendo con los archivos en cache');
    e.respondWith(caches.match(e.request));
  } else {
    // response to static files requests, Cache-First strategy
    console.log('Buscando los archivos y guardándolos en cache');
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

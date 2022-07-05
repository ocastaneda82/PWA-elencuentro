importScripts('/idb.js');
importScripts('/utility.js');
// Files to cache
const cacheName = 'eePWA-v006';
const CACHE_DYNAMIC_BOOKS = 'dynamic-books-v006';
// var CACHE_DYNAMIC_PASSAGES = 'dynamic-passages-v04';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/feed.js',
  '/idb.js',
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
//   '/PWA-elencuentro/index.html'...
// ];

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}
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
          if (k !== cacheName && k !== CACHE_DYNAMIC_BOOKS) {
            console.log('[Service Worker] Removing old cache', k);
            return caches.delete(k);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  // if (!(e.request.url.indexOf('http') === 0)) return;
  const url = 'https://el-encuentro-pwa-default-rtdb.firebaseio.com/textos';
  const url_books = '/book';
  if (
    // Intercept the url fetching
    e.request.url.indexOf(url) > -1 //||
    // e.request.url.indexOf(url_books) > -1
  ) {
    console.log('[Service Worker] Getting Week Info', e);
    // Dynamic caching for cache, then network strategy
    e.respondWith(
      // Save data to IDB
      fetch(e.request).then(function (res) {
        const cloneRes = res.clone();
        clearDataIDB('texts')
          .then(() => {
            return cloneRes.json();
          })
          .then((data) => {
            for (let key in data) {
              writeDataIDB('texts', data[key]);
            }
          });
        return res;
      })
    );
  } else if (isInArray(e.request.url, STATIC_FILES)) {
    console.log('Respondiendo con los archivos en cache');
    e.respondWith(caches.match(e.request));
  } else {
    // response to static files requests, Cache-First strategy, then network
    console.log('Buscando los archivos y guardándolos en cache');
    e.respondWith(
      caches.match(e.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(e.request).then(function (res) {
            return caches.open(CACHE_DYNAMIC_BOOKS).then(function (cache) {
              trimCache(CACHE_DYNAMIC_BOOKS, 3);
              cache.put(e.request.url, res.clone());
              return res;
            });
          });
          // .catch(function (err) {
          //   return caches.open(STATIC_FILES).then(function (cache) {
          //     return cache.match('/offline.html');
          //   });
          // });
        }
      })
    );
  }
});

const delay = (ms) => (_) =>
  new Promise((resolve) => setTimeout(() => resolve(_), ms));

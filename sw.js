self.importScripts("data/texts.js");

// Files to cache
const cacheName = "eePWA-v4";
const contentToCache = [
  "/PWA-elencuentro/",
  "/PWA-elencuentro/index.html",
  "/PWA-elencuentro/app.js",
  "/PWA-elencuentro/style.css",
  "/PWA-elencuentro/reset.css",
  "/PWA-elencuentro/favicon.ico",
  "/PWA-elencuentro/img/logo.png",
  "/PWA-elencuentro/img/header-temp-bg.jpg",
  "/PWA-elencuentro/icons/android-chrome-192x192.png",
  "/PWA-elencuentro/icons/android-chrome-384x384.png",
  "/PWA-elencuentro/icons/apple-touch-icon.png",
  "/PWA-elencuentro/icons/favicon-16x16.png",
  "/PWA-elencuentro/icons/favicon-32x32.png",
  "/PWA-elencuentro/icons/mstile-150x150.png",
  "/PWA-elencuentro/icons/safari-pinned-tab.svg",
];

// Installing Service Worker
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(contentToCache);
    })()
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", (e) => {
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
});

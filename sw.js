self.importScripts("data/texts.js");

// Files to cache
const cacheName = "eePWA-v2";
const contentToCache = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css",
  "/favicon.ico",
  "/img/logo.png",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-384x384.png",
  "/icons/icons/apple-touch-icon.png",
  "/icons/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/icons/mstile-150x150.png",
  "/icons/safari-pinned-tab.svg",
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

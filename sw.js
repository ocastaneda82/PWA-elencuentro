self.importScripts("data/texts.js");

// Files to cache
const cacheName = "eePWA-v1";
const appShellFiles = [
  "/js13kpwa/",
  "/js13kpwa/index.html",
  "/js13kpwa/app.js",
  "/js13kpwa/style.css",
  "/js13kpwa/fonts/graduate.eot",
  "/js13kpwa/fonts/graduate.ttf",
  "/js13kpwa/fonts/graduate.woff",
  "/js13kpwa/favicon.ico",
  "/js13kpwa/img/js13kgames.png",
  "/js13kpwa/img/bg.png",
  "/js13kpwa/icons/icon-32.png",
  "/js13kpwa/icons/icon-64.png",
  "/js13kpwa/icons/icon-96.png",
  "/js13kpwa/icons/icon-128.png",
  "/js13kpwa/icons/icon-168.png",
  "/js13kpwa/icons/icon-192.png",
  "/js13kpwa/icons/icon-256.png",
  "/js13kpwa/icons/icon-512.png",
];
const gamesImages = [];
for (let i = 0; i < games.length; i++) {
  gamesImages.push(`data/img/${games[i].slug}.jpg`);
}
const contentToCache = appShellFiles.concat(gamesImages);

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

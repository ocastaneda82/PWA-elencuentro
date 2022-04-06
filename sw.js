self.importScripts("data/texts.js");

// Files to cache
const cacheName = "eePWA-v1";
const appShellFiles = [
  "/PWA-elencuentro/",
  "/PWA-elencuentro/index.html",
  "/PWA-elencuentro/app.js",
  "/PWA-elencuentro/style.css",
  "/PWA-elencuentro/fonts/graduate.eot",
  "/PWA-elencuentro/fonts/graduate.ttf",
  "/PWA-elencuentro/fonts/graduate.woff",
  "/PWA-elencuentro/favicon.ico",
  "/PWA-elencuentro/img/js13kgames.png",
  "/PWA-elencuentro/img/bg.png",
  "/PWA-elencuentro/icons/icon-32.png",
  "/PWA-elencuentro/icons/icon-64.png",
  "/PWA-elencuentro/icons/icon-96.png",
  "/PWA-elencuentro/icons/icon-128.png",
  "/PWA-elencuentro/icons/icon-168.png",
  "/PWA-elencuentro/icons/icon-192.png",
  "/PWA-elencuentro/icons/icon-256.png",
  "/PWA-elencuentro/icons/icon-512.png",
];
const contentToCache = appShellFiles;

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

const CACHE_NAME = "dashboard-pakan-v2";
const CHART_JS_URL = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./config.js",
  "./manifest.json",
  "./Logo BRK JPG.jpg",
  "./icon-192.png",
  "./icon-512.png",
  CHART_JS_URL
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const requestUrl = new URL(event.request.url);

  // Data dari Apps Script harus selalu coba ambil terbaru dan tidak disimpan di cache PWA.
  if (requestUrl.hostname === "script.google.com") {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(function (networkResponse) {
        return networkResponse;
      });
    })
  );
});

/* Minimal offline cache for the Unsnitch site. Same-origin only; nothing is fetched from anywhere else. */
var CACHE = 'unsnitch-v2';
var ASSETS = [
  './', 'index.html', 'share.html', 'tokens.css', 'style.css', 'clean.js', 'app.js', 'share.js', 'manifest.webmanifest',
  'img/icon.svg', 'img/logo.svg', 'img/logo-small.svg', 'img/mosaic.svg', 'img/icon-192.png', 'img/icon-512.png', 'img/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Stale-while-revalidate. Query strings are ignored so share.html?text=… works offline
// (and the shared link is never written to the cache).
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res.ok && !new URL(req.url).search) cache.put(req, res.clone());
        return res;
      });
      if (hit) { net.catch(function () {}); return hit; }
      return net;
    });
  }));
});

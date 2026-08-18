var CACHE = 'claudio-aac-v14';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(['./']);
    }).catch(function() {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(ks) {
      return Promise.all(ks.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(nr) {
        if (nr && nr.status === 200) {
          var cr = nr.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, cr); });
        }
        return nr;
      }).catch(function() {
        return caches.match('./');
      });
    })
  );
});

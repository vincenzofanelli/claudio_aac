var CACHE = 'claudio-aac-v26';

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
  // Per le richieste di navigazione (il documento HTML principale):
  // network-first → se online prende la versione aggiornata da GitHub,
  // se offline usa la copia in cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(nr) {
        if (nr && nr.status === 200) {
          var cr = nr.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, cr); });
        }
        return nr;
      }).catch(function() {
        return caches.match('./');
      })
    );
    return;
  }
  // Per tutte le altre risorse: cache-first (comportamento precedente)
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
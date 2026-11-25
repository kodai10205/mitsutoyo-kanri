/* オフラインでも開けるようにするための仕組み（Service Worker） */
var V = 'mitsutoyo-v1';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'config.js', 'sync.js', 'icon-192.png', 'icon-512.png', 'favicon.svg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (/googleapis\.com$|firebaseio\.com$|firestore/.test(u.hostname)) return; /* データ通信は触らない */
  if (u.origin === location.origin) {
    /* 自分のファイルは、通信できれば最新を取り、できなければ保存分を使う */
    e.respondWith(fetch(r).then(function (res) {
      var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return res;
    }).catch(function () { return caches.match(r).then(function (h) { return h || caches.match('index.html'); }); }));
  } else {
    /* 外部の部品（PDF作成など）は、保存分があればそれを使う */
    e.respondWith(caches.match(r).then(function (h) {
      return h || fetch(r).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
        return res;
      });
    }));
  }
});

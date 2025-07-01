// Cache name
const CACHE_VERSION = 'flash-card-caches-v1';
const DISP_VERSION = 'flash-card-caches-v1-d';

// Cache targets
const resources = [
  './',
  './index.html',
  "./auto.html",
  "./315.json",
  "./EssentialEnglishExpressions.json",
  "./flash.html",
  "./leap.json",
  "./main.js",
  "./test.html",
  "https://cdn.glitch.global/11d006a8-5b3a-4652-b767-78669d8b944d/51PoJjHl5mL.jpg?v=1713700529766",
  "https://cdn.glitch.global/11d006a8-5b3a-4652-b767-78669d8b944d/61fS3muSGhL.jpg?v=1713700532861",
  "https://cdn.glitch.global/11d006a8-5b3a-4652-b767-78669d8b944d/71lwbEL4gnS._AC_UF1000%2C1000_QL80_.jpg?v=1713700536409"
];

// キャッシュ追加
self.addEventListener('install', function (event) {
  console.log('ServiceWorker Install');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) {
        console.log('cache.addAll');
        cache.addAll(resources);
      })
  );
});

self.addEventListener('fetch', function (event) {
  console.log('ServiceWorker fetch');
  event.respondWith(
    caches.match(getRequestWithoutParams(event.request))
      .then(function (response) {
        console.log(event.request);
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(DISP_VERSION)
                .then(function (cache) {
                  console.log('cache.put');
                  cache.put(getRequestWithoutParams(event.request).url, res.clone());
                  return res;
                });
            })
            .catch(function () {
              // 何もしない
            });
        }
      })
  );
});

// パラメータを除去したリクエストを取得する関数
function getRequestWithoutParams(request) {
  const url = new URL(request.url);
  url.search = '';  // クエリパラメータを空にする
  return new Request(url, {
    method: request.method,
    headers: request.headers,
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect,
    referrer: request.referrer,
    integrity: request.integrity,
    cache: request.cache
  });
}
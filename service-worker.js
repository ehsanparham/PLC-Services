const CACHE_NAME = 'plc-service-v11';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // فونت‌ها
  './BKOODB.TTF',
  './BTITRBD.TTF',
  // لوگوها
  './logo.png',
  './logo-print.png',
  './tuv.png',
  './login-bg.png',
  './Selta.png',
  './Abb.png',
  './Dimat.png',
  './Alcatel.png',
  // آیکون‌های PWA
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache addAll error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  // فقط درخواست‌های GET رو کش کن
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // فقط پاسخ‌های معتبر رو کش کن
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // اگه آفلاین بودیم و فایل نبود، index.html رو برگردون
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

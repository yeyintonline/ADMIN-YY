// sw.js (Recommended Final Version)

const CACHE_NAME = 'web-wrapper-cache-v2.0.4'; // <-- Version မြှင့်ဖို့မမေ့ပါနဲ့
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Navigation requests (iframe တွေရဲ့ request) တွေကို cache မလုပ်ပါ
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // App Shell file တွေအတွက် "Stale-While-Revalidate" strategy ကိုသုံးပါ
  // URL list ထဲက ဟုတ်မဟုတ် စစ်ဆေးပါ
  if (APP_SHELL_URLS.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          // Cache ထဲမှာရှိရင် အရင် cache ကိုပြန်ပေး၊ နောက်ကွယ်ကနေ network ကို fetch လုပ်
          return response || fetchPromise;
        });
      })
    );
    return;
  }
  
  // ကျန်တဲ့ request တွေအတွက် network ကို တိုက်ရိုက်သွားပါ
  event.respondWith(fetch(event.request));
});
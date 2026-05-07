const CACHE_NAME = 'hansypix-v2026-03-08-5';

const STATIC_ASSETS = [
  '/',
  '/src/pages/index.html',
  '/src/css/global.css?v=20260308',
  '/src/css/navigation.css?v=20260308',
  '/src/css/home.css?v=20260308',
  '/src/css/animations.css?v=20260308',
  '/src/css/chat.css?v=20260308',
  '/src/css/footer-modern.css?v=20260308',
  '/src/css/showcase.css?v=20260308',
  '/src/css/mobile.css?v=20260308-4',
  '/src/css/pwa.css?v=20260308',
  '/src/css/translations.css?v=20260308-5',
  '/src/js/config.js?v=20260308',
  '/src/js/translations.js?v=20260308-5',
  '/src/js/navigation.js?v=20260308',
  '/src/js/mobile-nav.js?v=20260308',
  '/src/js/home.js?v=20260308-4',
  '/src/js/chat.js?v=20260308',
  '/src/js/animations.js?v=20260308',
  '/src/js/pwa-install.js?v=20260308-3',
  '/src/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  event.respondWith(
    (async () => {
      try {
        // Network First
        const networkResponse = await fetch(req);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Fallback to cache
        const cached = await caches.match(req);
        if (cached) return cached;
        
        // Fallback for HTML
        const isHtmlNav = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
        if (isHtmlNav) {
          return caches.match('/src/pages/index.html');
        }
        
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});

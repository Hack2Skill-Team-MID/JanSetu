const CACHE_NAME = 'jansetu-cache-v1';
const DYNAMIC_CACHE = 'jansetu-dynamic-v1';
const API_BASE = '/api/';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      // Notice we don't strictly require these to succeed in dev, but in prod we would cache core routes
      return cache.addAll(STATIC_ASSETS).catch(err => console.log('Partial cache failure (expected in dev)', err));
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass Next.js internal requests, HMR, and Chrome extensions
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.includes('hot-update') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // 1. API Requests (Network First, fallback to Cache)
  if (url.pathname.startsWith(API_BASE)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.method === 'GET') {
            const resClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, resClone));
          }
          return response;
        })
        .catch(async () => {
          if (event.request.method === 'GET') {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'You are currently offline. Action saved and will retry when connection is restored.',
              offline: true 
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. Pages & Assets (Network First, fallback to Cache)
  // Cache-first breaks Next.js because it serves stale HTML/JS
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const resClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(async () => {
        // If network fails (offline), try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache and asking for a page, return offline.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline', { status: 503 });
        }
      })
  );
});

// Service Worker for caching map tiles and static assets
const CACHE_NAME = 'ecci-map-cache-v1';
const TILE_CACHE_NAME = 'ecci-tiles-cache-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== TILE_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle http/https requests (skip chrome-extension, devtools, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip WebSocket connections (Vite HMR)
  if (event.request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy 1: Tiles - Cache First (aggressive caching)
  if (url.pathname.includes('/tiles/') || url.pathname.endsWith('.pmtiles') || url.pathname.endsWith('.pbf')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            // Return cached tile immediately
            return cachedResponse;
          }
          
          // Fetch and cache new tile
          return fetch(event.request).then(response => {
            // Only cache successful responses
            if (response && response.status === 200) {
              // Clone BEFORE doing anything else with the response
              const responseToCache = response.clone();
              cache.put(event.request, responseToCache);
            }
            return response;
          }).catch(error => {
            console.error('Service Worker: Fetch failed for tile:', event.request.url, error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: API calls - Network First (always fresh data)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategy 3: Static assets - Cache First with Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(response => {
          // Cache new assets for next time (skip non-http requests)
          if (response && response.status === 200 && event.request.url.startsWith('http')) {
            // Clone BEFORE caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      caches.open(TILE_CACHE_NAME).then(cache => {
        return cache.keys().then(keys => {
          event.ports[0].postMessage({ 
            tileCount: keys.length,
            cacheName: TILE_CACHE_NAME
          });
        });
      })
    );
  }
});

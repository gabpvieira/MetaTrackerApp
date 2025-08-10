const CACHE_NAME = 'financas-semanais-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  // Add other critical assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - Network First strategy
    event.respondWith(networkFirstStrategy(request));
  } else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.includes('/src/')
  ) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirstStrategy(request));
  } else if (request.destination === 'image') {
    // Images - Cache First with fallback
    event.respondWith(cacheFirstWithFallback(request));
  } else {
    // Other requests - Network First with cache fallback
    event.respondWith(networkFirstStrategy(request));
  }
});

// Network First strategy - good for HTML and data
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request and we have no cache, return offline page
    if (request.destination === 'document') {
      return caches.match('/') || new Response(
        getOfflineHTML(),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    throw error;
  }
}

// Cache First strategy - good for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch:', request.url, error);
    throw error;
  }
}

// Cache First with fallback for images
async function cacheFirstWithFallback(request) {
  try {
    return await cacheFirstStrategy(request);
  } catch (error) {
    // Return a fallback image or empty response
    return new Response('', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// Background sync for failed requests (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued operations when back online
  console.log('[SW] Performing background sync');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const options = {
    body: event.data.text(),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Finanças Semanais', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Offline fallback HTML
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Finanças Semanais - Offline</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background: radial-gradient(ellipse at top, rgba(119, 255, 200, 0.15) 0%, rgba(177, 218, 255, 0.1) 50%, rgba(235, 195, 255, 0.05) 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #374151;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            padding: 40px;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          }
          .icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #77FFC8 0%, #B1DAFF 50%, #EBC3FF 100%);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }
          h1 {
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 600;
          }
          p {
            margin: 0 0 24px 0;
            opacity: 0.7;
            line-height: 1.5;
          }
          button {
            background: linear-gradient(135deg, #77FFC8 0%, #B1DAFF 100%);
            color: #1F2937;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 500;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          }
          button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(119, 255, 200, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📊</div>
          <h1>Você está offline</h1>
          <p>Suas finanças estão salvas localmente e estarão disponíveis quando você voltar online.</p>
          <button onclick="window.location.reload()">Tentar Novamente</button>
        </div>
      </body>
    </html>
  `;
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncContent());
    }
  });
}

async function syncContent() {
  // Perform periodic sync operations
  console.log('[SW] Performing periodic sync');
}

// Cache size management
async function limitCacheSize(cacheName, size) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > size) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, size);
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE, 100);
}, 60000); // Clean every minute

console.log('[SW] Service Worker script loaded');

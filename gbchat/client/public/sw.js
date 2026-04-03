// Service Worker for GBChat PWA
const CACHE_NAME = 'gbchat-cache-v1';
const STATIC_CACHE_NAME = 'gbchat-static-v1';
const API_CACHE_NAME = 'gbchat-api-v1';

const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/notification.mp3'
];

const STATIC_ASSETS = [
  '/icons/',
  '/assets/',
  '/images/',
  '/fonts/'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened');
      return cache.addAll(CACHE_URLS);
    }).catch((error) => {
      console.error('[SW] Install failed:', error);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname.startsWith(asset))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        // Try to fetch from network
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            // Cache the successful response
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
            return networkResponse;
          }
          
          // Return error response if network fails
          return new Response('Asset not found', { status: 404 });
        }).catch((error) => {
          console.error('[SW] Static asset fetch error:', error);
          return new Response('Network error', { status: 500 });
        });
      })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Return cached version if available
          return response;
        }
        
        // Fetch from network
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            // Cache successful API responses
            if (request.method === 'GET') {
              caches.open(API_CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
            return networkResponse;
          }
          
          return networkResponse;
        }).catch((error) => {
          console.error('[SW] API fetch error:', error);
          return new Response('Network error', { status: 500 });
        });
      })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            // Cache successful navigation responses
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
            return networkResponse;
          }
          
          return networkResponse;
        }).catch((error) => {
          console.error('[SW] Navigation fetch error:', error);
          return new Response('Network error', { status: 500 });
        });
      })
    );
    return;
  }

  // For all other requests, try network first
  event.respondWith(
    fetch(request).catch((error) => {
      console.error('[SW] Fetch error:', error);
      return new Response('Network error', { status: 500 });
    })
  );
});

// Message event for communication with client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GBChat';
  const options = {
    body: data.body || 'New message',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/chats',
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

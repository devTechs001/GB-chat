// Service Worker for GBChat PWA
// Bump CACHE_VERSION whenever the shell or the icon set changes: `activate`
// drops every cache that does not match, so a new icon is never masked by a
// stale cached copy.
const CACHE_VERSION = 'v3';
const CACHE_NAME = `gbchat-cache-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `gbchat-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `gbchat-api-${CACHE_VERSION}`;

const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-maskable-192x192.png',
  '/apple-touch-icon.png',
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

// Push notification event (server-sent Web Push)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'GBChat';
  const url = data.url || '/chats';

  const options = {
    body: data.body || 'New message',
    // 192px art renders correctly as the notification icon; the small badge
    // needs a flat, square image on Android.
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/favicon-32x32.png',
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    vibrate: [200, 100, 200],
    data: { url, ...data.data, type: data.type || 'system' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    (async () => {
      // The server cannot know whether this device is looking at the app, so it
      // always sends. Suppress the banner when a focused window is already
      // open — otherwise every message double-notifies the active tab.
      if (!data.force) {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const focused = windows.find((client) => client.focused || client.visibilityState === 'visible');
        if (focused) {
          focused.postMessage({ type: 'PUSH_RECEIVED', payload: data });
          return;
        }
      }
      await self.registration.showNotification(title, options);
    })()
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const target = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      // Prefer an app window already showing that route, then any app window.
      const exact = clientList.find((client) => client.url.endsWith(target));
      const anyApp = clientList.find((client) => new URL(client.url).origin === self.location.origin);
      const existing = exact || anyApp;

      if (existing) {
        if ('navigate' in existing) {
          try {
            await existing.navigate(target);
          } catch {
            /* navigation may be blocked; focusing is still useful */
          }
        }
        return existing.focus();
      }

      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })()
  );
});

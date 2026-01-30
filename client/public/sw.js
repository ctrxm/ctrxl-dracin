/**
 * Service Worker for CTRXL DRACIN
 * Handles caching for static assets and API responses
 * 
 * IMPORTANT: Video requests are NOT cached to prevent lag/skip issues
 */

const CACHE_VERSION = '1.0.1';
const CACHE_NAME = `ctrxl-dracin-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `ctrxl-dracin-static-v${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('[SW] Failed to cache some assets:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Do NOT cache video requests - let them pass through directly
  if (isVideoRequest(request)) {
    // Pass through without any caching or intervention
    return;
  }

  // Handle API requests
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  }
  // Handle static assets
  else {
    event.respondWith(handleStaticRequest(request));
  }
});

function isVideoRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'video' ||
    url.pathname.match(/\.(mp4|webm|m3u8|ts|m4s)$/i) ||
    url.hostname.includes('video') ||
    url.hostname.includes('cdn') ||
    url.search.includes('video') ||
    request.headers.get('range') !== null // Range requests are for video seeking
  );
}

function isAPIRequest(url) {
  return url.hostname.includes('api.sansekai.my.id') || url.pathname.includes('/api/');
}

async function handleAPIRequest(request) {
  try {
    // Network first for API - with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(console.error);
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    return new Response('Network error', { status: 503 });
  }
}

async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      
      // Only cache specific static assets
      if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js|woff|woff2|ttf|ico)$/i)) {
        cache.put(request, response.clone()).catch(console.error);
      }
    }
    
    return response;
  } catch (error) {
    // Return offline fallback for navigation
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Network error', { status: 503 });
  }
}

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(STATIC_CACHE_NAME)
      ]).then(() => {
        console.log('[SW] All caches cleared');
        if (event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Service Worker for CTRXL DRACIN
 * Handles caching for static assets, API responses, and video streaming
 */

const CACHE_NAME = 'ctrxl-dracin-v2';
const VIDEO_CACHE_NAME = 'ctrxl-dracin-video-v1';
const VIDEO_CACHE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/images/placeholder.jpg'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
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
          if (cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE_NAME) {
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

  // Handle video requests specially
  if (isVideoRequest(request)) {
    event.respondWith(handleVideoRequest(request));
  }
  // Handle API requests
  else if (isAPIRequest(url)) {
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
    url.pathname.match(/\.(mp4|webm|m3u8|ts)$/i) ||
    url.hostname.includes('video') ||
    url.hostname.includes('cdn')
  );
}

function isAPIRequest(url) {
  return url.hostname.includes('api.sansekai.my.id') || url.pathname.includes('/api/');
}

async function handleVideoRequest(request) {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  
  // Handle range requests (video seeking)
  if (request.headers.has('range')) {
    return handleRangeRequest(request, cache);
  }

  // Try cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch from network
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok && response.status === 200) {
        // Cache video segments
        const responseToCache = response.clone();
        await manageCacheSize(cache);
        cache.put(request, responseToCache).catch((err) => {
          console.warn('[SW] Failed to cache video:', err);
        });
      }
      return response;
    })
    .catch((error) => {
      console.error('[SW] Video fetch failed:', error);
      return cachedResponse || new Response('Network error', { status: 503 });
    });

  // Return cached if available, otherwise wait for network
  return cachedResponse || networkPromise;
}

async function handleRangeRequest(request, cache) {
  try {
    // Try to get full video from cache
    const cachedResponse = await cache.match(request.url);
    
    if (cachedResponse) {
      return serveRangeFromCache(request, cachedResponse);
    }

    // Fetch from network
    const response = await fetch(request);
    
    // Cache full video responses
    if (response.ok && response.status === 200) {
      const responseToCache = response.clone();
      await manageCacheSize(cache);
      cache.put(request.url, responseToCache).catch(console.error);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Range request failed:', error);
    return new Response('Range request failed', { status: 503 });
  }
}

async function serveRangeFromCache(request, cachedResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return cachedResponse;
  }

  const videoBlob = await cachedResponse.blob();
  const videoSize = videoBlob.size;

  // Parse range header
  const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!rangeMatch) {
    return cachedResponse;
  }

  const start = parseInt(rangeMatch[1], 10);
  const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : videoSize - 1;

  // Create range response
  const rangeBlob = videoBlob.slice(start, end + 1);
  return new Response(rangeBlob, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': rangeBlob.size.toString(),
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}

async function handleAPIRequest(request) {
  try {
    // Network first for API
    const response = await fetch(request);
    
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
      const cache = await caches.open(CACHE_NAME);
      
      // Cache images and static assets
      if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js|woff|woff2|ttf)$/i)) {
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

async function manageCacheSize(cache) {
  const requests = await cache.keys();
  let totalSize = 0;
  const entries = [];

  // Calculate total size
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      const size = blob.size;
      totalSize += size;
      entries.push({ request, size, url: request.url });
    }
  }

  // Remove oldest entries if over limit
  if (totalSize > VIDEO_CACHE_SIZE_LIMIT) {
    console.log('[SW] Cache size exceeded, cleaning up...');
    
    // Remove entries until under 80% of limit
    const targetSize = VIDEO_CACHE_SIZE_LIMIT * 0.8;
    let currentSize = totalSize;
    
    for (const entry of entries) {
      if (currentSize <= targetSize) break;
      
      await cache.delete(entry.request);
      currentSize -= entry.size;
      console.log('[SW] Removed:', entry.url);
    }
  }
}

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(VIDEO_CACHE_NAME)
      ]).then(() => {
        console.log('[SW] All caches cleared');
        if (event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

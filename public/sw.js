// VaxTrace Africa Service Worker
// Enables offline support and background sync

const CACHE_VERSION = 'v1';
const CACHE_NAME = `vaxtrace-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/auth/login',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log('Some assets failed to cache (this is ok, the app may not be fully built yet)');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('vaxtrace-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { method, url } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Skip chrome extensions and external requests
  if (url.startsWith('chrome-extension://') || url.includes('external')) {
    return;
  }

  // For API calls - network first with cache fallback
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fall back to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('API request offline, using cache:', request.url);
              return cachedResponse;
            }
            // No cache, return offline response
            return new Response('Offline - data not available', { status: 503 });
          });
        })
    );
    return;
  }

  // For static assets - cache first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page as fallback
          return caches.match('/offline.html');
        });
    })
  );
});

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'sync-vaccination-records') {
    event.waitUntil(syncVaccinationRecords());
  }
});

// Sync vaccination records from IndexedDB to server
async function syncVaccinationRecords() {
  try {
    console.log('Starting background sync for vaccination records');

    // Open IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('VaxTraceDB', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get unsynced items from queue
    const unsyncedItems = await new Promise((resolve, reject) => {
      const request = db
        .transaction('sync_queue', 'readonly')
        .objectStore('sync_queue')
        .getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`Found ${unsyncedItems.length} unsynced items`);

    // Sync each item
    for (const item of unsyncedItems) {
      if (!item.synced) {
        try {
          // Send to server
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });

          if (response.ok) {
            // Mark as synced in IndexedDB
            await new Promise((resolve, reject) => {
              const transaction = db.transaction('sync_queue', 'readwrite');
              const store = transaction.objectStore('sync_queue');
              item.synced = true;
              item.syncedAt = Date.now();
              const request = store.put(item);
              request.onsuccess = () => resolve(null);
              request.onerror = () => reject(request.error);
            });

            console.log(`Synced item: ${item.id}`);
          } else {
            console.log(`Sync failed for item: ${item.id}`);
          }
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }
    }

    console.log('Background sync completed');
    db.close();
  } catch (error) {
    console.error('Background sync error:', error);
    throw error;
  }
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SYNC_NOW') {
    syncVaccinationRecords()
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

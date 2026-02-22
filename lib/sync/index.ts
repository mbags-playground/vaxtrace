'use client';

import type { SyncQueueItem, VaccinationRecord } from '../types';
import { getUnsyncedItems, markSyncQueueItemAsSynced } from '../db';

/**
 * Initialize Service Worker and setup sync
 */
export async function initializeSyncService(): Promise<void> {
  if (typeof window === 'undefined') {
    console.log('[v0] Service Worker initialization skipped (server-side)');
    return;
  }

  if (!navigator.serviceWorker) {
    console.warn('[v0] Service Worker not supported in this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('[v0] Service Worker registered successfully');

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      const persisted = await navigator.storage.persist();
      console.log('[v0] Persistent storage:', persisted ? 'granted' : 'denied');
    }

    // Handle controller change
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[v0] New Service Worker update available');
            // You could show a toast notification here
          }
        });
      }
    });
  } catch (error) {
    console.error('[v0] Service Worker registration failed:', error);
  }
}

/**
 * Manually trigger sync now
 */
export async function syncNow(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.serviceWorker?.controller) {
      console.warn('[v0] Service Worker not ready');
      resolve(false);
      return;
    }

    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.success) {
        console.log('[v0] Sync completed successfully');
        resolve(true);
      } else {
        console.error('[v0] Sync failed:', event.data.error);
        resolve(false);
      }
    };

    navigator.serviceWorker.controller.postMessage(
      { type: 'SYNC_NOW' },
      [messageChannel.port2]
    );
  });
}

/**
 * Sync vaccination record to backend
 */
export async function syncVaccinationRecord(record: VaccinationRecord): Promise<boolean> {
  try {
    const response = await fetch('/api/vaccinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (response.ok) {
      console.log('[v0] Vaccination record synced:', record.id);
      return true;
    } else {
      console.error('[v0] Sync failed for record:', record.id);
      return false;
    }
  } catch (error) {
    console.error('[v0] Sync error for record:', error);
    return false;
  }
}

/**
 * Sync all unsynced items in queue
 */
export async function syncAllQueuedItems(): Promise<{ synced: number; failed: number }> {
  const result = { synced: 0, failed: 0 };

  try {
    const unsyncedItems = await getUnsyncedItems();
    console.log(`[v0] Found ${unsyncedItems.length} unsynced items to sync`);

    for (const item of unsyncedItems) {
      const success = await syncQueueItem(item);
      if (success) {
        result.synced++;
      } else {
        result.failed++;
      }
    }

    console.log(`[v0] Sync complete: ${result.synced} synced, ${result.failed} failed`);
    return result;
  } catch (error) {
    console.error('[v0] Error syncing queued items:', error);
    return result;
  }
}

/**
 * Sync individual queue item to backend
 */
async function syncQueueItem(item: SyncQueueItem): Promise<boolean> {
  try {
    let endpoint = '';
    let method = 'POST';

    // Determine endpoint based on collection and action
    switch (item.collection) {
      case 'vaccinations':
        endpoint = '/api/vaccinations';
        if (item.action === 'update') method = 'PUT';
        if (item.action === 'delete') method = 'DELETE';
        break;

      case 'medical_history':
        endpoint = '/api/medical-history';
        if (item.action === 'update') method = 'PUT';
        break;

      case 'records_shared':
        endpoint = '/api/shared-records';
        if (item.action === 'delete') method = 'DELETE';
        break;

      default:
        console.warn(`[v0] Unknown collection: ${item.collection}`);
        return false;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'DELETE' 
        ? JSON.stringify({ id: item.data.id })
        : JSON.stringify(item.data),
    });

    if (response.ok) {
      // Mark as synced
      await markSyncQueueItemAsSynced(item.id, Date.now());
      console.log(`[v0] Synced ${item.collection} ${item.action}: ${item.id}`);
      return true;
    } else {
      console.error(`[v0] Sync failed for ${item.id}:`, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('[v0] Error syncing queue item:', error);
    return false;
  }
}

/**
 * Setup automatic sync when online
 */
export function setupAutoSync(): void {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    console.log('[v0] Connection restored, starting auto-sync');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for connection to stabilize
    await syncAllQueuedItems();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('online', handleOnline);
  });
}

/**
 * Clear cache
 */
export async function clearCache(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.serviceWorker?.controller) {
      resolve(false);
      return;
    }

    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.success);
    };

    navigator.serviceWorker.controller.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );
  });
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Get online status as observable
 */
export function setupOnlineStatusListener(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

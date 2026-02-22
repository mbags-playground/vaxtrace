'use client';

import type {
  VaccinationRecord,
  MedicalHistory,
  SyncQueueItem,
  SharedRecord,
} from '../types';

const DB_NAME = 'VaxTraceDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  VACCINATIONS: 'vaccinations',
  MEDICAL_HISTORY: 'medical_history',
  SHARED_RECORDS: 'shared_records',
  SYNC_QUEUE: 'sync_queue',
  SESSIONS: 'sessions',
} as const;

/**
 * Initialize IndexedDB with all necessary object stores
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[v0] IndexedDB initialization error:', request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create vaccinations store
      if (!db.objectStoreNames.contains(STORES.VACCINATIONS)) {
        const vacStore = db.createObjectStore(STORES.VACCINATIONS, { keyPath: 'id' });
        vacStore.createIndex('patientMosipId', 'patientMosipId');
        vacStore.createIndex('dateAdministered', 'dateAdministered');
      }

      // Create medical history store
      if (!db.objectStoreNames.contains(STORES.MEDICAL_HISTORY)) {
        const medStore = db.createObjectStore(STORES.MEDICAL_HISTORY, { keyPath: 'id' });
        medStore.createIndex('patientMosipId', 'patientMosipId');
      }

      // Create shared records store
      if (!db.objectStoreNames.contains(STORES.SHARED_RECORDS)) {
        const shareStore = db.createObjectStore(STORES.SHARED_RECORDS, { keyPath: 'id' });
        shareStore.createIndex('shareCode', 'shareCode');
        shareStore.createIndex('patientMosipId', 'patientMosipId');
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('synced', 'synced');
        syncStore.createIndex('timestamp', 'timestamp');
      }

      // Create sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      console.log('[v0] IndexedDB initialized successfully');
      resolve(request.result);
    };
  });
}

/**
 * Add vaccination record to IndexedDB
 */
export async function addVaccinationRecord(
  record: VaccinationRecord
): Promise<string> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.VACCINATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.VACCINATIONS);
    const request = store.add(record);

    request.onsuccess = () => {
      console.log('[v0] Vaccination record added:', record.id);
      resolve(request.result as string);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all vaccination records for a patient
 */
export async function getVaccinationRecordsByPatient(
  patientMosipId: string
): Promise<VaccinationRecord[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.VACCINATIONS, 'readonly');
    const store = transaction.objectStore(STORES.VACCINATIONS);
    const index = store.index('patientMosipId');
    const request = index.getAll(patientMosipId);

    request.onsuccess = () => {
      resolve(request.result as VaccinationRecord[]);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Update vaccination record
 */
export async function updateVaccinationRecord(
  record: VaccinationRecord
): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.VACCINATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.VACCINATIONS);
    const request = store.put(record);

    request.onsuccess = () => {
      console.log('[v0] Vaccination record updated:', record.id);
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete vaccination record
 */
export async function deleteVaccinationRecord(recordId: string): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.VACCINATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.VACCINATIONS);
    const request = store.delete(recordId);

    request.onsuccess = () => {
      console.log('[v0] Vaccination record deleted:', recordId);
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get or create medical history for patient
 */
export async function getMedicalHistory(
  patientMosipId: string
): Promise<MedicalHistory> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDICAL_HISTORY, 'readonly');
    const store = transaction.objectStore(STORES.MEDICAL_HISTORY);
    const index = store.index('patientMosipId');
    const request = index.getAll(patientMosipId);

    request.onsuccess = () => {
      const results = request.result as MedicalHistory[];
      if (results.length > 0) {
        resolve(results[0]);
      } else {
        resolve({
          id: `med_${Date.now()}`,
          patientMosipId,
          allergies: [],
          contraindications: [],
          chronicConditions: [],
          medications: [],
          previousAdverseReactions: [],
          lastUpdated: Date.now(),
        });
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Update medical history
 */
export async function updateMedicalHistory(
  history: MedicalHistory
): Promise<void> {
  const db = await initializeDB();
  history.lastUpdated = Date.now();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MEDICAL_HISTORY, 'readwrite');
    const store = transaction.objectStore(STORES.MEDICAL_HISTORY);
    const request = store.put(history);

    request.onsuccess = () => {
      console.log('[v0] Medical history updated:', history.id);
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Add item to sync queue for offline mutations
 */
export async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id'>
): Promise<string> {
  const db = await initializeDB();
  const queueItem: SyncQueueItem = {
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.add(queueItem);

    request.onsuccess = () => {
      console.log('[v0] Item added to sync queue:', queueItem.id);
      resolve(request.result as string);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get unsynced items from queue
 */
export async function getUnsyncedItems(): Promise<SyncQueueItem[]> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('synced');
    const request = index.getAll(false);

    request.onsuccess = () => {
      resolve(request.result as SyncQueueItem[]);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Mark sync queue item as synced
 */
export async function markSyncQueueItemAsSynced(
  itemId: string,
  syncedAt: number
): Promise<void> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const getRequest = store.get(itemId);

    getRequest.onsuccess = () => {
      const item = getRequest.result as SyncQueueItem;
      if (item) {
        item.synced = true;
        item.syncedAt = syncedAt;
        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Create and store shared record (for QR code access)
 */
export async function createSharedRecord(
  record: SharedRecord
): Promise<string> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SHARED_RECORDS, 'readwrite');
    const store = transaction.objectStore(STORES.SHARED_RECORDS);
    const request = store.add(record);

    request.onsuccess = () => {
      console.log('[v0] Shared record created:', record.id);
      resolve(request.result as string);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get shared record by share code
 */
export async function getSharedRecordByCode(
  shareCode: string
): Promise<SharedRecord | null> {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SHARED_RECORDS, 'readonly');
    const store = transaction.objectStore(STORES.SHARED_RECORDS);
    const index = store.index('shareCode');
    const request = index.get(shareCode);

    request.onsuccess = () => {
      resolve((request.result as SharedRecord) || null);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from database (for logout)
 */
export async function clearAllData(): Promise<void> {
  const db = await initializeDB();
  const storeNames = [
    STORES.VACCINATIONS,
    STORES.MEDICAL_HISTORY,
    STORES.SHARED_RECORDS,
    STORES.SYNC_QUEUE,
  ];

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, 'readwrite');

    storeNames.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });

    transaction.oncomplete = () => {
      console.log('[v0] All data cleared from database');
      resolve();
    };

    transaction.onerror = () => reject(transaction.error);
  });
}

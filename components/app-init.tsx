'use client';

import { useEffect } from 'react';
import { initializeSyncService, setupAutoSync, setupOnlineStatusListener } from '@/lib/sync';

/**
 * AppInit component
 * Initializes PWA Service Worker and sync mechanisms
 * Should be placed at the root level of the app
 */
export function AppInit() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[v0] Initializing VaxTrace Africa PWA');

        // Initialize Service Worker
        await initializeSyncService();

        // Setup automatic sync when online
        setupAutoSync();

        // Setup online status listener for UI updates
        const unsubscribe = setupOnlineStatusListener((isOnline) => {
          console.log('[v0] Online status changed:', isOnline);
          // You can use this to update global state or show notifications
        });

        // Cleanup on unmount
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('[v0] Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  // This component doesn't render anything
  return null;
}

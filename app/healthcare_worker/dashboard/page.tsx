'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredSession, clearSession } from '@/lib/mosip/auth';
import { getUnsyncedItems } from '@/lib/db';
import type { UserSession, SyncQueueItem } from '@/lib/types';
import { LogOut, Plus, CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function HealthcareWorkerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [unsyncedItems, setUnsyncedItems] = useState<SyncQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentSession = await getStoredSession();
        if (!currentSession) {
          router.replace('/auth/login');
          return;
        }

        if (currentSession.role !== 'healthcare_worker') {
          router.replace(`/${currentSession.role}/dashboard`);
          return;
        }

        console.log('[v0] Loading healthcare worker dashboard for:', currentSession.name);
        setSession(currentSession);

        // Load unsynced items
        const items = await getUnsyncedItems();
        setUnsyncedItems(items);

        setIsLoading(false);
      } catch (err) {
        console.error('[v0] Error loading dashboard:', err);
        setIsLoading(false);
      }
    };

    loadData();

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await clearSession();
      router.replace('/auth/login');
    } catch (err) {
      console.error('[v0] Logout error:', err);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const syncedCount = unsyncedItems.filter(i => i.synced).length;
  const unsyncedCount = unsyncedItems.filter(i => !i.synced).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">
              Healthcare Worker Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              {session.name} • Register and verify vaccinations
            </p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Online Status */}
        <Card className={isOnline ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}>
          <CardContent className="pt-4 flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">Online • Data syncing enabled</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-700">Offline • Working with cached data</span>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            asChild 
            variant="default"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/healthcare_worker/add-record">
              <Plus className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">Add Vaccination</div>
                <div className="text-xs opacity-75">Register new record</div>
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/healthcare_worker/verify">
              <CheckCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">Verify Records</div>
                <div className="text-xs opacity-75">Validate entries</div>
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/healthcare_worker/clinic-records">
              <Clock className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">Clinic Records</div>
                <div className="text-xs opacity-75">View all entries</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Synchronization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Synced</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
                <p className="text-sm text-green-700">Records synchronized</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-900">Pending</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{unsyncedCount}</p>
                <p className="text-sm text-amber-700">Waiting to sync</p>
              </div>
            </div>

            {unsyncedCount > 0 && isOnline && (
              <Button className="w-full gap-2">
                <Wifi className="h-4 w-4" />
                Sync Now ({unsyncedCount} pending)
              </Button>
            )}

            {unsyncedCount > 0 && !isOnline && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">You're offline</p>
                  <p>Your records will sync automatically when you're back online.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground mt-1">Records Registered</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-muted-foreground mt-1">Records Verified</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground mt-1">Patients Served</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• All vaccination records are verified by MOSIP biometric data</p>
            <p>• Batch numbers and serial numbers are securely stored</p>
            <p>• Healthcare provider information is attached to each record</p>
            <p>• Your role allows you to access clinic and shared records</p>
            <p>• Records sync automatically when you're online</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

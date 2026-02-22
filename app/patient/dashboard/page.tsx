'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredSession, clearSession } from '@/lib/mosip/auth';
import { getVaccinationRecordsByPatient, getMedicalHistory } from '@/lib/db';
import type { UserSession, VaccinationRecord, MedicalHistory } from '@/lib/types';
import { LogOut, Share2, Download, AlertCircle, Calendar, MapPin, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentSession = await getStoredSession();
        if (!currentSession) {
          router.replace('/auth/login');
          return;
        }

        console.log('[v0] Loading patient dashboard for:', currentSession.name);
        setSession(currentSession);

        // Load vaccination records
        const records = await getVaccinationRecordsByPatient(currentSession.mosipId);
        setVaccinationRecords(records.sort((a, b) => 
          new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()
        ));

        // Load medical history
        const history = await getMedicalHistory(currentSession.mosipId);
        setMedicalHistory(history);

        setIsLoading(false);
      } catch (err) {
        console.error('[v0] Error loading patient dashboard:', err);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await clearSession();
      router.replace('/auth/login');
    } catch (err) {
      console.error('[v0] Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextDueVaccines = vaccinationRecords
    .filter(v => v.nextDueDate && new Date(v.nextDueDate) > new Date())
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">
              Welcome, {session.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your vaccination records are secure and always accessible
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            asChild 
            variant="default"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/patient/records">
              <Calendar className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">View Records</div>
                <div className="text-xs opacity-75">{vaccinationRecords.length} records</div>
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/patient/share">
              <Share2 className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">Share Records</div>
                <div className="text-xs opacity-75">QR code sharing</div>
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline"
            className="h-auto flex-col items-start p-4 justify-start gap-2"
          >
            <Link href="/patient/timeline">
              <Download className="h-5 w-5" />
              <div>
                <div className="font-semibold text-left">Timeline</div>
                <div className="text-xs opacity-75">Health history</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Upcoming Vaccinations */}
        {nextDueVaccines.length > 0 && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Upcoming Vaccinations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextDueVaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{vaccine.vaccineName}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(vaccine.nextDueDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Dose {vaccine.dose}/{vaccine.totalDoses}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Vaccinations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vaccinations</CardTitle>
            <CardDescription>
              Your most recent vaccination records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vaccinationRecords.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted opacity-50 mx-auto mb-2" />
                <p className="text-muted-foreground">No vaccination records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccinationRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{record.vaccineName}</h3>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(record.dateAdministered).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {record.facility}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                        Dose {record.dose}/{record.totalDoses}
                      </div>
                      {record.verified && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                          <UserCheck className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical History Alerts */}
        {medicalHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalHistory.allergies.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {medicalHistory.contraindications.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Contraindications</h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.contraindications.map((contra, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                      >
                        {contra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {medicalHistory.allergies.length === 0 && medicalHistory.contraindications.length === 0 && (
                <p className="text-muted-foreground text-sm">No medical alerts recorded</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Offline Status */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
          This application works offline. Your data syncs automatically when you're online.
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredSession } from '@/lib/mosip/auth';
import { getVaccinationRecordsByPatient } from '@/lib/db';
import type { UserSession, VaccinationRecord } from '@/lib/types';
import { ArrowLeft, Download, Share2, Calendar, MapPin, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function PatientRecordsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccinationRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentSession = await getStoredSession();
        if (!currentSession) {
          router.replace('/auth/login');
          return;
        }

        setSession(currentSession);

        const allRecords = await getVaccinationRecordsByPatient(currentSession.mosipId);
        const sorted = allRecords.sort((a, b) =>
          new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()
        );

        setRecords(sorted);
        applyFilter(sorted, 'all');
        setIsLoading(false);
      } catch (err) {
        console.error('[v0] Error loading records:', err);
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const applyFilter = (allRecords: VaccinationRecord[], filter: typeof selectedFilter) => {
    let filtered = allRecords;

    if (filter === 'verified') {
      filtered = allRecords.filter(r => r.verified);
    } else if (filter === 'pending') {
      filtered = allRecords.filter(r => !r.verified);
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
    applyFilter(records, filter);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Vaccination Records
            </h1>
            <p className="text-muted-foreground mt-1">
              {records.length} total records
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {(['all', 'verified', 'pending'] as const).map((filter) => (
            <Button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
            >
              {filter === 'all' && `All (${records.length})`}
              {filter === 'verified' && `Verified (${records.filter(r => r.verified).length})`}
              {filter === 'pending' && `Pending (${records.filter(r => !r.verified).length})`}
            </Button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No records found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {record.vaccineName}
                      </h3>

                      <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(record.dateAdministered).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{record.facility}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{record.location}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{record.healthcareProvider.name}</span>
                          </div>

                          <div className="text-muted-foreground">
                            <span className="font-medium">Batch:</span> {record.batchNumber}
                          </div>

                          {record.nextDueDate && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Next Due:</span>{' '}
                              {new Date(record.nextDueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {record.adverseEvents && record.adverseEvents.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-medium text-amber-900 mb-1">
                            Reported Side Effects:
                          </p>
                          <ul className="text-sm text-amber-800 space-y-1">
                            {record.adverseEvents.map((event, idx) => (
                              <li key={idx}>• {event}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.verified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {record.verified ? 'Verified' : 'Pending'}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Dose {record.dose}/{record.totalDoses}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

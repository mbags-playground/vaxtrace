'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredSession } from '@/lib/mosip/auth';
import { addVaccinationRecord, addToSyncQueue } from '@/lib/db';
import type { UserSession, VaccinationRecord } from '@/lib/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AddRecordPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientUIN: '',
    vaccineName: '',
    vaccineType: 'COVID-19' as const,
    dose: 1,
    totalDoses: 2,
    dateAdministered: '',
    location: '',
    facility: '',
    providerName: '',
    batchNumber: '',
    serialNumber: '',
    expiryDate: '',
    route: 'IM' as const,
    siteOfAdministration: 'Arm',
    nextDueDate: '',
    adverseEvents: '',
    notes: '',
  });

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getStoredSession();
      if (!currentSession) {
        router.replace('/auth/login');
      } else if (currentSession.role !== 'healthcare_worker') {
        router.replace(`/${currentSession.role}/dashboard`);
      } else {
        setSession(currentSession);
      }
    };
    checkSession();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.patientUIN) {
        throw new Error('Patient UIN is required');
      }
      if (!formData.vaccineName) {
        throw new Error('Vaccine name is required');
      }
      if (!formData.dateAdministered) {
        throw new Error('Date administered is required');
      }

      const record: VaccinationRecord = {
        id: `vac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientMosipId: formData.patientUIN,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType,
        dose: parseInt(formData.dose.toString()),
        totalDoses: parseInt(formData.totalDoses.toString()),
        dateAdministered: formData.dateAdministered,
        location: formData.location,
        facility: formData.facility,
        healthcareProvider: {
          name: formData.providerName,
          mosipId: session?.mosipId || '',
        },
        batchNumber: formData.batchNumber,
        serialNumber: formData.serialNumber,
        expiryDate: formData.expiryDate,
        nextDueDate: formData.nextDueDate,
        route: formData.route,
        siteOfAdministration: formData.siteOfAdministration,
        adverseEvents: formData.adverseEvents ? formData.adverseEvents.split(',').map(e => e.trim()) : [],
        notes: formData.notes,
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log('[v0] Creating vaccination record:', record);

      // Add to local database
      await addVaccinationRecord(record);

      // Add to sync queue for backend synchronization
      await addToSyncQueue({
        action: 'create',
        collection: 'vaccinations',
        data: record,
        timestamp: Date.now(),
        synced: false,
      });

      console.log('[v0] Record created and queued for sync');

      // Show success message and redirect
      alert('Vaccination record created successfully! It will be synced when online.');
      router.replace('/healthcare_worker/dashboard');
    } catch (err) {
      console.error('[v0] Error creating record:', err);
      setError(err instanceof Error ? err.message : 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const vaccineTypes = ['COVID-19', 'Yellow Fever', 'Polio', 'Measles', 'Malaria', 'TB', 'Other'] as const;
  const routes = ['IM', 'SC', 'ID', 'Oral', 'IV'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
              Add Vaccination Record
            </h1>
            <p className="text-muted-foreground mt-1">
              Register a new vaccination for a patient
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vaccination Details</CardTitle>
            <CardDescription>
              Complete all required fields to register a new vaccination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Patient Information</h3>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Patient UIN (MOSIP ID) *
                  </label>
                  <input
                    type="text"
                    name="patientUIN"
                    value={formData.patientUIN}
                    onChange={handleInputChange}
                    placeholder="Enter patient's MOSIP Unique Identity Number"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Vaccine Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Vaccine Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Vaccine Name *
                    </label>
                    <input
                      type="text"
                      name="vaccineName"
                      value={formData.vaccineName}
                      onChange={handleInputChange}
                      placeholder="e.g., Pfizer-BioNTech COVID-19"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Vaccine Type
                    </label>
                    <select
                      name="vaccineType"
                      value={formData.vaccineType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {vaccineTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Dose
                    </label>
                    <input
                      type="number"
                      name="dose"
                      value={formData.dose}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Total Doses
                    </label>
                    <input
                      type="number"
                      name="totalDoses"
                      value={formData.totalDoses}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Route
                    </label>
                    <select
                      name="route"
                      value={formData.route}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {routes.map(route => (
                        <option key={route} value={route}>{route}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      placeholder="Vaccine batch number"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Serial number (optional)"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      name="nextDueDate"
                      value={formData.nextDueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Administration Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Administration Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Date Administered *
                    </label>
                    <input
                      type="date"
                      name="dateAdministered"
                      value={formData.dateAdministered}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Site of Administration
                    </label>
                    <input
                      type="text"
                      name="siteOfAdministration"
                      value={formData.siteOfAdministration}
                      onChange={handleInputChange}
                      placeholder="e.g., Left arm, Right arm"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Facility Name *
                    </label>
                    <input
                      type="text"
                      name="facility"
                      value={formData.facility}
                      onChange={handleInputChange}
                      placeholder="Clinic or hospital name"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City/Region"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Healthcare Provider Name
                  </label>
                  <input
                    type="text"
                    name="providerName"
                    value={formData.providerName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Adverse Events (comma-separated)
                  </label>
                  <textarea
                    name="adverseEvents"
                    value={formData.adverseEvents}
                    onChange={handleInputChange}
                    placeholder="e.g., Arm soreness, Mild fever"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create Record'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

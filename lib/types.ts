// MOSIP Identity Verification Types
export interface MosipUser {
  id: string;
  uin: string; // Unique Identity Number from MOSIP
  name: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O';
  photo?: string; // Base64 encoded
  biometrics: {
    fingerprint?: string;
    iris?: string;
    face?: string;
  };
}

// Role-based access control
export type UserRole = 'patient' | 'healthcare_worker' | 'admin' | 'government';

// User session
export interface UserSession {
  id: string;
  mosipId: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  biometricVerified: boolean;
  lastVerified: number; // timestamp
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// Vaccination record
export interface VaccinationRecord {
  id: string;
  patientMosipId: string; // Link to patient via MOSIP
  vaccineName: string;
  vaccineType: 'COVID-19' | 'Yellow Fever' | 'Polio' | 'Measles' | 'Malaria' | 'TB' | 'Other';
  dose: number;
  totalDoses: number;
  dateAdministered: string; // ISO date
  location: string;
  facility: string;
  healthcareProvider: {
    name: string;
    mosipId: string;
    license?: string;
  };
  batchNumber: string;
  serialNumber?: string;
  expiryDate: string;
  nextDueDate?: string;
  route: 'IM' | 'SC' | 'ID' | 'Oral' | 'IV';
  siteOfAdministration: string;
  adverseEvents?: string[];
  notes?: string;
  verified: boolean;
  verifiedBy?: string; // MOSIP ID
  verifiedAt?: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number;
}

// Medical history
export interface MedicalHistory {
  id: string;
  patientMosipId: string;
  allergies: string[];
  contraindications: string[];
  chronicConditions: string[];
  medications: string[];
  previousAdverseReactions: string[];
  notes?: string;
  lastUpdated: number; // timestamp
}

// Offline sync queue
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: 'vaccinations' | 'medical_history' | 'records_shared';
  data: any;
  timestamp: number;
  synced: boolean;
  syncedAt?: number;
  error?: string;
}

// Shared records for QR code access
export interface SharedRecord {
  id: string;
  shareCode: string; // QR code content
  patientMosipId: string;
  vaccinations: VaccinationRecord[];
  medicalHistory: MedicalHistory;
  expiresAt: number;
  viewedBy: Array<{
    viewer: string;
    viewedAt: number;
  }>;
  createdAt: number;
}

// Analytics for government dashboard
export interface VaccinationAnalytics {
  totalRecords: number;
  vaccineBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  timelineData: Array<{
    date: string;
    count: number;
  }>;
  populationCoverage: {
    vaccinated: number;
    total: number;
    percentage: number;
  };
}

// Conflict resolution for offline sync
export interface ConflictResolution {
  recordId: string;
  localVersion: any;
  remoteVersion: any;
  resolved: boolean;
  resolvedVersion?: any;
  resolvedAt?: number;
  resolvedBy?: 'local' | 'remote' | 'manual';
}

# VaxTrace Africa - Vaccination Record Management PWA

A progressive web application for secure vaccination record management across Africa, powered by MOSIP identity verification and built for offline-first operation.

## Overview

VaxTrace Africa enables refugees, patients, healthcare workers, administrators, and government officials to securely manage vaccination records with:

- **MOSIP Biometric Authentication**: Fingerprint, iris, and face recognition via MOSIP eSignet
- **Offline-First Architecture**: Full functionality without internet connectivity
- **Role-Based Access Control**: Tailored interfaces for 4 user types
- **Progressive Web App**: Installable on iOS, Android, and desktop
- **End-to-End Encryption**: Secure data storage and transmission
- **Automatic Sync**: Background synchronization when online

## Features

### Patient Dashboard
- View personal vaccination records with detailed information
- Share records via QR codes for border/clinic verification
- Track upcoming vaccination appointments
- Medical history management (allergies, contraindications)
- Offline access to all records

### Healthcare Worker Portal
- Register new vaccination records
- Verify patient identity via MOSIP biometrics
- Capture batch numbers and serial numbers
- Track adverse events and reactions
- Manage clinic-level records
- Offline record entry with automatic sync

### Administrator Dashboard
- Manage system users and roles
- View system-wide analytics
- Configure healthcare facilities
- Audit logs and compliance tracking
- Export data for reporting

### Government Dashboard
- View aggregated vaccination statistics
- Coverage maps and geographic analysis
- Export reports for public health planning
- Trend analysis and outbreak tracking

## Technology Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: IndexedDB (client-side) + Backend (configurable)
- **Authentication**: MOSIP eSignet (OAuth 2.0)
- **PWA**: Service Worker with Workbox patterns
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React hooks + localStorage
- **API**: REST with background sync queue

## Architecture

### Offline-First Data Flow

```
User Action (Online/Offline)
    ↓
Local IndexedDB Storage
    ↓
Add to Sync Queue
    ↓
[If Online] → Background Sync → API Server
    ↓
Local Updates
    ↓
UI Re-render
```

## Setup

### Environment Variables

Create a `.env.local` file:

```env
# MOSIP Configuration
NEXT_PUBLIC_MOSIP_CLIENT_ID=vaxtrace-africa
NEXT_PUBLIC_MOSIP_ESIGNET_URL=https://esignet.mosip.net
NEXT_PUBLIC_MOSIP_KYC_URL=https://kyc.mosip.net
MOSIP_CLIENT_SECRET=your_client_secret_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.vaxtrace.example.com
API_SECRET_KEY=your_api_secret_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
app/
├── auth/
│   ├── login/              # MOSIP biometric login
│   ├── callback/           # OAuth callback
│   └── select-role/        # Role selection
├── patient/
│   ├── dashboard/          # Patient home
│   ├── records/            # View records
│   └── share/              # Share via QR
├── healthcare_worker/
│   ├── dashboard/          # Worker home
│   ├── add-record/         # Register vaccination
│   └── verify/             # Verify records
├── admin/
│   └── dashboard/          # Admin panel
├── government/
│   └── dashboard/          # Analytics dashboard
└── api/
    ├── sync/               # Background sync
    └── vaccinations/       # Vaccination CRUD

lib/
├── types.ts                # TypeScript interfaces
├── mosip/
│   └── auth.ts             # MOSIP authentication
├── db/
│   └── index.ts            # IndexedDB utilities
├── sync/
│   └── index.ts            # Offline sync service
└── rbac.ts                 # Role-based access control

components/
├── app-init.tsx            # PWA initialization
└── ui/                     # shadcn/ui components

public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
└── offline.html            # Offline fallback
```

## Database Schema

### Core Collections

**Vaccinations**
- id, patientMosipId, vaccineName, dose, dateAdministered
- location, facility, healthcareProvider, batchNumber
- verified, createdAt, updatedAt

**Medical History**
- id, patientMosipId, allergies, contraindications
- chronicConditions, medications, lastUpdated

**Sync Queue**
- id, action, collection, data, timestamp, synced

**Shared Records**
- id, shareCode, patientMosipId, vaccinations, expiresAt

## MOSIP Integration

### Authentication Flow

1. User clicks biometric option (fingerprint/iris/face)
2. Redirects to MOSIP eSignet authorization endpoint
3. MOSIP performs biometric verification
4. Returns authorization code
5. Exchange code for ID token + access token
6. Extract user info from JWT
7. Create session in IndexedDB
8. Show role selection
9. Redirect to dashboard

### Configuration

Update environment variables in MOSIP:
- Redirect URIs: `https://yourdomain.com/auth/callback`
- Scopes: `openid profile email phone`
- ACR values: `mosip:idp:acr:biometric`

## Offline Capabilities

### What Works Offline
- View all cached vaccination records
- Share records via QR codes
- Add new vaccination records (queued for sync)
- Update medical history (queued for sync)
- Export records to PDF
- Navigate all sections

### What Requires Online
- Initial MOSIP authentication
- Sync verification with backend
- Real-time record verification
- Admin user management

### Auto-Sync
- Triggers when connection restored
- Processes sync queue in order
- Handles conflicts (last-write-wins)
- Retries failed items
- Logs all sync events

## Sync API

### Endpoint: POST /api/sync

Request:
```json
{
  "action": "create",
  "collection": "vaccinations",
  "data": { /* vaccination record */ },
  "timestamp": 1234567890,
  "synced": false
}
```

Response:
```json
{
  "success": true,
  "synced": true,
  "id": "sync_xxx",
  "timestamp": 1234567890
}
```

## Security

- **MOSIP Integration**: Biometric verification required
- **Data Encryption**: Sensitive data encrypted at rest (IndexedDB)
- **Row-Level Security**: Backend RLS policies (when using Supabase)
- **Access Control**: RBAC with role-based permissions
- **Session Management**: Secure session storage in sessionStorage
- **API Authentication**: Bearer token validation
- **Audit Logging**: All mutations logged with timestamps

## Testing Offline

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Reload page
4. App continues to work normally
5. All data remains accessible
6. Changes queue for sync
7. Disable offline mode
8. Changes auto-sync to backend

## Deployment

### Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Or manually: vercel deploy
```

### Environment Setup
1. Add environment variables in Vercel dashboard
2. Configure MOSIP OAuth redirect URI
3. Setup database backend (Supabase/Neon/Aurora)
4. Deploy Service Worker (static file served)

## Performance Optimization

- Service Worker caches static assets
- IndexedDB stores up to 50MB per domain
- Efficient sync queue processing
- Lazy loading of role-specific features
- Asset compression and minification

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS in production
- Clear cache: DevTools → Application → Clear Storage

### Data Not Syncing
- Check network connection
- Verify API endpoints in environment variables
- Review Service Worker logs in DevTools
- Check IndexedDB data in DevTools

### MOSIP Authentication Fails
- Verify client credentials
- Check redirect URI configuration
- Ensure MOSIP service is accessible
- Review browser console for OAuth errors

## Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes with clear commit messages
3. Test offline functionality
4. Submit pull request

## License

This project is built to support healthcare in Africa and is provided as-is for humanitarian purposes.

## Support

For issues, questions, or contributions:
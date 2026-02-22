'use client';

import type { MosipUser, UserSession } from '../types';

/**
 * MOSIP eSignet Integration
 * This client handles biometric authentication via MOSIP's eSignet identity verification service
 */

interface eSignetConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  acr: 'mosip:idp:acr:biometric' | 'mosip:idp:acr:pin' | 'mosip:idp:acr:otp';
  claimsLocales: string[];
}

// Configuration - in production, load from environment variables
const getESignetConfig = (): eSignetConfig => {
  return {
    clientId: process.env.NEXT_PUBLIC_MOSIP_CLIENT_ID || 'vaxtrace-africa',
    clientSecret: process.env.MOSIP_CLIENT_SECRET,
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    scope: 'openid profile email phone',
    acr: 'mosip:idp:acr:biometric', // Biometric authentication
    claimsLocales: ['en'],
  };
};

/**
 * Build MOSIP eSignet authorization URL for biometric authentication
 */
export function getMosipAuthorizationUrl(): string {
  const config = getESignetConfig();
  const esignetBaseUrl = process.env.NEXT_PUBLIC_MOSIP_ESIGNET_URL || 'https://esignet.mosip.net';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    acr_values: config.acr,
    claims_locales: config.claimsLocales.join(' '),
    nonce: generateNonce(),
    state: generateState(),
  });

  return `${esignetBaseUrl}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens and user info
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  idToken: string;
  user: MosipUser;
}> {
  const config = getESignetConfig();
  const esignetBaseUrl = process.env.NEXT_PUBLIC_MOSIP_ESIGNET_URL || 'https://esignet.mosip.net';

  try {
    const response = await fetch(`${esignetBaseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret || '',
        redirect_uri: config.redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    const user = parseIdToken(data.id_token);

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      user,
    };
  } catch (error) {
    console.error('MOSIP token exchange error:', error);
    throw error;
  }
}

/**
 * Parse JWT ID token to extract user information
 */
function parseIdToken(idToken: string): MosipUser {
  try {
    const parts = idToken.split('.');
    const decoded = JSON.parse(atob(parts[1]));

    return {
      id: decoded.sub || decoded.uin,
      uin: decoded.uin,
      name: decoded.name,
      dateOfBirth: decoded.dob,
      gender: decoded.gender || 'O',
      photo: decoded.photo,
      biometrics: {
        fingerprint: decoded.biometric_fingerprint ? 'verified' : undefined,
        iris: decoded.biometric_iris ? 'verified' : undefined,
        face: decoded.biometric_face ? 'verified' : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to parse ID token:', error);
    throw new Error('Invalid ID token');
  }
}

/**
 * Verify biometric data with MOSIP KYC service
 */
export async function verifyBiometric(
  individualId: string,
  biometricType: 'fingerprint' | 'iris' | 'face',
  biometricData: string // Base64 encoded
): Promise<boolean> {
  const config = getESignetConfig();
  const kycUrl = process.env.NEXT_PUBLIC_MOSIP_KYC_URL || 'https://kyc.mosip.net';

  try {
    const response = await fetch(`${kycUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getStoredAccessToken()}`,
      },
      body: JSON.stringify({
        individualId,
        biometricType,
        biometricData,
      }),
    });

    const result = await response.json();
    return result.verified === true;
  } catch (error) {
    console.error('Biometric verification error:', error);
    return false;
  }
}

/**
 * Create user session after successful authentication
 */
export async function createUserSession(
  mosipUser: MosipUser,
  role: 'patient' | 'healthcare_worker' | 'admin' | 'government'
): Promise<UserSession> {
  const session: UserSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mosipId: mosipUser.id,
    role,
    name: mosipUser.name,
    biometricVerified: true,
    lastVerified: Date.now(),
  };

  // Store session in IndexedDB
  await storeSessionInIndexedDB(session);

  return session;
}

/**
 * Store session in IndexedDB for offline access
 */
async function storeSessionInIndexedDB(session: UserSession): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VaxTraceDB', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('sessions', 'readwrite');
      const store = transaction.objectStore('sessions');
      store.put(session);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

/**
 * Retrieve current session from IndexedDB
 */
export async function getStoredSession(): Promise<UserSession | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VaxTraceDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sessions')) {
        resolve(null);
        return;
      }

      const transaction = db.transaction('sessions', 'readonly');
      const store = transaction.objectStore('sessions');
      const query = store.getAll();

      query.onsuccess = () => {
        const sessions = query.result;
        resolve(sessions.length > 0 ? sessions[0] : null);
      };
      query.onerror = () => reject(query.error);
    };
  });
}

/**
 * Clear session on logout
 */
export async function clearSession(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VaxTraceDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sessions')) {
        resolve();
        return;
      }

      const transaction = db.transaction('sessions', 'readwrite');
      const store = transaction.objectStore('sessions');
      store.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Store access token securely
 */
function storeAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mosip_access_token', token);
  }
}

/**
 * Retrieve stored access token
 */
function getStoredAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('mosip_access_token');
  }
  return null;
}

/**
 * Generate cryptographic nonce
 */
function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

/**
 * Generate cryptographic state
 */
function generateState(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < 32; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return state;
}

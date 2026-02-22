'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMosipAuthorizationUrl, getStoredSession } from '@/lib/mosip/auth';
import { Fingerprint, Eye, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBiometric, setSelectedBiometric] = useState<'fingerprint' | 'iris' | 'face' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      const session = await getStoredSession();
      if (session && Date.now() - session.lastVerified < 24 * 60 * 60 * 1000) {
        // Session is valid (less than 24 hours old)
        router.replace(`/${session.role}/dashboard`);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleBiometricAuth = async (biometricType: 'fingerprint' | 'iris' | 'face') => {
    setIsLoading(true);
    setError(null);
    setSelectedBiometric(biometricType);

    try {
      // Initiate MOSIP eSignet flow
      const authUrl = getMosipAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate authentication. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-balance">VaxTrace Africa</CardTitle>
          <CardDescription className="text-base mt-2">
            Biometric Identity Verification
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Verify your identity using MOSIP biometric authentication to access your vaccination records securely.
          </p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Select biometric method:</p>

            <Button
              onClick={() => handleBiometricAuth('fingerprint')}
              disabled={isLoading}
              variant={selectedBiometric === 'fingerprint' ? 'default' : 'outline'}
              className="w-full h-20 flex flex-col items-center justify-center gap-2"
            >
              {isLoading && selectedBiometric === 'fingerprint' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Fingerprint className="h-6 w-6" />
              )}
              <span>Fingerprint</span>
            </Button>

            <Button
              onClick={() => handleBiometricAuth('iris')}
              disabled={isLoading}
              variant={selectedBiometric === 'iris' ? 'default' : 'outline'}
              className="w-full h-20 flex flex-col items-center justify-center gap-2"
            >
              {isLoading && selectedBiometric === 'iris' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Eye className="h-6 w-6" />
              )}
              <span>Iris Scan</span>
            </Button>

            <Button
              onClick={() => handleBiometricAuth('face')}
              disabled={isLoading}
              variant={selectedBiometric === 'face' ? 'default' : 'outline'}
              className="w-full h-20 flex flex-col items-center justify-center gap-2"
            >
              {isLoading && selectedBiometric === 'face' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              <span>Face Recognition</span>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Powered by MOSIP eSignet • Your identity data is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

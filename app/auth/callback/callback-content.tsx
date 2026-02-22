'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForToken, createUserSession } from '@/lib/mosip/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('[v0] Processing MOSIP auth callback');

        // Exchange code for tokens and user info
        const { accessToken, idToken, user } = await exchangeCodeForToken(code);
        console.log('[v0] Successfully exchanged code for tokens, user:', user.name);

        // Store access token
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mosip_access_token', accessToken);
          sessionStorage.setItem('mosip_id_token', idToken);
        }

        // Determine user role based on MOSIP attributes or default to patient
        // In production, this would come from MOSIP attributes or a separate role service
        const role = 'patient' as const;

        // Create user session
        const session = await createUserSession(user, role);
        console.log('[v0] User session created:', session.id);

        // Redirect to appropriate dashboard
        router.replace(`/${role}/dashboard`);
      } catch (err) {
        console.error('[v0] Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);

        // Redirect back to login after 3 seconds
        setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    };

    processAuthCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Authentication Failed</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Verifying Your Identity</h2>
          <p className="text-sm text-muted-foreground">
            Completing MOSIP authentication...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AppInit } from '@/components/app-init';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.replace('/home');
  }, [router]);

  return (
    <>
      <AppInit />
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-lg font-semibold mb-2">VaxTrace Africa</h2>
            <p className="text-sm text-muted-foreground">
              Loading application...
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

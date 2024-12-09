'use client';

import { useOffline } from '@/hooks/useOffline';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineAlert() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <Alert variant="destructive" className="fixed top-0 w-full z-50">
      <AlertDescription>
        You are currently offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
}
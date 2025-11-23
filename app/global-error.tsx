'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center px-6 bg-background">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertTriangle className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong!</h1>
              <p className="text-white/60">
                {error.message || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="primary">
                Try again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="ghost">
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

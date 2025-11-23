import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-white/80">Page not found</h2>
          <p className="text-white/60">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" iconLeft={<Home className="h-5 w-5" />}>
            Return home
          </Button>
        </Link>
      </div>
    </div>
  );
}

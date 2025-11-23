'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Disable SSR completely for the game page to prevent hydration issues
const GamePageContent = dynamic(() => import('./GamePageContent'), {
  ssr: false,
  loading: () => (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6 px-6 py-6 overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-purple-800/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-white/80 text-lg font-medium">Loading game...</p>
      </div>
    </main>
  ),
});

export default function GamePage() {
  return <GamePageContent />;
}

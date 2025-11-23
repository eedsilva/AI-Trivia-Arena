'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import components with no SSR to prevent hydration issues
const HeroSection = dynamic(
  () => import('../components/features/HeroSection').then((mod) => ({ default: mod.HeroSection })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-2xl tracking-tight">
          AI Trivia Arena
        </h1>
        <p className="text-lg text-white/80">
          Challenge your mind in a fast-paced quiz where every question is a new adventure, crafted
          by AI.
        </p>
      </div>
    ),
  }
);

const Leaderboard = dynamic(
  () =>
    import('../components/features/leaderboard/Leaderboard').then((mod) => ({
      default: mod.Leaderboard,
    })),
  {
    ssr: false,
  }
);

const UserModal = dynamic(
  () => import('../components/ui/UserModal').then((mod) => ({ default: mod.UserModal })),
  {
    ssr: false,
  }
);

import { hasUserCache } from '../lib/storage/userCache';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStartClick = () => {
    if (isMounted && hasUserCache()) {
      return;
    }
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
  };

  const handleModalClose = () => {
    if (isMounted && hasUserCache()) {
      setShowModal(false);
    }
  };

  return (
    <>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <HeroSection onStartClick={handleStartClick} />
        <Leaderboard useRealtime={true} maxEntries={5} />
      </main>
      {isMounted && (
        <UserModal open={showModal} onClose={handleModalClose} onSuccess={handleModalSuccess} />
      )}
    </>
  );
}

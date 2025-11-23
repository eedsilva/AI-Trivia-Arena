'use client';
import { useState } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { hasUserCache, getUserFromCache } from '../../lib/storage/userCache';

interface StartButtonProps {
  onStartClick?: () => void;
}

export function StartButton({ onStartClick }: StartButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    // Read directly from cache instead of subscribing to store
    const cachedUser = getUserFromCache();

    // Check if user is authenticated
    if (hasUserCache() && cachedUser?.user_id) {
      // User exists, initiate game session
      setIsLoading(true);

      try {
        const response = await fetch('/api/start-game-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: cachedUser.user_id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to start game session');
        }

        // Session started, navigate to game
        router.push('/game');
      } catch (error) {
        console.error('Error starting game session:', error);
        setIsLoading(false);
      }
    } else {
      // No user, trigger modal via parent callback
      onStartClick?.();
    }
  };

  return (
    <Button
      variant="start"
      className="mt-6 px-6 py-4 text-lg"
      onClick={handleClick}
      iconRight={
        isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />
      }
      disabled={isLoading}
    >
      {isLoading ? 'Starting Game...' : 'Start Game'}
    </Button>
  );
}

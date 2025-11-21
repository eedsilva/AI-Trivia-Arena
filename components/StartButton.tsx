'use client';
import { Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './global/Button';

export function StartButton() {
  const router = useRouter();
  return (
    <Button
      className="mt-6 px-6 py-4 text-lg"
      onClick={() => router.push('/game')}
      iconRight={<Rocket className="h-5 w-5" />}
    >
      Start Game
    </Button>
  );
}

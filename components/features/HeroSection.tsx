'use client';
import { StartButton } from './StartButton';

interface HeroSectionProps {
  onStartClick?: () => void;
}

export function HeroSection({ onStartClick }: HeroSectionProps) {
  return (
    <section className="max-w-2xl space-y-6">
      {/* Bold title as per spec */}
      <h1 className="text-6xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-2xl tracking-tight">
        AI Trivia Arena
      </h1>

      <p className="text-lg text-white/80">
        Challenge your mind in a fast-paced quiz where every question is a new adventure, crafted by
        AI.
      </p>

      {/* Start Game button */}
      <StartButton onStartClick={onStartClick} />
    </section>
  );
}

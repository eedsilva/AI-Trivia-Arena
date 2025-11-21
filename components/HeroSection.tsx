import { Sparkles } from 'lucide-react';
import { StartButton } from './StartButton';

export function HeroSection() {
  return (
    <section className="max-w-2xl space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-accent2">
        <Sparkles className="h-4 w-4" />
        AI-Powered Trivia Experience
      </div>
      <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
        AI Trivia Arena
      </h1>
      <p className="text-lg text-white/70">
        Challenge your mind in a fast-paced quiz where every question is a new adventure, crafted by AI.
      </p>
      <StartButton />
    </section>
  );
}

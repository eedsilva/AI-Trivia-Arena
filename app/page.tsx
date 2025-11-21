import { HeroSection } from '../components/HeroSection';
import { Leaderboard } from '../components/game/Leaderboard';

const mockLeaderboard = [
  { id: '1', name: 'CosmicKnight', score: 1250, streak: 8 },
  { id: '2', name: 'Starlight', score: 1100, streak: 7 },
  { id: '3', name: 'QuantumSorceress', score: 980, streak: 6 },
  { id: '4', name: 'MysticScholar', score: 850, streak: 5 }
];

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
      <HeroSection />
      <Leaderboard entries={mockLeaderboard} />
    </main>
  );
}

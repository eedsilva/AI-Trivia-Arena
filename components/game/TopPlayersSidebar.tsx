import { Leaderboard } from './Leaderboard';

export function TopPlayersSidebar() {
  const mock = [
    { id: '1', name: 'Quantum_Leap65', score: 1200, streak: 7 },
    { id: '2', name: 'NovaShade_Rider', score: 1100, streak: 6 },
    { id: '3', name: 'StarGazer_9', score: 1050, streak: 5 },
    { id: '4', name: 'Astro_Ace', score: 960, streak: 4 },
    { id: '5', name: 'Galactic_Gamer', score: 910, streak: 4 }
  ];
  return (
    <div className="w-full max-w-xs">
      <Leaderboard entries={mock} title="Top Players" />
    </div>
  );
}

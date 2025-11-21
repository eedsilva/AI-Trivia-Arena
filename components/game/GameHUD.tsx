import { Card } from '../global/Card';
import { Avatar } from '../global/Avatar';

interface GameHUDProps {
  username: string;
  score: number;
  streak: number;
  correctCount: number;
}

export function GameHUD({ username, score, streak, correctCount }: GameHUDProps) {
  const stats = [
    { label: 'Score', value: score.toLocaleString(), accent: 'text-accent2' },
    { label: 'Streak', value: `${streak}x` },
    { label: 'Correct', value: correctCount.toString() }
  ];
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Card className="flex items-center gap-3 p-4 md:w-64">
        <Avatar name={username} />
        <div>
          <p className="text-sm text-white/60">Player</p>
          <p className="text-lg font-semibold text-white">{username}</p>
        </div>
      </Card>
      <div className="grid flex-1 grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <p className="text-sm text-white/60">{stat.label}</p>
            <p className={`text-2xl font-bold text-white ${stat.accent ?? ''}`}>{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Trophy } from 'lucide-react';
import { Card } from '../global/Card';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export function Leaderboard({ entries, title = 'Leaderboard' }: LeaderboardProps) {
  return (
    <Card className="w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <Trophy className="h-5 w-5 text-accent" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className="text-xs uppercase tracking-wide text-white/40">Live</span>
      </div>
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-white/40">{idx + 1}.</span>
              <div>
                <p className="font-semibold text-white">{entry.name}</p>
                <p className="text-xs text-white/50">{entry.streak} round streak</p>
              </div>
            </div>
            <span className="text-lg font-bold text-accent2">{entry.score}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

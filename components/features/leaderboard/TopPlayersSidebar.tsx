'use client';
import { Leaderboard } from './Leaderboard';

export function TopPlayersSidebar() {
  // Use realtime leaderboard for game page
  return (
    <div className="w-full max-w-xs">
      <Leaderboard title="Top Players" useRealtime={true} maxEntries={10} />
    </div>
  );
}

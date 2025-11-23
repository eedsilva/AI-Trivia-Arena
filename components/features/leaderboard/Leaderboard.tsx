'use client';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import {
  useLeaderboard,
  type LeaderboardEntry,
  type LeaderboardSortBy,
} from '../../../lib/hooks/useLeaderboard';

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  title?: string;
  useRealtime?: boolean;
  maxEntries?: number;
  sortBy?: LeaderboardSortBy;
  onSortChange?: (sortBy: LeaderboardSortBy) => void;
}

/**
 * Leaderboard component with realtime updates and in-memory caching
 * Uses React Query for efficient data fetching and caching
 */
export function Leaderboard({
  entries: propEntries,
  title = 'Leaderboard',
  useRealtime = false,
  maxEntries = 10,
  sortBy: propSortBy,
  onSortChange,
}: LeaderboardProps) {
  // Internal sort state if not controlled by parent
  const [internalSort, setInternalSort] = useState<LeaderboardSortBy>('score');

  // Use prop sort if provided, otherwise use internal sort
  const currentSort = propSortBy !== undefined ? propSortBy : internalSort;

  // Sync internal sort with prop changes
  useEffect(() => {
    if (propSortBy !== undefined) {
      setInternalSort(propSortBy);
    }
  }, [propSortBy]);

  // Use custom hook for leaderboard data
  const { entries: hookEntries, isLoading } = useLeaderboard(currentSort, {
    enabled: useRealtime || !propEntries || propEntries.length === 0,
    maxEntries,
  });

  // Determine which entries to display
  const displayEntries = useMemo(() => {
    // Use prop entries if provided and not using realtime
    if (propEntries && propEntries.length > 0 && !useRealtime) {
      return propEntries.slice(0, maxEntries);
    }
    return hookEntries;
  }, [propEntries, useRealtime, hookEntries, maxEntries]);

  const handleSortChange = useCallback(
    (newSort: LeaderboardSortBy) => {
      // Update internal state if not controlled
      if (propSortBy === undefined) {
        setInternalSort(newSort);
      }
      // Notify parent component of sort change
      // React Query will automatically refetch when sortBy changes
      onSortChange?.(newSort);
    },
    [onSortChange, propSortBy]
  );
  return (
    <Card className="w-full max-w-sm space-y-4 bg-white/5 border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-xs uppercase tracking-wide text-white/40">Live</span>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2">
        <Button
          variant={currentSort === 'score' ? 'primary' : 'ghost'}
          onClick={() => handleSortChange('score')}
          className="flex-1 text-xs py-2"
          iconLeft={<TrendingUp className="h-3 w-3" />}
        >
          High Score
        </Button>
        <Button
          variant={currentSort === 'streak' ? 'primary' : 'ghost'}
          onClick={() => handleSortChange('streak')}
          className="flex-1 text-xs py-2"
          iconLeft={<Flame className="h-3 w-3" />}
        >
          Max Streak
        </Button>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-white/40 py-8 text-sm">Loading leaderboard...</div>
        ) : displayEntries.length > 0 ? (
          displayEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-white/60 font-bold text-base w-6 flex-shrink-0">
                  {idx + 1}.
                </span>
                <Avatar name={entry.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{entry.name}</p>
                  <p className="text-xs text-white/50">
                    {currentSort === 'streak'
                      ? `${entry.score.toLocaleString()} points`
                      : `${entry.max_streak || 0} max streak`}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-accent2 ml-2 flex-shrink-0">
                {currentSort === 'streak'
                  ? `${entry.max_streak || 0} 🔥`
                  : entry.score.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-white/40 py-8 text-sm">No players yet</div>
        )}
      </div>
    </Card>
  );
}

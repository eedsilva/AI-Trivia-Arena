'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { getLeaderboardWithUsers, subscribeToLeaderboard } from '../supabase/realtime';
import type { LeaderboardSortBy, LeaderboardEntry } from '../types';
import { queryKeys } from './queryKeys';

// Re-export type for convenience
export type { LeaderboardEntry, LeaderboardSortBy };

/**
 * Custom hook for fetching and managing leaderboard data
 *
 * Features:
 * - In-memory caching with React Query (30s stale time)
 * - Realtime updates without full refetch (1s debounce)
 * - Automatic cache invalidation on data changes
 * - Optimized for frequent updates
 *
 * @param sortBy - Sort by 'score' or 'streak' (default: 'score')
 * @param options - Optional configuration
 * @param options.enabled - Whether to fetch data (default: true)
 * @param options.maxEntries - Maximum number of entries to return (default: 10)
 * @returns Leaderboard data, loading state, and refetch function
 *
 * @example
 * const { entries, isLoading } = useLeaderboard('score', { maxEntries: 5 });
 */
export function useLeaderboard(
  sortBy: LeaderboardSortBy = 'score',
  options?: { enabled?: boolean; maxEntries?: number }
) {
  const { enabled = true, maxEntries = 10 } = options || {};
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof subscribeToLeaderboard> | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch leaderboard data with React Query
  const {
    data: leaderboardData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.leaderboard(sortBy),
    queryFn: async () => {
      const data = await getLeaderboardWithUsers(sortBy);
      return data.map((entry) => ({
        id: entry.user_id,
        name: entry.name || 'Unknown',
        score: entry.score || 0,
        streak: entry.streak || 0,
        max_streak: entry.max_streak || 0,
      }));
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds - leaderboard updates frequently
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Handle realtime updates
  useEffect(() => {
    if (!enabled) return;

    // Debounce the refetch to avoid too many calls
    const handleRealtimeUpdate = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Invalidate and refetch leaderboard
        queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard(sortBy) });
      }, 1000); // 1 second debounce
    };

    // Subscribe to realtime updates
    channelRef.current = subscribeToLeaderboard(handleRealtimeUpdate);

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, sortBy, queryClient]);

  // Get limited entries
  const entries = leaderboardData.slice(0, maxEntries);

  return {
    entries,
    isLoading,
    isError,
    error,
    refetch,
  };
}

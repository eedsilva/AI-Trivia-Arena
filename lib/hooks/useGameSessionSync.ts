'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { updateGameSessionScore } from '../game/realtimeGame';
import { queryKeys } from './queryKeys';
import { useGameStore } from '../store/gameStore';

interface SyncGameSessionParams {
  userId: string;
  score: number;
  streak: number;
  maxStreak?: number;
}

/**
 * Custom hook for syncing game session score to server
 *
 * Features:
 * - Automatic syncing when score/streak changes
 * - Optimistic UI updates with rollback on error
 * - 1 second debounce to prevent excessive API calls
 * - Race condition handling with query cancellation
 * - Exponential backoff retry (2 attempts)
 *
 * @param userId - User ID to sync session for
 * @returns Sync functions and sync state
 *
 * @example
 * // Auto-syncs when score/streak changes in store
 * useGameSessionSync(userId);
 */
export function useGameSessionSync(userId: string | undefined) {
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<SyncGameSessionParams | null>(null);
  const { score, streak, maxStreak } = useGameStore();

  const syncMutation = useMutation({
    mutationFn: async (params: SyncGameSessionParams) => {
      await updateGameSessionScore(params.userId, params.score, params.streak, params.maxStreak);
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.gameSession(params.userId) });

      // Snapshot previous value
      const previousSession = queryClient.getQueryData(queryKeys.gameSession(params.userId));

      // Optimistically update
      queryClient.setQueryData(queryKeys.gameSession(params.userId), {
        score: params.score,
        streak: params.streak,
        maxStreak: params.maxStreak || params.streak,
      });

      return { previousSession };
    },
    onError: (err, params, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(queryKeys.gameSession(params.userId), context.previousSession);
      }
      console.error('Failed to sync game session:', err);
    },
    onSettled: (data, error, params) => {
      // Only invalidate on error to refetch, not on success (optimistic update is enough)
      if (error) {
        queryClient.invalidateQueries({ queryKey: queryKeys.gameSession(params.userId) });
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Debounced sync function
  const syncScore = useCallback(
    (params: SyncGameSessionParams) => {
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Store latest params
      lastSyncRef.current = params;

      // Debounce the sync
      debounceRef.current = setTimeout(() => {
        if (lastSyncRef.current) {
          syncMutation.mutate(lastSyncRef.current);
        }
      }, 1000); // 1 second debounce
    },
    [syncMutation]
  );

  // Auto-sync when score/streak changes from store
  useEffect(() => {
    if (!userId) return;

    // Only sync if values have actually changed
    const currentParams: SyncGameSessionParams = {
      userId,
      score,
      streak,
      maxStreak,
    };

    const lastParams = lastSyncRef.current;

    // Skip initial render and only sync on actual changes
    if (
      lastParams &&
      (lastParams.score !== score ||
        lastParams.streak !== streak ||
        lastParams.maxStreak !== maxStreak)
    ) {
      console.log('🔄 SYNCING TO DB:', currentParams);
      syncScore(currentParams);
    } else if (!lastParams) {
      // Store initial params
      lastSyncRef.current = currentParams;
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [userId, score, streak, maxStreak, syncScore]);

  // Manual sync function for explicit calls
  const manualSync = useCallback(() => {
    if (!userId) return;
    const currentParams: SyncGameSessionParams = {
      userId,
      score,
      streak,
      maxStreak,
    };
    syncScore(currentParams);
  }, [userId, score, streak, maxStreak, syncScore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    syncScore,
    manualSync,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
}

'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { subscribeToGameSession } from '../game/realtimeGame';
import type { GameSessionData } from '../types';
import { queryKeys } from './queryKeys';

/**
 * Fetch game session data from API
 */
async function fetchGameSession(userId: string): Promise<GameSessionData> {
  const response = await fetch(`/api/get-game-session?user_id=${userId}`);
  if (!response.ok) {
    // Return default values if no session exists
    return { score: 0, streak: 0, maxStreak: 0 };
  }
  const data = await response.json();
  return {
    score: data.score || 0,
    streak: data.streak || 0,
    maxStreak: data.streak || 0,
    username: data.username || '',
    avatar_url: data.avatar_url || null,
  };
}

/**
 * Custom hook for fetching and managing game session data
 *
 * Features:
 * - Automatic fetching on mount when userId is available
 * - Realtime subscription to score updates via Supabase
 * - Optimistic cache updates on realtime changes
 * - 10s stale time for frequent updates
 *
 * @param userId - User ID to fetch session for
 * @param options - Optional configuration
 * @param options.enabled - Whether to fetch data (default: true)
 * @returns Game session data, loading state, and refetch function
 *
 * @example
 * const { sessionData, isLoading } = useGameSession(userId);
 */
export function useGameSession(userId: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof subscribeToGameSession> | null>(null);

  const {
    data: sessionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.gameSession(userId || ''),
    queryFn: () => fetchGameSession(userId!),
    enabled: enabled && !!userId,
    staleTime: 10 * 1000, // 10 seconds - session updates frequently
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId || !enabled) return;

    const channel = subscribeToGameSession(userId, (payload) => {
      // Update cache optimistically
      queryClient.setQueryData<GameSessionData>(queryKeys.gameSession(userId), (oldData) => {
        if (!oldData) return { score: payload.score, streak: payload.streak };
        return {
          ...oldData,
          score: payload.score,
          streak: payload.streak,
        };
      });
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [userId, enabled, queryClient]);

  return {
    sessionData: sessionData || { score: 0, streak: 0, maxStreak: 0 },
    isLoading,
    isError,
    error,
    refetch,
  };
}

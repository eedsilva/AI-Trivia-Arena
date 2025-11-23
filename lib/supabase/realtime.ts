import { supabaseBrowser } from './browser';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { LeaderboardSortBy } from '../types';

// Legacy interface for backward compatibility with Supabase queries
// Note: The main LeaderboardEntry type is defined in lib/types
export interface LeaderboardEntry {
  user_id: string;
  score: number;
  streak: number;
  max_streak?: number;
  name?: string; // From joined users table
}

/**
 * Subscribe to game_sessions table changes for realtime leaderboard updates
 * Listens to all changes (INSERT, UPDATE, DELETE) on game_sessions table
 *
 * @param callback - Function called when leaderboard data changes
 * @returns RealtimeChannel that can be unsubscribed
 *
 * @example
 * const channel = subscribeToLeaderboard(() => {
 *   // Refetch leaderboard data
 * });
 * // Later: channel.unsubscribe();
 */
export const subscribeToLeaderboard = (callback: () => void): RealtimeChannel => {
  const client = supabaseBrowser();

  const channel = client
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'game_sessions',
      } as any,
      (payload: RealtimePostgresChangesPayload<any>) => {
        // Trigger callback on any change
        callback();
      }
    )
    .subscribe();

  return channel;
};

// Re-export type from centralized types
export type { LeaderboardSortBy } from '../types';

/**
 * Get leaderboard data from the leaderboard_view
 * Uses the database view for efficient querying instead of manual joins
 * Supports sorting by high score or max streak
 *
 * @param sortBy - Sort by 'score' (high score) or 'streak' (max streak) (default: 'score')
 * @returns Array of leaderboard entries with user names
 *
 * @example
 * const leaderboard = await getLeaderboardWithUsers('streak');
 */
export const getLeaderboardWithUsers = async (
  sortBy: LeaderboardSortBy = 'score'
): Promise<Array<LeaderboardEntry & { name: string }>> => {
  try {
    const client = supabaseBrowser();

    // Query the view - need to fetch all and sort client-side if view has ORDER BY
    // Or query without ORDER BY from view and apply ordering in query
    const { data, error } = await client
      .from('leaderboard_view')
      .select('user_id, name, score, streak, max_streak')
      .limit(100); // Get more than needed to sort properly

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    if (!data) return [];

    // Sort the data client-side based on sortBy parameter
    const sortedData = [...data].sort((a, b) => {
      if (sortBy === 'score') {
        // Sort by score descending, then max_streak descending
        if (b.score !== a.score) {
          return (b.score || 0) - (a.score || 0);
        }
        return (b.max_streak || 0) - (a.max_streak || 0);
      } else {
        // Sort by max_streak descending, then score descending
        if (b.max_streak !== a.max_streak) {
          return (b.max_streak || 0) - (a.max_streak || 0);
        }
        return (b.score || 0) - (a.score || 0);
      }
    });

    // Return top 10 after sorting
    const topEntries = sortedData.slice(0, 10);

    // Map the view data (name is already aliased from username in the view)
    return topEntries.map((entry: any) => ({
      user_id: entry.user_id,
      score: entry.score || 0,
      streak: entry.streak || 0,
      max_streak: entry.max_streak || 0,
      name: entry.name || 'Unknown',
    }));
  } catch (error) {
    console.error('Error in getLeaderboardWithUsers:', error);
    return [];
  }
};

/**
 * SQL for creating the leaderboard_view (already created via Solution 1):
 *
 * The view maps u.username as 'name' for frontend compatibility.
 * Realtime is enabled on game_sessions table (NOT the view):
 * ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
 */

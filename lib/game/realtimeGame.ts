import { supabaseBrowser } from '../supabase/browser';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to real-time game session updates for a specific user
 * Listens to game_sessions table changes and pushes updated scores to clients
 *
 * @param userId - User ID to subscribe to updates for
 * @param callback - Callback function called when session data changes
 * @returns RealtimeChannel that can be unsubscribed
 *
 * @example
 * const channel = subscribeToGameSession(userId, (payload) => {
 *   console.log('Score updated:', payload.score);
 * });
 * // Later: channel.unsubscribe();
 */
export const subscribeToGameSession = (
  userId: string,
  callback: (payload: { score: number; streak: number; correctCount?: number }) => void
): RealtimeChannel => {
  const client = supabaseBrowser();

  const channel = client
    .channel(`game-session-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_sessions',
        filter: `user_id=eq.${userId}`,
      } as any,
      (payload: any) => {
        // Push updated scores
        callback({
          score: payload.new.score || 0,
          streak: payload.new.streak || 0,
        });
      }
    )
    .subscribe();

  return channel;
};

/**
 * Update game session score and streak in the database
 * Used by useGameSessionSync hook for syncing game state
 *
 * Logic:
 * - score: Only updates if the new score is HIGHER (high score for leaderboard)
 * - streak: Updates with current value (can go up or down each session)
 * - max_streak: Only updates if higher (all-time highest streak)
 *
 * @param userId - User ID to update session for
 * @param score - New score value (only saved if higher than existing)
 * @param streak - New streak value (current session streak)
 * @param maxStreak - Optional max streak
 * @throws Error if update fails
 *
 * @example
 * await updateGameSessionScore(userId, 1000, 5);
 */
export const updateGameSessionScore = async (
  userId: string,
  score: number,
  streak: number,
  maxStreak?: number
): Promise<void> => {
  try {
    const client = supabaseBrowser();

    console.log('💾 Updating score for user:', { userId, score, streak, maxStreak });

    // First, check if a session exists for this user
    const { data: existingSession, error: fetchError } = await client
      .from('game_sessions')
      .select('id, score, streak, max_streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ ERROR FETCHING SESSION:', fetchError);
      throw fetchError;
    }

    console.log('📂 Existing session:', existingSession);

    if (existingSession) {
      // Session exists, update it
      console.log('🔄 Updating existing session...');

      // Only update score if it's HIGHER than the existing high score
      const newHighScore = Math.max(existingSession.score || 0, score);

      // Only update max_streak if current streak is higher than existing max_streak
      const newMaxStreak = Math.max(existingSession.max_streak || 0, maxStreak || streak, streak);

      console.log('📈 Score and streak calculation:', {
        existingScore: existingSession.score,
        currentScore: score,
        newHighScore,
        existingMaxStreak: existingSession.max_streak,
        currentStreak: streak,
        proposedMaxStreak: maxStreak,
        newMaxStreak,
      });

      const { error, data, count } = await client
        .from('game_sessions')
        .update({
          score: newHighScore, // Only update if higher
          streak, // Current streak can go up or down
          max_streak: newMaxStreak, // All-time highest streak
        })
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('❌ DB UPDATE ERROR:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }

      console.log('✅ DB UPDATED:', data);
      console.log('📊 Rows affected:', count);
    } else {
      // Session doesn't exist, create it
      const { error, data } = await client
        .from('game_sessions')
        .insert({
          user_id: userId,
          score,
          streak,
          max_streak: maxStreak || streak,
        })
        .select();

      if (error) {
        console.error('❌ DB INSERT ERROR:', error);
        throw error;
      }

      console.log('✅ DB CREATED:', data);
    }
  } catch (error) {
    console.error('❌ Exception in updateGameSessionScore:', error);
    throw error;
  }
};

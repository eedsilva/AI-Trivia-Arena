import { supabaseServer } from './server';

/**
 * Get user information from database
 * @param userId - User ID to fetch
 * @returns User data including username and avatar_url
 * @throws Error if user not found or query fails
 */
export const getUser = async (userId: string) => {
  const { data, error } = await supabaseServer()
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    throw new Error('User not found');
  }

  if (error) throw error;
  return data;
};

/**
 * Get user's game session from database
 * @param userId - User ID to fetch session for
 * @returns Game session data
 * @throws Error if session not found or query fails
 */
export const getUserSession = async (userId: string) => {
  const { data, error } = await supabaseServer()
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no session exists (PGRST116 is "no rows returned"), throw error so caller knows
  if (error && error.code === 'PGRST116') {
    throw new Error('No game session found');
  }

  if (error) throw error;
  return data;
};

/**
 * Create a new user in the database
 * @param payload - User data including id, username, and optional avatar_url
 * @returns Created user data
 * @throws Error if creation fails
 */
export const createUser = async (payload: {
  id: string;
  username: string;
  avatar_url?: string;
}) => {
  const { data, error } = await supabaseServer()
    .from('users')
    .insert({
      id: payload.id,
      username: payload.username,
      avatar_url: payload.avatar_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Update user settings in the database
 * @param payload - User settings including difficulty, TTS preferences
 * @returns Updated settings data
 * @throws Error if update fails
 */
export const updateUserSettings = async (payload: {
  user_id: string;
  difficulty: string;
  tts_enabled: boolean;
  tts_voice: string;
}) => {
  const { data, error } = await supabaseServer()
    .from('user_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Save a generated question to the database
 * @param question - Question data to save
 * @returns Saved question data with ID
 * @throws Error if save fails
 */
export const saveQuestion = async (question: {
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
}) => {
  const { data, error } = await supabaseServer()
    .from('questions')
    .insert(question)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Start a new game session for a user
 * @param payload - Session data including user_id and optional initial score/streak
 * @returns Created session data
 * @throws Error if creation fails
 */
export const startGameSession = async (payload: {
  user_id: string;
  score?: number;
  streak?: number;
}) => {
  const { data, error } = await supabaseServer()
    .from('game_sessions')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Increment user's score using database RPC function
 * @param userId - User ID to increment score for
 * @param amount - Amount to increment by
 * @throws Error if increment fails
 */
export const incrementScore = async (userId: string, amount: number) => {
  const { error } = await supabaseServer().rpc('increment_score', {
    user_id_param: userId,
    increment_amount: amount,
  });
  if (error) throw error;
};

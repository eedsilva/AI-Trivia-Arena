import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const getUserSession = async (userId: string) => {
  const { data, error } = await supabaseServer
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const createUser = async (payload: { id: string; name: string; social_link?: string }) => {
  const { data, error } = await supabaseServer.from('users').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateUserSettings = async (payload: {
  user_id: string;
  difficulty: string;
  tts_enabled: boolean;
  tts_voice: string;
}) => {
  const { data, error } = await supabaseServer
    .from('user_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const saveQuestion = async (question: {
  question_text: string;
  options: string[];
  correct_answer_index: number;
  difficulty: string;
}) => {
  const { data, error } = await supabaseServer.from('questions').insert(question).select().single();
  if (error) throw error;
  return data;
};

export const startGameSession = async (payload: { user_id: string; score?: number }) => {
  const { data, error } = await supabaseServer.from('game_sessions').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateGameSession = async (payload: { user_id: string; score?: number; streak?: number }) => {
  const { data, error } = await supabaseServer
    .from('game_sessions')
    .update(payload)
    .eq('user_id', payload.user_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const incrementScore = async (userId: string, amount: number) => {
  const { error } = await supabaseServer.rpc('increment_score', {
    user_id_param: userId,
    increment_amount: amount
  });
  if (error) throw error;
};

export const getLeaderboard = async () => {
  const { data, error } = await supabaseServer
    .from('game_sessions')
    .select('user_id, score, streak')
    .order('score', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
};

export const getNextQuestion = async (difficulty: string) => {
  const { data, error } = await supabaseServer
    .from('questions')
    .select('*')
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data;
};

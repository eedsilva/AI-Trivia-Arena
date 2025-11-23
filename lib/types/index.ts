/**
 * Shared TypeScript types and interfaces
 * Centralized type definitions for the application
 */

/**
 * Question data structure for trivia questions
 */
export interface QuestionData {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string | null;
}

/**
 * Leaderboard entry with user information
 */
export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  max_streak?: number;
}

/**
 * Game session data
 */
export interface GameSessionData {
  score: number;
  streak: number;
  maxStreak?: number;
  username?: string;
  avatar_url?: string | null;
}

/**
 * User cache data
 */
export interface UserCache {
  username: string;
  user_id?: string;
}

/**
 * User settings cache
 */
export interface UserSettingsCache {
  difficulty: string;
  tts_enabled: boolean;
  tts_voice: string;
}

/**
 * Deepgram voice configuration
 */
export interface DeepgramVoice {
  id: string;
  name: string;
  model: string;
  language: string;
  description?: string;
}

/**
 * Leaderboard sort options
 */
export type LeaderboardSortBy = 'score' | 'streak';

/**
 * Difficulty levels
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Question provider options
 */
export type QuestionProvider = 'openrouter' | 'openai';

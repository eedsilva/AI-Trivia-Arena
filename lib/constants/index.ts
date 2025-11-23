/**
 * Application constants
 * Centralized constants for the application
 */

/**
 * Timer duration for questions in milliseconds
 */
export const TIMER_DURATION = 15000; // 15 seconds

/**
 * Maximum retry attempts for API calls
 */
export const MAX_RETRIES = 3;

/**
 * Retry delay in milliseconds
 */
export const RETRY_DELAY = 1000;

/**
 * Question fetch timeout in milliseconds
 */
export const QUESTION_FETCH_TIMEOUT = 30000; // 30 seconds

/**
 * Difficulty-based point weights for correct answers
 */
export const DIFFICULTY_POINTS = {
  easy: 50,
  medium: 100,
  hard: 150,
} as const;

/**
 * Voice preview text for TTS
 */
export const VOICE_PREVIEW_TEXT = 'This is a preview of this voice';

/**
 * Difficulty-based point weights for correct answers
 * Re-exported from constants for backward compatibility
 */
import { DIFFICULTY_POINTS } from '../constants';
import type { DifficultyLevel } from '../types';

export { DIFFICULTY_POINTS };
export type { DifficultyLevel };

/**
 * Get points for a correct answer based on difficulty
 * @param difficulty - Difficulty level (easy, medium, hard)
 * @returns Points awarded for correct answer
 */
export const getPointsForDifficulty = (difficulty: string): number => {
  const normalizedDifficulty = difficulty.toLowerCase() as DifficultyLevel;
  return DIFFICULTY_POINTS[normalizedDifficulty] || DIFFICULTY_POINTS.easy;
};

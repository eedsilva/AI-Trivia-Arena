'use client';
import { create } from 'zustand';
import type { QuestionData } from '../types';
import { getPointsForDifficulty } from '../game/difficulty';

/**
 * Game state interface
 * Manages the current game session state including score, streak, and current question
 */
interface GameState {
  /** Current player's username */
  username: string;
  /** Current total score */
  score: number;
  /** Current consecutive correct answers streak */
  streak: number;
  /** Count of correct answers in current session (resets on page load) */
  correctCount: number;
  /** Maximum streak achieved in current session */
  maxStreak: number;
  /** Current question being displayed */
  currentQuestion?: QuestionData;
  /** Array of question IDs that have been asked in this session */
  askedQuestionIds: string[];

  // Actions
  /** Set the player's username */
  setUsername: (name: string) => void;
  /** Set the current question */
  setQuestion: (question: QuestionData) => void;
  /** Set score directly (used for syncing from server) */
  setScore: (score: number) => void;
  /** Set streak directly (used for syncing from server) */
  setStreak: (streak: number) => void;
  /** Set max streak directly */
  setMaxStreak: (maxStreak: number) => void;
  /** Reset correct count to 0 (called on page load) */
  resetCorrectCount: () => void;
  /** Add a question ID to the asked questions list */
  addAskedQuestion: (questionId: string) => void;
  /** Reset the asked questions list (e.g., start new session) */
  resetAskedQuestions: () => void;
  /** Apply answer result with optimistic update - calculates points and updates streak */
  applyResult: (correct: boolean, difficulty?: string) => void;
  /** Initialize game state from database values */
  initializeFromDB: (score: number, streak: number) => void;
}

/**
 * Game store using Zustand
 * Manages game session state with optimistic updates
 * Score syncing is handled by useGameSessionSync hook
 */
export const useGameStore = create<GameState>((set, get) => ({
  username: 'CosmicExplorer',
  score: 0,
  streak: 0,
  correctCount: 0,
  maxStreak: 0,
  askedQuestionIds: [],

  setUsername: (username) => set({ username }),

  setQuestion: (currentQuestion) => set({ currentQuestion }),

  setScore: (score) => set({ score }),

  setStreak: (streak) => set({ streak }),

  setMaxStreak: (maxStreak) => set({ maxStreak }),

  resetCorrectCount: () => set({ correctCount: 0 }),

  addAskedQuestion: (questionId) =>
    set((state) => ({
      askedQuestionIds: [...state.askedQuestionIds, questionId],
    })),

  resetAskedQuestions: () => set({ askedQuestionIds: [] }),

  /**
   * Apply answer result with optimistic update
   * @param correct - Whether the answer was correct
   * @param difficulty - Difficulty level for point calculation
   */
  applyResult: (correct, difficulty = 'easy') =>
    set((state) => {
      const newStreak = correct ? state.streak + 1 : 0;
      const newMaxStreak = Math.max(state.maxStreak, newStreak);
      const points = correct ? getPointsForDifficulty(difficulty) : 0;
      const newScore = correct ? state.score + points : state.score;

      console.log('applyResult called:', {
        correct,
        difficulty,
        points,
        oldScore: state.score,
        newScore,
        oldStreak: state.streak,
        newStreak,
      });

      return {
        score: newScore,
        streak: newStreak,
        maxStreak: newMaxStreak,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      };
    }),

  /**
   * Initialize game state from database
   * Called when loading game session from server
   * @param score - Score from database
   * @param streak - Streak from database
   */
  initializeFromDB: (score, streak) => {
    const currentState = get();
    console.log('🔄 initializeFromDB:', {
      from: { score: currentState.score, streak: currentState.streak },
      to: { score, streak },
    });
    set({
      score,
      streak,
      maxStreak: streak,
      correctCount: 0,
    });
  },
}));

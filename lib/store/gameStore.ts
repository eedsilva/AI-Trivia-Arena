'use client';
import { create } from 'zustand';
import { QuestionData } from '../../components/game/QuestionCard';

interface GameState {
  username: string;
  score: number;
  streak: number;
  correctCount: number;
  currentQuestion?: QuestionData;
  setUsername: (name: string) => void;
  setQuestion: (question: QuestionData) => void;
  applyResult: (correct: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  username: 'CosmicExplorer',
  score: 12500,
  streak: 5,
  correctCount: 36,
  setUsername: (username) => set({ username }),
  setQuestion: (currentQuestion) => set({ currentQuestion }),
  applyResult: (correct) =>
    set((state) => ({
      score: correct ? state.score + 100 : state.score,
      streak: correct ? state.streak + 1 : 0,
      correctCount: correct ? state.correctCount + 1 : state.correctCount
    }))
}));

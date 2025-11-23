import { act, renderHook } from '@testing-library/react';
import { useGameStore } from '../../lib/store/gameStore';
import type { QuestionData } from '../../lib/types';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.setScore(0);
      result.current.setStreak(0);
      result.current.setMaxStreak(0);
      result.current.resetCorrectCount();
      result.current.resetAskedQuestions();
      result.current.setUsername('CosmicExplorer');
    });
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.username).toBe('CosmicExplorer');
      expect(result.current.score).toBe(0);
      expect(result.current.streak).toBe(0);
      expect(result.current.correctCount).toBe(0);
      expect(result.current.maxStreak).toBe(0);
      expect(result.current.askedQuestionIds).toEqual([]);
      expect(result.current.currentQuestion).toBeUndefined();
    });
  });

  describe('Username Management', () => {
    it('should set username correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setUsername('TestPlayer');
      });

      expect(result.current.username).toBe('TestPlayer');
    });
  });

  describe('Question Management', () => {
    it('should set current question', () => {
      const { result } = renderHook(() => useGameStore());
      const mockQuestion: QuestionData = {
        id: 'q1',
        question_text: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correct_answer_index: 0,
        explanation: 'Test explanation',
        difficulty: 'easy',
      };

      act(() => {
        result.current.setQuestion(mockQuestion);
      });

      expect(result.current.currentQuestion).toEqual(mockQuestion);
    });

    it('should add asked question IDs', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addAskedQuestion('q1');
        result.current.addAskedQuestion('q2');
        result.current.addAskedQuestion('q3');
      });

      expect(result.current.askedQuestionIds).toEqual(['q1', 'q2', 'q3']);
    });

    it('should reset asked questions', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.addAskedQuestion('q1');
        result.current.addAskedQuestion('q2');
        result.current.resetAskedQuestions();
      });

      expect(result.current.askedQuestionIds).toEqual([]);
    });
  });

  describe('Score Management', () => {
    it('should set score directly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setScore(100);
      });

      expect(result.current.score).toBe(100);
    });

    it('should award correct points for easy question', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.score).toBe(50); // Easy = 50 points
    });

    it('should award correct points for medium question', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'medium');
      });

      expect(result.current.score).toBe(100); // Medium = 100 points
    });

    it('should award correct points for hard question', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'hard');
      });

      expect(result.current.score).toBe(150); // Hard = 150 points
    });

    it('should not award points for incorrect answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setScore(100);
        result.current.applyResult(false, 'hard');
      });

      expect(result.current.score).toBe(100); // No change
    });

    it('should accumulate score across multiple correct answers', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy'); // +50
        result.current.applyResult(true, 'medium'); // +100
        result.current.applyResult(true, 'hard'); // +150
      });

      expect(result.current.score).toBe(300);
    });
  });

  describe('Streak Management', () => {
    it('should set streak directly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setStreak(5);
      });

      expect(result.current.streak).toBe(5);
    });

    it('should increment streak on correct answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.streak).toBe(1);

      act(() => {
        result.current.applyResult(true, 'medium');
      });

      expect(result.current.streak).toBe(2);
    });

    it('should reset streak on incorrect answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.streak).toBe(3);

      act(() => {
        result.current.applyResult(false, 'easy');
      });

      expect(result.current.streak).toBe(0);
    });

    it('should update max streak when streak exceeds it', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.maxStreak).toBe(3);
    });

    it('should not decrease max streak on wrong answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.maxStreak).toBe(3);

      act(() => {
        result.current.applyResult(false, 'easy');
      });

      expect(result.current.maxStreak).toBe(3); // Should remain unchanged
      expect(result.current.streak).toBe(0); // But streak should reset
    });

    it('should set max streak directly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setMaxStreak(10);
      });

      expect(result.current.maxStreak).toBe(10);
    });
  });

  describe('Correct Count Management', () => {
    it('should increment correct count on correct answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'medium');
        result.current.applyResult(false, 'hard');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.correctCount).toBe(3);
    });

    it('should not increment correct count on incorrect answer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(false, 'medium');
      });

      expect(result.current.correctCount).toBe(1);
    });

    it('should reset correct count', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.resetCorrectCount();
      });

      expect(result.current.correctCount).toBe(0);
    });
  });

  describe('Database Initialization', () => {
    it('should initialize from database values', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.initializeFromDB(500, 10);
      });

      expect(result.current.score).toBe(500);
      expect(result.current.streak).toBe(10);
      expect(result.current.maxStreak).toBe(10);
      expect(result.current.correctCount).toBe(0);
    });

    it('should override existing values when initializing from DB', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setScore(100);
        result.current.setStreak(5);
        result.current.initializeFromDB(500, 10);
      });

      expect(result.current.score).toBe(500);
      expect(result.current.streak).toBe(10);
    });
  });

  describe('Complex Game Scenarios', () => {
    it('should handle a complete game session correctly', () => {
      const { result } = renderHook(() => useGameStore());

      // Start game
      act(() => {
        result.current.setUsername('TestPlayer');
      });

      // Answer first question (easy) - correct
      act(() => {
        result.current.addAskedQuestion('q1');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.score).toBe(50);
      expect(result.current.streak).toBe(1);
      expect(result.current.correctCount).toBe(1);

      // Answer second question (medium) - correct
      act(() => {
        result.current.addAskedQuestion('q2');
        result.current.applyResult(true, 'medium');
      });

      expect(result.current.score).toBe(150);
      expect(result.current.streak).toBe(2);
      expect(result.current.correctCount).toBe(2);

      // Answer third question (hard) - incorrect
      act(() => {
        result.current.addAskedQuestion('q3');
        result.current.applyResult(false, 'hard');
      });

      expect(result.current.score).toBe(150); // No change
      expect(result.current.streak).toBe(0); // Reset
      expect(result.current.maxStreak).toBe(2); // Preserved
      expect(result.current.correctCount).toBe(2); // No increment

      // Answer fourth question (hard) - correct
      act(() => {
        result.current.addAskedQuestion('q4');
        result.current.applyResult(true, 'hard');
      });

      expect(result.current.score).toBe(300);
      expect(result.current.streak).toBe(1); // Started new streak
      expect(result.current.maxStreak).toBe(2); // Still 2
      expect(result.current.correctCount).toBe(3);
      expect(result.current.askedQuestionIds).toEqual(['q1', 'q2', 'q3', 'q4']);
    });

    it('should handle new max streak achievement', () => {
      const { result } = renderHook(() => useGameStore());

      // First session - max streak of 3
      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.maxStreak).toBe(3);

      // Wrong answer
      act(() => {
        result.current.applyResult(false, 'easy');
      });

      // Second session - beat the max streak
      act(() => {
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
        result.current.applyResult(true, 'easy');
      });

      expect(result.current.streak).toBe(5);
      expect(result.current.maxStreak).toBe(5);
    });
  });
});

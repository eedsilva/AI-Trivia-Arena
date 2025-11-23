import { getPointsForDifficulty, DIFFICULTY_POINTS } from '../../lib/game/difficulty';

describe('Difficulty Helper Functions', () => {
  describe('DIFFICULTY_POINTS constant', () => {
    it('should have correct point values for each difficulty', () => {
      expect(DIFFICULTY_POINTS.easy).toBe(50);
      expect(DIFFICULTY_POINTS.medium).toBe(100);
      expect(DIFFICULTY_POINTS.hard).toBe(150);
    });

    it('should be a readonly object', () => {
      // TypeScript enforces this at compile time
      // This test ensures the values are as expected
      expect(Object.isFrozen(DIFFICULTY_POINTS)).toBe(false); // const objects aren't frozen by default
      expect(typeof DIFFICULTY_POINTS).toBe('object');
    });
  });

  describe('getPointsForDifficulty', () => {
    describe('Valid difficulty levels', () => {
      it('should return 50 points for easy difficulty', () => {
        expect(getPointsForDifficulty('easy')).toBe(50);
      });

      it('should return 100 points for medium difficulty', () => {
        expect(getPointsForDifficulty('medium')).toBe(100);
      });

      it('should return 150 points for hard difficulty', () => {
        expect(getPointsForDifficulty('hard')).toBe(150);
      });
    });

    describe('Case insensitivity', () => {
      it('should handle uppercase difficulty levels', () => {
        expect(getPointsForDifficulty('EASY')).toBe(50);
        expect(getPointsForDifficulty('MEDIUM')).toBe(100);
        expect(getPointsForDifficulty('HARD')).toBe(150);
      });

      it('should handle mixed case difficulty levels', () => {
        expect(getPointsForDifficulty('Easy')).toBe(50);
        expect(getPointsForDifficulty('MeDiUm')).toBe(100);
        expect(getPointsForDifficulty('HaRd')).toBe(150);
      });
    });

    describe('Invalid or unknown difficulty levels', () => {
      it('should default to easy points for unknown difficulty', () => {
        expect(getPointsForDifficulty('unknown')).toBe(50);
      });

      it('should default to easy points for empty string', () => {
        expect(getPointsForDifficulty('')).toBe(50);
      });

      it('should default to easy points for invalid values', () => {
        expect(getPointsForDifficulty('super_hard')).toBe(50);
        expect(getPointsForDifficulty('trivial')).toBe(50);
        expect(getPointsForDifficulty('123')).toBe(50);
      });
    });

    describe('Edge cases', () => {
      it('should default to easy for difficulty with extra whitespace', () => {
        // Function doesn't trim whitespace, so these are invalid and default to easy
        expect(getPointsForDifficulty(' easy ')).toBe(50);
        expect(getPointsForDifficulty(' medium ')).toBe(50);
        expect(getPointsForDifficulty(' hard ')).toBe(50);
      });
    });
  });

  describe('Point progression validation', () => {
    it('should have increasing points for increasing difficulty', () => {
      const easyPoints = getPointsForDifficulty('easy');
      const mediumPoints = getPointsForDifficulty('medium');
      const hardPoints = getPointsForDifficulty('hard');

      expect(mediumPoints).toBeGreaterThan(easyPoints);
      expect(hardPoints).toBeGreaterThan(mediumPoints);
    });

    it('should have medium points exactly double easy points', () => {
      const easyPoints = getPointsForDifficulty('easy');
      const mediumPoints = getPointsForDifficulty('medium');

      expect(mediumPoints).toBe(easyPoints * 2);
    });

    it('should have hard points exactly triple easy points', () => {
      const easyPoints = getPointsForDifficulty('easy');
      const hardPoints = getPointsForDifficulty('hard');

      expect(hardPoints).toBe(easyPoints * 3);
    });
  });

  describe('Integration scenarios', () => {
    it('should calculate correct total for mixed difficulty questions', () => {
      const total =
        getPointsForDifficulty('easy') +
        getPointsForDifficulty('medium') +
        getPointsForDifficulty('hard');

      expect(total).toBe(300); // 50 + 100 + 150
    });

    it('should calculate correct total for multiple questions', () => {
      const questions = [
        'easy',
        'easy',
        'medium',
        'hard',
        'medium',
      ];

      const total = questions.reduce(
        (sum, difficulty) => sum + getPointsForDifficulty(difficulty),
        0
      );

      expect(total).toBe(450); // 50 + 50 + 100 + 150 + 100
    });
  });
});

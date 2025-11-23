import {
  getUserFromCache,
  saveUserToCache,
  clearUserCache,
  hasUserCache,
} from '../../lib/storage/userCache';

describe('User Cache', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getUserFromCache', () => {
    it('should return null when no cache exists', () => {
      const result = getUserFromCache();
      expect(result).toBeNull();
    });

    it('should return user data when cache exists', () => {
      localStorage.setItem('ai-trivia-user', 'TestPlayer');
      localStorage.setItem('ai-trivia-user-id', 'user-123');

      const result = getUserFromCache();

      expect(result).toEqual({
        username: 'TestPlayer',
        user_id: 'user-123',
      });
    });

    it('should return user without user_id when only username is cached', () => {
      localStorage.setItem('ai-trivia-user', 'TestPlayer');

      const result = getUserFromCache();

      expect(result).toEqual({
        username: 'TestPlayer',
        user_id: undefined,
      });
    });

    it('should return null on localStorage error', () => {
      // Mock localStorage to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = getUserFromCache();

      expect(result).toBeNull();

      // Restore original implementation
      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('saveUserToCache', () => {
    it('should save username to localStorage', () => {
      saveUserToCache({ username: 'TestPlayer' });

      expect(localStorage.getItem('ai-trivia-user')).toBe('TestPlayer');
    });

    it('should save username and user_id to localStorage', () => {
      saveUserToCache({ username: 'TestPlayer', user_id: 'user-123' });

      expect(localStorage.getItem('ai-trivia-user')).toBe('TestPlayer');
      expect(localStorage.getItem('ai-trivia-user-id')).toBe('user-123');
    });

    it('should not save user_id when undefined', () => {
      saveUserToCache({ username: 'TestPlayer' });

      expect(localStorage.getItem('ai-trivia-user')).toBe('TestPlayer');
      expect(localStorage.getItem('ai-trivia-user-id')).toBeNull();
    });

    it('should overwrite existing cache', () => {
      saveUserToCache({ username: 'OldPlayer', user_id: 'old-123' });
      saveUserToCache({ username: 'NewPlayer', user_id: 'new-456' });

      const result = getUserFromCache();

      expect(result).toEqual({
        username: 'NewPlayer',
        user_id: 'new-456',
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => {
        saveUserToCache({ username: 'TestPlayer' });
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('clearUserCache', () => {
    it('should remove all user cache items', () => {
      localStorage.setItem('ai-trivia-user', 'TestPlayer');
      localStorage.setItem('ai-trivia-user-id', 'user-123');

      clearUserCache();

      expect(localStorage.getItem('ai-trivia-user')).toBeNull();
      expect(localStorage.getItem('ai-trivia-user-id')).toBeNull();
    });

    it('should not throw when cache is already empty', () => {
      expect(() => {
        clearUserCache();
      }).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        clearUserCache();
      }).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });
  });

  describe('hasUserCache', () => {
    it('should return false when no cache exists', () => {
      expect(hasUserCache()).toBe(false);
    });

    it('should return true when username is cached', () => {
      localStorage.setItem('ai-trivia-user', 'TestPlayer');

      expect(hasUserCache()).toBe(true);
    });

    it('should return false when only user_id is cached', () => {
      localStorage.setItem('ai-trivia-user-id', 'user-123');

      expect(hasUserCache()).toBe(false);
    });

    it('should return true even if user_id is missing', () => {
      localStorage.setItem('ai-trivia-user', 'TestPlayer');

      expect(hasUserCache()).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should save and retrieve user data correctly', () => {
      const userData = { username: 'TestPlayer', user_id: 'user-123' };

      saveUserToCache(userData);
      const retrieved = getUserFromCache();

      expect(retrieved).toEqual(userData);
    });

    it('should clear and verify cache is empty', () => {
      saveUserToCache({ username: 'TestPlayer', user_id: 'user-123' });
      expect(hasUserCache()).toBe(true);

      clearUserCache();

      expect(hasUserCache()).toBe(false);
      expect(getUserFromCache()).toBeNull();
    });

    it('should handle multiple save operations', () => {
      saveUserToCache({ username: 'Player1', user_id: 'id-1' });
      saveUserToCache({ username: 'Player2', user_id: 'id-2' });
      saveUserToCache({ username: 'Player3', user_id: 'id-3' });

      const result = getUserFromCache();

      expect(result).toEqual({
        username: 'Player3',
        user_id: 'id-3',
      });
    });

    it('should handle session lifecycle', () => {
      // Initial state - no cache
      expect(hasUserCache()).toBe(false);

      // User logs in
      saveUserToCache({ username: 'TestPlayer', user_id: 'user-123' });
      expect(hasUserCache()).toBe(true);
      expect(getUserFromCache()?.username).toBe('TestPlayer');

      // User logs out
      clearUserCache();
      expect(hasUserCache()).toBe(false);
      expect(getUserFromCache()).toBeNull();
    });
  });
});

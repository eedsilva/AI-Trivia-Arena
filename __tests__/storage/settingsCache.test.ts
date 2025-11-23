import {
  getSettingsFromCache,
  saveSettingsToCache,
  clearSettingsCache,
} from '../../lib/storage/settingsCache';

describe('Settings Cache', () => {
  const defaultSettings = {
    difficulty: 'easy',
    tts_enabled: false,
    tts_voice: 'aura-asteria-en',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSettingsFromCache', () => {
    it('should return default settings when no cache exists', () => {
      const result = getSettingsFromCache();

      expect(result).toEqual(defaultSettings);
    });

    it('should return cached settings when they exist', () => {
      const customSettings = {
        difficulty: 'hard',
        tts_enabled: true,
        tts_voice: 'aura-luna-en',
      };

      localStorage.setItem('ai-trivia-settings', JSON.stringify(customSettings));

      const result = getSettingsFromCache();

      expect(result).toEqual(customSettings);
    });

    it('should merge cached settings with defaults', () => {
      // Save partial settings
      const partialSettings = {
        difficulty: 'medium',
      };

      localStorage.setItem('ai-trivia-settings', JSON.stringify(partialSettings));

      const result = getSettingsFromCache();

      expect(result).toEqual({
        difficulty: 'medium',
        tts_enabled: false, // from default
        tts_voice: 'aura-asteria-en', // from default
      });
    });

    it('should return defaults on invalid JSON', () => {
      localStorage.setItem('ai-trivia-settings', 'invalid-json{');

      const result = getSettingsFromCache();

      expect(result).toEqual(defaultSettings);
    });

    it('should return defaults on localStorage error', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const result = getSettingsFromCache();

      expect(result).toEqual(defaultSettings);

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('saveSettingsToCache', () => {
    it('should save complete settings to localStorage', () => {
      const settings = {
        difficulty: 'hard',
        tts_enabled: true,
        tts_voice: 'aura-luna-en',
      };

      saveSettingsToCache(settings);

      const cached = localStorage.getItem('ai-trivia-settings');
      expect(JSON.parse(cached!)).toEqual(settings);
    });

    it('should save partial settings and merge with existing', () => {
      // First save
      saveSettingsToCache({
        difficulty: 'medium',
        tts_enabled: true,
      });

      // Second save with different property
      saveSettingsToCache({
        tts_voice: 'aura-luna-en',
      });

      const result = getSettingsFromCache();

      expect(result).toEqual({
        difficulty: 'medium',
        tts_enabled: true,
        tts_voice: 'aura-luna-en',
      });
    });

    it('should overwrite existing property values', () => {
      saveSettingsToCache({ difficulty: 'easy' });
      saveSettingsToCache({ difficulty: 'hard' });

      const result = getSettingsFromCache();

      expect(result.difficulty).toBe('hard');
    });

    it('should merge with defaults for first save', () => {
      saveSettingsToCache({ difficulty: 'medium' });

      const result = getSettingsFromCache();

      expect(result).toEqual({
        difficulty: 'medium',
        tts_enabled: false,
        tts_voice: 'aura-asteria-en',
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        saveSettingsToCache({ difficulty: 'hard' });
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('clearSettingsCache', () => {
    it('should remove settings from localStorage', () => {
      saveSettingsToCache({ difficulty: 'hard' });

      clearSettingsCache();

      expect(localStorage.getItem('ai-trivia-settings')).toBeNull();
    });

    it('should not throw when cache is already empty', () => {
      expect(() => {
        clearSettingsCache();
      }).not.toThrow();
    });

    it('should return defaults after clearing cache', () => {
      saveSettingsToCache({
        difficulty: 'hard',
        tts_enabled: true,
        tts_voice: 'aura-luna-en',
      });

      clearSettingsCache();

      const result = getSettingsFromCache();

      expect(result).toEqual(defaultSettings);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        clearSettingsCache();
      }).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete settings workflow', () => {
      // Start with defaults
      let settings = getSettingsFromCache();
      expect(settings).toEqual(defaultSettings);

      // User changes difficulty
      saveSettingsToCache({ difficulty: 'medium' });
      settings = getSettingsFromCache();
      expect(settings.difficulty).toBe('medium');
      expect(settings.tts_enabled).toBe(false);

      // User enables TTS
      saveSettingsToCache({ tts_enabled: true });
      settings = getSettingsFromCache();
      expect(settings.tts_enabled).toBe(true);
      expect(settings.difficulty).toBe('medium');

      // User changes voice
      saveSettingsToCache({ tts_voice: 'aura-zeus-en' });
      settings = getSettingsFromCache();
      expect(settings.tts_voice).toBe('aura-zeus-en');
      expect(settings.tts_enabled).toBe(true);
      expect(settings.difficulty).toBe('medium');

      // User resets settings
      clearSettingsCache();
      settings = getSettingsFromCache();
      expect(settings).toEqual(defaultSettings);
    });

    it('should handle multiple difficulty changes', () => {
      const difficulties = ['easy', 'medium', 'hard', 'medium', 'easy'];

      difficulties.forEach((difficulty) => {
        saveSettingsToCache({ difficulty });
        const settings = getSettingsFromCache();
        expect(settings.difficulty).toBe(difficulty);
      });
    });

    it('should preserve unrelated settings when updating one property', () => {
      saveSettingsToCache({
        difficulty: 'hard',
        tts_enabled: true,
        tts_voice: 'aura-luna-en',
      });

      // Only change difficulty
      saveSettingsToCache({ difficulty: 'easy' });

      const settings = getSettingsFromCache();

      expect(settings).toEqual({
        difficulty: 'easy', // changed
        tts_enabled: true, // preserved
        tts_voice: 'aura-luna-en', // preserved
      });
    });

    it('should handle save and clear operations in sequence', () => {
      // Save
      saveSettingsToCache({ difficulty: 'hard', tts_enabled: true });
      expect(getSettingsFromCache().difficulty).toBe('hard');

      // Clear
      clearSettingsCache();
      expect(getSettingsFromCache()).toEqual(defaultSettings);

      // Save again
      saveSettingsToCache({ difficulty: 'medium' });
      expect(getSettingsFromCache().difficulty).toBe('medium');

      // Clear again
      clearSettingsCache();
      expect(getSettingsFromCache()).toEqual(defaultSettings);
    });

    it('should handle all voice options', () => {
      const voices = [
        'aura-asteria-en',
        'aura-luna-en',
        'aura-stella-en',
        'aura-athena-en',
        'aura-zeus-en',
      ];

      voices.forEach((voice) => {
        saveSettingsToCache({ tts_voice: voice });
        const settings = getSettingsFromCache();
        expect(settings.tts_voice).toBe(voice);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty object save', () => {
      saveSettingsToCache({});

      const settings = getSettingsFromCache();

      expect(settings).toEqual(defaultSettings);
    });

    it('should handle undefined values', () => {
      saveSettingsToCache({
        difficulty: 'hard',
        tts_enabled: undefined as any,
      });

      const settings = getSettingsFromCache();

      expect(settings.difficulty).toBe('hard');
      // undefined should not override the default
      expect(typeof settings.tts_enabled).toBe('boolean');
    });

    it('should handle null values in localStorage', () => {
      localStorage.setItem('ai-trivia-settings', 'null');

      const settings = getSettingsFromCache();

      expect(settings).toEqual(defaultSettings);
    });
  });
});

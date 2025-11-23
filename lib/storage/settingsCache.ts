import type { UserSettingsCache } from '../types';

const SETTINGS_CACHE_KEY = 'ai-trivia-settings';

// Re-export type from centralized types
export type { UserSettingsCache } from '../types';

const defaultSettings: UserSettingsCache = {
  difficulty: 'easy',
  tts_enabled: false, // AI Voice disabled by default
  tts_voice: 'aura-asteria-en',
};

/**
 * Get cached user settings from localStorage
 */
export const getSettingsFromCache = (): UserSettingsCache => {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!cached) return defaultSettings;

    const settings = JSON.parse(cached);
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.error('Error reading settings cache:', error);
    return defaultSettings;
  }
};

/**
 * Save user settings to localStorage
 */
export const saveSettingsToCache = (settings: Partial<UserSettingsCache>): void => {
  if (typeof window === 'undefined') return;

  try {
    const current = getSettingsFromCache();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings cache:', error);
  }
};

/**
 * Clear user settings from localStorage
 */
export const clearSettingsCache = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SETTINGS_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing settings cache:', error);
  }
};

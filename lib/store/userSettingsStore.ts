'use client';
import { create } from 'zustand';
import {
  getSettingsFromCache,
  saveSettingsToCache,
  type UserSettingsCache,
} from '../storage/settingsCache';

/**
 * User settings state interface
 * Extends UserSettingsCache with action methods
 */
interface UserSettingsState extends UserSettingsCache {
  // Actions
  /** Set difficulty level */
  setDifficulty: (difficulty: string) => void;
  /** Enable or disable TTS */
  setTtsEnabled: (enabled: boolean) => void;
  /** Set TTS voice */
  setTtsVoice: (voice: string) => void;
  /** Update multiple settings at once */
  updateSettings: (settings: Partial<UserSettingsCache>) => void;
  /** Initialize settings from localStorage cache */
  initializeFromCache: () => void;
  /** Sync settings to server */
  syncToServer: (user_id: string) => Promise<void>;
}

/**
 * User settings store using Zustand
 * Manages user preferences with localStorage persistence
 * Note: Server sync is now primarily handled by useUserSettings hook
 * Always starts with defaults to prevent SSR/client hydration mismatch
 * Initialize from cache using initializeFromCache() on client mount
 */
export const useUserSettingsStore = create<UserSettingsState>((set, get) => ({
  difficulty: 'easy',
  tts_enabled: false, // AI Voice disabled by default
  tts_voice: 'aura-asteria-en',

  /**
   * Set difficulty level
   * @param difficulty - Difficulty level (easy, medium, hard)
   */
  setDifficulty: (difficulty) => {
    const newSettings = { difficulty };
    saveSettingsToCache(newSettings);
    set(newSettings);
  },

  /**
   * Enable or disable TTS
   * @param tts_enabled - Whether TTS is enabled
   */
  setTtsEnabled: (tts_enabled) => {
    const newSettings = { tts_enabled };
    saveSettingsToCache(newSettings);
    set(newSettings);
  },

  /**
   * Set TTS voice
   * @param tts_voice - Voice ID to use
   */
  setTtsVoice: (tts_voice) => {
    const newSettings = { tts_voice };
    saveSettingsToCache(newSettings);
    set(newSettings);
  },

  /**
   * Update multiple settings at once
   * @param settings - Partial settings to update
   */
  updateSettings: (settings) => {
    saveSettingsToCache(settings);
    set(settings);
  },

  /**
   * Initialize settings from localStorage cache
   * Called on app initialization
   */
  initializeFromCache: () => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const state = get();
    const cached = getSettingsFromCache();

    // Only update if values are different to prevent unnecessary re-renders
    if (
      state.difficulty !== cached.difficulty ||
      state.tts_enabled !== cached.tts_enabled ||
      state.tts_voice !== cached.tts_voice
    ) {
      set(cached);
    }
  },

  /**
   * Sync settings to server
   * @param user_id - User ID to sync settings for
   */
  syncToServer: async (user_id: string) => {
    try {
      const settings = get();
      await fetch('/api/update-user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          difficulty: settings.difficulty,
          tts_enabled: settings.tts_enabled,
          tts_voice: settings.tts_voice,
        }),
      });
    } catch (error) {
      console.error('Error syncing settings to server:', error);
    }
  },
}));

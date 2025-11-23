'use client';
import { create } from 'zustand';
import {
  getUserFromCache,
  saveUserToCache,
  clearUserCache,
  type UserCache,
} from '../storage/userCache';

/**
 * User state interface
 * Manages authenticated user information
 */
interface UserState {
  /** Current user's username */
  username: string;
  /** Current user's unique ID */
  user_id?: string;
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  // Actions
  /** Set user data and save to cache */
  setUser: (user: UserCache) => void;
  /** Clear user data and cache */
  clearUser: () => void;
  /** Initialize user state from localStorage cache */
  initializeFromCache: () => void;
}

/**
 * User store using Zustand
 * Manages authenticated user state with localStorage persistence
 * Note: Always starts with empty state to prevent SSR/client hydration mismatch
 * Initialize from cache using initializeFromCache() on client mount
 */
export const useUserStore = create<UserState>((set, get) => ({
  username: '',
  user_id: undefined,
  isAuthenticated: false,

  /**
   * Set user data and persist to cache
   * @param user - User data to set
   */
  setUser: (user: UserCache) => {
    const state = get();
    // Only update if values are actually different
    if (
      !state.isAuthenticated ||
      state.username !== user.username ||
      state.user_id !== user.user_id
    ) {
      saveUserToCache(user);
      set({
        username: user.username,
        user_id: user.user_id,
        isAuthenticated: true,
      });
    }
  },

  /**
   * Clear user data and cache
   */
  clearUser: () => {
    clearUserCache();
    set({
      username: '',
      user_id: undefined,
      isAuthenticated: false,
    });
  },

  /**
   * Initialize user state from localStorage cache
   * Called on app initialization
   */
  initializeFromCache: () => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const state = get();
    const cached = getUserFromCache();

    // Only update if values are actually different to prevent unnecessary re-renders
    if (
      cached &&
      (!state.isAuthenticated ||
        state.username !== cached.username ||
        state.user_id !== cached.user_id)
    ) {
      set({
        username: cached.username,
        user_id: cached.user_id,
        isAuthenticated: true,
      });
    }
  },
}));

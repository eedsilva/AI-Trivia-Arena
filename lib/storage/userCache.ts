import type { UserCache } from '../types';

const USER_CACHE_KEY = 'ai-trivia-user';
const USER_ID_KEY = 'ai-trivia-user-id';

// Re-export type from centralized types
export type { UserCache } from '../types';

/**
 * Get cached user data from localStorage
 */
export const getUserFromCache = (): UserCache | null => {
  if (typeof window === 'undefined') return null;

  try {
    const username = localStorage.getItem(USER_CACHE_KEY);
    const user_id = localStorage.getItem(USER_ID_KEY);

    if (!username) return null;

    return {
      username,
      user_id: user_id || undefined,
    };
  } catch (error) {
    console.error('Error reading user cache:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserToCache = (user: UserCache): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_CACHE_KEY, user.username);
    if (user.user_id) {
      localStorage.setItem(USER_ID_KEY, user.user_id);
    }
  } catch (error) {
    console.error('Error saving user cache:', error);
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserCache = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};

/**
 * Check if user is cached
 */
export const hasUserCache = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(USER_CACHE_KEY);
};

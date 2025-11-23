/**
 * Centralized store initialization
 * Initializes all Zustand stores from localStorage cache
 * Prevents multiple initialization calls and ensures consistency
 */

import { useUserStore } from '../store/userStore';
import { useUserSettingsStore } from '../store/userSettingsStore';

let globalInitialized = false;

/**
 * Initialize stores synchronously on client
 * Called at module level and in hook to ensure initialization
 */
function initializeStores() {
  if (globalInitialized || typeof window === 'undefined') return;

  globalInitialized = true;

  // Get store functions directly
  const initializeFromCache = useUserStore.getState().initializeFromCache;
  const initializeSettings = useUserSettingsStore.getState().initializeFromCache;

  // Initialize both stores synchronously
  initializeFromCache();
  initializeSettings();
}

/**
 * Hook to ensure stores are initialized
 * Calls initialization synchronously in component body to avoid render cycles
 */
export function useStoreInitialization() {
  // Initialize synchronously in component body, not in effect
  // This ensures stores are ready before first render
  if (typeof window !== 'undefined' && !globalInitialized) {
    initializeStores();
  }
}

/**
 * Reset the global initialization flag
 * Useful for testing or when you need to re-initialize
 */
export function resetStoreInitialization() {
  globalInitialized = false;
}

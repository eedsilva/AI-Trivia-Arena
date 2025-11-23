'use client';
import { useUserStore } from '../store/userStore';
import { useUserSettingsStore } from '../store/userSettingsStore';

/**
 * Initialize stores at module level - BEFORE React renders
 * This is the key: run initialization outside of React's render cycle
 * to prevent any re-renders or flashing
 */
if (typeof window !== 'undefined') {
  // Run immediately when module loads, before any component renders
  const userStore = useUserStore.getState();
  const settingsStore = useUserSettingsStore.getState();

  // Initialize from cache synchronously
  userStore.initializeFromCache();
  settingsStore.initializeFromCache();
}

/**
 * StoreProvider - Minimal wrapper that does nothing but render children
 * Stores are already initialized at module level above
 * No state, no effects, no re-renders
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

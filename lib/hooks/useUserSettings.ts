'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettingsFromCache,
  saveSettingsToCache,
  type UserSettingsCache,
} from '../storage/settingsCache';
import { queryKeys } from './queryKeys';

/**
 * Fetch user settings from API
 * Fetches from database and merges with cache
 */
async function fetchUserSettings(userId: string): Promise<UserSettingsCache> {
  try {
    const response = await fetch(`/api/get-user-settings?user_id=${userId}`);
    if (!response.ok) {
      console.warn('Failed to fetch settings from server, using cache');
      return getSettingsFromCache();
    }

    const settings = await response.json();
    console.log('📥 Fetched settings from database:', settings);

    // Save to cache
    const userSettings: UserSettingsCache = {
      difficulty: settings.difficulty || 'easy',
      tts_enabled: settings.tts_enabled ?? false,
      tts_voice: settings.tts_voice || 'aura-asteria-en',
    };

    saveSettingsToCache(userSettings);
    return userSettings;
  } catch (error) {
    console.error('Error fetching settings from server:', error);
    return getSettingsFromCache();
  }
}

/**
 * Update user settings on server
 */
async function updateUserSettings(payload: {
  user_id: string;
  difficulty: string;
  tts_enabled: boolean;
  tts_voice: string;
}): Promise<UserSettingsCache> {
  const response = await fetch('/api/update-user-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }

  const data = await response.json();
  const settings = {
    difficulty: data.difficulty || payload.difficulty,
    tts_enabled: data.tts_enabled ?? payload.tts_enabled,
    tts_voice: data.tts_voice || payload.tts_voice,
  };

  // Save to cache
  saveSettingsToCache(settings);
  return settings;
}

/**
 * Custom hook for managing user settings
 *
 * Features:
 * - Sync with server with optimistic updates
 * - Local cache fallback for offline support
 * - Automatic rollback on error
 * - 5 minute stale time
 *
 * @param userId - User ID to fetch settings for
 * @param options - Optional configuration
 * @param options.enabled - Whether to fetch data (default: true)
 * @returns Settings data, loading state, and update function
 *
 * @example
 * const { settings, updateSettings } = useUserSettings(userId);
 * await updateSettings({ user_id: userId, difficulty: 'hard', tts_enabled: true, tts_voice: 'aura-luna-en' });
 */
export function useUserSettings(userId: string | undefined, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.userSettings(userId || ''),
    queryFn: () => {
      // First try cache, then fetch from server
      const cached = getSettingsFromCache();
      if (userId) {
        return fetchUserSettings(userId);
      }
      return Promise.resolve(cached);
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialData: getSettingsFromCache, // Use cache as initial data
  });

  const updateSettings = useMutation({
    mutationFn: updateUserSettings,
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userSettings(userId || '') });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<UserSettingsCache>(
        queryKeys.userSettings(userId || '')
      );

      // Optimistically update
      queryClient.setQueryData<UserSettingsCache>(
        queryKeys.userSettings(userId || ''),
        (old) => ({ ...old, ...newSettings }) as UserSettingsCache
      );

      // Save to cache immediately
      saveSettingsToCache(newSettings as UserSettingsCache);

      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.userSettings(userId || ''), context.previousSettings);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.userSettings(userId || '') });
    },
  });

  return {
    settings: settings || getSettingsFromCache(),
    isLoading,
    isError,
    error,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}

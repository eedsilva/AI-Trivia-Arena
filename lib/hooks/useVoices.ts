'use client';
import { useQuery } from '@tanstack/react-query';
import { getDeepgramVoices, type DeepgramVoice } from '../integrations/deepgram/voices';
import { queryKeys } from './queryKeys';

/**
 * Fetch voices from API
 */
async function fetchVoices(): Promise<DeepgramVoice[]> {
  try {
    const response = await fetch('/api/voices');
    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices from API, using fallback:', error);
    // Fallback to static voices
    return getDeepgramVoices();
  }
}

/**
 * Custom hook for fetching TTS voice options
 *
 * Features:
 * - Static fallback if API fails
 * - 30 minute stale time (voices don't change often)
 * - Placeholder data for instant UI
 *
 * @param options - Optional configuration
 * @param options.enabled - Whether to fetch data (default: true)
 * @returns Voice options, loading state, and error state
 *
 * @example
 * const { voices, isLoading } = useVoices();
 */
export function useVoices(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  const {
    data: voices = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.voices(),
    queryFn: fetchVoices,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - voices don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    // Use static voices as fallback
    placeholderData: getDeepgramVoices(),
  });

  return {
    voices,
    isLoading,
    isError,
    error,
  };
}

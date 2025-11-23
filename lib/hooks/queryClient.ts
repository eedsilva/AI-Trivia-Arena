'use client';
import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration for React Query client
 * Optimized for real-time trivia game with proper caching and stale time
 *
 * Using a singleton pattern to ensure only one instance is created
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for 30 seconds - good for leaderboard
        staleTime: 30 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 2 times
        retry: 2,
        // Refetch on window focus for leaderboard updates
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Note: Do not export queryClient at module level to avoid SSR issues
// Always use getQueryClient() function instead

'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getQueryClient } from '../hooks/queryClient';

/**
 * QueryProvider wrapper component
 * Provides React Query context to the entire application
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure we only create one QueryClient instance per component tree
  // Use useMemo to ensure stability across re-renders
  const queryClient = useMemo(() => getQueryClient(), []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

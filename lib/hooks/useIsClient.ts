/**
 * Hook to detect if we're on the client side
 * Returns true immediately on client to avoid hydration mismatches
 * Server and client must render the same initial content
 */

/**
 * Returns true on client, false on server
 * This is a constant value per render, avoiding state updates
 */
export function useIsClient() {
  return typeof window !== 'undefined';
}

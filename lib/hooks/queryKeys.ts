/**
 * Query keys for React Query
 * Centralized query key factory for consistent cache management
 */
export const queryKeys = {
  // Leaderboard queries
  leaderboard: (sortBy: 'score' | 'streak' = 'score') => ['leaderboard', sortBy] as const,

  // Game session queries
  gameSession: (userId: string) => ['gameSession', userId] as const,

  // Question queries
  question: (difficulty: string) => ['question', difficulty] as const,

  // User settings queries
  userSettings: (userId: string) => ['userSettings', userId] as const,

  // Voices queries
  voices: () => ['voices'] as const,
} as const;

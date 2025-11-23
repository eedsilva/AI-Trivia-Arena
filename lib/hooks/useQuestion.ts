'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuestion, type FetchQuestionOptions } from '../game/questionFetcher';
import type { QuestionData } from '../types';
import { queryKeys } from './queryKeys';

/**
 * Custom hook for fetching trivia questions
 *
 * Features:
 * - Proper loading states and error handling
 * - Fallback questions on API failure
 * - Infinite stale time (questions are unique)
 * - Mutation for fetching new questions
 * - Prevents duplicate questions via excludeQuestionIds
 *
 * @param difficulty - Difficulty level (easy, medium, hard)
 * @param options - Optional configuration
 * @param options.enabled - Whether to fetch data (default: true)
 * @param options.excludeQuestionIds - Array of question IDs to exclude
 * @returns Question data, loading state, and fetchNewQuestion function
 *
 * @example
 * const { question, isLoading, fetchNewQuestion } = useQuestion('medium', { excludeQuestionIds: ['id1', 'id2'] });
 * await fetchNewQuestion({ difficulty: 'hard' });
 */
export function useQuestion(
  difficulty: string = 'easy',
  options?: { enabled?: boolean; excludeQuestionIds?: string[] }
) {
  const { enabled = true, excludeQuestionIds = [] } = options || {};
  const queryClient = useQueryClient();

  const {
    data: question,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.question(difficulty),
    queryFn: () => fetchQuestion({ difficulty, excludeQuestionIds }),
    enabled,
    staleTime: Infinity, // Questions are unique, don't refetch
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  // Mutation for fetching a new question
  const fetchNewQuestion = useMutation({
    mutationFn: (opts?: FetchQuestionOptions) =>
      fetchQuestion({ difficulty, excludeQuestionIds, ...opts }),
    onSuccess: (newQuestion) => {
      // Invalidate old question and set new one
      queryClient.setQueryData(queryKeys.question(difficulty), newQuestion);
    },
  });

  return {
    question: question || null,
    isLoading,
    isError,
    error,
    refetch,
    fetchNewQuestion: fetchNewQuestion.mutateAsync,
    isFetchingNew: fetchNewQuestion.isPending,
  };
}

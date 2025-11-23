import { envConfig } from '../config';
import type { QuestionProvider } from '../types';

/**
 * Question provider configuration
 * Determines which AI service to use for generating trivia questions
 */

// Re-export type from centralized types
export type { QuestionProvider } from '../types';

/**
 * Get the configured question provider from validated environment variable
 * Defaults to 'openrouter' if not set
 */
export const getQuestionProvider = (): QuestionProvider => {
  return envConfig.questionProvider;
};

/**
 * Check if a specific provider is available
 */
export const isProviderAvailable = (provider: QuestionProvider): boolean => {
  if (provider === 'openrouter') {
    return envConfig.openrouter.isAvailable();
  }
  if (provider === 'openai') {
    return envConfig.openai.isAvailable();
  }
  return false;
};

/**
 * Get the available provider with fallback logic
 * Returns the configured provider if available, otherwise tries the other one
 */
export const getAvailableProvider = (): QuestionProvider => {
  const configured = getQuestionProvider();

  if (isProviderAvailable(configured)) {
    return configured;
  }

  // Fallback to the other provider
  const fallback: QuestionProvider = configured === 'openrouter' ? 'openai' : 'openrouter';

  if (isProviderAvailable(fallback)) {
    console.warn(`Configured provider ${configured} is not available, falling back to ${fallback}`);
    return fallback;
  }

  // If neither is available, return configured (will use fallback question)
  console.warn(`Neither OpenRouter nor OpenAI is available, will use fallback questions`);
  return configured;
};

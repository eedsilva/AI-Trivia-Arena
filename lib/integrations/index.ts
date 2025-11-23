/**
 * External API Integrations
 * Centralized exports for all external service integrations
 *
 * Note: OpenAI and OpenRouter export similar functions, so we export them
 * with specific names to avoid conflicts. Use the integration-specific
 * imports when you need a specific provider.
 */

// AI Question Generation - export with specific names to avoid conflicts
export {
  getOpenAIClient,
  generateTriviaQuestion as generateOpenAITriviaQuestion,
  generateAndSaveQuestion as generateAndSaveQuestionOpenAI,
  type GeneratedQuestion as OpenAIGeneratedQuestion,
} from './openai';

export {
  getOpenRouterClient,
  isOpenRouterAvailable,
  generateTriviaQuestion as generateOpenRouterTriviaQuestion,
  generateAndSaveQuestion as generateAndSaveQuestionOpenRouter,
  type GeneratedQuestion as OpenRouterGeneratedQuestion,
} from './openrouter';

// Text-to-Speech
export * from './deepgram';

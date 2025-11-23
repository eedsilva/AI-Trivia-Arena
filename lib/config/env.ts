import { z } from 'zod';

/**
 * Environment variable validation schema
 * Validates all environment variables used in the application
 */
const envSchema = z.object({
  // Supabase - required
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Service role key is only available on server, not in browser
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Question Provider - optional, defaults to 'openrouter'
  // Accepts 'openapi' as alias for 'openai' for backward compatibility
  QUESTION_PROVIDER: z.enum(['openrouter', 'openai', 'openapi']).optional(),

  // OpenRouter - optional
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),

  // OpenAI - optional
  OPENAI_API_KEY: z.string().optional(),

  // Deepgram - optional
  DEEPGRAM_API_KEY: z.string().optional(),

  // App URL - optional, allow empty string or valid URL
  NEXT_PUBLIC_APP_URL: z.union([z.string().url(), z.literal('')]).optional(),
});

/**
 * Parse and validate environment variables
 * Uses safeParse to handle missing optional variables gracefully
 */
const envParseResult = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  QUESTION_PROVIDER: process.env.QUESTION_PROVIDER,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!envParseResult.success) {
  console.log(process.env);
  console.error('❌ Invalid environment variables:', envParseResult.error.format());
  throw new Error('Invalid environment configuration. Please check your .env.local file.');
}

const env = envParseResult.data;

/**
 * Safe environment variable access
 * Returns validated environment variables or throws descriptive errors
 */
export const envConfig = {
  // Supabase
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Question Provider - normalize 'openapi' to 'openai' for backward compatibility
  questionProvider: (() => {
    const provider = env.QUESTION_PROVIDER || 'openrouter';
    return (provider === 'openapi' ? 'openai' : provider) as 'openrouter' | 'openai';
  })(),

  // OpenRouter
  openrouter: {
    apiKey: env.OPENROUTER_API_KEY || undefined,
    model: env.OPENROUTER_MODEL || undefined,
    isAvailable: () => !!env.OPENROUTER_API_KEY,
  },

  // OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY || undefined,
    isAvailable: () => !!env.OPENAI_API_KEY,
  },

  // Deepgram
  deepgram: {
    apiKey: env.DEEPGRAM_API_KEY || undefined,
    isAvailable: () => !!env.DEEPGRAM_API_KEY,
  },

  // App
  app: {
    url: env.NEXT_PUBLIC_APP_URL || undefined,
  },
} as const;

/**
 * Type-safe environment configuration
 */
export type EnvConfig = typeof envConfig;

import { OpenRouter } from '@openrouter/sdk';
import { envConfig } from '../../config';

let _openrouterClient: OpenRouter | null = null;

export const getOpenRouterClient = (): OpenRouter => {
  if (!_openrouterClient) {
    const apiKey = envConfig.openrouter.apiKey;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    _openrouterClient = new OpenRouter({
      apiKey,
      // Optional: Add app metadata for OpenRouter analytics
      httpReferer: envConfig.app.url,
      xTitle: 'AI Trivia Arena',
    });
  }
  return _openrouterClient;
};

export const isOpenRouterAvailable = (): boolean => {
  return envConfig.openrouter.isAvailable();
};

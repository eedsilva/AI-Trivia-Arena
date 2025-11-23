import { createClient, DeepgramClient } from '@deepgram/sdk';
import { envConfig } from '../../config';

let _deepgramClient: DeepgramClient | null = null;

export const getDeepgramClient = (): DeepgramClient => {
  if (!_deepgramClient) {
    const apiKey = envConfig.deepgram.apiKey;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is required');
    }
    _deepgramClient = createClient(apiKey);
  }
  return _deepgramClient;
};

export const isDeepgramAvailable = (): boolean => {
  return envConfig.deepgram.isAvailable();
};

import OpenAI from 'openai';
import { envConfig } from '../../config';

let _openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!_openaiClient) {
    const apiKey = envConfig.openai.apiKey;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    _openaiClient = new OpenAI({ apiKey });
  }
  return _openaiClient;
};

import { getDeepgramClient, isDeepgramAvailable } from './client';
import type { DeepgramVoice } from '../../types';
import { VOICE_PREVIEW_TEXT } from '../../constants';

// Re-export type from centralized types
export type { DeepgramVoice } from '../../types';

/**
 * List of available Deepgram voices
 * These are the current Deepgram Aura voices and other available models
 */
export const DEEPGRAM_VOICES: DeepgramVoice[] = [
  // Aura voices (English)
  {
    id: 'aura-asteria-en',
    name: 'Asteria',
    model: 'aura',
    language: 'en',
    description: 'Female, warm and friendly',
  },
  {
    id: 'aura-luna-en',
    name: 'Luna',
    model: 'aura',
    language: 'en',
    description: 'Female, calm and soothing',
  },
  {
    id: 'aura-stella-en',
    name: 'Stella',
    model: 'aura',
    language: 'en',
    description: 'Female, energetic and bright',
  },
  {
    id: 'aura-athena-en',
    name: 'Athena',
    model: 'aura',
    language: 'en',
    description: 'Female, confident and clear',
  },
  {
    id: 'aura-hera-en',
    name: 'Hera',
    model: 'aura',
    language: 'en',
    description: 'Female, authoritative and strong',
  },
  {
    id: 'aura-orion-en',
    name: 'Orion',
    model: 'aura',
    language: 'en',
    description: 'Male, deep and resonant',
  },
  {
    id: 'aura-arcas-en',
    name: 'Arcas',
    model: 'aura',
    language: 'en',
    description: 'Male, warm and approachable',
  },
  {
    id: 'aura-perseus-en',
    name: 'Perseus',
    model: 'aura',
    language: 'en',
    description: 'Male, confident and clear',
  },
  {
    id: 'aura-zeus-en',
    name: 'Zeus',
    model: 'aura',
    language: 'en',
    description: 'Male, powerful and commanding',
  },
  {
    id: 'aura-apollo-en',
    name: 'Apollo',
    model: 'aura',
    language: 'en',
    description: 'Male, energetic and vibrant',
  },

  // Other models (if available)
  {
    id: 'echo-en',
    name: 'Echo',
    model: 'echo',
    language: 'en',
    description: 'Neutral, balanced voice',
  },
  {
    id: 'pulse-en',
    name: 'Pulse',
    model: 'pulse',
    language: 'en',
    description: 'Energetic and dynamic',
  },
];

/**
 * Get list of available Deepgram voices
 * Returns the static list of voices
 */
export const getDeepgramVoices = (): DeepgramVoice[] => {
  if (!isDeepgramAvailable()) {
    return [];
  }
  return DEEPGRAM_VOICES;
};

/**
 * Get a voice by ID
 */
export const getVoiceById = (voiceId: string): DeepgramVoice | undefined => {
  return DEEPGRAM_VOICES.find((voice) => voice.id === voiceId);
};

// Re-export VOICE_PREVIEW_TEXT from constants
export { VOICE_PREVIEW_TEXT };

import { getDeepgramClient, isDeepgramAvailable } from './client';
import { supabaseServer } from '../../supabase/server';
import { envConfig } from '../../config';
import type { SpeakSchema, TextSource } from '@deepgram/sdk';

export interface TTSOptions {
  text: string;
  voice?: string;
  model?: string;
}

export interface TTSResult {
  url: string;
  fileName: string;
}

/**
 * Generate speech using Deepgram TTS
 * Falls back to OpenAI TTS if Deepgram is not available
 */
export const generateSpeech = async (options: TTSOptions): Promise<TTSResult> => {
  const { text, voice, model = 'aura' } = options;

  // Try Deepgram first if available
  if (isDeepgramAvailable()) {
    try {
      return await generateSpeechDeepgram({ text, voice, model });
    } catch (error) {
      console.error('Deepgram TTS error, falling back to OpenAI:', error);
    }
  }

  // Fallback to OpenAI TTS
  return await generateSpeechOpenAI(options);
};

/**
 * Generate speech using Deepgram TTS
 */
const generateSpeechDeepgram = async (options: TTSOptions): Promise<TTSResult> => {
  const { text, voice, model = 'aura' } = options;
  const deepgram = getDeepgramClient();

  // Prepare text source
  const textSource: TextSource = { text };

  // Prepare speak options
  const speakOptions: SpeakSchema = {
    model,
    encoding: 'mp3',
  };

  // Add voice if provided (Deepgram voice format: model-voice-language)
  // The voice parameter should be the full model identifier like "aura-asteria-en"
  if (voice) {
    // Use the voice directly as the model identifier
    speakOptions.model = voice;
  } else {
    // Default to base model if no voice specified
    speakOptions.model = model;
  }

  // Make the request
  const response = await deepgram.speak.request(textSource, speakOptions);

  if (!response) {
    throw new Error('No response from Deepgram');
  }

  // Get the audio stream
  const stream = await response.getStream();
  if (!stream) {
    throw new Error('No audio stream from Deepgram');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // Combine chunks into buffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const audioBuffer = Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    totalLength
  );

  const fileName = `speech-${Date.now()}.mp3`;

  // Upload to Supabase storage
  await supabaseServer().storage.from('voice_samples').upload(fileName, audioBuffer, {
    contentType: 'audio/mpeg',
    upsert: true,
  });

  const { data: publicUrl } = supabaseServer().storage.from('voice_samples').getPublicUrl(fileName);

  return {
    url: publicUrl.publicUrl,
    fileName,
  };
};

/**
 * Fallback to OpenAI TTS
 */
const generateSpeechOpenAI = async (options: TTSOptions): Promise<TTSResult> => {
  const { text, voice = 'aura-asteria-en' } = options;

  const { default: OpenAI } = await import('openai');
  const apiKey = envConfig.openai.apiKey;

  if (!apiKey) {
    throw new Error('Neither DEEPGRAM_API_KEY nor OPENAI_API_KEY is available');
  }

  const openai = new OpenAI({ apiKey });

  // Map Deepgram voice to OpenAI voice
  // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
  const openaiVoice = voice.includes('luna') ? 'nova' : 'alloy';

  const speech = await openai.audio.speech.create({
    model: 'tts-1',
    voice: openaiVoice,
    input: text,
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());
  const fileName = `speech-${Date.now()}.mp3`;

  await supabaseServer().storage.from('voice_samples').upload(fileName, audioBuffer, {
    contentType: 'audio/mpeg',
    upsert: true,
  });

  const { data: publicUrl } = supabaseServer().storage.from('voice_samples').getPublicUrl(fileName);

  return {
    url: publicUrl.publicUrl,
    fileName,
  };
};

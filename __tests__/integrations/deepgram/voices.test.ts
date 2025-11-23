import {
  DEEPGRAM_VOICES,
  getDeepgramVoices,
  getVoiceById,
  VOICE_PREVIEW_TEXT,
} from '../../../lib/integrations/deepgram/voices';
import * as deepgramClient from '../../../lib/integrations/deepgram/client';

// Mock the deepgram client
jest.mock('../../../lib/integrations/deepgram/client', () => ({
  isDeepgramAvailable: jest.fn(),
  getDeepgramClient: jest.fn(),
}));

describe('Deepgram Voices', () => {
  describe('DEEPGRAM_VOICES constant', () => {
    it('should contain an array of voice objects', () => {
      expect(Array.isArray(DEEPGRAM_VOICES)).toBe(true);
      expect(DEEPGRAM_VOICES.length).toBeGreaterThan(0);
    });

    it('should have voices with required properties', () => {
      DEEPGRAM_VOICES.forEach((voice) => {
        expect(voice).toHaveProperty('id');
        expect(voice).toHaveProperty('name');
        expect(voice).toHaveProperty('model');
        expect(voice).toHaveProperty('language');
        expect(voice).toHaveProperty('description');

        expect(typeof voice.id).toBe('string');
        expect(typeof voice.name).toBe('string');
        expect(typeof voice.model).toBe('string');
        expect(typeof voice.language).toBe('string');
        expect(typeof voice.description).toBe('string');
      });
    });

    it('should include Aura voice models', () => {
      const auraVoices = DEEPGRAM_VOICES.filter((v) => v.model === 'aura');
      expect(auraVoices.length).toBeGreaterThan(0);
    });

    it('should include specific voices', () => {
      const voiceIds = DEEPGRAM_VOICES.map((v) => v.id);

      expect(voiceIds).toContain('aura-asteria-en');
      expect(voiceIds).toContain('aura-luna-en');
      expect(voiceIds).toContain('aura-zeus-en');
    });

    it('should have unique voice IDs', () => {
      const voiceIds = DEEPGRAM_VOICES.map((v) => v.id);
      const uniqueIds = new Set(voiceIds);

      expect(uniqueIds.size).toBe(voiceIds.length);
    });

    it('should have English language voices', () => {
      DEEPGRAM_VOICES.forEach((voice) => {
        expect(voice.language).toBe('en');
      });
    });
  });

  describe('getDeepgramVoices', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return voices array when Deepgram is available', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(true);

      const voices = getDeepgramVoices();

      expect(voices).toEqual(DEEPGRAM_VOICES);
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should return empty array when Deepgram is not available', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(false);

      const voices = getDeepgramVoices();

      expect(voices).toEqual([]);
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBe(0);
    });

    it('should call isDeepgramAvailable', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(true);

      getDeepgramVoices();

      expect(deepgramClient.isDeepgramAvailable).toHaveBeenCalledTimes(1);
    });

    it('should return same voice array on multiple calls', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(true);

      const voices1 = getDeepgramVoices();
      const voices2 = getDeepgramVoices();

      expect(voices1).toEqual(voices2);
    });
  });

  describe('getVoiceById', () => {
    it('should return voice when ID exists', () => {
      const voice = getVoiceById('aura-asteria-en');

      expect(voice).toBeDefined();
      expect(voice?.id).toBe('aura-asteria-en');
      expect(voice?.name).toBe('Asteria');
    });

    it('should return undefined when ID does not exist', () => {
      const voice = getVoiceById('non-existent-voice');

      expect(voice).toBeUndefined();
    });

    it('should handle case-sensitive IDs', () => {
      const voice = getVoiceById('AURA-ASTERIA-EN');

      expect(voice).toBeUndefined(); // Should not match
    });

    it('should return correct voice for various IDs', () => {
      const testCases = [
        { id: 'aura-luna-en', expectedName: 'Luna' },
        { id: 'aura-zeus-en', expectedName: 'Zeus' },
        { id: 'aura-athena-en', expectedName: 'Athena' },
      ];

      testCases.forEach(({ id, expectedName }) => {
        const voice = getVoiceById(id);
        expect(voice).toBeDefined();
        expect(voice?.name).toBe(expectedName);
      });
    });

    it('should handle empty string', () => {
      const voice = getVoiceById('');

      expect(voice).toBeUndefined();
    });

    it('should return voice with all properties', () => {
      const voice = getVoiceById('aura-asteria-en');

      expect(voice).toMatchObject({
        id: 'aura-asteria-en',
        name: 'Asteria',
        model: 'aura',
        language: 'en',
        description: expect.any(String),
      });
    });
  });

  describe('VOICE_PREVIEW_TEXT', () => {
    it('should be a non-empty string', () => {
      expect(typeof VOICE_PREVIEW_TEXT).toBe('string');
      expect(VOICE_PREVIEW_TEXT.length).toBeGreaterThan(0);
    });

    it('should be a reasonable preview text', () => {
      expect(VOICE_PREVIEW_TEXT).toMatch(/preview/i);
    });
  });

  describe('Voice categorization', () => {
    it('should have both male and female voices', () => {
      const femaleDescriptions = DEEPGRAM_VOICES.filter((v) =>
        v.description.toLowerCase().includes('female')
      );
      const maleDescriptions = DEEPGRAM_VOICES.filter((v) =>
        v.description.toLowerCase().includes('male')
      );

      expect(femaleDescriptions.length).toBeGreaterThan(0);
      expect(maleDescriptions.length).toBeGreaterThan(0);
    });

    it('should have voices with different characteristics', () => {
      const characteristics = DEEPGRAM_VOICES.map((v) => v.description);

      // Check for variety in descriptions
      const uniqueDescriptions = new Set(characteristics);
      expect(uniqueDescriptions.size).toBeGreaterThan(1);
    });

    it('should organize voices by model type', () => {
      const byModel = DEEPGRAM_VOICES.reduce(
        (acc, voice) => {
          acc[voice.model] = (acc[voice.model] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(Object.keys(byModel).length).toBeGreaterThan(0);
      expect(byModel['aura']).toBeGreaterThan(0);
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should support voice selection flow', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(true);

      // Get all voices
      const voices = getDeepgramVoices();
      expect(voices.length).toBeGreaterThan(0);

      // Select first voice
      const selectedVoiceId = voices[0].id;
      const selectedVoice = getVoiceById(selectedVoiceId);

      expect(selectedVoice).toBeDefined();
      expect(selectedVoice?.id).toBe(selectedVoiceId);
    });

    it('should handle unavailable Deepgram gracefully', () => {
      (deepgramClient.isDeepgramAvailable as jest.Mock).mockReturnValue(false);

      const voices = getDeepgramVoices();
      expect(voices).toEqual([]);

      // Should still be able to access constant
      expect(DEEPGRAM_VOICES.length).toBeGreaterThan(0);
    });

    it('should support filtering voices by gender', () => {
      const femaleVoices = DEEPGRAM_VOICES.filter((v) =>
        v.description.toLowerCase().includes('female')
      );
      const maleVoices = DEEPGRAM_VOICES.filter((v) =>
        v.description.toLowerCase().includes('male')
      );

      expect(femaleVoices.length).toBeGreaterThan(0);
      expect(maleVoices.length).toBeGreaterThan(0);
      // Some voices may not have gender specified (like "Neutral, balanced voice")
      // So the sum may be less than total
      expect(femaleVoices.length + maleVoices.length).toBeGreaterThan(0);
    });

    it('should find voices by name pattern', () => {
      // Find all Aura voices
      const auraVoices = DEEPGRAM_VOICES.filter((v) => v.id.startsWith('aura-'));

      expect(auraVoices.length).toBeGreaterThan(0);

      auraVoices.forEach((voice) => {
        expect(voice.model).toBe('aura');
      });
    });
  });
});

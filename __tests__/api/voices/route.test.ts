import { GET } from '../../../app/api/voices/route';
import * as voicesModule from '../../../lib/integrations/deepgram/voices';
import { NextResponse } from 'next/server';

// Mock the deepgram voices module
jest.mock('../../../lib/integrations/deepgram/voices', () => ({
  getDeepgramVoices: jest.fn(),
  DEEPGRAM_VOICES: [
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
  ],
}));

describe('Voices API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/voices', () => {
    it('should return voices list successfully', async () => {
      const mockVoices = [
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
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ voices: mockVoices });
    });

    it('should return empty array when no voices available', async () => {
      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ voices: [] });
    });

    it('should call getDeepgramVoices once', async () => {
      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue([]);

      await GET();

      expect(voicesModule.getDeepgramVoices).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Failed to get voices');
      (voicesModule.getDeepgramVoices as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch voices' });
    });

    it('should return proper JSON response', async () => {
      const mockVoices = [
        {
          id: 'aura-asteria-en',
          name: 'Asteria',
          model: 'aura',
          language: 'en',
          description: 'Female, warm and friendly',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response = await GET();

      // Check response is a Response
      expect(response instanceof Response).toBe(true);

      // Check response body
      const data = await response.json();
      expect(data).toEqual({ voices: mockVoices });

      // Check response status
      expect(response.status).toBe(200);
    });

    it('should handle undefined return from getDeepgramVoices', async () => {
      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ voices: undefined });
    });

    it('should handle null return from getDeepgramVoices', async () => {
      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ voices: null });
    });

    it('should return all voice properties', async () => {
      const mockVoices = [
        {
          id: 'aura-asteria-en',
          name: 'Asteria',
          model: 'aura',
          language: 'en',
          description: 'Female, warm and friendly',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response = await GET();
      const data = await response.json();

      expect(data.voices[0]).toMatchObject({
        id: 'aura-asteria-en',
        name: 'Asteria',
        model: 'aura',
        language: 'en',
        description: 'Female, warm and friendly',
      });
    });
  });

  describe('Error scenarios', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (voicesModule.getDeepgramVoices as jest.Mock).mockImplementation(() => {
        throw networkError;
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch voices');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      (voicesModule.getDeepgramVoices as jest.Mock).mockImplementation(() => {
        throw timeoutError;
      });

      const response = await GET();

      expect(response.status).toBe(500);
    });

    it('should handle unknown errors', async () => {
      (voicesModule.getDeepgramVoices as jest.Mock).mockImplementation(() => {
        throw 'Unknown error';
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch voices');
    });
  });

  describe('Response format', () => {
    it('should return voices in expected format', async () => {
      const mockVoices = [
        {
          id: 'test-voice',
          name: 'Test',
          model: 'test-model',
          language: 'en',
          description: 'Test description',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('voices');
      expect(Array.isArray(data.voices)).toBe(true);
    });

    it('should not modify voices data', async () => {
      const mockVoices = [
        {
          id: 'aura-asteria-en',
          name: 'Asteria',
          model: 'aura',
          language: 'en',
          description: 'Female, warm and friendly',
          extraProperty: 'should be preserved',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response = await GET();
      const data = await response.json();

      expect(data.voices[0]).toEqual(mockVoices[0]);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockVoices = [
        {
          id: 'aura-asteria-en',
          name: 'Asteria',
          model: 'aura',
          language: 'en',
          description: 'Female, warm and friendly',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const requests = await Promise.all([GET(), GET(), GET()]);

      requests.forEach((response) => {
        expect(response.status).toBe(200);
      });

      expect(voicesModule.getDeepgramVoices).toHaveBeenCalledTimes(3);
    });

    it('should return consistent data across requests', async () => {
      const mockVoices = [
        {
          id: 'aura-asteria-en',
          name: 'Asteria',
          model: 'aura',
          language: 'en',
          description: 'Female, warm and friendly',
        },
      ];

      (voicesModule.getDeepgramVoices as jest.Mock).mockReturnValue(mockVoices);

      const response1 = await GET();
      const data1 = await response1.json();

      const response2 = await GET();
      const data2 = await response2.json();

      expect(data1).toEqual(data2);
    });
  });
});

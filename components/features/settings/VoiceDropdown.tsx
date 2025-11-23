'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useVoices } from '../../../lib/hooks/useVoices';

interface VoiceDropdownProps {
  value: string;
  onChange: (value: string) => void;
  enabled?: boolean;
  onError?: (message: string) => void;
}

/**
 * Voice dropdown component for selecting TTS voice
 * Uses useVoices hook for efficient data fetching with caching
 */
export function VoiceDropdown({ value, onChange, enabled = true, onError }: VoiceDropdownProps) {
  const { voices, isLoading } = useVoices({ enabled });
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [validatingVoice, setValidatingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = useCallback(
    async (voiceId: string) => {
      console.log('🎵 handlePlayPreview called for:', voiceId);

      // Prevent duplicate calls
      if (playingVoice === voiceId) {
        console.log('⏸️ Already playing this voice, stopping...');
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        setPlayingVoice(null);
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      setPlayingVoice(voiceId);

      try {
        console.log('📡 Fetching voice preview...');
        // Fetch voice preview
        const response = await fetch(`/api/voice-preview?voice_id=${encodeURIComponent(voiceId)}`);
        if (!response.ok) throw new Error('Failed to fetch voice preview');

        const data = await response.json();
        const audioUrl = data.url;
        console.log('✅ Got audio URL:', data.cached ? '(cached)' : '(new)');

        // Create and play audio
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setPlayingVoice(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          console.error('Error playing voice preview');
          setPlayingVoice(null);
          audioRef.current = null;
          onError?.('Unable to play this voice. Please try another voice.');
        };

        audioRef.current = audio;
        await audio.play();
      } catch (error) {
        console.error('Error playing voice preview:', error);
        setPlayingVoice(null);
        audioRef.current = null;
        onError?.('Unable to load voice preview. Please try another voice.');
      }
    },
    [playingVoice, onError]
  );

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 text-sm text-white/80">
        <span className="font-medium text-white">Voice</span>
        <div className="flex items-center justify-center py-3">
          <Loader2 className="h-5 w-5 animate-spin text-white/60" />
        </div>
      </div>
    );
  }

  const handleVoiceSelect = (voiceId: string) => {
    onChange(voiceId);
  };

  return (
    <div className="flex flex-col gap-2" suppressHydrationWarning>
      <label className="text-sm font-medium text-white">Voice</label>
      <div
        className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar"
        suppressHydrationWarning
      >
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => handleVoiceSelect(voice.id)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all cursor-pointer ${
              value === voice.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-border bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{voice.name}</span>
                {voice.description && (
                  <span className="text-xs text-white/60">• {voice.description}</span>
                )}
              </div>
              <div className="text-xs text-white/50 mt-0.5">{voice.id}</div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card selection when clicking play
                  handlePlayPreview(voice.id);
                }}
                disabled={playingVoice === voice.id}
                className="p-2"
                iconLeft={
                  playingVoice === voice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )
                }
                aria-label={`Preview ${voice.name} voice`}
              />
              {value === voice.id && (
                <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

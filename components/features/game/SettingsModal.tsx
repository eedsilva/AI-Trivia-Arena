'use client';
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { DifficultySelector } from '../settings/DifficultySelector';
import { Toggle } from '../../ui/Toggle';
import { VoiceDropdown } from '../settings/VoiceDropdown';
import { useUserSettingsStore } from '../../../lib/store/userSettingsStore';
import { useUserStore } from '../../../lib/store/userStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  // Get store state without subscribing to prevent re-renders
  const getSettings = () => useUserSettingsStore.getState();
  const getUser = () => useUserStore.getState();
  const [isSaving, setIsSaving] = useState(false);
  const [localDifficulty, setLocalDifficulty] = useState('easy');
  const [localTtsEnabled, setLocalTtsEnabled] = useState(false);
  const [localTtsVoice, setLocalTtsVoice] = useState('aura-asteria-en');

  // Initialize local state from store when modal opens
  useEffect(() => {
    if (open) {
      const settings = getSettings();
      const user = getUser();
      settings.initializeFromCache();
      setLocalDifficulty(settings.difficulty);
      setLocalTtsEnabled(settings.tts_enabled);
      setLocalTtsVoice(settings.tts_voice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDifficultyChange = (difficulty: string) => {
    setLocalDifficulty(difficulty);
  };

  const handleTtsEnabledChange = (enabled: boolean) => {
    setLocalTtsEnabled(enabled);
  };

  const handleVoiceChange = (voice: string) => {
    setLocalTtsVoice(voice);
  };

  const handleCancel = () => {
    // Reset local state to stored values
    const settings = getSettings();
    setLocalDifficulty(settings.difficulty);
    setLocalTtsEnabled(settings.tts_enabled);
    setLocalTtsVoice(settings.tts_voice);
    onClose();
  };

  const handleSave = async () => {
    console.log('🎮 SettingsModal handleSave called');
    console.log('Settings to save:', { localDifficulty, localTtsEnabled, localTtsVoice });

    setIsSaving(true);
    try {
      const user = getUser();
      console.log('User:', user);

      if (user.user_id) {
        // Update store with new values first
        console.log('📝 Updating store...');
        getSettings().updateSettings({
          difficulty: localDifficulty,
          tts_enabled: localTtsEnabled,
          tts_voice: localTtsVoice,
        });

        // Then sync to server
        console.log('📡 Syncing to server...');
        await getSettings().syncToServer(user.user_id);
        console.log('✅ Settings saved successfully');
      }
      onClose();
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Game Settings" preventClose={isSaving}>
      <div className="space-y-4">
        <DifficultySelector value={localDifficulty} onChange={handleDifficultyChange} />
        <Toggle enabled={localTtsEnabled} onChange={handleTtsEnabledChange} label="AI Voice" />
        {localTtsEnabled && (
          <VoiceDropdown
            value={localTtsVoice}
            onChange={handleVoiceChange}
            enabled={localTtsEnabled}
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

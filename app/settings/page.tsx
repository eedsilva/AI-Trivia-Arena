'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DifficultySelector } from '../../components/features/settings/DifficultySelector';
import { Toggle } from '../../components/ui/Toggle';
import { VoiceDropdown } from '../../components/features/settings/VoiceDropdown';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useUserStore } from '../../lib/store/userStore';
import { useUserSettingsStore } from '../../lib/store/userSettingsStore';

export default function SettingsPage() {
  const router = useRouter();
  const { user_id } = useUserStore();
  const {
    difficulty: storedDifficulty,
    tts_enabled: storedTtsEnabled,
    tts_voice: storedVoice,
  } = useUserSettingsStore();

  // Local state for editing
  const [difficulty, setDifficulty] = useState(storedDifficulty);
  const [ttsEnabled, setTtsEnabled] = useState(storedTtsEnabled);
  const [voice, setVoice] = useState(storedVoice);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Sync with store on mount
  useEffect(() => {
    setDifficulty(storedDifficulty);
    setTtsEnabled(storedTtsEnabled);
    setVoice(storedVoice);
  }, [storedDifficulty, storedTtsEnabled, storedVoice]);

  const handleSave = async () => {
    console.log('💾 handleSave called');
    console.log('Settings to save:', { difficulty, ttsEnabled, voice, user_id });

    setError(null);

    // Validation: If AI Voice is enabled, require voice selection
    if (ttsEnabled && !voice) {
      console.log('❌ Validation failed: voice required');
      setError('Please select a voice when AI Voice is enabled');
      setShowErrorModal(true);
      return;
    }

    if (!user_id) {
      console.log('❌ No user_id found');
      setError('User not found. Please log in again.');
      setShowErrorModal(true);
      return;
    }

    setIsSaving(true);

    try {
      console.log('📡 Sending request to /api/update-user-settings...');
      const response = await fetch('/api/update-user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          difficulty,
          tts_enabled: ttsEnabled,
          tts_voice: voice,
        }),
      });

      console.log('📬 Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.log('❌ Response error:', data);
        throw new Error(data.error || 'Failed to save settings');
      }

      const responseData = await response.json();
      console.log('✅ Settings saved successfully:', responseData);

      // Update store with new settings
      useUserSettingsStore.getState().updateSettings({
        difficulty,
        tts_enabled: ttsEnabled,
        tts_voice: voice,
      });

      console.log('✅ Store updated, navigating to home...');

      // Navigate back to home
      router.push('/');
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to stored values without saving
    setDifficulty(storedDifficulty);
    setTtsEnabled(storedTtsEnabled);
    setVoice(storedVoice);
    router.push('/');
  };

  return (
    <>
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Settings</h2>
            <div className="h-3 w-3 rounded-full bg-accent shadow-glow" />
          </div>
          <div className="space-y-4">
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <Toggle enabled={ttsEnabled} onChange={setTtsEnabled} label="AI Voice" />
            {ttsEnabled && (
              <VoiceDropdown
                value={voice}
                onChange={setVoice}
                onError={(message) => {
                  setError(message);
                  setShowErrorModal(true);
                }}
              />
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button className="px-6" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </main>

      <Modal open={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error">
        <div className="space-y-4">
          <p className="text-white/80">{error}</p>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorModal(false)}>OK</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

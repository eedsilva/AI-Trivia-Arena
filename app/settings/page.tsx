'use client';
import { useState } from 'react';
import { DifficultySelector } from '../../components/DifficultySelector';
import { Toggle } from '../../components/global/Toggle';
import { VoiceDropdown } from '../../components/VoiceDropdown';
import { Button } from '../../components/global/Button';
import { Card } from '../../components/global/Card';

export default function SettingsPage() {
  const [difficulty, setDifficulty] = useState('easy');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voice, setVoice] = useState('aura-asteria-en');

  const handleSave = () => {
    // This would call API update-user-settings
    alert('Settings saved!');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Settings</h2>
          <div className="h-3 w-3 rounded-full bg-accent shadow-glow" />
        </div>
        <div className="space-y-4">
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
          <Toggle enabled={ttsEnabled} onChange={setTtsEnabled} label="AI Voice" />
          <VoiceDropdown value={voice} onChange={setVoice} />
        </div>
        <div className="flex justify-end">
          <Button className="px-6" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </main>
  );
}

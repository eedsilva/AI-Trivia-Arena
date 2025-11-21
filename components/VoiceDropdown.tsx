'use client';
import { Select } from './global/Select';

interface VoiceDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}

const defaultVoices = [
  { label: 'Aura (Female)', value: 'aura-asteria-en' },
  { label: 'Echo (Neutral)', value: 'echo-en' },
  { label: 'Pulse (Energetic)', value: 'pulse-en' }
];

export function VoiceDropdown({ value, onChange, options = defaultVoices }: VoiceDropdownProps) {
  return (
    <Select
      label="Voice"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((voice) => (
        <option key={voice.value} value={voice.value} className="bg-background">
          {voice.label}
        </option>
      ))}
    </Select>
  );
}

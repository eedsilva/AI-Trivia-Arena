'use client';
import { Tabs } from '../../ui/Tabs';

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-white">Difficulty Level</p>
      <Tabs
        options={[
          { label: 'Easy', value: 'easy' },
          { label: 'Medium', value: 'medium' },
          { label: 'Hard', value: 'hard' },
        ]}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

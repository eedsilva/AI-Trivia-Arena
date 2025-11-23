'use client';
import clsx from 'classnames';
import { useState } from 'react';

export interface TabOption {
  label: string;
  value: string;
}

interface TabsProps {
  options: TabOption[];
  value?: string;
  onChange?: (val: string) => void;
}

export function Tabs({ options, value, onChange }: TabsProps) {
  const [internal, setInternal] = useState(options[0]?.value);
  const current = value ?? internal;

  const handleChange = (val: string) => {
    setInternal(val);
    onChange?.(val);
  };

  return (
    <div className="flex gap-2 rounded-full bg-white/10 p-1 text-sm" suppressHydrationWarning>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={clsx(
            'flex-1 rounded-full px-4 py-2 font-semibold transition',
            current === opt.value
              ? 'bg-accent text-white shadow-glow'
              : 'text-white/70 hover:text-white'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

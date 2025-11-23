'use client';
import clsx from 'classnames';
import { Switch } from '@headlessui/react';

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 text-sm text-white/80"
      suppressHydrationWarning
    >
      {label && <span className="text-white">{label}</span>}
      <Switch
        checked={enabled}
        onChange={onChange}
        className={clsx(
          enabled ? 'bg-accent' : 'bg-white/15',
          'relative inline-flex h-7 w-14 items-center rounded-full transition'
        )}
      >
        <span
          className={clsx(
            enabled ? 'translate-x-7' : 'translate-x-1',
            'inline-block h-5 w-5 transform rounded-full bg-white transition'
          )}
        />
      </Switch>
    </div>
  );
}

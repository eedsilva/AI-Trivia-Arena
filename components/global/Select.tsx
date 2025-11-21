import clsx from 'classnames';
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-white/80">
      {label && <span className="font-medium text-white">{label}</span>}
      <select
        className={clsx(
          'w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-base text-white shadow-inner shadow-black/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

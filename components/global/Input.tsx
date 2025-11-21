import clsx from 'classnames';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1 text-sm text-white/80">
      {label && <span className="font-medium text-white">{label}</span>}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 shadow-inner shadow-black/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/60',
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-white/50">{hint}</span>}
    </label>
  );
});

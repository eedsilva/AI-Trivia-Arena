import clsx from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export type OptionState = 'default' | 'correct' | 'wrong';

interface OptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: OptionState;
  label: string;
}

const stateStyles: Record<OptionState, string> = {
  default: 'bg-white/5 hover:bg-white/10 text-white/90 border border-border',
  correct: 'bg-green-500/20 border border-green-400 text-green-100 shadow-[0_0_20px_rgba(74,222,128,0.35)]',
  wrong: 'bg-red-500/20 border border-red-400 text-red-100 shadow-[0_0_20px_rgba(248,113,113,0.35)]'
};

export function OptionButton({ state = 'default', label, className, children, ...props }: OptionButtonProps) {
  return (
    <button
      className={clsx(
        'flex items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-semibold transition',
        stateStyles[state],
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {children && <span className="text-sm text-white/70">{children}</span>}
    </button>
  );
}

import clsx from 'classnames';
import { ButtonHTMLAttributes } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export type OptionState = 'default' | 'correct' | 'wrong';

interface OptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: OptionState;
  label: string;
  letter?: string;
}

const stateStyles: Record<OptionState, string> = {
  default: 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/10',
  correct:
    'bg-green-500/20 border-2 border-green-400 text-green-100 shadow-[0_0_20px_rgba(74,222,128,0.35)]',
  wrong:
    'bg-red-500/20 border-2 border-red-400 text-red-100 shadow-[0_0_20px_rgba(248,113,113,0.35)]',
};

// Support up to 5 options (A-E) as per spec
const optionLetters = ['A', 'B', 'C', 'D', 'E'];

const selectedStyles =
  'bg-purple-500/20 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]';

export function OptionButton({
  state = 'default',
  label,
  letter,
  className,
  children,
  disabled,
  'aria-selected': ariaSelected,
  ...props
}: OptionButtonProps) {
  const isSelected = ariaSelected === true;

  return (
    <button
      className={clsx(
        'flex items-center justify-between rounded-2xl px-6 py-5 text-left text-base font-semibold transition-all duration-200',
        stateStyles[state],
        state === 'default' &&
          !disabled &&
          'hover:scale-[1.02] hover:border-white/20 hover:bg-white/8 cursor-pointer',
        state === 'default' && isSelected && selectedStyles,
        disabled && 'cursor-not-allowed',
        className
      )}
      disabled={disabled}
      role="option"
      aria-selected={ariaSelected}
      {...props}
    >
      <div className="flex items-center gap-4">
        {letter && (
          <span
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg transition-colors flex-shrink-0',
              state === 'default' && 'bg-white/10 text-white/80 border border-white/10',
              state === 'correct' && 'bg-green-500/30 text-green-100 border border-green-400/50',
              state === 'wrong' && 'bg-red-500/30 text-red-100 border border-red-400/50'
            )}
          >
            {letter}
          </span>
        )}
        <span className="flex-1">{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {state === 'correct' && <CheckCircle2 className="h-6 w-6 text-green-400" />}
        {state === 'wrong' && <XCircle className="h-6 w-6 text-red-400" />}
        {children && <span className="text-sm text-white/70">{children}</span>}
      </div>
    </button>
  );
}

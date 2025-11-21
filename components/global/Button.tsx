import clsx from 'classnames';
import { ButtonHTMLAttributes, ReactNode } from 'react';

const variantStyles = {
  primary: 'bg-accent hover:bg-accent2 text-white shadow-glow',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-border',
  ghost: 'bg-transparent hover:bg-white/10 text-white'
};

export type ButtonVariant = keyof typeof variantStyles;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  className,
  children,
  variant = 'primary',
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
        'active:scale-95',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {iconLeft && <span className="text-lg">{iconLeft}</span>}
      {children}
      {iconRight && <span className="text-lg">{iconRight}</span>}
    </button>
  );
}

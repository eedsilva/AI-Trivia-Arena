import clsx from 'classnames';
import { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'card-surface glow-border rounded-3xl border border-border p-6 shadow-xl backdrop-blur',
        className
      )}
      {...props}
    />
  );
}

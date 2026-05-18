import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** Renders the card as a button when an `onClick` is supplied. */
  onClick?: () => void;
  className?: string;
}

/** The standard white surface panel: rounded, padded, soft shadow. */
export function Card({ children, onClick, className }: CardProps) {
  const classes = clsx(
    'rounded-2xl bg-surface p-4 shadow-card',
    onClick && 'cursor-pointer text-left transition-shadow hover:shadow-lg',
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}

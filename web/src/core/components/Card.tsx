import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { sound } from '../utils/sound';

interface CardProps {
  children: ReactNode;
  /** Renders the card as a button when an `onClick` is supplied. */
  onClick?: () => void;
  className?: string;
}

/** The standard white surface panel: rounded, padded, soft shadow, pops in. */
export function Card({ children, onClick, className }: CardProps) {
  const classes = clsx(
    'animate-pop-in rounded-2xl bg-surface p-4 shadow-card',
    onClick &&
      'cursor-pointer text-left transition-all duration-150 ' +
        'hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98]',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => {
          sound.click();
          onClick();
        }}
        className={classes}
      >
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}

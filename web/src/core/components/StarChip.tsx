import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { StarIcon } from './icons';

interface StarChipProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StarChipProps['size']>, string> = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-body px-2.5 py-1 gap-1.5',
  lg: 'text-title px-3 py-1.5 gap-2',
};

const ICON_CLASS: Record<NonNullable<StarChipProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

/**
 * A pill showing a Star icon and a count — the app's currency display. Pulses
 * briefly when the count changes (e.g. parent approves a task → balance jumps).
 */
export function StarChip({ count, size = 'md', className }: StarChipProps) {
  const [pulse, setPulse] = useState(false);
  const previous = useRef(count);

  useEffect(() => {
    if (previous.current !== count) {
      setPulse(true);
      const timer = window.setTimeout(() => setPulse(false), 450);
      previous.current = count;
      return () => window.clearTimeout(timer);
    }
  }, [count]);

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-gradient-to-br from-star/25 to-secondary/15 font-bold text-textPrimary transition-transform',
        pulse && 'animate-pulse-grow',
        SIZE_CLASS[size],
        className,
      )}
      aria-label={`${count} Stars`}
    >
      <StarIcon className={clsx('text-star', ICON_CLASS[size])} />
      {count}
    </span>
  );
}

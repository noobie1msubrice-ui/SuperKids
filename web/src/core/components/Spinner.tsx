import { clsx } from 'clsx';

interface SpinnerProps {
  className?: string;
}

/** A simple rotating ring spinner. */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent',
        className ?? 'h-6 w-6',
      )}
    />
  );
}

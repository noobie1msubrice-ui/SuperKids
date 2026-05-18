import { clsx } from 'clsx';

type BadgeTone = 'neutral' | 'pending' | 'success' | 'muted';

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-primary/10 text-primary',
  pending: 'bg-secondary/15 text-secondary',
  success: 'bg-success/15 text-success',
  muted: 'bg-textMuted/15 text-textMuted',
};

/** A small colour-coded label for a task / item / backpack status. */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full px-2.5 py-0.5 text-caption font-semibold',
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}

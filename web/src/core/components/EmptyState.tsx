import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** A large emoji or icon shown above the message. */
  icon: ReactNode;
  message: string;
  /** Optional call-to-action rendered below the message. */
  action?: ReactNode;
}

/** A friendly "nothing here yet" panel — the icon gives a little wiggle. */
export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="animate-pop-in flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center shadow-card">
      <div
        className="animate-wiggle flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 text-5xl"
        aria-hidden
      >
        {icon}
      </div>
      <p className="text-section text-textMuted">{message}</p>
      {action}
    </div>
  );
}

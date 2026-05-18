import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** A large emoji or icon shown above the message. */
  icon: ReactNode;
  message: string;
  /** Optional call-to-action rendered below the message. */
  action?: ReactNode;
}

/** A friendly "nothing here yet" panel — every list uses one (doc 06 §1). */
export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center shadow-card">
      <div className="text-5xl" aria-hidden>
        {icon}
      </div>
      <p className="text-section text-textMuted">{message}</p>
      {action}
    </div>
  );
}

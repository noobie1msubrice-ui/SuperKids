import { useEffect, useState } from 'react';
import { useAdminBroadcast } from '../hooks/useAdminBroadcast';

const STORAGE_KEY = 'winkz.bcast.lastSeen';

/**
 * A bright gradient banner that pops in when an admin publishes a broadcast
 * message. Each user dismisses it individually — the local "last seen"
 * timestamp is stored in localStorage, so once a message is dismissed it does
 * not reappear until the admin sends a *newer* one.
 */
export function BroadcastBanner() {
  const broadcast = useAdminBroadcast();
  const [dismissedAt, setDismissedAt] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
  });

  const sentAtMs = broadcast?.sentAt?.toMillis() ?? 0;

  // If the active broadcast is older than (or equal to) what the user has
  // already seen, treat it as already-dismissed for this session too.
  useEffect(() => {
    if (sentAtMs && sentAtMs <= dismissedAt) {
      // already dismissed; nothing to do
    }
  }, [sentAtMs, dismissedAt]);

  if (!broadcast || sentAtMs === 0 || sentAtMs <= dismissedAt) {
    return null;
  }

  function dismiss(): void {
    window.localStorage.setItem(STORAGE_KEY, String(sentAtMs));
    setDismissedAt(sentAtMs);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in-up bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white shadow-pop"
    >
      <div className="mx-auto flex max-w-content items-start gap-3">
        <span aria-hidden className="text-xl leading-none">
          📢
        </span>
        <p className="flex-1 text-body font-bold">{broadcast.text}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded-lg px-2 py-0.5 text-body font-bold text-white/90 hover:bg-white/15"
        >
          ×
        </button>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { StarIcon } from './icons';

interface RewardCelebrationProps {
  open: boolean;
  /** The headline shown in the burst, e.g. "+5 Stars!". */
  message: string;
  onDone: () => void;
}

const CONFETTI_COLORS = ['#5B5BD6', '#FF8A3D', '#FFC93C', '#3CC97A'];

/**
 * A full-screen confetti + star-burst overlay played when a child earns Stars
 * or buys an item (doc 06 §7). Auto-dismisses after the animation.
 */
export function RewardCelebration({
  open,
  message,
  onDone,
}: RewardCelebrationProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const timer = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(timer);
  }, [open, onDone]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      role="status"
      aria-live="assertive"
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 h-3 w-3 rounded-sm"
          style={{
            left: `${(i / 24) * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 6) * 80}ms`,
          }}
        />
      ))}
      <div className="flex flex-col items-center gap-3">
        <StarIcon className="animate-star-pop h-28 w-28 text-star drop-shadow" />
        <p className="text-display text-primary drop-shadow">{message}</p>
      </div>
    </div>
  );
}

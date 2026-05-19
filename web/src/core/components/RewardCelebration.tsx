import { useEffect } from 'react';
import { StarIcon } from './icons';
import { sound } from '../utils/sound';

interface RewardCelebrationProps {
  open: boolean;
  /** The headline shown in the burst, e.g. "+5 Stars!". */
  message: string;
  onDone: () => void;
}

const CONFETTI_COLORS = ['#5B5BD6', '#FF8A3D', '#FFC93C', '#3CC97A'];

/**
 * A full-screen confetti + star-burst overlay played when a child earns Stars
 * or buys an item (doc 06 §7). Plays a cheerful chime and auto-dismisses.
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
    sound.reward();
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
      {/* Soft glow so the burst reads on any background. */}
      <div
        className="absolute h-80 w-80 rounded-full bg-star/30 blur-3xl"
        aria-hidden
      />

      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 h-3 w-3"
          style={{
            left: `${(i / 36) * 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            borderRadius: i % 2 === 0 ? '9999px' : '2px',
            animationDelay: `${(i % 8) * 70}ms`,
          }}
        />
      ))}

      <div className="animate-pop-in relative flex flex-col items-center gap-3">
        <StarIcon className="animate-star-pop h-32 w-32 text-star drop-shadow-lg" />
        <p className="text-display font-extrabold text-primary drop-shadow">
          {message}
        </p>
      </div>
    </div>
  );
}

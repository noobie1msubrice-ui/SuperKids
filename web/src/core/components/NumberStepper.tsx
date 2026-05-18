import { useId } from 'react';
import { StarChip } from './StarChip';

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
  /** Shows the value as a StarChip — used for Star reward / price fields. */
  showStars?: boolean;
}

/**
 * A plus/minus stepper for a bounded positive integer. Designed for the Star
 * reward and Star price fields; pair it with react-hook-form's `Controller`.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 999,
  error,
  showStars = false,
}: NumberStepperProps) {
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="flex flex-col gap-1">
      <span id={id} className="text-body font-semibold">
        {label}
      </span>
      <div className="flex items-center gap-3" role="group" aria-labelledby={id}>
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          className="h-12 w-12 rounded-xl border-2 border-primary text-title font-bold text-primary disabled:opacity-40"
        >
          −
        </button>
        {showStars ? (
          <StarChip count={value} size="lg" />
        ) : (
          <span className="min-w-[3rem] text-center text-title">{value}</span>
        )}
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          className="h-12 w-12 rounded-xl border-2 border-primary text-title font-bold text-primary disabled:opacity-40"
        >
          +
        </button>
      </div>
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}

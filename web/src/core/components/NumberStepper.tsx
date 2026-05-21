import { useId, useState } from 'react';
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
 * A plus/minus stepper for a bounded positive integer. Tapping the middle
 * (the number or Star chip) switches it to an editable input so you can
 * type a value directly instead of mashing + repeatedly.
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
  const clamp = (n: number): number => Math.min(max, Math.max(min, n));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function startEditing(): void {
    setDraft(String(value));
    setEditing(true);
  }

  function commit(): void {
    const trimmed = draft.replace(/[^0-9-]/g, '');
    const parsed = parseInt(trimmed, 10);
    const next = clamp(Number.isFinite(parsed) ? parsed : min);
    onChange(next);
    setDraft(String(next));
    setEditing(false);
  }

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

        {editing ? (
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              } else if (e.key === 'Escape') {
                setDraft(String(value))
                setEditing(false)
              }
            }}
            onFocus={(e) => e.currentTarget.select()}
            className="h-12 w-24 rounded-full border-2 border-primary bg-star/20 px-2 text-center text-title font-bold text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`${label} value`}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            aria-label={`${label} — tap to type`}
            className="rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {showStars ? (
              <StarChip count={value} size="lg" />
            ) : (
              <span className="min-w-[3rem] text-center text-title">{value}</span>
            )}
          </button>
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

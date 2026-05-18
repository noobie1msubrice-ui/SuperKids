import { clsx } from 'clsx';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** A validation error message, shown below the input when present. */
  error?: string;
  /** Optional helper text shown when there is no error. */
  hint?: string;
}

/**
 * A labelled text input. Forwards its ref so it plugs straight into
 * react-hook-form's `register()`.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, hint, className, id, ...rest }, ref) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="text-body font-semibold">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(
            'min-h-[48px] rounded-xl border-2 bg-surface px-3 text-body',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            error ? 'border-danger' : 'border-textMuted/30',
            className,
          )}
          {...rest}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-caption text-danger">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${fieldId}-hint`} className="text-caption text-textMuted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

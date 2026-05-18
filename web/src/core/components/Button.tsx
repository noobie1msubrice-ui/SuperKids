import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shows a spinner and disables the button while an action runs. */
  loading?: boolean;
  /** Stretches the button to its container's width. */
  fullWidth?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold ' +
  'min-h-[52px] px-6 text-body transition-colors disabled:opacity-50 ' +
  'disabled:cursor-not-allowed';

function ButtonInner({ loading, children }: Pick<ButtonProps, 'loading' | 'children'>) {
  return (
    <>
      {loading && <Spinner className="h-5 w-5" />}
      {children}
    </>
  );
}

/** The prominent call-to-action button. */
export function PrimaryButton({
  children,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        BASE,
        'bg-primary text-white hover:bg-primary/90',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      <ButtonInner loading={loading}>{children}</ButtonInner>
    </button>
  );
}

/** A lower-emphasis button for secondary actions. */
export function SecondaryButton({
  children,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        BASE,
        'border-2 border-primary bg-surface text-primary hover:bg-primary/5',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      <ButtonInner loading={loading}>{children}</ButtonInner>
    </button>
  );
}

/** A destructive-action button (delete, remove). */
export function DangerButton({
  children,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        BASE,
        'bg-danger text-white hover:bg-danger/90',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      <ButtonInner loading={loading}>{children}</ButtonInner>
    </button>
  );
}

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Spinner } from './Spinner';
import { sound } from '../utils/sound';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Shows a spinner and disables the button while an action runs. */
  loading?: boolean;
  /** Stretches the button to its container's width. */
  fullWidth?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold ' +
  'min-h-[52px] px-6 text-body transition-all duration-100 ' +
  'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ' +
  'disabled:active:scale-100';

function ButtonInner({ loading, children }: Pick<ButtonProps, 'loading' | 'children'>) {
  return (
    <>
      {loading && <Spinner className="h-5 w-5" />}
      {children}
    </>
  );
}

/** Wraps a click handler so every press gives a soft audible tick. */
function withClick(
  handler: ((e: MouseEvent<HTMLButtonElement>) => void) | undefined,
) {
  return (e: MouseEvent<HTMLButtonElement>) => {
    sound.click();
    handler?.(e);
  };
}

/** The prominent call-to-action button. */
export function PrimaryButton({
  children,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        BASE,
        'bg-gradient-to-b from-[#6E6EE8] to-primary text-white shadow-pop',
        'hover:brightness-105 active:translate-y-0.5 active:shadow-none',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      onClick={withClick(onClick)}
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
  onClick,
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
      onClick={withClick(onClick)}
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
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        BASE,
        'bg-danger text-white shadow-pop hover:brightness-105',
        'active:translate-y-0.5 active:shadow-none',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      onClick={withClick(onClick)}
      {...rest}
    >
      <ButtonInner loading={loading}>{children}</ButtonInner>
    </button>
  );
}

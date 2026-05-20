import type { ReactNode } from 'react';
import { StarIcon } from '../../../core/components/icons';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional footer link row, e.g. "Create an account". */
  footer?: ReactNode;
  /** When set, renders a back button above the title. */
  onBack?: () => void;
  /** Accessible label / text for the back button. */
  backLabel?: string;
}

/** The centred-card layout shared by every authentication screen. */
export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  onBack,
  backLabel = 'Back',
}: AuthScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-bgLight to-secondary/10 px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#7C7CEC] shadow-pop">
          <StarIcon className="h-7 w-7 text-star" />
        </span>
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-title font-extrabold text-transparent">
          Winkz
        </span>
      </div>

      <div className="animate-pop-in w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 -ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-body font-bold text-primary transition-colors hover:bg-primary/5"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </button>
        )}
        <h1 className="text-title">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-body text-textMuted">{subtitle}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>

      {footer && <div className="mt-4 text-body">{footer}</div>}
    </div>
  );
}

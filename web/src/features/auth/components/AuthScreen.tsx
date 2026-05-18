import type { ReactNode } from 'react';
import { StarIcon } from '../../../core/components/icons';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional footer link row, e.g. "Create an account". */
  footer?: ReactNode;
}

/** The centred-card layout shared by every authentication screen. */
export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bgLight px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
          <StarIcon className="h-7 w-7 text-star" />
        </span>
        <span className="text-title text-primary">Winkz</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">
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

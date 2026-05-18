import { useTranslation } from '../i18n/LanguageContext';

interface ErrorViewProps {
  /** A user-facing message; falls back to the generic error copy. */
  message?: string;
  /** Optional retry handler — renders a "Try again" button when present. */
  onRetry?: () => void;
}

/** A friendly error panel for a failed data load. */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface px-6 py-12 text-center shadow-card">
      <div className="text-5xl" aria-hidden>
        😕
      </div>
      <p className="text-section text-textMuted">
        {message ?? t('common.errorGeneric')}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-bold text-primary underline"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

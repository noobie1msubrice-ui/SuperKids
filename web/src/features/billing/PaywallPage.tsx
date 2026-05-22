import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useTranslation } from '../../core/i18n/LanguageContext';
import { LoadingView } from '../../core/components/LoadingView';
import { PrimaryButton, SecondaryButton } from '../../core/components/Button';
import { StarIcon, TrophyIcon } from '../../core/components/icons';
import {
  DEFAULT_PRICE_VND,
  effectiveStatus,
  formatVnd,
  hasAccess,
  trialDaysLeft,
} from '../../core/utils/billing';

/**
 * Self-gated paywall screen. Shown whenever a signed-in user's billing status
 * blocks access (trial ended, status expired, etc.). Renders OUTSIDE the
 * normal AppLayout — the user has no nav until they pay or contact admin.
 */
export function PaywallPage() {
  const { firebaseUser, profile, loading, logout } = useAuth();
  const { t } = useTranslation();

  if (loading) return <LoadingView fullScreen />;
  if (!firebaseUser || !profile) return <Navigate to="/role-select" replace />;
  // If they shouldn't see the paywall, send them home.
  if (hasAccess(profile)) return <Navigate to="/" replace />;

  const status = effectiveStatus(profile);
  const daysLeft = trialDaysLeft(profile);
  const price = profile.priceVnd ?? DEFAULT_PRICE_VND;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-bgLight to-secondary/10 px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f] shadow-pop">
          <TrophyIcon className="h-8 w-8 text-star" />
        </span>
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-title font-extrabold text-transparent">
          Winkz
        </span>
      </div>

      <div className="animate-pop-in w-full max-w-md rounded-2xl bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <StarIcon className="h-8 w-8" />
          </span>
        </div>

        <h1 className="text-center text-title">{t('paywall.title')}</h1>
        <p className="mt-2 text-center text-body text-textMuted">
          {status === 'trial' && daysLeft <= 0
            ? t('paywall.trialEnded')
            : status === 'expired'
              ? t('paywall.locked')
              : t('paywall.notActive')}
        </p>

        <div className="my-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
          <p className="text-caption text-textMuted">{t('paywall.priceLabel')}</p>
          <p className="mt-1 text-display font-extrabold text-primary">
            {formatVnd(price)}
          </p>
          <p className="text-caption text-textMuted">
            {t('paywall.perMonth')}
          </p>
          {profile.priceMessage && (
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-surface px-3 py-2 text-body font-semibold text-secondary">
              💬 {profile.priceMessage}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-bgLight px-4 py-3 text-caption text-textMuted">
          <p className="font-bold text-textPrimary">{t('paywall.howTo')}</p>
          <p className="mt-1">{t('paywall.howToBody')}</p>
          <p className="mt-2 break-all font-bold text-primary">{profile.email}</p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <PrimaryButton
            fullWidth
            onClick={() => {
              alert(t('paywall.comingSoon'));
            }}
          >
            {t('paywall.subscribe')}
          </PrimaryButton>
          <SecondaryButton fullWidth onClick={() => void logout()}>
            {t('paywall.signOut')}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

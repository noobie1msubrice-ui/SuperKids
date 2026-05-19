import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { homePathFor } from '../../../core/router/ProtectedRoute';
import { LoadingView } from '../../../core/components/LoadingView';
import { SecondaryButton } from '../../../core/components/Button';
import { AuthScreen } from '../components/AuthScreen';
import { useTranslation } from '../../../core/i18n/LanguageContext';

/**
 * Holding screen for a kid who has signed up but has no parent yet. The profile
 * is a live subscription, so the moment a parent links this account
 * (`parentId` appears) the kid is redirected straight to their tasks.
 */
export function ChildWaitingPage() {
  const { firebaseUser, profile, loading, logout } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <LoadingView fullScreen />;
  }
  if (!firebaseUser || !profile) {
    return <Navigate to="/role-select" replace />;
  }
  // A linked kid (or any non-child account) belongs on their real home page.
  if (profile.role !== 'child' || profile.parentId) {
    return <Navigate to={homePathFor(profile)} replace />;
  }

  return (
    <AuthScreen title={t('waiting.title')}>
      <div className="flex flex-col gap-4">
        <p className="text-body text-textMuted">{t('waiting.message')}</p>
        <p className="break-all rounded-xl bg-bgLight p-3 text-center text-body font-bold text-primary">
          {profile.email}
        </p>
        <p className="text-body text-textMuted">{t('waiting.note')}</p>
        <SecondaryButton type="button" fullWidth onClick={() => void logout()}>
          {t('waiting.signOut')}
        </SecondaryButton>
      </div>
    </AuthScreen>
  );
}

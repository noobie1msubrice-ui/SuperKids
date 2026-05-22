import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarChip } from '../components/StarChip';
import { TrophyIcon, LogoutIcon } from '../components/icons';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { homePathFor } from '../router/ProtectedRoute';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../../models/userProfile';

/**
 * The persistent app header: the Winkz logo on the left and, on the right, a
 * child's current Star balance plus a quick log-out button so anyone can sign
 * out without opening the profile page (doc 06 §3). The logo links back to the
 * role's home menu (tasks page).
 */
export function Header({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <header className="bg-surface/80 shadow-card backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
        <Link
          to={homePathFor(profile)}
          aria-label={t('nav.home')}
          className="group flex items-center gap-2 rounded-lg transition-transform hover:scale-[1.02]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f] shadow-pop transition-transform group-hover:rotate-6">
            <TrophyIcon className="h-6 w-6 text-star" />
          </span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-section font-extrabold text-transparent">
            Winkz
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {profile.role === 'child' && (
            <StarChip count={profile.starBalance ?? 0} size="lg" />
          )}
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            aria-label={t('common.logOut')}
            title={t('common.logOut')}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 py-2 text-caption font-bold text-textMuted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogoutIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{t('common.logOut')}</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title={t('common.logOut')}
        message={t('common.logOutConfirm')}
        confirmLabel={t('common.logOut')}
        cancelLabel={t('common.cancel')}
        danger
        onConfirm={() => void logout()}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  );
}

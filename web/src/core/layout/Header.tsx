import { Link } from 'react-router-dom';
import { StarChip } from '../components/StarChip';
import { StarIcon } from '../components/icons';
import { homePathFor } from '../router/ProtectedRoute';
import { useTranslation } from '../i18n/LanguageContext';
import type { UserProfile } from '../../models/userProfile';

/**
 * The persistent app header: the Winkz logo on the left and, for a child,
 * their current Star balance on the right of every page (doc 06 §3).
 * The logo links back to the role's home menu (tasks page).
 */
export function Header({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  return (
    <header className="bg-surface/80 shadow-card backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
        <Link
          to={homePathFor(profile)}
          aria-label={t('nav.home')}
          className="group flex items-center gap-2 rounded-lg transition-transform hover:scale-[1.02]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#7C7CEC] shadow-pop transition-transform group-hover:rotate-6">
            <StarIcon className="h-5 w-5 text-star" />
          </span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-section font-extrabold text-transparent">
            Winkz
          </span>
        </Link>
        {profile.role === 'child' && (
          <StarChip count={profile.starBalance ?? 0} size="lg" />
        )}
      </div>
    </header>
  );
}

import { StarChip } from '../components/StarChip';
import { StarIcon } from '../components/icons';
import type { UserProfile } from '../../models/userProfile';

/**
 * The persistent app header: the SuperKids logo on the left and, for a child,
 * their current Star balance on the right of every page (doc 06 §3).
 */
export function Header({ profile }: { profile: UserProfile }) {
  return (
    <header className="bg-surface shadow-card">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <StarIcon className="h-5 w-5 text-star" />
          </span>
          <span className="text-section font-bold text-primary">SuperKids</span>
        </div>
        {profile.role === 'child' && (
          <StarChip count={profile.starBalance ?? 0} size="lg" />
        )}
      </div>
    </header>
  );
}

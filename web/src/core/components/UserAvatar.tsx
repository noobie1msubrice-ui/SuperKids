import { clsx } from 'clsx';
import {
  ParentIcon,
  KidIcon,
  AdminIcon,
  SmileIcon,
} from './icons';
import type { UserProfile, UserRole } from '../../models/userProfile';

interface UserAvatarProps {
  profile: Pick<UserProfile, 'displayName' | 'photoUrl' | 'role'>;
  /** Optional online indicator: green dot when true, grey when false. */
  online?: boolean;
  /** Hides the status dot entirely (default false — dot is shown). */
  hideStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const ICON_SIZE: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const TINT: Record<UserRole, string> = {
  parent: 'bg-primary/15 text-primary',
  child: 'bg-secondary/15 text-secondary',
  admin: 'bg-primary/15 text-primary',
};

function RoleIcon({ role, className }: { role: UserRole; className: string }) {
  if (role === 'parent') return <ParentIcon className={className} />;
  if (role === 'child') return <KidIcon className={className} />;
  if (role === 'admin') return <AdminIcon className={className} />;
  return <SmileIcon className={className} />;
}

/**
 * Round avatar bubble — shows the user's photo, falling back to a role icon
 * on a tinted circle. An optional dot in the corner indicates online (green)
 * or offline (grey).
 */
export function UserAvatar({
  profile,
  online,
  hideStatus = false,
  size = 'sm',
  className,
}: UserAvatarProps) {
  const showDot = !hideStatus && online !== undefined;
  return (
    <div className={clsx('relative shrink-0', className)}>
      <div
        className={clsx(
          'flex items-center justify-center overflow-hidden rounded-full',
          SIZE[size],
          !profile.photoUrl && TINT[profile.role],
        )}
        aria-hidden
      >
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <RoleIcon role={profile.role} className={ICON_SIZE[size]} />
        )}
      </div>
      {showDot && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-surface',
            online ? 'bg-success' : 'bg-textMuted/60',
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

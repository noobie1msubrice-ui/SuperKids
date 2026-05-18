import { Card } from '../../../core/components/Card';
import { StarChip } from '../../../core/components/StarChip';
import type { UserProfile } from '../../../models/userProfile';

interface ChildCardProps {
  child: UserProfile;
  onClick?: () => void;
}

/** A child summary row: avatar, name, and current Star balance. */
export function ChildCard({ child, onClick }: ChildCardProps) {
  return (
    <Card onClick={onClick}>
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-title font-bold text-secondary"
          aria-hidden
        >
          {child.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="flex-1 truncate text-section">{child.displayName}</span>
        <StarChip count={child.starBalance ?? 0} />
      </div>
    </Card>
  );
}

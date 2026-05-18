import { clsx } from 'clsx';
import { StarIcon } from './icons';

interface StarChipProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StarChipProps['size']>, string> = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-body px-2.5 py-1 gap-1.5',
  lg: 'text-title px-3 py-1.5 gap-2',
};

const ICON_CLASS: Record<NonNullable<StarChipProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

/** A pill showing a Star icon and a count — the app's currency display. */
export function StarChip({ count, size = 'md', className }: StarChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-star/20 font-bold text-textPrimary',
        SIZE_CLASS[size],
        className,
      )}
      aria-label={`${count} Stars`}
    >
      <StarIcon className={clsx('text-star', ICON_CLASS[size])} />
      {count}
    </span>
  );
}

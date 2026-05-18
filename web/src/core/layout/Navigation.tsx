import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import type { UserRole } from '../../models/userProfile';
import { useTranslation } from '../i18n/LanguageContext';
import {
  TasksIcon,
  StoreIcon,
  BackpackIcon,
  FamilyIcon,
  ProfileIcon,
} from '../components/icons';

interface NavItem {
  to: string;
  labelKey: string;
  Icon: (props: { className?: string }) => ReactNode;
}

const PARENT_NAV: NavItem[] = [
  { to: '/parent/tasks', labelKey: 'nav.tasks', Icon: TasksIcon },
  { to: '/parent/store', labelKey: 'nav.store', Icon: StoreIcon },
  { to: '/parent/family', labelKey: 'nav.family', Icon: FamilyIcon },
  { to: '/parent/profile', labelKey: 'nav.profile', Icon: ProfileIcon },
];

const CHILD_NAV: NavItem[] = [
  { to: '/child/tasks', labelKey: 'nav.tasks', Icon: TasksIcon },
  { to: '/child/store', labelKey: 'nav.store', Icon: StoreIcon },
  { to: '/child/backpack', labelKey: 'nav.backpack', Icon: BackpackIcon },
  { to: '/child/profile', labelKey: 'nav.profile', Icon: ProfileIcon },
];

/**
 * Primary navigation: a horizontal tab bar on tablet/desktop, a fixed bottom
 * bar on phones (doc 06 §3).
 */
export function Navigation({ role }: { role: UserRole }) {
  const { t } = useTranslation();
  const items = role === 'parent' ? PARENT_NAV : CHILD_NAV;

  return (
    <nav
      aria-label="Primary"
      className={clsx(
        'bg-surface shadow-card',
        // phone: fixed bottom bar
        'fixed inset-x-0 bottom-0 z-30 border-t border-textMuted/10',
        // tablet/desktop: static bar under the header
        'md:static md:border-t-0',
      )}
    >
      <ul className="mx-auto flex max-w-content items-stretch justify-around md:justify-start md:gap-2 md:px-4">
        {items.map(({ to, labelKey, Icon }) => (
          <li key={to} className="flex-1 md:flex-none">
            <NavLink
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 py-2 text-caption font-semibold',
                  'md:flex-row md:gap-2 md:rounded-xl md:px-4 md:py-3 md:text-body',
                  'min-h-[56px] justify-center transition-colors',
                  isActive
                    ? 'text-primary md:bg-primary/10'
                    : 'text-textMuted hover:text-primary',
                )
              }
            >
              <Icon className="h-6 w-6" />
              {t(labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

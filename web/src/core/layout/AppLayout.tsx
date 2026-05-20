import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { BroadcastBanner } from '../components/BroadcastBanner';
import type { UserProfile } from '../../models/userProfile';

/**
 * The signed-in app shell: header, primary navigation, and the routed page in
 * a centred, max-width container. Bottom padding leaves room for the fixed
 * bottom nav bar on phones. Kid pages get a warm sunset gradient so the kid
 * experience feels like its own place; parent pages stay quieter.
 */
export function AppLayout({ profile }: { profile: UserProfile }) {
  const isKid = profile.role === 'child';
  return (
    <div
      className={clsx(
        'flex min-h-screen flex-col',
        isKid
          ? 'bg-gradient-to-br from-secondary/15 via-bgLight to-primary/15'
          : 'bg-gradient-to-b from-bgLight to-primary/5',
      )}
    >
      <BroadcastBanner />
      <Header profile={profile} />
      <Navigation role={profile.role} />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 pb-28 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}

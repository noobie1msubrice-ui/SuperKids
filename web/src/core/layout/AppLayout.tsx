import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';
import type { UserProfile } from '../../models/userProfile';

/**
 * The signed-in app shell: header, primary navigation, and the routed page in
 * a centred, max-width container. Bottom padding leaves room for the fixed
 * bottom nav bar on phones.
 */
export function AppLayout({ profile }: { profile: UserProfile }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header profile={profile} />
      <Navigation role={profile.role} />
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 pb-28 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layout/AppLayout';
import { LoadingView } from '../components/LoadingView';
import type { UserProfile, UserRole } from '../../models/userProfile';

/**
 * Path of the home page for a profile. A kid who has not yet been linked to a
 * parent has no tasks or store, so they land on the waiting screen instead.
 */
export function homePathFor(profile: UserProfile): string {
  if (profile.role === 'admin') return '/admin';
  if (profile.role === 'parent') return '/parent/tasks';
  return profile.parentId ? '/child/tasks' : '/child/waiting';
}

/**
 * Guards a role's section of the app. Redirects a signed-out user to the role
 * picker, and a user whose profile role does not match this section to their
 * own home — the profile role is always authoritative (doc 05 §1).
 */
export function ProtectedRoute({ role }: { role: UserRole }) {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingView fullScreen />;
  }
  if (!firebaseUser || !profile) {
    return <Navigate to="/role-select" replace />;
  }
  if (profile.role !== role) {
    return <Navigate to={homePathFor(profile)} replace />;
  }
  // An unlinked kid cannot use the child section yet — hold them on the
  // waiting screen until a parent claims their account.
  if (role === 'child' && !profile.parentId) {
    return <Navigate to="/child/waiting" replace />;
  }
  // The admin panel brings its own chrome — no parent/child header & nav.
  if (role === 'admin') {
    return <Outlet />;
  }
  return <AppLayout profile={profile} />;
}

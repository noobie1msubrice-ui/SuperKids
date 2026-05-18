import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layout/AppLayout';
import { LoadingView } from '../components/LoadingView';
import type { UserRole } from '../../models/userProfile';

/** Path of the home page for each role. */
export function homePathFor(role: UserRole): string {
  if (role === 'admin') return '/admin';
  return role === 'parent' ? '/parent/tasks' : '/child/tasks';
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
    return <Navigate to={homePathFor(profile.role)} replace />;
  }
  // The admin panel brings its own chrome — no parent/child header & nav.
  if (role === 'admin') {
    return <Outlet />;
  }
  return <AppLayout profile={profile} />;
}

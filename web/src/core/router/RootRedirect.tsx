import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components/LoadingView';
import { homePathFor } from './ProtectedRoute';

/**
 * The `/` route. Sends a signed-out user to the role picker and a signed-in
 * user to the home page that matches their profile role.
 */
export function RootRedirect() {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingView fullScreen />;
  }
  if (!firebaseUser || !profile) {
    return <Navigate to="/role-select" replace />;
  }
  return <Navigate to={homePathFor(profile.role)} replace />;
}

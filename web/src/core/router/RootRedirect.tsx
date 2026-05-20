import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components/LoadingView';
import { homePathFor } from './ProtectedRoute';
import { hasPickedLanguage } from '../i18n/LanguageContext';

/**
 * The `/` route. First-time visitors see the language picker; returning
 * signed-out users see the role picker; signed-in users go to their home.
 */
export function RootRedirect() {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingView fullScreen />;
  }
  if (!firebaseUser || !profile) {
    return (
      <Navigate to={hasPickedLanguage() ? '/role-select' : '/language'} replace />
    );
  }
  return <Navigate to={homePathFor(profile)} replace />;
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../core/services/authService';
import { homePathFor } from '../../../core/router/ProtectedRoute';
import { COPY } from '../../../core/utils/constants';
import type { UserRole } from '../../../models/userProfile';

interface RoleLogin {
  submit: (email: string, password: string) => Promise<void>;
  pending: boolean;
  error: string | null;
}

/**
 * Logs a user in and verifies their profile role matches the path they came
 * from. The login-screen role choice is only a hint — if it disagrees with the
 * authoritative profile role, the user is signed back out (doc 05 §1).
 */
export function useRoleLogin(expectedRole: UserRole): RoleLogin {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string): Promise<void> {
    setPending(true);
    setError(null);
    try {
      const uid = await authService.login(email, password);
      const profile = await authService.loadProfile(uid);

      if (!profile || profile.role !== expectedRole) {
        await authService.logout();
        const wrongRoleMessage =
          expectedRole === 'child'
            ? COPY.childLoginError
            : expectedRole === 'admin'
              ? 'That account is not an admin account.'
              : 'That account is not a parent account.';
        setError(wrongRoleMessage);
        return;
      }
      navigate(homePathFor(profile), { replace: true });
    } catch (err) {
      setError((err as Error).message || COPY.genericError);
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, error };
}

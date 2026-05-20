import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onSnapshot } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import type { UserProfile } from '../../models/userProfile';

/** How often a signed-in client heartbeats lastActiveAt (ms). */
const HEARTBEAT_MS = 30_000;

interface AuthContextValue {
  /** The raw Firebase Auth user, or null when signed out. */
  firebaseUser: User | null;
  /** The Firestore profile — kept live, so a child's Star balance updates. */
  profile: UserProfile | null;
  /** True until the first auth state and profile have resolved. */
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides the signed-in user and profile to the whole app. The profile is a
 * live `onSnapshot` subscription, so a child's `starBalance` (written by Cloud
 * Functions) propagates to the header and pages without a refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = authService.onAuthChange((user) => {
      unsubProfile?.();
      unsubProfile = null;

      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubProfile = onSnapshot(
        firestoreService.userDocRef(user.uid),
        (snap) => {
          setProfile(snap.exists() ? snap.data() : null);
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  // Heartbeat lastActiveAt while signed in so the admin panel can show
  // online/offline. We write immediately and then every 30s; failures are
  // swallowed (a network blip shouldn't crash the session).
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const ping = (): void => {
      firestoreService.updateLastActive(uid).catch(() => {});
    };
    ping();
    const interval = window.setInterval(ping, HEARTBEAT_MS);
    return () => window.clearInterval(interval);
  }, [firebaseUser]);

  const logout = () => authService.logout();

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}

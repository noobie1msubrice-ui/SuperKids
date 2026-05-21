import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ADMIN_EMAILS, COLLECTIONS } from '../utils/constants';
import { isFreeEmail } from '../utils/billing';
import {
  userProfileConverter,
  type UserProfile,
} from '../../models/userProfile';
import { AppError } from './functionsService';

/** Trial-window billing fields applied to a new account at signup. */
function trialBilling(email: string): {
  billingStatus: 'free' | 'trial';
  trialEndsAt?: Timestamp;
} {
  if (isFreeEmail(email)) return { billingStatus: 'free' };
  const ends = new Date();
  ends.setDate(ends.getDate() + 30);
  return { billingStatus: 'trial', trialEndsAt: Timestamp.fromDate(ends) };
}

/** Maps a Firebase Auth error code to a friendly message. */
function mapAuthError(err: unknown): AppError {
  const code = (err as { code?: string }).code ?? 'unknown';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'That email is already in use.',
    'auth/invalid-email': 'That email address looks wrong.',
    'auth/weak-password': 'Please choose a stronger password.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/user-not-found': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'You need internet to sign in.',
  };
  return new AppError(code, messages[code] ?? 'Could not sign in. Try again.');
}

export const authService = {
  /** Subscribes to auth-state changes; returns an unsubscribe function. */
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  /** Loads the Firestore profile for a UID, or null if it does not exist. */
  async loadProfile(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, COLLECTIONS.users, uid).withConverter(
      userProfileConverter,
    );
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  /** Creates a parent Auth user and its `role: 'parent'` profile document. */
  async signUpParent(
    displayName: string,
    email: string,
    password: string,
  ): Promise<void> {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName });
      await setDoc(doc(db, COLLECTIONS.users, user.uid), {
        role: 'parent',
        displayName,
        email,
        createdAt: serverTimestamp(),
        ...trialBilling(email),
      });
    } catch (err) {
      throw mapAuthError(err);
    }
  },

  /**
   * Creates a child Auth user and an *unlinked* `role: 'child'` profile — no
   * `parentId`, no `starBalance`. A kid uses this to self-register; a parent
   * later claims them via the linkChildToParent function. Firestore rules
   * reject any `parentId`/`starBalance` written here.
   */
  async signUpChild(
    displayName: string,
    email: string,
    password: string,
  ): Promise<void> {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(user, { displayName });
      await setDoc(doc(db, COLLECTIONS.users, user.uid), {
        role: 'child',
        displayName,
        email,
        createdAt: serverTimestamp(),
        ...trialBilling(email),
      });
    } catch (err) {
      throw mapAuthError(err);
    }
  },

  /**
   * Creates an admin Auth user and its `role: 'admin'` profile. Allowed only
   * for the email allow-list; Firestore rules enforce the same restriction.
   */
  async signUpAdmin(
    displayName: string,
    email: string,
    password: string,
  ): Promise<void> {
    const normalized = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(normalized as (typeof ADMIN_EMAILS)[number])) {
      throw new AppError(
        'admin/not-allowed',
        'This email is not authorized for admin access.',
      );
    }
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        normalized,
        password,
      );
      await updateProfile(user, { displayName });
      await setDoc(doc(db, COLLECTIONS.users, user.uid), {
        role: 'admin',
        displayName,
        email: normalized,
        createdAt: serverTimestamp(),
        billingStatus: 'free',
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw mapAuthError(err);
    }
  },

  /** Signs in with email and password; returns the signed-in user's UID. */
  async login(email: string, password: string): Promise<string> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user.uid;
    } catch (err) {
      throw mapAuthError(err);
    }
  },

  /** Signs the current user out. */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Changes the signed-in user's password. Re-authenticates with the current
   * password first, as Firebase requires recent credentials for this change.
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new AppError('auth/no-user', 'You need to be signed in.');
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err) {
      throw mapAuthError(err);
    }
  },
};

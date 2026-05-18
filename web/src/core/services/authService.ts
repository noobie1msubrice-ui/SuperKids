import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../utils/constants';
import {
  userProfileConverter,
  type UserProfile,
} from '../../models/userProfile';
import { AppError } from './functionsService';

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
      });
    } catch (err) {
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
};

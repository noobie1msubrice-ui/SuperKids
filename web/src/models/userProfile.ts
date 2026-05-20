import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

export type UserRole = 'parent' | 'child' | 'admin';

/** One profile per account; the document ID equals the Firebase Auth UID. */
export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  email: string;
  createdAt: Timestamp | null;
  photoUrl?: string;
  /** Heartbeat timestamp — drives the online/offline dot in the admin panel. */
  lastActiveAt?: Timestamp;
  // Child-only fields.
  parentId?: string;
  starBalance?: number;
  fcmToken?: string;
}

export const userProfileConverter = idConverter<UserProfile>();

export function isParent(profile: UserProfile): boolean {
  return profile.role === 'parent';
}

export function isChild(profile: UserProfile): boolean {
  return profile.role === 'child';
}

export function isAdmin(profile: UserProfile): boolean {
  return profile.role === 'admin';
}

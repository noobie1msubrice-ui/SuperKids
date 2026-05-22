import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

export type UserRole = 'parent' | 'child' | 'admin';

/**
 * Billing status:
 *  - `free`   → admin comp; never paywalled.
 *  - `trial`  → using the 30-day free trial; paywalled once trialEndsAt passes.
 *  - `paid`   → active paid subscription; paywalled once subscriptionEndsAt passes.
 *  - `expired`→ explicitly locked out by admin.
 */
export type BillingStatus = 'free' | 'trial' | 'paid' | 'expired';

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
  // Billing — written by admin function and the signup path.
  billingStatus?: BillingStatus;
  trialEndsAt?: Timestamp;
  subscriptionEndsAt?: Timestamp;
  /** Per-user price override (VND). When unset, the default price is used. */
  priceVnd?: number;
  /** Optional message shown next to the price on this user's paywall. */
  priceMessage?: string;
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

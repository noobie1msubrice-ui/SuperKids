import type { UserProfile, BillingStatus } from '../../models/userProfile';

/** Default price shown on the paywall when no per-user override exists. */
export const DEFAULT_PRICE_VND = 200_000;

/**
 * Emails that bypass billing entirely. New accounts signing up with one of
 * these emails are auto-set to `billingStatus: 'free'`; existing ones are
 * backfilled to `'free'` by the migration script. Admins can also mark any
 * other user as `'free'` in the admin panel.
 */
export const FREE_EMAILS = [
  'lamlam0319@gmail.com',
  'noobie1msubrice@gmail.com',
  'robotdangkhoa@gmail.com',
  'infinitelearningthebest@gmail.com',
] as const;

export function isFreeEmail(email: string): boolean {
  const normalised = email.trim().toLowerCase();
  return (FREE_EMAILS as readonly string[]).includes(normalised);
}

/** Resolves the effective billing status for a profile that may be missing fields. */
export function effectiveStatus(profile: UserProfile): BillingStatus {
  // Admins are always free — they don't need to pay to use their own panel.
  if (profile.role === 'admin') return 'free';
  if (profile.billingStatus) return profile.billingStatus;
  // Default for legacy users with no field yet: treat as trial.
  return 'trial';
}

/**
 * True when the user can use the app (billing-wise). Paywall fires when this
 * returns false.
 */
export function hasAccess(profile: UserProfile, now: number = Date.now()): boolean {
  const status = effectiveStatus(profile);
  if (status === 'free') return true;
  if (status === 'expired') return false;
  if (status === 'trial') {
    const ends = profile.trialEndsAt?.toMillis() ?? 0;
    return ends === 0 || ends > now;
  }
  if (status === 'paid') {
    const ends = profile.subscriptionEndsAt?.toMillis() ?? 0;
    return ends === 0 || ends > now;
  }
  return false;
}

/** Days remaining on the user's trial, rounded down. Negative means expired. */
export function trialDaysLeft(profile: UserProfile, now: number = Date.now()): number {
  const ends = profile.trialEndsAt?.toMillis();
  if (!ends) return 0;
  return Math.floor((ends - now) / (24 * 60 * 60 * 1000));
}

/** Formats a VND amount like `200.000 ₫` (Vietnamese number format). */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

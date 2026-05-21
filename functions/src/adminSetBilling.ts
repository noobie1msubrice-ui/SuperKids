import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireAdmin } from './lib/guards';
import { validateString } from './lib/validation';
import { trialEndsInDays } from './lib/billing';

type BillingStatus = 'free' | 'trial' | 'paid' | 'expired';
const VALID_STATUSES: BillingStatus[] = ['free', 'trial', 'paid', 'expired'];

interface SetBillingRequest {
  uid: string;
  billingStatus?: BillingStatus;
  /** When set, resets the trial to N days from now (and forces status=trial). */
  resetTrialDays?: number;
  /**
   * Per-user price override (VND). Pass null or 0 to clear the override and
   * fall back to the default price.
   */
  priceVnd?: number | null;
}

/**
 * Admin-only: update a user's billing fields. Used by the Admin panel's
 * Billing controls (toggle Free / set custom price / restart trial).
 */
export const adminSetBilling = onCall<SetBillingRequest>(async (request) => {
  await requireAdmin(request);
  const uid = validateString(request.data?.uid, 'User', 1, 128);

  const update: Record<string, unknown> = {};

  if (request.data.billingStatus) {
    if (!VALID_STATUSES.includes(request.data.billingStatus)) {
      throw new HttpsError('invalid-argument', 'Invalid billing status.');
    }
    update.billingStatus = request.data.billingStatus;
  }

  if (
    typeof request.data.resetTrialDays === 'number' &&
    request.data.resetTrialDays > 0
  ) {
    update.billingStatus = 'trial';
    update.trialEndsAt = trialEndsInDays(request.data.resetTrialDays);
  }

  if (request.data.priceVnd === null || request.data.priceVnd === 0) {
    update.priceVnd = FieldValue.delete();
  } else if (
    typeof request.data.priceVnd === 'number' &&
    request.data.priceVnd > 0
  ) {
    update.priceVnd = Math.round(request.data.priceVnd);
  }

  // If admin sets status=free, the trial/sub end dates become irrelevant.
  if (update.billingStatus === 'free') {
    update.trialEndsAt = FieldValue.delete();
    update.subscriptionEndsAt = FieldValue.delete();
  }

  if (Object.keys(update).length === 0) {
    throw new HttpsError('invalid-argument', 'Nothing to update.');
  }

  // The expired status takes immediate effect by zeroing the end-dates so
  // hasAccess() returns false even if status field is somehow ignored.
  if (update.billingStatus === 'expired') {
    update.trialEndsAt = Timestamp.fromMillis(0);
    update.subscriptionEndsAt = Timestamp.fromMillis(0);
  }

  await db.collection('users').doc(uid).update(update);
  return { success: true as const };
});

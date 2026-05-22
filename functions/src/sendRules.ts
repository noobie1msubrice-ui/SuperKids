import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireParent } from './lib/guards';
import { validateString } from './lib/validation';

interface SendRulesRequest {
  text: string;
}

/**
 * Parent publishes a new ruleset to their kids. Rejected when the current
 * ruleset is `active` and has not yet expired (rules are locked for 7 days
 * once all kids accept). Resets acceptedBy and bumps status to `pending`.
 * Caller: a parent.
 */
export const sendRules = onCall<SendRulesRequest>(async (request) => {
  const parentUid = await requireParent(request);
  const text = validateString(request.data?.text, 'Rules', 1, 2000);

  const ref = db.collection('rulesets').doc(parentUid);
  const snap = await ref.get();
  if (snap.exists) {
    const data = snap.data() as { status?: string; expiresAt?: Timestamp };
    if (
      data.status === 'active' &&
      data.expiresAt &&
      data.expiresAt.toMillis() > Date.now()
    ) {
      throw new HttpsError(
        'failed-precondition',
        'These rules are locked until they expire. You cannot change them yet.',
      );
    }
  }

  // Full overwrite (no merge) — any leftover deniedBy / lockedAt / expiresAt
  // from a previous round is dropped simply by not including it.
  await ref.set({
    parentId: parentUid,
    text,
    status: 'pending',
    sentAt: FieldValue.serverTimestamp(),
    acceptedBy: [],
  });

  return { success: true as const };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireChild } from './lib/guards';

interface RespondRequest {
  accept: boolean;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Kid accepts or denies the current ruleset. Accepting adds the kid's UID to
 * `acceptedBy`; once every child of the family has accepted, the ruleset
 * transitions to `active` for 7 days. Denying sets `status: 'denied'` so the
 * parent can write a new one.
 * Caller: a child.
 */
export const respondToRule = onCall<RespondRequest>(async (request) => {
  const { uid: kidUid, user: kid } = await requireChild(request);
  if (!kid.parentId) {
    throw new HttpsError(
      'failed-precondition',
      "You're not linked to a parent yet.",
    );
  }
  if (typeof request.data?.accept !== 'boolean') {
    throw new HttpsError('invalid-argument', 'accept must be a boolean.');
  }

  const ref = db.collection('rulesets').doc(kid.parentId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'No rules to respond to.');
  }
  const data = snap.data() as {
    status?: string;
    acceptedBy?: string[];
  };
  if (data.status !== 'pending') {
    throw new HttpsError(
      'failed-precondition',
      'These rules are not waiting for a response.',
    );
  }

  if (!request.data.accept) {
    await ref.update({ status: 'denied', deniedBy: kidUid });
    return { success: true as const, status: 'denied' as const };
  }

  // Accept path: add this kid; if every kid in the family has now accepted,
  // lock the ruleset for 7 days.
  const alreadyAccepted = data.acceptedBy ?? []
  if (alreadyAccepted.includes(kidUid)) {
    return { success: true as const, status: 'pending' as const };
  }
  const acceptedBy = [...alreadyAccepted, kidUid]

  const siblings = await db
    .collection('users')
    .where('parentId', '==', kid.parentId)
    .where('role', '==', 'child')
    .get();
  const allKidUids = siblings.docs.map((d) => d.id);
  const allAccepted = allKidUids.every((id) => acceptedBy.includes(id));

  if (allAccepted) {
    const now = Date.now();
    await ref.update({
      acceptedBy,
      status: 'active',
      lockedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + SEVEN_DAYS_MS),
    });
    return { success: true as const, status: 'active' as const };
  }

  await ref.update({ acceptedBy });
  return { success: true as const, status: 'pending' as const };
});

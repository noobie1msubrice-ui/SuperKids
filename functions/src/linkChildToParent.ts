import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { auth, db } from './lib/admin';
import { requireParent } from './lib/guards';
import { validateEmail } from './lib/validation';

interface LinkChildRequest {
  email: string;
}

/**
 * Links a self-registered child account to the calling parent's family.
 * The kid signs up on their own (an unlinked `role: 'child'` profile with no
 * `parentId`); the parent then enters the kid's sign-up email here to claim
 * them. Initialises `starBalance` so the kid is a complete family member.
 * Caller: an authenticated parent.
 */
export const linkChildToParent = onCall<LinkChildRequest>(async (request) => {
  const parentUid = await requireParent(request);
  const email = validateEmail(request.data?.email);

  // Resolve the email to an Auth user. Auth normalises email casing, so this
  // matches regardless of how the kid or parent typed it.
  let childUid: string;
  try {
    const userRecord = await auth.getUserByEmail(email);
    childUid = userRecord.uid;
  } catch {
    throw new HttpsError('not-found', 'No kid account uses that email.');
  }

  const childSnap = await db.collection('users').doc(childUid).get();
  if (!childSnap.exists) {
    throw new HttpsError('not-found', 'No kid account uses that email.');
  }
  const child = childSnap.data() as { role?: string; parentId?: string };

  if (child.role !== 'child') {
    throw new HttpsError(
      'failed-precondition',
      'That email belongs to a parent account, not a kid account.',
    );
  }
  if (child.parentId) {
    if (child.parentId === parentUid) {
      throw new HttpsError('already-exists', 'That kid is already in your family.');
    }
    throw new HttpsError(
      'failed-precondition',
      'That kid is already part of another family.',
    );
  }

  try {
    await db.collection('users').doc(childUid).update({
      parentId: parentUid,
      starBalance: 0,
    });
  } catch (err) {
    logger.error('linkChildToParent: profile update failed', err);
    throw new HttpsError('internal', 'Could not link the account. Try again.');
  }

  const displayName = childSnap.get('displayName') ?? '';
  return { childUid, displayName };
});

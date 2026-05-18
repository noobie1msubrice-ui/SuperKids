import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { auth, db } from './lib/admin';
import { requireParent } from './lib/guards';
import {
  validateString,
  validateEmail,
  validatePassword,
} from './lib/validation';

interface CreateChildRequest {
  displayName: string;
  email: string;
  password: string;
}

/**
 * Creates a child Auth user and links it to the calling parent.
 * Caller: an authenticated parent.
 */
export const createChildAccount = onCall<CreateChildRequest>(async (request) => {
  const parentUid = await requireParent(request);

  const displayName = validateString(request.data?.displayName, 'Name', 1, 40);
  const email = validateEmail(request.data?.email);
  const password = validatePassword(request.data?.password);

  // Step 1 — create the Auth user.
  let childUid: string;
  try {
    const childUser = await auth.createUser({ email, password, displayName });
    childUid = childUser.uid;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'That email is already in use.');
    }
    logger.error('createChildAccount: auth.createUser failed', err);
    throw new HttpsError('internal', 'Could not create the account. Try again.');
  }

  // Step 2 — create the profile document. Roll back the Auth user if this fails.
  try {
    await db.collection('users').doc(childUid).set({
      role: 'child',
      displayName,
      email,
      parentId: parentUid,
      starBalance: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    logger.error('createChildAccount: profile write failed, rolling back', err);
    await auth.deleteUser(childUid).catch((rollbackErr) => {
      logger.error('createChildAccount: rollback also failed', rollbackErr);
    });
    throw new HttpsError('internal', 'Could not create the account. Try again.');
  }

  return { childUid };
});

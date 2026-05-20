import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { auth } from './lib/admin';
import { requireAdmin } from './lib/guards';
import { validateString } from './lib/validation';

interface ImpersonateRequest {
  uid: string;
}

/**
 * Mints a Firebase Auth custom token for `uid` so an admin can sign in *as*
 * that account from the admin panel ("Join account"). Sign-in fully replaces
 * the admin's session — to return, the admin logs out and signs back in.
 * Caller: an admin.
 */
export const impersonateUser = onCall<ImpersonateRequest>(async (request) => {
  const adminUid = await requireAdmin(request);
  const uid = validateString(request.data?.uid, 'User', 1, 128);

  if (uid === adminUid) {
    throw new HttpsError(
      'failed-precondition',
      "You're already signed in as that account.",
    );
  }

  let token: string;
  try {
    token = await auth.createCustomToken(uid);
  } catch (err) {
    logger.error('impersonateUser: createCustomToken failed', err);
    throw new HttpsError('internal', 'Could not create the sign-in token.');
  }

  logger.info('impersonateUser', { adminUid, targetUid: uid });
  return { token };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { auth } from './lib/admin';
import { requireAdmin } from './lib/guards';
import { validateString } from './lib/validation';

interface ImpersonateRequest {
  uid: string;
  /** Origin to embed in the sign-in link (typically window.location.origin). */
  continueUrl: string;
}

/**
 * Admin "Join account": instead of minting a custom token (which needs the
 * runtime SA to have `iam.serviceAccounts.signBlob`, a fiddly IAM grant),
 * we generate a one-time email-link sign-in URL via the Identity Toolkit.
 * This path uses only standard Firebase Admin REST permissions, so it works
 * without any IAM role tweaking.
 * The client then calls `signInWithEmailLink(auth, email, link)` directly —
 * no email is actually sent.
 * Caller: an admin.
 */
export const impersonateUser = onCall<ImpersonateRequest>(async (request) => {
  const adminUid = await requireAdmin(request);
  const uid = validateString(request.data?.uid, 'User', 1, 128);
  const continueUrl = validateString(
    request.data?.continueUrl,
    'continueUrl',
    1,
    500,
  );

  if (uid === adminUid) {
    throw new HttpsError(
      'failed-precondition',
      "You're already signed in as that account.",
    );
  }

  // Look up the target user's email — the link is keyed on it.
  let email: string;
  try {
    const record = await auth.getUser(uid);
    if (!record.email) {
      throw new HttpsError(
        'failed-precondition',
        'That account has no email on file.',
      );
    }
    email = record.email;
  } catch (err: unknown) {
    if (err instanceof HttpsError) throw err;
    const code = (err as { code?: string }).code;
    if (code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'That account no longer exists.');
    }
    logger.error('impersonateUser: getUser failed', err);
    throw new HttpsError('internal', 'Could not load the target account.');
  }

  // Generate the one-time sign-in link.
  let link: string;
  try {
    link = await auth.generateSignInWithEmailLink(email, {
      url: continueUrl,
      handleCodeInApp: true,
    });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/operation-not-allowed') {
      throw new HttpsError(
        'failed-precondition',
        'Enable "Email link (passwordless sign-in)" in Firebase Console → Authentication → Sign-in method → Email/Password.',
      );
    }
    logger.error('impersonateUser: generateSignInWithEmailLink failed', err);
    throw new HttpsError('internal', 'Could not create the sign-in link.');
  }

  logger.info('impersonateUser', { adminUid, targetUid: uid });
  return { email, link };
});

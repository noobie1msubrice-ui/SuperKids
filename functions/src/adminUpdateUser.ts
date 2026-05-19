import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { auth, db } from './lib/admin';
import { requireAdmin } from './lib/guards';
import {
  validateString,
  validateOptionalString,
  validateEmail,
  validatePassword,
} from './lib/validation';

interface AdminUpdateUserRequest {
  uid: string;
  displayName?: string;
  email?: string;
  newPassword?: string;
}

/**
 * Lets an admin edit any account: change the display name, the login email,
 * and/or reset the password. Updates both the Auth record and the Firestore
 * profile so the two never drift apart.
 * Caller: an admin.
 */
export const adminUpdateUser = onCall<AdminUpdateUserRequest>(async (request) => {
  await requireAdmin(request);

  const uid = validateString(request.data?.uid, 'User', 1, 128);
  const displayName = validateOptionalString(request.data?.displayName, 'Name', 40);
  const hasEmail =
    request.data?.email !== undefined && request.data?.email !== '';
  const hasPassword =
    request.data?.newPassword !== undefined && request.data?.newPassword !== '';

  if (!displayName && !hasEmail && !hasPassword) {
    throw new HttpsError('invalid-argument', 'Nothing to update.');
  }

  const authUpdate: { displayName?: string; email?: string; password?: string } = {};
  const docUpdate: { displayName?: string; email?: string } = {};

  if (displayName) {
    authUpdate.displayName = displayName;
    docUpdate.displayName = displayName;
  }
  if (hasEmail) {
    const email = validateEmail(request.data.email);
    authUpdate.email = email;
    docUpdate.email = email;
  }
  if (hasPassword) {
    authUpdate.password = validatePassword(request.data.newPassword);
  }

  try {
    await auth.updateUser(uid, authUpdate);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'That email is already in use.');
    }
    if (code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'That account no longer exists.');
    }
    logger.error('adminUpdateUser: auth.updateUser failed', err);
    throw new HttpsError('internal', 'Could not update the account. Try again.');
  }

  if (Object.keys(docUpdate).length > 0) {
    await db.collection('users').doc(uid).update(docUpdate);
  }

  return { success: true as const };
});

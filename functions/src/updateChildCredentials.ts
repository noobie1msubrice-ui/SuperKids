import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth, db } from './lib/admin';
import { requireParent, requireOwnedChild } from './lib/guards';
import {
  validateString,
  validatePassword,
  validateEmail,
} from './lib/validation';

interface UpdateChildRequest {
  childUid: string;
  displayName?: string;
  newPassword?: string;
  newEmail?: string;
}

/**
 * Lets a parent rename a child, reset the child's password, or change the
 * child's sign-in email. Caller: the parent who owns the child.
 */
export const updateChildCredentials = onCall<UpdateChildRequest>(
  async (request) => {
    const parentUid = await requireParent(request);

    const childUid = validateString(request.data?.childUid, 'Child', 1, 128);
    await requireOwnedChild(parentUid, childUid);

    const hasName =
      request.data?.displayName !== undefined && request.data?.displayName !== '';
    const hasPassword =
      request.data?.newPassword !== undefined && request.data?.newPassword !== '';
    const hasEmail =
      request.data?.newEmail !== undefined && request.data?.newEmail !== '';

    if (!hasName && !hasPassword && !hasEmail) {
      throw new HttpsError(
        'invalid-argument',
        'Provide a new name, email, or password.',
      );
    }

    if (hasName) {
      const displayName = validateString(request.data.displayName, 'Name', 1, 40);
      await auth.updateUser(childUid, { displayName });
      await db.collection('users').doc(childUid).update({ displayName });
    }

    if (hasEmail) {
      const newEmail = validateEmail(request.data.newEmail);
      try {
        await auth.updateUser(childUid, { email: newEmail });
      } catch (err) {
        if ((err as { code?: string }).code === 'auth/email-already-exists') {
          throw new HttpsError('already-exists', 'That email is already in use.');
        }
        throw err;
      }
      await db.collection('users').doc(childUid).update({ email: newEmail });
    }

    if (hasPassword) {
      const newPassword = validatePassword(request.data.newPassword);
      await auth.updateUser(childUid, { password: newPassword });
    }

    return { success: true };
  },
);

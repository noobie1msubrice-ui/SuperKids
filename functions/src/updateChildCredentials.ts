import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth, db } from './lib/admin';
import { requireParent, requireOwnedChild } from './lib/guards';
import { validateString, validatePassword } from './lib/validation';

interface UpdateChildRequest {
  childUid: string;
  displayName?: string;
  newPassword?: string;
}

/**
 * Lets a parent rename a child or reset the child's password.
 * Caller: the parent who owns the child.
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

    if (!hasName && !hasPassword) {
      throw new HttpsError(
        'invalid-argument',
        'Provide a new name or a new password.',
      );
    }

    if (hasName) {
      const displayName = validateString(request.data.displayName, 'Name', 1, 40);
      await auth.updateUser(childUid, { displayName });
      await db.collection('users').doc(childUid).update({ displayName });
    }

    if (hasPassword) {
      const newPassword = validatePassword(request.data.newPassword);
      await auth.updateUser(childUid, { password: newPassword });
    }

    return { success: true };
  },
);

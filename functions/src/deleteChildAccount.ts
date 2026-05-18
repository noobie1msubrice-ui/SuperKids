import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { auth, db } from './lib/admin';
import { requireParent, requireOwnedChild } from './lib/guards';
import { validateString } from './lib/validation';

interface DeleteChildRequest {
  childUid: string;
}

/** Deletes every document in a query, in batches of 400. */
async function deleteQuery(
  query: FirebaseFirestore.Query,
): Promise<void> {
  const snap = await query.limit(400).get();
  if (snap.empty) {
    return;
  }
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  if (snap.size === 400) {
    await deleteQuery(query); // more remain
  }
}

/**
 * Removes a child and all of their data: tasks, backpack items, the ledger
 * subcollection, the profile document, and the Auth user.
 * Parent-owned store items are intentionally left untouched.
 * Caller: the parent who owns the child.
 */
export const deleteChildAccount = onCall<DeleteChildRequest>(async (request) => {
  const parentUid = await requireParent(request);

  const childUid = validateString(request.data?.childUid, 'Child', 1, 128);
  await requireOwnedChild(parentUid, childUid);

  await deleteQuery(db.collection('tasks').where('childId', '==', childUid));
  await deleteQuery(
    db.collection('backpackItems').where('childId', '==', childUid),
  );
  await deleteQuery(db.collection('users').doc(childUid).collection('transactions'));
  await db.collection('users').doc(childUid).delete();

  try {
    await auth.deleteUser(childUid);
  } catch (err) {
    // The profile is already gone; log but do not fail the call.
    logger.warn('deleteChildAccount: auth user already removed or missing', err);
  }

  return { success: true };
});

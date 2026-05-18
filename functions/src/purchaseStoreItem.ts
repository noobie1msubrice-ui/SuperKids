import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireChild } from './lib/guards';
import { validateString } from './lib/validation';

interface PurchaseRequest {
  storeItemId: string;
}

/**
 * Lets a child buy a store item with Stars, atomically.
 * Caller: an authenticated child.
 */
export const purchaseStoreItem = onCall<PurchaseRequest>(async (request) => {
  const { uid: childUid, user: child } = await requireChild(request);
  const storeItemId = validateString(request.data?.storeItemId, 'Item', 1, 128);

  const backpackItemRef = db.collection('backpackItems').doc();

  const newBalance = await db.runTransaction(async (tx) => {
    const childRef = db.collection('users').doc(childUid);
    const childSnap = await tx.get(childRef);
    const childData = childSnap.data() as { starBalance: number };

    const itemRef = db.collection('storeItems').doc(storeItemId);
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists) {
      throw new HttpsError('not-found', 'That item no longer exists.');
    }
    const item = itemSnap.data() as {
      parentId: string;
      name: string;
      description?: string;
      imageUrl?: string;
      starPrice: number;
      isActive: boolean;
    };

    if (!item.isActive) {
      throw new HttpsError('failed-precondition', "This item isn't available.");
    }
    if (item.parentId !== child.parentId) {
      throw new HttpsError('permission-denied', "This item isn't in your store.");
    }
    if (childData.starBalance < item.starPrice) {
      throw new HttpsError(
        'failed-precondition',
        "You don't have enough Stars yet.",
      );
    }

    const balanceAfter = childData.starBalance - item.starPrice;

    tx.update(childRef, { starBalance: balanceAfter });
    tx.set(backpackItemRef, {
      childId: childUid,
      parentId: child.parentId,
      storeItemId,
      name: item.name,
      ...(item.description !== undefined && { description: item.description }),
      ...(item.imageUrl !== undefined && { imageUrl: item.imageUrl }),
      pricePaid: item.starPrice,
      status: 'owned',
      purchasedAt: FieldValue.serverTimestamp(),
    });
    tx.set(childRef.collection('transactions').doc(), {
      type: 'spend',
      amount: item.starPrice,
      reason: `Bought: ${item.name}`,
      refType: 'purchase',
      refId: backpackItemRef.id,
      balanceAfter,
      createdAt: FieldValue.serverTimestamp(),
    });

    return balanceAfter;
  });

  return { success: true, newBalance, backpackItemId: backpackItemRef.id };
});

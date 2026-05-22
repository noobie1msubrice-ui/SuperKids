import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Query,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../utils/constants';
import { userProfileConverter, type UserProfile } from '../../models/userProfile';
import { taskConverter, type Task } from '../../models/task';
import { storeItemConverter, type StoreItem } from '../../models/storeItem';
import {
  backpackItemConverter,
  type BackpackItem,
} from '../../models/backpackItem';
import {
  transactionConverter,
  type Transaction,
} from '../../models/transaction';
import { rulesetConverter } from '../../models/ruleset';

const usersCol = collection(db, COLLECTIONS.users).withConverter(
  userProfileConverter,
);
const tasksCol = collection(db, COLLECTIONS.tasks).withConverter(taskConverter);
const storeItemsCol = collection(db, COLLECTIONS.storeItems).withConverter(
  storeItemConverter,
);
const backpackCol = collection(db, COLLECTIONS.backpackItems).withConverter(
  backpackItemConverter,
);

/** Drops keys whose value is `undefined` so Firestore writes stay clean. */
function defined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export const firestoreService = {
  // ---------- document references ----------

  /** The converted reference to a user's own profile document. */
  userDocRef(uid: string) {
    return doc(db, COLLECTIONS.users, uid).withConverter(userProfileConverter);
  },

  /** Reference to a family's single Ruleset doc (keyed by parent UID). */
  rulesetDocRef(parentUid: string) {
    return doc(db, 'rulesets', parentUid).withConverter(rulesetConverter);
  },

  // ---------- queries (read, real-time) ----------

  /** All children of a parent. */
  childrenQuery(parentId: string): Query<UserProfile> {
    return query(usersCol, where('parentId', '==', parentId));
  },

  /** Every task a parent owns, newest first. */
  parentTasksQuery(parentId: string): Query<Task> {
    return query(
      tasksCol,
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc'),
    );
  },

  /** Every task assigned to a child, newest first. */
  childTasksQuery(childId: string): Query<Task> {
    return query(
      tasksCol,
      where('childId', '==', childId),
      orderBy('createdAt', 'desc'),
    );
  },

  /** Every store item a parent owns, newest first. */
  parentStoreQuery(parentId: string): Query<StoreItem> {
    return query(
      storeItemsCol,
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc'),
    );
  },

  /** Active store items belonging to a child's parent, newest first. */
  childStoreQuery(parentId: string): Query<StoreItem> {
    return query(
      storeItemsCol,
      where('parentId', '==', parentId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
    );
  },

  /** A child's backpack, newest first. */
  childBackpackQuery(childId: string): Query<BackpackItem> {
    return query(
      backpackCol,
      where('childId', '==', childId),
      orderBy('purchasedAt', 'desc'),
    );
  },

  /**
   * All of a parent's children's backpack items that are awaiting redemption
   * — drives the "Waiting for you" panel on the Family page. Two equality
   * filters need no composite index (Firestore handles this with the default
   * single-field indexes); client sorts by request time.
   */
  parentPendingRedemptionsQuery(parentId: string): Query<BackpackItem> {
    return query(
      backpackCol,
      where('parentId', '==', parentId),
      where('status', '==', 'redeem_requested'),
    );
  },

  /** A child's Star ledger, newest first. */
  childTransactionsQuery(childId: string): Query<Transaction> {
    return query(
      collection(db, COLLECTIONS.users, childId, COLLECTIONS.transactions)
        .withConverter(transactionConverter),
      orderBy('createdAt', 'desc'),
    );
  },

  // ---------- task writes ----------

  async createTask(input: {
    parentId: string;
    childId: string;
    title: string;
    description?: string;
    starReward: number;
  }): Promise<void> {
    await addDoc(collection(db, COLLECTIONS.tasks), {
      ...defined(input),
      status: 'available',
      createdAt: serverTimestamp(),
    });
  },

  async updateTask(
    taskId: string,
    input: { title: string; description?: string; starReward: number },
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.tasks, taskId), {
      title: input.title,
      starReward: input.starReward,
      description: input.description ?? '',
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.tasks, taskId));
  },

  /**
   * Child marks an available task done — moves it to `pending_approval` and
   * attaches the photo evidence the kid just uploaded. Both fields are
   * required by the Firestore rule.
   */
  async markTaskDone(
    taskId: string,
    evidence: { evidenceUrl: string; evidencePath: string },
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.tasks, taskId), {
      status: 'pending_approval',
      completedAt: serverTimestamp(),
      evidenceUrl: evidence.evidenceUrl,
      evidencePath: evidence.evidencePath,
    });
  },

  // ---------- store-item writes ----------

  async createStoreItem(input: {
    parentId: string;
    name: string;
    description?: string;
    starPrice: number;
    imageUrl?: string;
    imagePath?: string;
    isActive: boolean;
  }): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.storeItems), {
      ...defined(input),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateStoreItem(
    itemId: string,
    input: Partial<{
      name: string;
      description: string;
      starPrice: number;
      imageUrl: string;
      imagePath: string;
      isActive: boolean;
    }>,
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.storeItems, itemId), defined(input));
  },

  async deleteStoreItem(itemId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.storeItems, itemId));
  },

  // ---------- backpack writes ----------

  /** Child asks a parent to redeem an owned backpack item. */
  async requestRedeem(backpackItemId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.backpackItems, backpackItemId), {
      status: 'redeem_requested',
      redeemRequestedAt: serverTimestamp(),
    });
  },

  /** Parent marks a requested backpack item as redeemed. */
  async markRedeemed(backpackItemId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.backpackItems, backpackItemId), {
      status: 'redeemed',
      redeemedAt: serverTimestamp(),
    });
  },

  // ---------- profile writes ----------

  /** Updates the signed-in user's own display name. */
  async updateDisplayName(uid: string, displayName: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.users, uid), { displayName });
  },

  /** Updates the signed-in user's own profile picture URL. */
  async updatePhotoUrl(uid: string, photoUrl: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.users, uid), { photoUrl });
  },

  /** Heartbeats the signed-in user's lastActiveAt — drives the online dot. */
  async updateLastActive(uid: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.users, uid), {
      lastActiveAt: serverTimestamp(),
    });
  },

  // ---------- admin broadcast ----------

  /** Reference to the single meta/adminMessage doc that drives the banner. */
  adminBroadcastDocRef() {
    return doc(db, 'meta', 'adminMessage');
  },

  /** Admin: publish a broadcast message visible to every signed-in user. */
  async setAdminBroadcast(text: string, sentByUid: string): Promise<void> {
    await setDoc(doc(db, 'meta', 'adminMessage'), {
      text,
      sentBy: sentByUid,
      sentAt: serverTimestamp(),
    });
  },

  /** Admin: clear the broadcast (banner stops showing for new viewers). */
  async clearAdminBroadcast(): Promise<void> {
    await deleteDoc(doc(db, 'meta', 'adminMessage'));
  },

  // ---------- admin (full-control) queries & writes ----------

  /** Every user account — admin only. */
  allUsersQuery(): Query<UserProfile> {
    return query(usersCol);
  },

  /** Every task in the system, newest first — admin only. */
  allTasksQuery(): Query<Task> {
    return query(tasksCol, orderBy('createdAt', 'desc'));
  },

  /** Every store item in the system, newest first — admin only. */
  allStoreItemsQuery(): Query<StoreItem> {
    return query(storeItemsCol, orderBy('createdAt', 'desc'));
  },

  /** Admin: overwrite a child's Star balance directly. */
  async adminSetStarBalance(uid: string, starBalance: number): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.users, uid), { starBalance });
  },

  /** Admin: rename any account. */
  async adminRenameUser(uid: string, displayName: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.users, uid), { displayName });
  },

  /** Admin: delete a user's profile document. */
  async adminDeleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.users, uid));
  },
};

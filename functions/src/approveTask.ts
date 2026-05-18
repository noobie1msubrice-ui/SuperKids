import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireParent } from './lib/guards';
import { validateString } from './lib/validation';

interface ApproveTaskRequest {
  taskId: string;
}

/**
 * Approves a completed task and credits its Stars, atomically.
 * Caller: the parent who owns the task.
 *
 * Idempotency: the `status == 'pending_approval'` guard inside the transaction
 * means a repeated call fails harmlessly rather than crediting Stars twice.
 */
export const approveTask = onCall<ApproveTaskRequest>(async (request) => {
  const parentUid = await requireParent(request);
  const taskId = validateString(request.data?.taskId, 'Task', 1, 128);

  const newBalance = await db.runTransaction(async (tx) => {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnap = await tx.get(taskRef);
    if (!taskSnap.exists) {
      throw new HttpsError('not-found', 'That task no longer exists.');
    }
    const task = taskSnap.data() as {
      parentId: string;
      childId: string;
      title: string;
      starReward: number;
      status: string;
    };

    if (task.parentId !== parentUid) {
      throw new HttpsError('permission-denied', 'That task is not yours.');
    }
    if (task.status !== 'pending_approval') {
      throw new HttpsError(
        'failed-precondition',
        "This task isn't waiting for approval.",
      );
    }

    const childRef = db.collection('users').doc(task.childId);
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists) {
      throw new HttpsError('not-found', 'That child could not be found.');
    }
    const child = childSnap.data() as { starBalance: number };
    const balanceAfter = child.starBalance + task.starReward;

    tx.update(taskRef, {
      status: 'completed',
      approvedAt: FieldValue.serverTimestamp(),
    });
    tx.update(childRef, { starBalance: balanceAfter });
    tx.set(childRef.collection('transactions').doc(), {
      type: 'earn',
      amount: task.starReward,
      reason: `Task: ${task.title}`,
      refType: 'task',
      refId: taskId,
      balanceAfter,
      createdAt: FieldValue.serverTimestamp(),
    });

    return balanceAfter;
  });

  return { success: true, newBalance };
});

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './lib/admin';
import { requireParent } from './lib/guards';
import { validateString } from './lib/validation';

interface RejectTaskRequest {
  taskId: string;
}

/**
 * Sends a pending task back to `available` so the child can redo it.
 * No Star movement. Caller: the parent who owns the task.
 */
export const rejectTask = onCall<RejectTaskRequest>(async (request) => {
  const parentUid = await requireParent(request);
  const taskId = validateString(request.data?.taskId, 'Task', 1, 128);

  const taskRef = db.collection('tasks').doc(taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) {
    throw new HttpsError('not-found', 'That task no longer exists.');
  }
  const task = taskSnap.data() as { parentId: string; status: string };

  if (task.parentId !== parentUid) {
    throw new HttpsError('permission-denied', 'That task is not yours.');
  }
  if (task.status !== 'pending_approval') {
    throw new HttpsError(
      'failed-precondition',
      "This task isn't waiting for approval.",
    );
  }

  await taskRef.update({
    status: 'available',
    completedAt: FieldValue.delete(),
  });

  return { success: true };
});

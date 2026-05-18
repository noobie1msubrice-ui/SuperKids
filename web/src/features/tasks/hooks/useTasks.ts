import { useMemo } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { firestoreService } from '../../../core/services/firestoreService';
import { useCollectionData } from '../../../core/hooks/useCollectionData';
import type { Task } from '../../../models/task';

/** Live list of every task the signed-in parent owns, newest first. */
export function useParentTasks() {
  const { profile } = useAuth();
  const query = useMemo(
    () =>
      profile?.role === 'parent'
        ? firestoreService.parentTasksQuery(profile.id)
        : null,
    [profile],
  );
  return useCollectionData<Task>(query);
}

/** Live list of tasks assigned to the signed-in child, newest first. */
export function useMyTasks() {
  const { profile } = useAuth();
  const query = useMemo(
    () =>
      profile?.role === 'child'
        ? firestoreService.childTasksQuery(profile.id)
        : null,
    [profile],
  );
  return useCollectionData<Task>(query);
}

/**
 * Sorts tasks so anything awaiting approval comes first (doc 06 §5.1),
 * then by recency. Returns a new array; the input is not mutated.
 */
export function pendingFirst(tasks: Task[]): Task[] {
  const rank: Record<Task['status'], number> = {
    pending_approval: 0,
    available: 1,
    completed: 2,
  };
  return [...tasks].sort((a, b) => rank[a.status] - rank[b.status]);
}

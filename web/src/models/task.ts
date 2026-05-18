import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

export type TaskStatus = 'available' | 'pending_approval' | 'completed';

/** A unit of work a parent assigns to one child, worth a fixed number of Stars. */
export interface Task {
  id: string;
  parentId: string;
  childId: string;
  title: string;
  description?: string;
  starReward: number;
  status: TaskStatus;
  dueDate?: Timestamp;
  createdAt: Timestamp | null;
  completedAt?: Timestamp;
  approvedAt?: Timestamp;
}

export const taskConverter = idConverter<Task>();

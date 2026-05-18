import type { TaskStatus } from '../../models/task';
import type { BackpackStatus } from '../../models/backpackItem';

type BadgeTone = 'neutral' | 'pending' | 'success' | 'muted';

interface StatusLabel {
  label: string;
  tone: BadgeTone;
}

/** Display label + badge tone for a task status. */
export const TASK_STATUS: Record<TaskStatus, StatusLabel> = {
  available: { label: 'To do', tone: 'neutral' },
  pending_approval: { label: 'Pending approval', tone: 'pending' },
  completed: { label: 'Completed', tone: 'success' },
};

/** Display label + badge tone for a backpack-item status. */
export const BACKPACK_STATUS: Record<BackpackStatus, StatusLabel> = {
  owned: { label: 'Owned', tone: 'neutral' },
  redeem_requested: { label: 'Redeem requested', tone: 'pending' },
  redeemed: { label: 'Redeemed', tone: 'success' },
};

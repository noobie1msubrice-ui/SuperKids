import type { TaskStatus } from '../../models/task';
import type { BackpackStatus } from '../../models/backpackItem';

type BadgeTone = 'neutral' | 'pending' | 'success' | 'muted';

interface StatusLabel {
  /** Translation key — pass through `t()` before display. */
  labelKey: string;
  tone: BadgeTone;
}

/** Translation key + badge tone for a task status. */
export const TASK_STATUS: Record<TaskStatus, StatusLabel> = {
  available: { labelKey: 'tasks.toDo', tone: 'neutral' },
  pending_approval: { labelKey: 'tasks.pendingApproval', tone: 'pending' },
  completed: { labelKey: 'tasks.completed', tone: 'success' },
};

/** Translation key + badge tone for a backpack-item status. */
export const BACKPACK_STATUS: Record<BackpackStatus, StatusLabel> = {
  owned: { labelKey: 'backpack.owned', tone: 'neutral' },
  redeem_requested: { labelKey: 'backpack.redeemRequested', tone: 'pending' },
  redeemed: { labelKey: 'backpack.redeemed', tone: 'success' },
};

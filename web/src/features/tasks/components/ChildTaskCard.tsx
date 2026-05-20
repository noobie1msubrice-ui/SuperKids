import { clsx } from 'clsx';
import { Card } from '../../../core/components/Card';
import { StarChip } from '../../../core/components/StarChip';
import { PrimaryButton } from '../../../core/components/Button';
import { CheckIcon } from '../../../core/components/icons';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import type { Task, TaskStatus } from '../../../models/task';

interface ChildTaskCardProps {
  task: Task;
  onDone: () => void;
  busy: boolean;
}

/** Coloured left accent + emoji bubble tint, by status. */
const ACCENT: Record<TaskStatus, { stripe: string; bubble: string }> = {
  available: { stripe: 'border-l-[6px] border-l-primary', bubble: 'bg-primary/10' },
  pending_approval: {
    stripe: 'border-l-[6px] border-l-secondary',
    bubble: 'bg-secondary/10',
  },
  completed: { stripe: 'border-l-[6px] border-l-success', bubble: 'bg-success/15' },
};

/** A task card in the child's Tasks tab — big, bright, one clear action (doc 06 §6.1). */
export function ChildTaskCard({ task, onDone, busy }: ChildTaskCardProps) {
  const { t } = useTranslation();
  const accent = ACCENT[task.status];
  return (
    <Card className={accent.stripe}>
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl',
            accent.bubble,
          )}
          aria-hidden
        >
          {task.status === 'completed' ? '🌟' : '🧹'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-section">{task.title}</p>
          {task.description && (
            <p className="truncate text-caption text-textMuted">
              {task.description}
            </p>
          )}
          <span className="mt-1 inline-flex items-center gap-1 text-body">
            {t('tasks.earn')} <StarChip count={task.starReward} />
          </span>
        </div>
      </div>

      <div className="mt-3">
        {task.status === 'available' && (
          <PrimaryButton fullWidth onClick={onDone} loading={busy}>
            {t('tasks.done')}
          </PrimaryButton>
        )}
        {task.status === 'pending_approval' && (
          <p className="rounded-xl bg-secondary/10 py-3 text-center text-body font-semibold text-secondary">
            {t('tasks.waitingParent')}
          </p>
        )}
        {task.status === 'completed' && (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-body font-semibold text-success">
            <CheckIcon className="h-5 w-5" />
            {t('tasks.earnedStars', { count: task.starReward })}
          </p>
        )}
      </div>
    </Card>
  );
}

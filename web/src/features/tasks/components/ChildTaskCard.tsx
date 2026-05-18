import { Card } from '../../../core/components/Card';
import { StarChip } from '../../../core/components/StarChip';
import { PrimaryButton } from '../../../core/components/Button';
import { CheckIcon } from '../../../core/components/icons';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import type { Task } from '../../../models/task';

interface ChildTaskCardProps {
  task: Task;
  onDone: () => void;
  busy: boolean;
}

/** A task card in the child's Tasks tab — big, bright, one clear action (doc 06 §6.1). */
export function ChildTaskCard({ task, onDone, busy }: ChildTaskCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
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

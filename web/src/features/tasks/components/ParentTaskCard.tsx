import { Card } from '../../../core/components/Card';
import { StarChip } from '../../../core/components/StarChip';
import { StatusBadge } from '../../../core/components/StatusBadge';
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button';
import { TASK_STATUS } from '../../../core/utils/statusLabels';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import type { Task } from '../../../models/task';

interface ParentTaskCardProps {
  task: Task;
  childName: string;
  /** Opens the edit page; omitted (disabled) once the task is completed. */
  onEdit?: () => void;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}

/** A task row in the parent's Tasks tab, with inline approve/reject (doc 06 §5.1). */
export function ParentTaskCard({
  task,
  childName,
  onEdit,
  onApprove,
  onReject,
  busy,
}: ParentTaskCardProps) {
  const { t } = useTranslation();
  const isPending = task.status === 'pending_approval';

  return (
    <Card onClick={onEdit}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-section">{task.title}</p>
          <p className="mt-0.5 text-caption text-textMuted">{childName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StarChip count={task.starReward} size="sm" />
          <StatusBadge
            label={t(TASK_STATUS[task.status].labelKey)}
            tone={TASK_STATUS[task.status].tone}
          />
        </div>
      </div>

      {isPending && task.evidenceUrl && (
        <a
          href={task.evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 block overflow-hidden rounded-xl border-2 border-secondary/30"
        >
          <img
            src={task.evidenceUrl}
            alt={t('tasks.evidenceAlt')}
            className="max-h-72 w-full object-cover"
          />
        </a>
      )}

      {isPending && (
        <div
          className="mt-3 flex gap-3"
          // Stop the card's edit-on-click firing when a button is pressed.
          onClick={(e) => e.stopPropagation()}
        >
          <SecondaryButton
            className="min-h-[44px] flex-1 px-3"
            onClick={onReject}
            loading={busy}
          >
            {t('tasks.reject')}
          </SecondaryButton>
          <PrimaryButton
            className="min-h-[44px] flex-1 px-3"
            onClick={onApprove}
            loading={busy}
          >
            {t('tasks.approve')}
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

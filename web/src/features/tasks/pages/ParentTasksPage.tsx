import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParentTasks, pendingFirst } from '../hooks/useTasks';
import { useChildren } from '../../family/hooks/useChildren';
import { ParentTaskCard } from '../components/ParentTaskCard';
import { functionsService } from '../../../core/services/functionsService';
import { useToast } from '../../../core/context/ToastContext';
import { PageHeader } from '../../../core/components/PageHeader';
import { PrimaryButton } from '../../../core/components/Button';
import { LoadingView } from '../../../core/components/LoadingView';
import { ErrorView } from '../../../core/components/ErrorView';
import { EmptyState } from '../../../core/components/EmptyState';

/** Parent Tasks tab: tasks grouped by child, pending approvals first (doc 06 §5.1). */
export function ParentTasksPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: tasks, loading: tasksLoading, error } = useParentTasks();
  const { children, loading: childrenLoading } = useChildren();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  async function review(
    action: 'approve' | 'reject',
    taskId: string,
  ): Promise<void> {
    setBusyTaskId(taskId);
    try {
      if (action === 'approve') {
        const result = await functionsService.approveTask({ taskId });
        showToast(`Approved! +${result.newBalance} ⭐ total.`, 'success');
      } else {
        await functionsService.rejectTask({ taskId });
        showToast('Sent back to try again.', 'info');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusyTaskId(null);
    }
  }

  const loading = tasksLoading || childrenLoading;

  return (
    <div>
      <PageHeader
        title="Tasks"
        action={
          children.length > 0 ? (
            <PrimaryButton
              className="min-h-[44px] px-4"
              onClick={() => navigate('/parent/tasks/add')}
            >
              Add Task
            </PrimaryButton>
          ) : undefined
        }
      />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && children.length === 0 && (
        <EmptyState
          icon="👶"
          message="Add a child first, then you can assign tasks."
          action={
            <PrimaryButton onClick={() => navigate('/parent/family/add')}>
              Add Child
            </PrimaryButton>
          }
        />
      )}

      {!loading && !error && children.length > 0 && tasks.length === 0 && (
        <EmptyState
          icon="📋"
          message="No tasks yet — click Add Task to assign one."
        />
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {children.map((child) => {
            const childTasks = pendingFirst(
              tasks.filter((t) => t.childId === child.id),
            );
            if (childTasks.length === 0) {
              return null;
            }
            return (
              <section key={child.id}>
                <h2 className="mb-2 text-section">{child.displayName}</h2>
                <div className="flex flex-col gap-3">
                  {childTasks.map((task) => (
                    <ParentTaskCard
                      key={task.id}
                      task={task}
                      childName={child.displayName}
                      busy={busyTaskId === task.id}
                      onEdit={
                        task.status === 'completed'
                          ? undefined
                          : () => navigate(`/parent/tasks/${task.id}/edit`)
                      }
                      onApprove={() => review('approve', task.id)}
                      onReject={() => review('reject', task.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

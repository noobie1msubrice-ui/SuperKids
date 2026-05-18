import { useState } from 'react'
import { useMyTasks, pendingFirst } from '../hooks/useTasks'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { ChildTaskCard } from '../components/ChildTaskCard'
import { PageHeader } from '../../../core/components/PageHeader'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'

export function ChildTasksPage() {
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: tasks, loading, error } = useMyTasks()
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)

  async function handleDone(taskId: string): Promise<void> {
    setBusyTaskId(taskId)
    try {
      await firestoreService.markTaskDone(taskId)
      showToast(t('tasks.markedDone'), 'success')
    } catch {
      showToast(t('common.errorGeneric'), 'error')
    } finally {
      setBusyTaskId(null)
    }
  }

  const sorted = pendingFirst(tasks)

  return (
    <div>
      <PageHeader title={t('tasks.childTitle')} />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && sorted.length === 0 && (
        <EmptyState icon="😎" message={t('tasks.noTasksChild')} />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          {sorted.map((task) => (
            <ChildTaskCard
              key={task.id}
              task={task}
              onDone={() => handleDone(task.id)}
              busy={busyTaskId === task.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

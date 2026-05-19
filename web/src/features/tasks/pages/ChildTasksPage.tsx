import { useEffect, useRef, useState } from 'react'
import { useMyTasks, pendingFirst } from '../hooks/useTasks'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { ChildTaskCard } from '../components/ChildTaskCard'
import { PageHeader } from '../../../core/components/PageHeader'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'
import { RewardCelebration } from '../../../core/components/RewardCelebration'
import type { TaskStatus } from '../../../models/task'

export function ChildTasksPage() {
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: tasks, loading, error } = useMyTasks()
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<string | null>(null)

  // Track previous task statuses so we can fire the celebration the moment a
  // task flips from non-completed to completed (parent just approved it).
  // The first snapshot after mount only seeds the map — already-completed
  // tasks on page load never re-trigger the celebration.
  const prevStatuses = useRef<Map<string, TaskStatus> | null>(null)
  useEffect(() => {
    if (loading) return
    const snapshot = new Map(tasks.map((task) => [task.id, task.status]))
    if (prevStatuses.current === null) {
      prevStatuses.current = snapshot
      return
    }
    for (const task of tasks) {
      const prev = prevStatuses.current.get(task.id)
      if (prev && prev !== 'completed' && task.status === 'completed') {
        setCelebration(`+${task.starReward} Stars!`)
        break
      }
    }
    prevStatuses.current = snapshot
  }, [tasks, loading])

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

      <RewardCelebration
        open={celebration !== null}
        message={celebration ?? ''}
        onDone={() => setCelebration(null)}
      />
    </div>
  )
}

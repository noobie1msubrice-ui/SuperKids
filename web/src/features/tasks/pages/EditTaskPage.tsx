import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useParentTasks } from '../hooks/useTasks'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { TextField } from '../../../core/components/TextField'
import { NumberStepper } from '../../../core/components/NumberStepper'
import { PrimaryButton, SecondaryButton, DangerButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { LoadingView } from '../../../core/components/LoadingView'
import { LIMITS, COPY } from '../../../core/utils/constants'

interface EditTaskForm {
  title: string
  description: string
  starReward: number
}

export function EditTaskPage() {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: tasks, loading } = useParentTasks()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const task = tasks.find((t) => t.id === taskId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditTaskForm>({ defaultValues: { starReward: 5 } })

  useEffect(() => {
    if (task) {
      reset({ title: task.title, description: task.description ?? '', starReward: task.starReward })
    }
  }, [task, reset])

  async function onSubmit(data: EditTaskForm): Promise<void> {
    setSaving(true)
    setFormError(null)
    try {
      await firestoreService.updateTask(taskId, {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        starReward: data.starReward,
      })
      showToast('Task updated.', 'success')
      navigate('/parent/tasks')
    } catch {
      setFormError(COPY.genericError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setDeleting(true)
    try {
      await firestoreService.deleteTask(taskId)
      showToast('Task deleted.', 'info')
      navigate('/parent/tasks')
    } catch {
      showToast(COPY.genericError, 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return <LoadingView />

  return (
    <div>
      <PageHeader title="Edit Task" />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormError message={formError} />

          <TextField
            label="Task title"
            error={errors.title?.message}
            {...register('title', {
              required: 'Please enter a title.',
              maxLength: { value: LIMITS.titleMax, message: `Title must be ${LIMITS.titleMax} chars or fewer.` },
            })}
          />

          <TextField
            label="Description (optional)"
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: LIMITS.descriptionMax, message: `Description must be ${LIMITS.descriptionMax} chars or fewer.` },
            })}
          />

          <Controller
            name="starReward"
            control={control}
            rules={{ min: { value: LIMITS.starRewardMin, message: 'Must be at least 1 Star.' } }}
            render={({ field }) => (
              <NumberStepper
                label="Star reward"
                value={field.value}
                onChange={field.onChange}
                min={LIMITS.starRewardMin}
                max={99}
                showStars
                error={errors.starReward?.message}
              />
            )}
          />

          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              fullWidth
              onClick={() => navigate('/parent/tasks')}
              disabled={saving}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={saving}>
              Save
            </PrimaryButton>
          </div>

          <DangerButton
            type="button"
            fullWidth
            onClick={() => setConfirmDelete(true)}
            loading={deleting}
          >
            Delete Task
          </DangerButton>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete task?"
        message="This will permanently remove the task. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useParentTasks } from '../hooks/useTasks'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
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
  const { t } = useTranslation()
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
      showToast(t('tasks.taskUpdated'), 'success')
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
      showToast(t('tasks.taskDeleted'), 'info')
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
      <PageHeader title={t('tasks.editTask')} />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormError message={formError} />

          <TextField
            label={t('tasks.title')}
            error={errors.title?.message}
            {...register('title', {
              required: t('tasks.enterTitle'),
              maxLength: { value: LIMITS.titleMax, message: `Max ${LIMITS.titleMax} characters.` },
            })}
          />

          <TextField
            label={t('tasks.description')}
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
                label={t('tasks.starReward')}
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
              {t('common.cancel')}
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={saving}>
              {t('common.save')}
            </PrimaryButton>
          </div>

          <DangerButton
            type="button"
            fullWidth
            onClick={() => setConfirmDelete(true)}
            loading={deleting}
          >
            {t('tasks.deleteTask')}
          </DangerButton>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title={t('tasks.deleteConfirmTitle')}
        message={t('tasks.deleteConfirmMsg')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

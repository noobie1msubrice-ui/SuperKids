import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useChildren } from '../../family/hooks/useChildren'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { TextField } from '../../../core/components/TextField'
import { NumberStepper } from '../../../core/components/NumberStepper'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { LIMITS, COPY } from '../../../core/utils/constants'

interface AddTaskForm {
  title: string
  description: string
  starReward: number
  childId: string
}

export function AddTaskPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { children } = useChildren()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddTaskForm>({ defaultValues: { starReward: 5, childId: '' } })

  async function onSubmit(data: AddTaskForm): Promise<void> {
    if (!profile) return
    setPending(true)
    setFormError(null)
    try {
      await firestoreService.createTask({
        parentId: profile.id,
        childId: data.childId,
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        starReward: data.starReward,
      })
      showToast(t('tasks.taskAdded'), 'success')
      navigate('/parent/tasks')
    } catch {
      setFormError(COPY.genericError)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('tasks.addTask')} />
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

          <div className="flex flex-col gap-1">
            <label className="text-body font-semibold" htmlFor="childId">
              {t('tasks.assignTo')}
            </label>
            <select
              id="childId"
              className="rounded-xl border-2 border-textMuted/30 bg-surface p-3 text-body focus:border-primary focus:outline-none"
              {...register('childId', { required: t('tasks.chooseChildError') })}
            >
              <option value="">{t('tasks.chooseChild')}</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
            {errors.childId && (
              <p className="text-caption text-danger">{errors.childId.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              fullWidth
              onClick={() => navigate('/parent/tasks')}
              disabled={pending}
            >
              {t('common.cancel')}
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={pending}>
              {t('tasks.addTask')}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  )
}

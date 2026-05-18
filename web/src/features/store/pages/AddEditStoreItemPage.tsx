import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useParentStore } from '../hooks/useStore'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { TextField } from '../../../core/components/TextField'
import { NumberStepper } from '../../../core/components/NumberStepper'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { LIMITS, COPY } from '../../../core/utils/constants'

interface StoreItemForm {
  name: string
  description: string
  starPrice: number
  isActive: boolean
}

export function AddEditStoreItemPage() {
  const { itemId } = useParams()
  const isEdit = Boolean(itemId)
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: items } = useParentStore()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const existing = isEdit ? items.find((i) => i.id === itemId) : undefined

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StoreItemForm>({ defaultValues: { starPrice: 10, isActive: true } })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? '',
        starPrice: existing.starPrice,
        isActive: existing.isActive,
      })
    }
  }, [existing, reset])

  async function onSubmit(data: StoreItemForm): Promise<void> {
    if (!profile) return
    setPending(true)
    setFormError(null)
    try {
      if (isEdit && itemId) {
        await firestoreService.updateStoreItem(itemId, {
          name: data.name.trim(),
          description: data.description.trim() || undefined,
          starPrice: data.starPrice,
          isActive: data.isActive,
        })
      } else {
        await firestoreService.createStoreItem({
          parentId: profile.id,
          name: data.name.trim(),
          description: data.description.trim() || undefined,
          starPrice: data.starPrice,
          isActive: data.isActive,
        })
      }
      showToast(isEdit ? t('store.itemUpdated') : t('store.itemAdded'), 'success')
      navigate('/parent/store')
    } catch {
      setFormError(COPY.genericError)
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? t('store.editItem') : t('store.addItem')} />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormError message={formError} />

          <TextField
            label={t('store.itemName')}
            error={errors.name?.message}
            {...register('name', {
              required: t('store.enterName'),
              maxLength: { value: LIMITS.itemNameMax, message: `Max ${LIMITS.itemNameMax} characters.` },
            })}
          />

          <TextField
            label={t('store.description')}
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: LIMITS.descriptionMax, message: `Description must be ${LIMITS.descriptionMax} chars or fewer.` },
            })}
          />

          <Controller
            name="starPrice"
            control={control}
            rules={{ min: { value: LIMITS.starPriceMin, message: 'Must be at least 1 Star.' } }}
            render={({ field }) => (
              <NumberStepper
                label={t('store.starPrice')}
                value={field.value}
                onChange={field.onChange}
                min={LIMITS.starPriceMin}
                max={999}
                showStars
                error={errors.starPrice?.message}
              />
            )}
          />

          <label className="flex items-center gap-2 text-body text-textMuted">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register('isActive')}
            />
            {t('store.visibleToKids')}
          </label>

          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              fullWidth
              onClick={() => navigate('/parent/store')}
              disabled={pending}
            >
              {t('common.cancel')}
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={pending}>
              {isEdit ? t('common.save') : t('store.addItem')}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParentStore } from '../hooks/useStore'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { PrimaryButton, SecondaryButton, DangerButton } from '../../../core/components/Button'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import type { StoreItem } from '../../../models/storeItem'

export function ParentStoreItemsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: items, loading, error } = useParentStore()
  const [deleteTarget, setDeleteTarget] = useState<StoreItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await firestoreService.deleteStoreItem(deleteTarget.id)
      showToast(t('store.itemRemoved'), 'info')
      setDeleteTarget(null)
    } catch {
      showToast(t('common.errorGeneric'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function toggleActive(item: StoreItem): Promise<void> {
    try {
      await firestoreService.updateStoreItem(item.id, { isActive: !item.isActive })
      showToast(item.isActive ? t('store.itemHidden') : t('store.itemVisible'), 'success')
    } catch {
      showToast(t('common.errorGeneric'), 'error')
    }
  }

  return (
    <div>
      <PageHeader
        title={t('store.title')}
        action={
          <PrimaryButton className="min-h-[44px] px-4" onClick={() => navigate('/parent/store/add')}>
            {t('store.addItem')}
          </PrimaryButton>
        }
      />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="🏪"
          message={t('store.emptyParent')}
          action={
            <PrimaryButton onClick={() => navigate('/parent/store/add')}>
              {t('store.addItem')}
            </PrimaryButton>
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-section font-bold">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 truncate text-caption text-textMuted">{item.description}</p>
                  )}
                  <div className="mt-1">
                    <StarChip count={item.starPrice} size="sm" />
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-caption font-semibold ${
                    item.isActive ? 'bg-success/15 text-success' : 'bg-textMuted/15 text-textMuted'
                  }`}
                >
                  {item.isActive ? t('store.active') : t('store.hidden')}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <SecondaryButton
                  className="min-h-[40px] px-3 text-caption"
                  onClick={() => navigate(`/parent/store/${item.id}/edit`)}
                >
                  {t('common.edit')}
                </SecondaryButton>
                <SecondaryButton
                  className="min-h-[40px] px-3 text-caption"
                  onClick={() => toggleActive(item)}
                >
                  {item.isActive ? t('store.hide') : t('store.show')}
                </SecondaryButton>
                <DangerButton
                  className="min-h-[40px] px-3 text-caption"
                  onClick={() => setDeleteTarget(item)}
                >
                  {t('common.delete')}
                </DangerButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('store.deleteConfirmTitle')}
        message={t('store.deleteConfirmMsg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

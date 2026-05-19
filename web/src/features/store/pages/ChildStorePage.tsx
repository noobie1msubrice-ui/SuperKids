import { useState } from 'react'
import { useChildStore } from '../hooks/useStore'
import { functionsService } from '../../../core/services/functionsService'
import { useAuth } from '../../../core/context/AuthContext'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { Modal } from '../../../core/components/Modal'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'
import { RewardCelebration } from '../../../core/components/RewardCelebration'
import type { StoreItem } from '../../../models/storeItem'

export function ChildStorePage() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: items, loading, error } = useChildStore()
  const [buyTarget, setBuyTarget] = useState<StoreItem | null>(null)
  const [buying, setBuying] = useState(false)
  const [celebration, setCelebration] = useState<string | null>(null)

  const balance = profile?.starBalance ?? 0

  async function handleBuy(): Promise<void> {
    if (!buyTarget) return
    setBuying(true)
    try {
      const result = await functionsService.purchaseStoreItem({ storeItemId: buyTarget.id })
      const itemName = buyTarget.name
      setBuyTarget(null)
      setCelebration(`${itemName}!`)
      showToast(t('store.bought', { count: result.newBalance }), 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div>
      <PageHeader title={t('store.starStore')} />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && items.length === 0 && (
        <EmptyState icon="🏪" message={t('store.emptyChild')} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const canAfford = balance >= item.starPrice
            return (
              <Card key={item.id} className="flex flex-col">
                <p className="mb-1 text-center text-section font-bold">{item.name}</p>
                {item.description && (
                  <p className="mb-2 text-center text-caption text-textMuted">{item.description}</p>
                )}
                <div className="mb-3 flex justify-center">
                  <StarChip count={item.starPrice} size="md" />
                </div>
                <button
                  className={`mt-auto rounded-xl py-2 text-body font-extrabold transition ${
                    canAfford
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'cursor-not-allowed bg-textMuted/10 text-textMuted'
                  }`}
                  onClick={() => canAfford && setBuyTarget(item)}
                  disabled={!canAfford}
                >
                  {canAfford
                    ? t('store.buy')
                    : t('store.needMore', { count: item.starPrice - balance })}
                </button>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={buyTarget !== null}
        onClose={() => setBuyTarget(null)}
        title={buyTarget?.name ?? ''}
      >
        {buyTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-body text-textMuted">
              {t('store.buyFor')}{' '}
              <span className="font-bold text-textPrimary">⭐ {buyTarget.starPrice}</span>?
            </p>
            <p className="text-caption text-textMuted">
              {t('store.balanceAfter', {
                before: balance,
                after: balance - buyTarget.starPrice,
              })}
            </p>
            <div className="flex gap-3">
              <SecondaryButton fullWidth onClick={() => setBuyTarget(null)} disabled={buying}>
                {t('common.cancel')}
              </SecondaryButton>
              <PrimaryButton fullWidth loading={buying} onClick={handleBuy}>
                {t('store.buyConfirm')}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      <RewardCelebration
        open={celebration !== null}
        message={celebration ?? ''}
        onDone={() => setCelebration(null)}
      />
    </div>
  )
}

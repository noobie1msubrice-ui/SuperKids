import { useState } from 'react'
import { useChildStore } from '../hooks/useStore'
import { functionsService } from '../../../core/services/functionsService'
import { useAuth } from '../../../core/context/AuthContext'
import { useToast } from '../../../core/context/ToastContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { Modal } from '../../../core/components/Modal'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'
import type { StoreItem } from '../../../models/storeItem'

export function ChildStorePage() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { data: items, loading, error } = useChildStore()
  const [buyTarget, setBuyTarget] = useState<StoreItem | null>(null)
  const [buying, setBuying] = useState(false)

  const balance = profile?.starBalance ?? 0

  async function handleBuy(): Promise<void> {
    if (!buyTarget) return
    setBuying(true)
    try {
      const result = await functionsService.purchaseStoreItem({ storeItemId: buyTarget.id })
      showToast(`Bought! New balance: ${result.newBalance} ⭐`, 'success')
      setBuyTarget(null)
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div>
      <PageHeader title="Star Store" />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && items.length === 0 && (
        <EmptyState icon="🏪" message="The store is empty — check back later!" />
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
                  {canAfford ? 'Buy ✨' : `Need ${item.starPrice - balance} more ⭐`}
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
              Buy for <span className="font-bold text-textPrimary">⭐ {buyTarget.starPrice}</span>?
            </p>
            <p className="text-caption text-textMuted">
              You have {balance} ⭐ → will have {balance - buyTarget.starPrice} ⭐
            </p>
            <div className="flex gap-3">
              <SecondaryButton fullWidth onClick={() => setBuyTarget(null)} disabled={buying}>
                Cancel
              </SecondaryButton>
              <PrimaryButton fullWidth loading={buying} onClick={handleBuy}>
                Buy! ✨
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

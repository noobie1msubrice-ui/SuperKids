import { useState } from 'react'
import { useMyBackpack } from '../hooks/useBackpack'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { StatusBadge } from '../../../core/components/StatusBadge'
import { PrimaryButton } from '../../../core/components/Button'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { EmptyState } from '../../../core/components/EmptyState'
import { BACKPACK_STATUS } from '../../../core/utils/statusLabels'

export function BackpackPage() {
  const { showToast } = useToast()
  const { data: items, loading, error } = useMyBackpack()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleRequestRedeem(itemId: string): Promise<void> {
    setBusyId(itemId)
    try {
      await firestoreService.requestRedeem(itemId)
      showToast("Shown to parent — they'll mark it redeemed!", 'success')
    } catch {
      showToast('Something went wrong. Try again.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="My Backpack" />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="🎒"
          message="Your backpack is empty — buy something from the Star Store!"
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
                    <StarChip count={item.pricePaid} size="sm" />
                    <span className="ml-1 text-caption text-textMuted">spent</span>
                  </div>
                </div>
                <StatusBadge {...BACKPACK_STATUS[item.status]} />
              </div>

              {item.status === 'owned' && (
                <div className="mt-3">
                  <PrimaryButton
                    fullWidth
                    loading={busyId === item.id}
                    onClick={() => handleRequestRedeem(item.id)}
                  >
                    Show Parent 🙋
                  </PrimaryButton>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

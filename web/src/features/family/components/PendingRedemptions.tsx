import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'
import { useAction } from '../../../core/hooks/useAction'
import { useChildren } from '../hooks/useChildren'
import { StarChip } from '../../../core/components/StarChip'
import { PrimaryButton } from '../../../core/components/Button'
import type { BackpackItem } from '../../../models/backpackItem'

/**
 * The "Waiting for you" panel at the top of FamilyPage: every backpack item
 * across all of a parent's kids that is currently in `redeem_requested` state
 * — i.e. the kid tapped "Show Parent" and is waiting for the parent to hand
 * over the real-world reward and confirm. Hidden when there's nothing pending.
 */
export function PendingRedemptions() {
  const { profile } = useAuth()
  const { children } = useChildren()
  const { showToast } = useToast()
  const { t } = useTranslation()

  const query = useMemo(
    () =>
      profile?.role === 'parent'
        ? firestoreService.parentPendingRedemptionsQuery(profile.id)
        : null,
    [profile],
  )
  const { data: pending } = useCollectionData<BackpackItem>(query)
  const redeem = useAction(firestoreService.markRedeemed)

  // Most recent request first (request time may be null briefly during write).
  const sorted = useMemo(
    () =>
      [...pending].sort(
        (a, b) =>
          (b.redeemRequestedAt?.toMillis() ?? 0) -
          (a.redeemRequestedAt?.toMillis() ?? 0),
      ),
    [pending],
  )

  const nameOf = useMemo(() => {
    const m: Record<string, string> = {}
    children.forEach((c) => {
      m[c.id] = c.displayName
    })
    return m
  }, [children])

  if (sorted.length === 0) {
    return null
  }

  async function handleRedeem(itemId: string): Promise<void> {
    const res = await redeem.run(itemId)
    if (res !== undefined) {
      showToast(t('family.markedRedeemed'), 'success')
    }
  }

  return (
    <section className="mb-6 rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-bgLight p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🎁
        </span>
        <h2 className="text-section font-extrabold text-gray-800">
          {t('family.pendingRedemptions')} ({sorted.length})
        </h2>
      </div>
      <p className="mb-3 text-caption text-textMuted">
        {t('family.redeemHint')}
      </p>

      <ul className="flex flex-col gap-2">
        {sorted.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
          >
            <div className="min-w-0">
              <div className="truncate text-body font-bold text-gray-800">
                {item.name}
              </div>
              <div className="text-caption text-textMuted">
                {nameOf[item.childId] ?? 'Kid'} ·{' '}
                <span className="inline-flex align-middle">
                  <StarChip count={item.pricePaid} size="sm" />
                </span>
              </div>
            </div>
            <PrimaryButton
              className="min-h-[40px] px-3 text-caption"
              loading={redeem.pending}
              onClick={() => handleRedeem(item.id)}
            >
              {t('family.markRedeemed')}
            </PrimaryButton>
          </li>
        ))}
      </ul>
    </section>
  )
}

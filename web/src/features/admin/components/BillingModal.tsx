import { useState } from 'react'
import { Modal } from '../../../core/components/Modal'
import { TextField } from '../../../core/components/TextField'
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { useToast } from '../../../core/context/ToastContext'
import { functionsService } from '../../../core/services/functionsService'
import {
  DEFAULT_PRICE_VND,
  effectiveStatus,
  formatVnd,
  trialDaysLeft,
} from '../../../core/utils/billing'
import type { UserProfile } from '../../../models/userProfile'

interface BillingModalProps {
  user: UserProfile
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  free: 'Free (admin comp)',
  trial: 'On trial',
  paid: 'Paid subscriber',
  expired: 'Locked / expired',
}

/** Admin dialog to manage one user's billing: status + custom price. */
export function BillingModal({ user, onClose }: BillingModalProps) {
  const { showToast } = useToast()
  const [priceInput, setPriceInput] = useState(
    user.priceVnd != null ? String(user.priceVnd) : '',
  )
  const [messageInput, setMessageInput] = useState(user.priceMessage ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = effectiveStatus(user)
  const days = trialDaysLeft(user)

  async function run(
    label: string,
    args: Parameters<typeof functionsService.adminSetBilling>[0],
  ): Promise<void> {
    setBusy(true)
    setError(null)
    try {
      await functionsService.adminSetBilling(args)
      showToast(`${label} — saved.`, 'success')
    } catch (err) {
      setError((err as Error).message || 'Could not update billing.')
    } finally {
      setBusy(false)
    }
  }

  async function savePrice(): Promise<void> {
    const raw = priceInput.trim()
    const message = messageInput.trim()
    const priceVnd =
      raw === ''
        ? null
        : Number(raw.replace(/[^0-9]/g, ''))
    if (raw !== '' && (!Number.isFinite(priceVnd) || (priceVnd ?? 0) <= 0)) {
      setError('Price must be a positive number of đồng.')
      return
    }
    await run('Price', {
      uid: user.id,
      priceVnd,
      // Empty message clears the override.
      priceMessage: message === '' ? null : message,
    })
  }

  return (
    <Modal open onClose={onClose} title={`Billing — ${user.displayName}`}>
      <div className="flex flex-col gap-4">
        <FormError message={error} />

        {/* Current status */}
        <div className="rounded-xl bg-bgLight p-3">
          <div className="text-caption text-textMuted">Current status</div>
          <div className="text-section font-bold">{STATUS_LABEL[status] ?? status}</div>
          {status === 'trial' && (
            <div className="mt-1 text-caption text-textMuted">
              {days > 0
                ? `${days} day${days === 1 ? '' : 's'} left on trial`
                : 'Trial has ended'}
            </div>
          )}
          <div className="mt-1 text-caption text-textMuted">
            Effective price:{' '}
            <span className="font-bold text-textPrimary">
              {formatVnd(user.priceVnd ?? DEFAULT_PRICE_VND)}
            </span>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex flex-col gap-2">
          <PrimaryButton
            type="button"
            onClick={() => run('Marked Free', { uid: user.id, billingStatus: 'free' })}
            loading={busy}
            className="min-h-[44px]"
          >
            ✓ Free (no charge)
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() =>
              run('Trial restarted', { uid: user.id, resetTrialDays: 30 })
            }
            loading={busy}
            className="min-h-[44px]"
          >
            Restart 30-day trial
          </SecondaryButton>
          <SecondaryButton
            type="button"
            onClick={() => run('Marked Paid', { uid: user.id, billingStatus: 'paid' })}
            loading={busy}
            className="min-h-[44px]"
          >
            Mark as paid
          </SecondaryButton>
          <DangerButton
            type="button"
            onClick={() =>
              run('Account locked', { uid: user.id, billingStatus: 'expired' })
            }
            loading={busy}
            className="min-h-[44px]"
          >
            Lock account
          </DangerButton>
        </div>

        {/* Custom price + optional message */}
        <div className="border-t border-gray-100 pt-4">
          <TextField
            label="Custom price (VND)"
            placeholder={`leave blank to use default (${DEFAULT_PRICE_VND.toLocaleString('vi-VN')} ₫)`}
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            hint="Override the default price for this user only."
          />
          <label className="mt-3 flex flex-col gap-1 text-body font-semibold">
            Custom message (optional)
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="e.g. Special discount for being an early supporter!"
              rows={2}
              maxLength={500}
              className="rounded-xl border-2 border-textMuted/30 px-3 py-2 text-body focus:border-primary focus:outline-none"
            />
            <span className="text-caption font-normal text-textMuted">
              Shown next to the price on this user's paywall.
            </span>
          </label>
          <PrimaryButton
            type="button"
            onClick={savePrice}
            loading={busy}
            className="mt-3 min-h-[44px] self-start px-5"
          >
            Save price &amp; message
          </PrimaryButton>
        </div>

        <SecondaryButton type="button" fullWidth onClick={onClose} disabled={busy}>
          Done
        </SecondaryButton>
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import { Modal } from '../../../core/components/Modal'
import { TextField } from '../../../core/components/TextField'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { useToast } from '../../../core/context/ToastContext'
import { functionsService } from '../../../core/services/functionsService'
import { LIMITS } from '../../../core/utils/constants'
import type { UserProfile } from '../../../models/userProfile'

interface EditUserModalProps {
  /** The user being edited — the parent renders this modal only when set. */
  user: UserProfile
  onClose: () => void
}

/**
 * Admin dialog to change any account's name, login email and/or password.
 * Every field is optional: each one defaults to the user's current value
 * (shown as a placeholder) and the admin only fills in the fields they want
 * to change. Submitting with all fields blank shows "Nothing to change".
 */
export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const { showToast } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(): Promise<void> {
    setError(null)
    const update: {
      uid: string
      displayName?: string
      email?: string
      newPassword?: string
    } = { uid: user.id }

    const dn = displayName.trim()
    if (dn) update.displayName = dn

    const em = email.trim()
    if (em) update.email = em

    if (newPassword) {
      if (newPassword.length < LIMITS.passwordMin) {
        setError(`Password must be at least ${LIMITS.passwordMin} characters.`)
        return
      }
      update.newPassword = newPassword
    }

    if (!update.displayName && !update.email && !update.newPassword) {
      setError('Nothing to change — fill in any field you want to update.')
      return
    }

    setSaving(true)
    try {
      await functionsService.adminUpdateUser(update)
      showToast('Account updated.', 'success')
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Could not update the account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`Edit ${user.displayName}`}>
      <div className="flex flex-col gap-4">
        <p className="rounded-xl bg-primary/5 px-3 py-2 text-caption text-textMuted">
          Fill in only the fields you want to change — leave the rest blank.
        </p>
        <FormError message={error} />
        <TextField
          label="Display name"
          placeholder={user.displayName}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="Login email"
          type="email"
          placeholder={user.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="New password"
          type="password"
          placeholder="leave blank to keep current"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="flex gap-3">
          <SecondaryButton type="button" fullWidth onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" fullWidth onClick={save} loading={saving}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

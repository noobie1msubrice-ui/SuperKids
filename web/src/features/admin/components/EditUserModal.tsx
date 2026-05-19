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

/** Admin dialog to change any account's name, login email and password. */
export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const { showToast } = useToast()
  const [displayName, setDisplayName] = useState(user.displayName)
  const [email, setEmail] = useState(user.email)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(): Promise<void> {
    if (!displayName.trim()) {
      setError('Name cannot be empty.')
      return
    }
    if (!email.trim()) {
      setError('Email cannot be empty.')
      return
    }
    if (newPassword && newPassword.length < LIMITS.passwordMin) {
      setError(`Password must be at least ${LIMITS.passwordMin} characters.`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await functionsService.adminUpdateUser({
        uid: user.id,
        displayName: displayName.trim(),
        email: email.trim(),
        newPassword: newPassword || undefined,
      })
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
        <FormError message={error} />
        <TextField
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="Login email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="New password (leave blank to keep)"
          type="password"
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

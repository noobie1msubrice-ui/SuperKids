import { useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { TextField } from '../../../core/components/TextField'
import { PrimaryButton, SecondaryButton, DangerButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { LIMITS, COPY } from '../../../core/utils/constants'

export function ParentProfilePage() {
  const { profile, logout } = useAuth()
  const { showToast } = useToast()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmLogout, setConfirmLogout] = useState(false)

  function startEdit(): void {
    setNewName(profile?.displayName ?? '')
    setNameError('')
    setSaveError(null)
    setEditingName(true)
  }

  async function handleSaveName(): Promise<void> {
    const trimmed = newName.trim()
    if (!trimmed) {
      setNameError('Please enter a name.')
      return
    }
    if (trimmed.length > LIMITS.displayNameMax) {
      setNameError(`Name must be ${LIMITS.displayNameMax} characters or fewer.`)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await firestoreService.updateDisplayName(profile!.id, trimmed)
      showToast('Name updated.', 'success')
      setEditingName(false)
    } catch {
      setSaveError(COPY.genericError)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" />

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl">
            👨‍👩‍👧
          </div>
          <div>
            <p className="text-section font-bold">{profile.displayName}</p>
            <p className="text-caption text-textMuted">Parent</p>
          </div>
        </div>

        {!editingName ? (
          <SecondaryButton className="min-h-[44px] px-4" onClick={startEdit}>
            Edit name
          </SecondaryButton>
        ) : (
          <div className="flex flex-col gap-3">
            <FormError message={saveError} />
            <TextField
              label="Display name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              error={nameError}
            />
            <div className="flex gap-3">
              <SecondaryButton
                fullWidth
                onClick={() => setEditingName(false)}
                disabled={saving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton fullWidth loading={saving} onClick={handleSaveName}>
                Save
              </PrimaryButton>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <DangerButton fullWidth onClick={() => setConfirmLogout(true)}>
          Log out
        </DangerButton>
      </Card>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You will be returned to the role selector."
        confirmLabel="Log out"
        danger
        loading={false}
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}

import { useState } from 'react'
import { firestoreService } from '../../../core/services/firestoreService'
import { useToast } from '../../../core/context/ToastContext'

interface StarBalanceEditorProps {
  uid: string
  current: number
}

/** Inline editor letting an admin overwrite a child's Star balance. */
export function StarBalanceEditor({ uid, current }: StarBalanceEditorProps) {
  const { showToast } = useToast()
  const [value, setValue] = useState(String(current))
  const [saving, setSaving] = useState(false)

  const dirty = value.trim() !== String(current)

  async function save(): Promise<void> {
    const next = Number(value)
    if (!Number.isInteger(next) || next < 0) {
      showToast('Balance must be a whole number, 0 or more.', 'error')
      return
    }
    setSaving(true)
    try {
      await firestoreService.adminSetStarBalance(uid, next)
      showToast('Star balance updated.', 'success')
    } catch {
      showToast('Could not update balance.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden>⭐</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-lg border-2 border-textMuted/30 px-2 py-1 text-body"
      />
      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="rounded-lg bg-primary px-3 py-1 text-caption font-bold text-white disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

import { useState } from 'react'
import { Modal } from '../../../core/components/Modal'
import { ImagePicker } from '../../../core/components/ImagePicker'
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { useToast } from '../../../core/context/ToastContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { storageService } from '../../../core/services/storageService'
import { CheckIcon } from '../../../core/components/icons'
import type { Task } from '../../../models/task'

interface SubmitTaskModalProps {
  task: Task
  onClose: () => void
}

/**
 * Kid's "I did the task" modal. A photo is REQUIRED — uploads to Storage,
 * then writes status='pending_approval' + evidence URL on the task doc.
 * Without the photo the Submit button stays disabled.
 */
export function SubmitTaskModal({ task, onClose }: SubmitTaskModalProps) {
  const { showToast } = useToast()
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(): Promise<void> {
    if (!file) {
      setError(t('tasks.evidenceRequired'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const evidence = await storageService.uploadTaskEvidence(task.id, file)
      await firestoreService.markTaskDone(task.id, evidence)
      showToast(t('tasks.markedDone'), 'success')
      onClose()
    } catch (err) {
      setError((err as Error).message || t('common.errorGeneric'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={task.title}>
      <div className="flex flex-col gap-4">
        <p className="text-body text-textMuted">{t('tasks.evidenceHint')}</p>
        <FormError message={error} />
        <ImagePicker
          label={t('tasks.evidenceLabel')}
          onChange={setFile}
          placeholder={
            <CheckIcon className="h-10 w-10 text-textMuted" />
          }
        />
        <div className="flex gap-3">
          <SecondaryButton type="button" fullWidth onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            fullWidth
            loading={busy}
            disabled={!file}
            onClick={submit}
          >
            {t('tasks.submit')}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}

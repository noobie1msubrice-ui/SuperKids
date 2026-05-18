import { useState } from 'react'
import { useAuth } from '../../core/context/AuthContext'
import { useToast } from '../../core/context/ToastContext'
import { useTranslation } from '../../core/i18n/LanguageContext'
import { LANGUAGES } from '../../core/i18n/translations'
import { firestoreService } from '../../core/services/firestoreService'
import { authService } from '../../core/services/authService'
import { Card } from '../../core/components/Card'
import { TextField } from '../../core/components/TextField'
import { PrimaryButton } from '../../core/components/Button'
import { FormError } from '../../core/components/FormError'
import { LIMITS } from '../../core/utils/constants'

/**
 * Settings card on the Profile page: every user can switch language and
 * change their display name and password.
 */
export function ProfileSettings() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { t, lang, setLang } = useTranslation()

  const [name, setName] = useState(profile?.displayName ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  if (!profile) return null

  async function saveName(): Promise<void> {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(t('settings.enterName'))
      return
    }
    if (trimmed.length > LIMITS.displayNameMax) {
      setNameError(t('settings.nameTooLong'))
      return
    }
    setNameSaving(true)
    setNameError(null)
    try {
      await firestoreService.updateDisplayName(profile!.id, trimmed)
      showToast(t('settings.nameUpdated'), 'success')
    } catch {
      setNameError(t('common.errorGeneric'))
    } finally {
      setNameSaving(false)
    }
  }

  async function savePassword(): Promise<void> {
    if (newPw.length < LIMITS.passwordMin) {
      setPwError(t('settings.passwordTooShort', { min: LIMITS.passwordMin }))
      return
    }
    if (newPw !== confirmPw) {
      setPwError(t('auth.passwordsMismatch'))
      return
    }
    setPwSaving(true)
    setPwError(null)
    try {
      await authService.changePassword(currentPw, newPw)
      showToast(t('settings.passwordUpdated'), 'success')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwError((err as Error).message || t('common.errorGeneric'))
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-section font-bold">⚙️ {t('settings.title')}</h2>

      {/* Language */}
      <div className="mb-6">
        <div className="mb-2 text-body font-semibold">{t('settings.language')}</div>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`flex-1 rounded-xl border-2 py-2 text-body font-bold transition-colors ${
                lang === l.code
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-textMuted/30 text-textMuted hover:border-primary/50'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display name */}
      <div className="mb-6 flex flex-col gap-2 border-t border-gray-100 pt-5">
        <div className="text-body font-semibold">{t('settings.changeName')}</div>
        <FormError message={nameError} />
        <TextField
          label={t('settings.displayName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PrimaryButton
          onClick={saveName}
          loading={nameSaving}
          className="min-h-[44px] self-start px-5"
        >
          {t('common.save')}
        </PrimaryButton>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-5">
        <div className="text-body font-semibold">{t('settings.changePassword')}</div>
        <FormError message={pwError} />
        <TextField
          label={t('settings.currentPassword')}
          type="password"
          autoComplete="current-password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
        />
        <TextField
          label={t('settings.newPassword')}
          type="password"
          autoComplete="new-password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />
        <TextField
          label={t('settings.confirmNewPassword')}
          type="password"
          autoComplete="new-password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />
        <PrimaryButton
          onClick={savePassword}
          loading={pwSaving}
          className="min-h-[44px] self-start px-5"
        >
          {t('settings.update')}
        </PrimaryButton>
      </div>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthScreen } from '../components/AuthScreen'
import { authService } from '../../../core/services/authService'
import { TextField } from '../../../core/components/TextField'
import { PrimaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { LoadingView } from '../../../core/components/LoadingView'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { isValidEmail } from '../../../core/utils/validators'

const MIN_PASSWORD = 6

/**
 * Password recovery. Two ways in, both ending on the same in-app
 * "set a new password" screen:
 *   1. The user types their email + a password they still remember; if it's
 *      correct we sign them in and let them set a new one immediately.
 *   2. They ask for an email link; clicking "change your password" returns
 *      here with an oobCode, which we verify and then let them set a new one.
 */
export function RecoverPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const oobCode = params.get('oobCode')

  // step: which screen is showing.
  const [step, setStep] = useState<
    'verifyingLink' | 'request' | 'setNew' | 'sent' | 'done'
  >(oobCode ? 'verifyingLink' : 'request')
  // how we'll save the new password: from a remembered login, or an email code.
  const [resetCode, setResetCode] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If we arrived from an email link, validate the code, then show "set new".
  useEffect(() => {
    if (!oobCode) return
    let active = true
    void (async () => {
      try {
        const linkedEmail = await authService.verifyResetCode(oobCode)
        if (!active) return
        setEmail(linkedEmail)
        setResetCode(oobCode)
        setStep('setNew')
      } catch (err) {
        if (!active) return
        setError((err as Error).message || t('common.errorGeneric'))
        setStep('request')
      }
    })()
    return () => {
      active = false
    }
  }, [oobCode, t])

  // Step 1a: verify the remembered password by signing in with it.
  async function verifyRemembered(): Promise<void> {
    if (!isValidEmail(email)) {
      setError(t('recover.badEmail'))
      return
    }
    if (!oldPassword) {
      setError(t('auth.enterPassword'))
      return
    }
    setPending(true)
    setError(null)
    try {
      await authService.verifyOldPassword(email, oldPassword)
      setResetCode(null) // signed in — we'll use updatePassword
      setStep('setNew')
    } catch (err) {
      setError((err as Error).message || t('common.errorGeneric'))
    } finally {
      setPending(false)
    }
  }

  // Step 1b: forgot it entirely — email a reset link instead.
  async function emailLink(): Promise<void> {
    if (!isValidEmail(email)) {
      setError(t('recover.badEmail'))
      return
    }
    setPending(true)
    setError(null)
    try {
      await authService.sendPasswordReset(email)
      setStep('sent')
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      // Don't reveal whether an account exists for that email.
      if (code.includes('user-not-found')) {
        setStep('sent')
      } else {
        setError((err as Error).message || t('common.errorGeneric'))
      }
    } finally {
      setPending(false)
    }
  }

  // Step 2: save the new password (via reset code, or as the signed-in user).
  async function saveNew(): Promise<void> {
    if (newPassword.length < MIN_PASSWORD) {
      setError(t('recover.tooShort'))
      return
    }
    if (newPassword !== confirm) {
      setError(t('recover.mismatch'))
      return
    }
    setPending(true)
    setError(null)
    try {
      if (resetCode) {
        await authService.confirmReset(resetCode, newPassword)
      } else {
        await authService.setNewPassword(newPassword)
      }
      await authService.logout()
      setStep('done')
    } catch (err) {
      setError((err as Error).message || t('common.errorGeneric'))
    } finally {
      setPending(false)
    }
  }

  if (step === 'verifyingLink') {
    return (
      <AuthScreen title={t('recover.title')}>
        <LoadingView />
        <p className="mt-2 text-center text-caption text-textMuted">
          {t('recover.verifyingLink')}
        </p>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title={step === 'setNew' ? t('recover.newTitle') : t('recover.title')}
      onBack={() => navigate(-1)}
      backLabel={t('auth.back')}
    >
      {step === 'request' && (
        <div className="flex flex-col gap-4">
          <p className="text-body text-textMuted">{t('recover.rememberIntro')}</p>
          <FormError message={error} />
          <TextField
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label={t('recover.oldPasswordLabel')}
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <PrimaryButton type="button" fullWidth loading={pending} onClick={verifyRemembered}>
            {t('recover.continue')}
          </PrimaryButton>
          <button
            type="button"
            onClick={emailLink}
            disabled={pending}
            className="self-center text-caption font-semibold text-primary underline"
          >
            {t('recover.forgotItEmail')}
          </button>
          <p className="text-caption text-textMuted">{t('recover.kidNote')}</p>
        </div>
      )}

      {step === 'setNew' && (
        <div className="flex flex-col gap-4">
          <FormError message={error} />
          <TextField
            label={t('recover.newPasswordLabel')}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label={t('recover.confirmPasswordLabel')}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <PrimaryButton type="button" fullWidth loading={pending} onClick={saveNew}>
            {t('recover.savePassword')}
          </PrimaryButton>
        </div>
      )}

      {step === 'sent' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center text-5xl" aria-hidden>
            📬
          </div>
          <p className="text-center text-body">
            {t('recover.sentBody', { email })}
          </p>
          <PrimaryButton fullWidth onClick={() => navigate('/role-select')}>
            {t('recover.backToLogin')}
          </PrimaryButton>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center text-5xl" aria-hidden>
            🎉
          </div>
          <p className="text-center text-section font-bold text-success">
            {t('recover.doneTitle')}
          </p>
          <p className="text-center text-body">{t('recover.doneBody')}</p>
          <PrimaryButton fullWidth onClick={() => navigate('/role-select')}>
            {t('recover.goLogin')}
          </PrimaryButton>
        </div>
      )}
    </AuthScreen>
  )
}

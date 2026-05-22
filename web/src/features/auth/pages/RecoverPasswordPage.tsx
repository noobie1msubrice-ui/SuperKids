import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthScreen } from '../components/AuthScreen'
import { authService } from '../../../core/services/authService'
import { TextField } from '../../../core/components/TextField'
import { PrimaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { isValidEmail } from '../../../core/utils/validators'

/**
 * Password-recovery screen. Sends a Firebase reset-link email. Reached from
 * the "Forgot your password?" link or the too-many-tries prompt on a login
 * screen. Kids usually have a parent-made email, so a note points them to
 * ask their parent (who can reset it from the Family page).
 */
export function RecoverPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function send(): Promise<void> {
    if (!isValidEmail(email)) {
      setError(t('recover.badEmail'))
      return
    }
    setPending(true)
    setError(null)
    try {
      await authService.sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      // Don't reveal whether an account exists for that email.
      if (code.includes('user-not-found')) {
        setSent(true)
      } else {
        setError((err as Error).message || t('common.errorGeneric'))
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthScreen
      title={t('recover.title')}
      onBack={() => navigate(-1)}
      backLabel={t('auth.back')}
    >
      {sent ? (
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
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-body text-textMuted">{t('recover.intro')}</p>
          <FormError message={error} />
          <TextField
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PrimaryButton type="button" fullWidth loading={pending} onClick={send}>
            {t('recover.sendLink')}
          </PrimaryButton>
          <p className="text-caption text-textMuted">{t('recover.kidNote')}</p>
        </div>
      )}
    </AuthScreen>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../core/components/Modal'
import { TextField } from '../../../core/components/TextField'
import { PrimaryButton } from '../../../core/components/Button'
import { FormError } from '../../../core/components/FormError'
import { useRoleLogin } from '../../auth/hooks/useRoleLogin'
import { authService } from '../../../core/services/authService'
import { rules } from '../../../core/utils/validators'
import { COPY } from '../../../core/utils/constants'
import { useTranslation } from '../../../core/i18n/LanguageContext'

interface AdminAuthModalProps {
  open: boolean
  onClose: () => void
}

interface AdminAuthForm {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const TAB_BASE = 'flex-1 rounded-lg py-2 text-body font-bold transition-colors'

/** The hidden Admin login / sign-up dialog (opened by typing "admin"). */
export function AdminAuthModal({ open, onClose }: AdminAuthModalProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const login = useRoleLogin('admin')
  const [signupPending, setSignupPending] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminAuthForm>()

  async function onSubmit(data: AdminAuthForm): Promise<void> {
    if (mode === 'login') {
      await login.submit(data.email.trim(), data.password)
      return
    }
    setSignupPending(true)
    setSignupError(null)
    try {
      await authService.signUpAdmin(
        data.displayName.trim(),
        data.email,
        data.password,
      )
      navigate('/admin', { replace: true })
    } catch (err) {
      setSignupError((err as Error).message || COPY.genericError)
    } finally {
      setSignupPending(false)
    }
  }

  function switchMode(next: 'login' | 'signup'): void {
    setMode(next)
    setSignupError(null)
    reset()
  }

  const pending = mode === 'login' ? login.pending : signupPending
  const error = mode === 'login' ? login.error : signupError

  return (
    <Modal open={open} onClose={onClose} title={t('admin.dialogTitle')}>
      <div className="mb-5 flex gap-1 rounded-xl bg-bgLight p-1">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`${TAB_BASE} ${mode === 'login' ? 'bg-surface text-primary shadow-card' : 'text-textMuted'}`}
        >
          {t('auth.logIn')}
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`${TAB_BASE} ${mode === 'signup' ? 'bg-surface text-primary shadow-card' : 'text-textMuted'}`}
        >
          {t('admin.signUp')}
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={error} />

        {mode === 'signup' && (
          <TextField
            label={t('auth.yourName')}
            error={errors.displayName?.message}
            {...register('displayName', rules.displayName)}
          />
        )}

        <TextField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', rules.email)}
        />

        <TextField
          label={t('auth.password')}
          type="password"
          error={errors.password?.message}
          {...register(
            'password',
            mode === 'signup'
              ? rules.password
              : { required: t('auth.enterPassword') },
          )}
        />

        {mode === 'signup' && (
          <TextField
            label={t('auth.confirmPassword')}
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: t('auth.confirmYourPassword'),
              validate: (value) =>
                value === watch('password') || t('auth.passwordsMismatch'),
            })}
          />
        )}

        <PrimaryButton type="submit" fullWidth loading={pending}>
          {mode === 'login' ? t('auth.logIn') : t('admin.createAdminAccount')}
        </PrimaryButton>
      </form>
    </Modal>
  )
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { authService } from '../../../core/services/authService';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { rules } from '../../../core/utils/validators';
import { COPY } from '../../../core/utils/constants';
import { useTranslation } from '../../../core/i18n/LanguageContext';

interface SignupForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Kid sign-up screen. Creates an unlinked child account; the kid then waits on
 * the waiting screen until a parent claims them with linkChildToParent.
 */
export function ChildSignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: SignupForm): Promise<void> {
    setPending(true);
    setError(null);
    try {
      await authService.signUpChild(
        data.displayName.trim(),
        data.email.trim(),
        data.password,
      );
      // AuthContext picks up the new (unlinked) kid; send them to the waiting
      // screen until a parent links the account.
      navigate('/child/waiting', { replace: true });
    } catch (err) {
      setError((err as Error).message || COPY.genericError);
      setPending(false);
    }
  }

  return (
    <AuthScreen
      title={t('auth.kidSignUp')}
      subtitle={t('auth.kidSignupSubtitle')}
      onBack={() => navigate('/child/login')}
      backLabel={t('auth.back')}
      footer={
        <span className="text-textMuted">
          {t('auth.alreadyHaveOne')}{' '}
          <Link to="/child/login" className="font-bold text-primary underline">
            {t('auth.logInLink')}
          </Link>
        </span>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={error} />
        <TextField
          label={t('auth.yourName')}
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName', rules.displayName)}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', rules.password)}
        />
        <TextField
          label={t('auth.confirmPassword')}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: t('auth.confirmYourPassword'),
            validate: (value) =>
              value === watch('password') || t('auth.passwordsMismatch'),
          })}
        />
        <PrimaryButton type="submit" fullWidth loading={pending}>
          {t('auth.createAccount')}
        </PrimaryButton>
      </form>
    </AuthScreen>
  );
}

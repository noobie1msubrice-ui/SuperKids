import { useForm } from 'react-hook-form';
import { AuthScreen } from '../components/AuthScreen';
import { useRoleLogin } from '../hooks/useRoleLogin';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { useTranslation } from '../../../core/i18n/LanguageContext';

interface LoginForm {
  email: string;
  password: string;
}

/** Child login screen — no sign-up; extra-simple errors (doc 06 §4.4). */
export function ChildLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { submit, pending, error } = useRoleLogin('child');
  const { t } = useTranslation();

  return (
    <AuthScreen
      title={t('auth.kidLogIn')}
      subtitle={t('auth.kidLoginSubtitle')}
    >
      <form
        onSubmit={handleSubmit((d) => submit(d.email, d.password))}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={error} />
        <TextField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: t('auth.enterEmail') })}
        />
        <TextField
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: t('auth.enterPassword') })}
        />
        <PrimaryButton type="submit" fullWidth loading={pending}>
          {t('auth.letsGo')}
        </PrimaryButton>
      </form>
    </AuthScreen>
  );
}

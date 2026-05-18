import { useForm } from 'react-hook-form';
import { AuthScreen } from '../components/AuthScreen';
import { useRoleLogin } from '../hooks/useRoleLogin';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';

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

  return (
    <AuthScreen
      title="Kid Log In"
      subtitle="Ask your parent for your login."
    >
      <form
        onSubmit={handleSubmit((d) => submit(d.email, d.password))}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={error} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Please enter your email.' })}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Please enter your password.' })}
        />
        <PrimaryButton type="submit" fullWidth loading={pending}>
          Let's Go!
        </PrimaryButton>
      </form>
    </AuthScreen>
  );
}

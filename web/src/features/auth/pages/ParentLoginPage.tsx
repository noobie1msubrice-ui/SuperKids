import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { useRoleLogin } from '../hooks/useRoleLogin';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { rules } from '../../../core/utils/validators';

interface LoginForm {
  email: string;
  password: string;
}

/** Parent login screen (doc 06 §4.3). */
export function ParentLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { submit, pending, error } = useRoleLogin('parent');

  return (
    <AuthScreen
      title="Parent Log In"
      footer={
        <span className="text-textMuted">
          New here?{' '}
          <Link to="/parent/signup" className="font-bold text-primary underline">
            Create an account
          </Link>
        </span>
      }
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
          {...register('email', rules.email)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Please enter a password.' })}
        />
        <PrimaryButton type="submit" fullWidth loading={pending}>
          Log In
        </PrimaryButton>
      </form>
    </AuthScreen>
  );
}

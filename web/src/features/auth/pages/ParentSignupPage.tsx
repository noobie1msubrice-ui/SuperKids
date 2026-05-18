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

interface SignupForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Parent sign-up screen (doc 01 F2, doc 06 §4.3). */
export function ParentSignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: SignupForm): Promise<void> {
    setPending(true);
    setError(null);
    try {
      await authService.signUpParent(data.displayName, data.email, data.password);
      // AuthContext picks up the new user; route to the parent home.
      navigate('/parent/tasks', { replace: true });
    } catch (err) {
      setError((err as Error).message || COPY.genericError);
      setPending(false);
    }
  }

  return (
    <AuthScreen
      title="Create your account"
      footer={
        <span className="text-textMuted">
          Already have one?{' '}
          <Link to="/parent/login" className="font-bold text-primary underline">
            Log in
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
          label="Your name"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName', rules.displayName)}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', rules.password)}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password.',
            validate: (value) =>
              value === watch('password') || 'Those passwords do not match.',
          })}
        />
        <PrimaryButton type="submit" fullWidth loading={pending}>
          Create Account
        </PrimaryButton>
      </form>
    </AuthScreen>
  );
}

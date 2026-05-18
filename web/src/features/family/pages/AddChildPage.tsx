import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { functionsService } from '../../../core/services/functionsService';
import { useAction } from '../../../core/hooks/useAction';
import { PageHeader } from '../../../core/components/PageHeader';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { Card } from '../../../core/components/Card';
import { rules } from '../../../core/utils/validators';

interface AddChildForm {
  displayName: string;
  email: string;
  password: string;
}

/** Parent adds a child account via the createChildAccount function (doc 06 §5.6). */
export function AddChildPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddChildForm>();
  const { run, pending, error } = useAction(functionsService.createChildAccount);
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState<AddChildForm | null>(null);

  async function onSubmit(data: AddChildForm): Promise<void> {
    const result = await run({
      displayName: data.displayName.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    if (result) {
      setCreated(data);
    }
  }

  // Confirmation: show the credentials so the parent can pass them to the kid.
  if (created) {
    return (
      <div>
        <PageHeader title="Child added!" />
        <Card>
          <p className="mb-4 text-body">
            <strong>{created.displayName}</strong> can now log in as a Kid with
            this email and password:
          </p>
          <dl className="mb-5 space-y-2 rounded-xl bg-bgLight p-4 text-body">
            <div className="flex justify-between gap-4">
              <dt className="text-textMuted">Email</dt>
              <dd className="break-all font-semibold">{created.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-textMuted">Password</dt>
              <dd className="font-semibold">{created.password}</dd>
            </div>
          </dl>
          <PrimaryButton fullWidth onClick={() => navigate('/parent/family')}>
            Done
          </PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Add a Child" />
      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormError message={error} />
          <TextField
            label="Child's name"
            error={errors.displayName?.message}
            {...register('displayName', rules.displayName)}
          />
          <TextField
            label="Login email"
            type="email"
            hint="The child uses this to log in on the Kid path."
            error={errors.email?.message}
            {...register('email', rules.email)}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password?.message}
            {...register('password', rules.password)}
          />
          <label className="flex items-center gap-2 text-body text-textMuted">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4"
            />
            Show password
          </label>
          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              fullWidth
              onClick={() => navigate('/parent/family')}
              disabled={pending}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={pending}>
              Create Account
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { Modal } from '../../../core/components/Modal';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { functionsService } from '../../../core/services/functionsService';
import { useAction } from '../../../core/hooks/useAction';
import { rules } from '../../../core/utils/validators';
import { LIMITS } from '../../../core/utils/constants';
import type { UserProfile } from '../../../models/userProfile';

interface ChildManageModalProps {
  open: boolean;
  child: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}

interface ManageForm {
  displayName: string;
  newPassword: string;
}

/**
 * Lets a parent rename a child and/or reset their password via
 * `updateChildCredentials` (doc 06 §5.7). The password field is optional —
 * leaving it blank keeps the current password.
 */
export function ChildManageModal({
  open,
  child,
  onClose,
  onSaved,
}: ChildManageModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManageForm>({
    defaultValues: { displayName: child.displayName, newPassword: '' },
  });
  const { run, pending, error } = useAction(
    functionsService.updateChildCredentials,
  );

  async function onSubmit(data: ManageForm): Promise<void> {
    const result = await run({
      childUid: child.id,
      displayName: data.displayName.trim(),
      newPassword: data.newPassword ? data.newPassword : undefined,
    });
    if (result) {
      reset({ displayName: data.displayName, newPassword: '' });
      onSaved();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Manage ${child.displayName}`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError message={error} />
        <TextField
          label="Display name"
          error={errors.displayName?.message}
          {...register('displayName', rules.displayName)}
        />
        <TextField
          label="New password"
          type="password"
          hint="Leave blank to keep the current password."
          error={errors.newPassword?.message}
          {...register('newPassword', {
            validate: (value) =>
              !value ||
              value.length >= LIMITS.passwordMin ||
              `Password must be at least ${LIMITS.passwordMin} characters.`,
          })}
        />
        <div className="flex gap-3">
          <SecondaryButton
            type="button"
            fullWidth
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" fullWidth loading={pending}>
            Save
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

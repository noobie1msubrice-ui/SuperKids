import { Modal } from './Modal';
import { PrimaryButton, SecondaryButton, DangerButton } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
  /** Shows a spinner on the confirm button while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A yes/no confirmation modal for destructive or important actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const Confirm = danger ? DangerButton : PrimaryButton;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-body text-textMuted">{message}</p>
      <div className="flex gap-3">
        <SecondaryButton fullWidth onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </SecondaryButton>
        <Confirm fullWidth onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Confirm>
      </div>
    </Modal>
  );
}

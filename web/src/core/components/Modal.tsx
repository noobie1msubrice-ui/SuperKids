import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** A centred modal dialog with a backdrop. Closes on Escape or backdrop click. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-textPrimary/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="mb-4 text-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

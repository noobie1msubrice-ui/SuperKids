interface FormErrorProps {
  /** The message to show; the component renders nothing when empty. */
  message?: string | null;
}

/** A red banner for a form-level error (failed submit, server rejection). */
export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p
      role="alert"
      className="rounded-xl bg-danger/10 px-3 py-2 text-body font-semibold text-danger"
    >
      {message}
    </p>
  );
}

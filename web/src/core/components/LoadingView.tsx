import { Spinner } from './Spinner';

interface LoadingViewProps {
  /** Optional label shown beneath the spinner. */
  label?: string;
  /** Fills the viewport height — used for the initial app load. */
  fullScreen?: boolean;
}

/** A centred spinner shown while data or auth state is resolving. */
export function LoadingView({ label, fullScreen = false }: LoadingViewProps) {
  return (
    <div
      className={
        'flex flex-col items-center justify-center gap-3 text-primary ' +
        (fullScreen ? 'min-h-screen' : 'py-16')
      }
    >
      <Spinner className="h-10 w-10" />
      {label && <p className="text-body text-textMuted">{label}</p>}
    </div>
  );
}

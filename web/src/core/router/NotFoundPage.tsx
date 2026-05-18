import { Link } from 'react-router-dom';
import { PrimaryButton } from '../components/Button';

/** The friendly 404 page for any unknown route (doc 06 §3). */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl" aria-hidden>
        🔭
      </div>
      <h1 className="text-title">We couldn't find that page</h1>
      <p className="text-body text-textMuted">
        The page you were looking for isn't here.
      </p>
      <Link to="/">
        <PrimaryButton>Go home</PrimaryButton>
      </Link>
    </div>
  );
}

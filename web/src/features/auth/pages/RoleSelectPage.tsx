import { useNavigate } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';

/** The first screen: choose the Parent or Kid experience (doc 06 §4.2). */
export function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <AuthScreen title="Who's using SuperKids?">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/parent/login')}
          className="flex items-center gap-4 rounded-2xl border-2 border-primary/20 bg-bgLight p-4 text-left transition-colors hover:border-primary"
        >
          <span className="text-4xl" aria-hidden>
            👨‍👩‍👧
          </span>
          <span className="text-section">I'm a Parent</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/child/login')}
          className="flex items-center gap-4 rounded-2xl border-2 border-secondary/20 bg-bgLight p-4 text-left transition-colors hover:border-secondary"
        >
          <span className="text-4xl" aria-hidden>
            🧒
          </span>
          <span className="text-section">I'm a Kid</span>
        </button>
      </div>
    </AuthScreen>
  );
}

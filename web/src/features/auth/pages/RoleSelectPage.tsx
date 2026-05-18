import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { AdminAuthModal } from '../../admin/components/AdminAuthModal';

/** The first screen: choose the Parent or Kid experience (doc 06 §4.2). */
export function RoleSelectPage() {
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

  // Hidden entry point: typing "admin" anywhere on this screen opens the
  // Admin login / sign-up dialog.
  useEffect(() => {
    let buffer = '';
    function onKey(e: KeyboardEvent): void {
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key).toLowerCase().slice(-5);
      if (buffer === 'admin') {
        buffer = '';
        setAdminOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <AuthScreen title="Who's using Winkz?">
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
      <AdminAuthModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

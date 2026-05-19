import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { AdminAuthModal } from '../../admin/components/AdminAuthModal';
import { useAuth } from '../../../core/context/AuthContext';
import { useTranslation } from '../../../core/i18n/LanguageContext';

/** The first screen: choose the Parent or Kid experience (doc 06 §4.2). */
export function RoleSelectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);

  // Hidden entry point: typing "admin" anywhere on this screen opens the
  // Admin login / sign-up dialog — or, when an admin is already signed in,
  // jumps straight to the Admin panel with no re-login.
  useEffect(() => {
    let buffer = '';
    function onKey(e: KeyboardEvent): void {
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key).toLowerCase().slice(-5);
      if (buffer === 'admin') {
        buffer = '';
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          setAdminOpen(true);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profile, navigate]);

  return (
    <>
      <AuthScreen title={t('role.title')}>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/parent/login')}
          className="flex items-center gap-4 rounded-2xl border-2 border-primary/20 bg-bgLight p-4 text-left transition-colors hover:border-primary"
        >
          <span className="text-4xl" aria-hidden>
            👨‍👩‍👧
          </span>
          <span className="text-section">{t('role.parent')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/child/login')}
          className="flex items-center gap-4 rounded-2xl border-2 border-secondary/20 bg-bgLight p-4 text-left transition-colors hover:border-secondary"
        >
          <span className="text-4xl" aria-hidden>
            🧒
          </span>
          <span className="text-section">{t('role.child')}</span>
        </button>
      </div>
      </AuthScreen>
      <AdminAuthModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthScreen } from '../components/AuthScreen';
import { AdminAuthModal } from '../../admin/components/AdminAuthModal';
import { useAuth } from '../../../core/context/AuthContext';
import {
  hasPickedLanguage,
  useTranslation,
} from '../../../core/i18n/LanguageContext';
import { ParentIcon, KidIcon } from '../../../core/components/icons';
import { sound } from '../../../core/utils/sound';
import type { Lang } from '../../../core/i18n/translations';

/** The first screen: choose the Parent or Kid experience (doc 06 §4.2). */
export function RoleSelectPage() {
  const navigate = useNavigate();
  const { t, setLang } = useTranslation();
  const { profile } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);
  // First-time visitors get a non-dismissible language popup over the menu;
  // once they pick, the choice is saved and the popup never reappears.
  const [langOpen, setLangOpen] = useState(() => !hasPickedLanguage());

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

  function pickLanguage(lang: Lang): void {
    sound.click();
    setLang(lang);
    setLangOpen(false);
  }

  return (
    <>
      <AuthScreen title={t('role.title')}>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            sound.click();
            navigate('/parent/login');
          }}
          className="group flex items-center gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-bgLight p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-cardHover active:scale-[0.98]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
            <ParentIcon className="h-8 w-8" />
          </span>
          <span className="text-section font-bold">{t('role.parent')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.click();
            navigate('/child/login');
          }}
          className="group flex items-center gap-4 rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-bgLight p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-secondary hover:shadow-cardHover active:scale-[0.98]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary transition-colors group-hover:bg-secondary/25">
            <KidIcon className="h-8 w-8" />
          </span>
          <span className="text-section font-bold">{t('role.child')}</span>
        </button>
      </div>
      </AuthScreen>
      <AdminAuthModal open={adminOpen} onClose={() => setAdminOpen(false)} />

      {langOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-textPrimary/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-popup-title"
        >
          <div className="animate-pop-in w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">
            <h2 id="lang-popup-title" className="text-title">
              Choose your language
            </h2>
            <p className="mt-1 text-body text-textMuted">
              Chọn ngôn ngữ của bạn
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => pickLanguage('en')}
                className="group flex items-center gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-bgLight p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-cardHover active:scale-[0.98]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-extrabold text-primary transition-colors group-hover:bg-primary/25">
                  EN
                </span>
                <span className="text-section font-bold">English</span>
              </button>

              <button
                type="button"
                onClick={() => pickLanguage('vi')}
                className="group flex items-center gap-4 rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-bgLight p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-secondary hover:shadow-cardHover active:scale-[0.98]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-lg font-extrabold text-secondary transition-colors group-hover:bg-secondary/25">
                  VI
                </span>
                <span className="text-section font-bold">Tiếng Việt</span>
              </button>
            </div>

            <p className="mt-5 text-center text-caption text-textMuted">
              You can change this later in Settings · Bạn có thể đổi sau trong Cài đặt
            </p>
          </div>
        </div>
      )}
    </>
  );
}

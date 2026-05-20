import { useNavigate } from 'react-router-dom';
import { StarIcon } from '../../../core/components/icons';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import { sound } from '../../../core/utils/sound';
import type { Lang } from '../../../core/i18n/translations';

/**
 * The very first screen a new visitor sees: pick a language before any
 * login UI. Bilingual on purpose — they haven't picked yet. Once they choose,
 * the LanguageContext writes the storage key and this screen is never shown
 * again (RootRedirect skips it).
 */
export function LanguageSelectPage() {
  const navigate = useNavigate();
  const { setLang } = useTranslation();

  function choose(lang: Lang): void {
    sound.click();
    setLang(lang);
    navigate('/role-select', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-bgLight to-secondary/10 px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#7C7CEC] shadow-pop">
          <StarIcon className="h-7 w-7 text-star" />
        </span>
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-title font-extrabold text-transparent">
          Winkz
        </span>
      </div>

      <div className="animate-pop-in w-full max-w-sm rounded-2xl bg-surface p-6 shadow-card">
        <h1 className="text-title">Choose your language</h1>
        <p className="mt-1 text-body text-textMuted">Chọn ngôn ngữ của bạn</p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => choose('en')}
            className="group flex items-center gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-bgLight p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-cardHover active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-extrabold text-primary transition-colors group-hover:bg-primary/25">
              EN
            </span>
            <span className="text-section font-bold">English</span>
          </button>

          <button
            type="button"
            onClick={() => choose('vi')}
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
  );
}

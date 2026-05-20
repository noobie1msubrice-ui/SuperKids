import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Lang } from './translations'

const STORAGE_KEY = 'winkz.lang'

/**
 * True once the user has explicitly chosen a language (the first-visit
 * language picker writes the storage key). Until then we route them to the
 * picker before any login UI.
 */
export function hasPickedLanguage(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== null
}

type Vars = Record<string, string | number>

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Translates a key for the current language, filling `{name}` placeholders. */
  t: (key: string, vars?: Vars) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'vi' || stored === 'en' ? stored : 'en'
}

/** Provides the active language and a `t()` translator to the whole app. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      let text = translations[lang][key] ?? translations.en[key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(value))
        }
      }
      return text
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider.')
  }
  return ctx
}

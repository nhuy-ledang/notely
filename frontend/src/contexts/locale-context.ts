import { createContext } from 'react'
import type { Locale } from '@/i18n/locales'

export type LocaleContextValue = {
  locale: Locale
  setLocale: (next: Locale) => Promise<void>
  /** Optional `{var}` interpolation in the translated string. */
  t: (key: string, vars?: Record<string, string | number>) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

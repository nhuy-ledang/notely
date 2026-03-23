import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { bundles } from '@/i18n/bundles'
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  type Locale,
} from '@/i18n/locales'
import { useAuth } from '@/hooks/useAuth'
import { LocaleContext } from './locale-context'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user, token, ready, patchProfile } = useAuth()
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())

  useEffect(() => {
    document.documentElement.lang = locale === 'vi' ? 'vi' : 'en'
  }, [locale])

  useEffect(() => {
    if (!ready || !user) {
      return
    }
    const raw = user.preferences?.locale
    if (isLocale(raw)) {
      setLocaleState(raw)
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, raw)
      } catch {
        /* ignore */
      }
    }
  }, [ready, user])

  const setLocale = useCallback(
    async (next: Locale) => {
      setLocaleState(next)
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      if (token) {
        try {
          await patchProfile({ preferences: { locale: next } })
        } catch {
          /* keep local choice */
        }
      }
    },
    [token, patchProfile],
  )

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = bundles[locale][key] ?? bundles.en[key] ?? bundles[DEFAULT_LOCALE][key] ?? key
      if (vars) {
        s = s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
      }
      return s
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

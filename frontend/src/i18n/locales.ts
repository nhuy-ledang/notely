export type Locale = 'vi' | 'en'

export const LOCALE_STORAGE_KEY = 'notely_locale'

export const DEFAULT_LOCALE: Locale = 'vi'

export function isLocale(value: unknown): value is Locale {
  return value === 'vi' || value === 'en'
}

export function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(raw)) {
      return raw
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

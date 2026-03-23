export type ThemePreference = 'light' | 'dark' | 'system'
export type AccentId = 'purple' | 'teal' | 'coral'
export type FontId = 'manrope' | 'inter' | 'playfair'

export type PersonalizationState = {
  theme: ThemePreference
  accent: AccentId
  font: FontId
}

export const PERSONALIZATION_STORAGE_KEY = 'notely-personalization-v1'

export const DEFAULT_PERSONALIZATION: PersonalizationState = {
  theme: 'light',
  accent: 'purple',
  font: 'manrope',
}

const ACCENT_VARS: Record<
  AccentId,
  Record<string, string>
> = {
  purple: {
    '--color-primary': '#3525cd',
    '--color-primary-container': '#4f46e5',
    '--color-surface-tint': '#4d44e3',
    '--color-primary-fixed': '#e2dfff',
    '--color-primary-fixed-dim': '#c3c0ff',
    '--color-on-primary-fixed-variant': '#3323cc',
    '--color-inverse-primary': '#c3c0ff',
  },
  teal: {
    '--color-primary': '#0f766e',
    '--color-primary-container': '#14b8a6',
    '--color-surface-tint': '#0d9488',
    '--color-primary-fixed': '#ccfbf1',
    '--color-primary-fixed-dim': '#5eead4',
    '--color-on-primary-fixed-variant': '#115e59',
    '--color-inverse-primary': '#5eead4',
  },
  coral: {
    '--color-primary': '#be123c',
    '--color-primary-container': '#e11d48',
    '--color-surface-tint': '#fb7185',
    '--color-primary-fixed': '#ffe4e6',
    '--color-primary-fixed-dim': '#fda4af',
    '--color-on-primary-fixed-variant': '#9f1239',
    '--color-inverse-primary': '#fda4af',
  },
}

const FONT_VARS: Record<FontId, { headline: string; body: string }> = {
  manrope: {
    headline: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  inter: {
    headline: '"Inter", ui-sans-serif, system-ui, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  playfair: {
    headline: '"Playfair Display", Georgia, "Times New Roman", serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
}

export function resolveIsDark(theme: ThemePreference): boolean {
  if (theme === 'dark') {
    return true
  }
  if (theme === 'light') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function loadPersonalization(): PersonalizationState {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_PERSONALIZATION
    }
    const parsed = JSON.parse(raw) as Partial<PersonalizationState>
    return {
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system'
          ? parsed.theme
          : DEFAULT_PERSONALIZATION.theme,
      accent:
        parsed.accent === 'purple' || parsed.accent === 'teal' || parsed.accent === 'coral'
          ? parsed.accent
          : DEFAULT_PERSONALIZATION.accent,
      font:
        parsed.font === 'manrope' || parsed.font === 'inter' || parsed.font === 'playfair'
          ? parsed.font
          : DEFAULT_PERSONALIZATION.font,
    }
  } catch {
    return DEFAULT_PERSONALIZATION
  }
}

export function savePersonalization(state: PersonalizationState) {
  localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(state))
}

export function applyPersonalizationToDocument(state: PersonalizationState) {
  const root = document.documentElement
  const dark = resolveIsDark(state.theme)
  root.classList.toggle('dark', dark)
  root.classList.toggle('light', !dark)

  for (const [key, value] of Object.entries(ACCENT_VARS[state.accent])) {
    root.style.setProperty(key, value)
  }

  const fonts = FONT_VARS[state.font]
  root.style.setProperty('--font-headline', fonts.headline)
  root.style.setProperty('--font-body', fonts.body)
}

/** If `prefs` contains valid theme/accent/font keys, return them; otherwise null. */
export function personalizationFromUserRecord(
  prefs: Record<string, unknown> | undefined,
): PersonalizationState | null {
  if (!prefs) {
    return null
  }
  const theme = prefs.theme
  const accent = prefs.accent
  const font = prefs.font
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
    return null
  }
  if (accent !== 'purple' && accent !== 'teal' && accent !== 'coral') {
    return null
  }
  if (font !== 'manrope' && font !== 'inter' && font !== 'playfair') {
    return null
  }
  return { theme, accent, font }
}

export function accentHex(accent: AccentId): string {
  switch (accent) {
    case 'purple':
      return '#4f46e5'
    case 'teal':
      return '#14b8a6'
    case 'coral':
      return '#e11d48'
    default:
      return '#4f46e5'
  }
}

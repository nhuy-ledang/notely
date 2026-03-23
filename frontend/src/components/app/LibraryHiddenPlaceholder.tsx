import { Link } from 'react-router-dom'
import { useLocale } from '@/hooks/useLocale'

export function LibraryHiddenPlaceholder() {
  const { t } = useLocale()
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-8 py-12 text-center shadow-sm dark:border-outline-variant/30">
      <span className="material-symbols-outlined mb-4 block text-4xl text-on-surface-variant" aria-hidden>
        visibility_off
      </span>
      <h2 className="mb-2 font-manrope text-xl font-bold text-on-surface">{t('libraryHidden.title')}</h2>
      <p className="mb-6 text-sm leading-relaxed text-on-surface-variant font-body">{t('libraryHidden.body')}</p>
      <Link
        to="/app/settings"
        className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
      >
        {t('libraryHidden.openSettings')}
      </Link>
    </div>
  )
}

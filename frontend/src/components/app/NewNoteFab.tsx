import { Link, useLocation } from 'react-router-dom'
import { useLocale } from '@/hooks/useLocale'

export function NewNoteFab() {
  const { t } = useLocale()
  const { pathname } = useLocation()
  const collectionMatch = /^\/app\/collections\/(\d+)$/.exec(pathname)
  const to = collectionMatch
    ? `/app/notes/new?collectionId=${collectionMatch[1]}`
    : '/app/notes/new'

  return (
    <Link
      to={to}
      className="fixed bottom-24 left-6 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-[0_12px_40px_-8px_color-mix(in_srgb,var(--color-primary-container)_50%,transparent)] transition-[transform,box-shadow] hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-8 md:left-[calc(16rem+1.5rem)]"
      aria-label={t('fab.newNote')}
    >
      <span className="material-symbols-outlined text-3xl" aria-hidden>
        add
      </span>
    </Link>
  )
}

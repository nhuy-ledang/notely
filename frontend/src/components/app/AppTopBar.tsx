import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserAccountMenu } from '@/components/app/UserAccountMenu'
import { useDashboardSearch } from '@/hooks/useDashboardSearch'
import { useLocale } from '@/hooks/useLocale'

export function AppTopBar() {
  const { t } = useLocale()
  const { search, setSearch } = useDashboardSearch()
  const [draft, setDraft] = useState(search)

  useEffect(() => {
    setDraft(search)
  }, [search])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(draft)
    }, 320)
    return () => window.clearTimeout(id)
  }, [draft, setSearch])

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest/95 px-8 text-sm font-medium shadow-sm backdrop-blur-md dark:border-outline-variant/25 dark:shadow-none md:left-64 font-manrope">
      <div className="flex max-w-xl flex-1 items-center">
        <div className="group relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            id="dashboard-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            className="w-full rounded-full border-none bg-slate-100/50 py-2.5 pl-12 pr-4 text-on-surface transition-all placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-primary/25 dark:bg-slate-800/50"
          />
        </div>
      </div>
      <div className="ml-8 flex items-center gap-6">
        <Link
          to="/app/starred"
          className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container active:scale-95"
          aria-label={t('topbar.starredAria')}
        >
          <span className="material-symbols-outlined">star</span>
        </Link>
        <Link
          to="/app"
          className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container active:scale-95"
          aria-label={t('topbar.allNotesAria')}
        >
          <span className="material-symbols-outlined">grid_view</span>
        </Link>
        <UserAccountMenu />
      </div>
    </header>
  )
}

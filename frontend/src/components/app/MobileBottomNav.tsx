import { NavLink } from 'react-router-dom'
import { useLocale } from '@/hooks/useLocale'

const itemBase =
  'flex flex-col items-center justify-center rounded-2xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 active:scale-90'

const itemActive =
  'bg-primary-fixed text-primary dark:bg-primary-container/25 dark:text-primary-fixed-dim'

export function MobileBottomNav() {
  const { t } = useLocale()
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl border-t border-outline-variant/15 bg-surface-container-lowest/95 px-4 pb-6 pt-3 font-inter text-[10px] font-bold uppercase tracking-widest shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-outline-variant/25 dark:shadow-[0_-4px_28px_rgba(0,0,0,0.35)] md:hidden">
      <NavLink
        to="/app"
        end
        className={({ isActive }) =>
          `${itemBase} ${
            isActive ? itemActive : 'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800'
          }`
        }
      >
        <span className="material-symbols-outlined mb-1">home</span>
        {t('mobile.home')}
      </NavLink>
      <NavLink
        to="/app/collections"
        className={({ isActive }) =>
          `${itemBase} ${
            isActive ? itemActive : 'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800'
          }`
        }
      >
        <span className="material-symbols-outlined mb-1">folder_special</span>
        Collections
      </NavLink>
      <a
        href="#dashboard-search"
        className={`${itemBase} text-on-surface-variant hover:bg-surface-container`}
      >
        <span className="material-symbols-outlined mb-1">search</span>
        {t('mobile.search')}
      </a>
      <NavLink
        to="/app/starred"
        className={({ isActive }) =>
          `${itemBase} ${
            isActive ? itemActive : 'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800'
          }`
        }
      >
        <span className="material-symbols-outlined mb-1">star</span>
        {t('mobile.starred')}
      </NavLink>
      <NavLink
        to="/app/settings"
        className={({ isActive }) =>
          `${itemBase} ${
            isActive ? itemActive : 'text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800'
          }`
        }
      >
        <span className="material-symbols-outlined mb-1">settings</span>
        {t('mobile.settings')}
      </NavLink>
    </nav>
  )
}

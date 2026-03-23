import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'

const linkBase =
  'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:translate-x-1'

const linkInactive =
  'text-secondary hover:text-primary dark:text-on-surface-variant dark:hover:text-primary-fixed-dim'

const linkActive =
  'bg-primary-fixed text-primary dark:bg-primary-container/25 dark:text-primary-fixed-dim'

const bottomLinkClass =
  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'

const bottomIconClass =
  'material-symbols-outlined text-xl text-on-surface-variant/75 dark:text-on-surface-variant/65'

export function AppSidebar() {
  const { logout } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="z-40 hidden h-screen w-64 flex-col border-r border-outline-variant/10 bg-slate-50 text-sm shadow-none dark:border-outline-variant/20 dark:bg-surface-dim md:flex font-inter">
      <div className="flex h-full flex-col gap-2 p-6">
        <div className="mb-10 px-4">
          <NavLink to="/app" className="block">
            <h1 className="font-manrope text-2xl font-extrabold tracking-tight text-primary dark:text-primary-fixed-dim">
              Notely
            </h1>
          </NavLink>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/75">
            {t('sidebar.tagline')}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span className="material-symbols-outlined">description</span>
            {t('sidebar.allNotes')}
          </NavLink>
          <NavLink
            to="/app/collections"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span className="material-symbols-outlined">folder_special</span>
            {t('sidebar.collections')}
          </NavLink>
          <NavLink
            to="/app/starred"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span className="material-symbols-outlined">grade</span>
            {t('sidebar.important')}
          </NavLink>
          {/* <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span className="material-symbols-outlined">person</span>
            My profile
          </NavLink> */}
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span className="material-symbols-outlined">settings</span>
            {t('sidebar.settings')}
          </NavLink>
        </nav>

        <div className="mt-auto flex flex-col gap-4 px-4 pb-4 pt-2">
          <div className="flex flex-col gap-0.5 border-t border-outline-variant/25 pt-4 dark:border-outline-variant/30">
            <NavLink
              to="/app/help"
              className={({ isActive }) =>
                `${bottomLinkClass} ${isActive ? 'bg-primary-fixed/50 dark:bg-primary-container/20' : ''}`
              }
            >
              <span className={bottomIconClass} aria-hidden>
                help
              </span>
              {t('sidebar.help')}
            </NavLink>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={bottomLinkClass}
            >
              <span className={bottomIconClass} aria-hidden>
                logout
              </span>
              Log out
            </button>
          </div>

          <div className="rounded-2xl bg-primary-fixed p-4 dark:bg-primary-container/20">
            <p className="font-manrope text-xs font-bold text-on-primary-fixed dark:text-primary-fixed-dim">
              {t('sidebar.upgradeTitle')}
            </p>
            <p className="mt-2 text-[10px] font-medium leading-relaxed text-on-primary-fixed-variant dark:text-primary-fixed-dim/85">
              {t('sidebar.upgradeBody')}
            </p>
            <Link
              to="/register"
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-on-primary shadow-sm transition-transform active:scale-95"
            >
              {t('sidebar.upgradeCta')}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

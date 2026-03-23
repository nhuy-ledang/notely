import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePersonalization } from '@/contexts/personalization-context'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'

const FALLBACK_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBjEUrg3-7a4mRaL7HeD6XmdX1Uesx-8mrIAbad62-37HP3FOCIigWOv7791sh_vLWyt0QTP8jwIUpLLER6x5pw5ucAAVVm_kR25PfdULHaqspTw3eoTv9YPUOzXYyjJIl8L9qwh1xirWufBKkJbG80woj4JyTIXPK-qodqQzZFfk6o36M5SKQdfsLA_ZXyvojE_NNEuqyvm9aTYI7ndQZob7s7y9sUIOCnC6wWKauoqD-7F32hUGKi-S3AxN95sQRIYw8fYhRoMhsS'

const menuItemClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container'

const menuIconClass = 'material-symbols-outlined text-xl text-on-surface-variant'

export function UserAccountMenu() {
  const { user, logout } = useAuth()
  const { t } = useLocale()
  const { openModal } = usePersonalization()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant/25 text-sm font-bold text-on-surface outline-none ring-primary/35 transition-transform hover:opacity-95 focus-visible:ring-2 active:scale-95 dark:border-outline-variant/40"
        aria-label={t('userMenu.aria')}
      >
        {user ? (
          <span className="flex h-full w-full items-center justify-center bg-primary-fixed font-manrope text-primary">
            {initial}
          </span>
        ) : (
          <img src={FALLBACK_AVATAR} alt="" className="h-full w-full object-cover" />
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-outline-variant/20 bg-surface-container-lowest py-2 shadow-lg shadow-black/10 dark:border-outline-variant/35 dark:bg-surface-container-low dark:shadow-black/50"
        >
          <div className="border-b border-outline-variant/15 px-4 pb-3 pt-1 dark:border-outline-variant/25">
            <p className="truncate font-manrope text-base font-bold text-on-surface">
              {user?.name ?? t('userMenu.guest')}
            </p>
            <p className="mt-0.5 truncate text-sm text-on-surface-variant">
              {user?.email ?? ''}
            </p>
          </div>

          <nav className="flex flex-col gap-0.5 p-2" aria-label="Account">
            <Link
              to="/app/profile"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <span className={menuIconClass} aria-hidden>
                person
              </span>
              {t('userMenu.profile')}
            </Link>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false)
                openModal()
              }}
            >
              <span className={menuIconClass} aria-hidden>
                tune
              </span>
              {t('userMenu.personalization')}
            </button>
            <Link
              to="/app/settings"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <span className={menuIconClass} aria-hidden>
                manage_accounts
              </span>
              {t('userMenu.settings')}
            </Link>
            <Link
              to="/app/help"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <span className={menuIconClass} aria-hidden>
                help
              </span>
              {t('userMenu.help')}
            </Link>
          </nav>

          <div className="border-t border-outline-variant/15 p-2 dark:border-outline-variant/25">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden>
                logout
              </span>
              {t('userMenu.logout')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

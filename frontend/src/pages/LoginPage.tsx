import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { GoogleMark } from '@/components/landing/GoogleMark'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { ApiError, getErrorMessage, getGoogleOAuthUrl } from '@/lib/api'

export function LoginPage() {
  const { loginWithPassword } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/app'

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = t('login.docTitle')
  }, [t])

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('oauth_error')
    if (q) {
      setError(q)
      navigate('/login', { replace: true, state: location.state })
    }
  }, [location.search, location.state, navigate])

  function goGoogle() {
    setError(null)
    try {
      window.location.assign(getGoogleOAuthUrl())
    } catch {
      setError(t('login.missingApi'))
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')

    setPending(true)
    try {
      await loginWithPassword(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const body = err instanceof ApiError ? err.body : undefined
      setError(getErrorMessage(body, err instanceof Error ? err.message : t('login.failed')))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-sm space-y-8">
        <header className="space-y-1">
          <h2 className="font-headline text-2xl font-bold text-on-surface">{t('login.title')}</h2>
          <p className="text-sm text-on-surface-variant font-body">{t('login.subtitle')}</p>
        </header>

        <div className="space-y-4">
          <button
            type="button"
            onClick={goGoogle}
            disabled={pending}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-3.5 transition-all duration-200 hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleMark />
            <span className="text-sm font-semibold text-on-surface">{t('login.google')}</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-surface-variant/50" />
            <span className="mx-4 shrink font-label text-[10px] uppercase tracking-[0.2em] text-outline/50">
              {t('login.orEmail')}
            </span>
            <div className="grow border-t border-surface-variant/50" />
          </div>

          {error ? (
            <p
              className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container font-body"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="group">
                <label htmlFor="email" className="sr-only">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={pending}
                  placeholder={t('login.placeholderEmail')}
                  className="w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <div className="group relative">
                <label htmlFor="password" className="sr-only">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  placeholder={t('login.placeholderPassword')}
                  className="w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
                <a
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-primary/60 transition-colors hover:text-primary"
                  href="#"
                >
                  {t('login.forgot')}
                </a>
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-on-surface py-3.5 font-headline text-sm font-bold text-surface transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <footer className="pt-2 text-center">
          <p className="text-sm text-on-surface-variant font-body">
            {t('login.newHere')}{' '}
            <Link
              to="/register"
              className="font-bold text-primary underline decoration-1 underline-offset-4 transition-all hover:underline"
            >
              {t('login.createAccount')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  )
}

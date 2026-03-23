import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { GoogleMark } from '@/components/landing/GoogleMark'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { ApiError, getErrorMessage, getGoogleOAuthUrl } from '@/lib/api'

export function RegisterPage() {
  const { registerWithPassword } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Create account — Notely'
  }, [])

  function goGoogle() {
    setError(null)
    try {
      window.location.assign(getGoogleOAuthUrl())
    } catch {
      setError(t('register.missingApi'))
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')

    setPending(true)
    try {
      await registerWithPassword({ name, email, password })
      navigate('/app', { replace: true })
    } catch (err) {
      const body = err instanceof ApiError ? err.body : undefined
      setError(getErrorMessage(body, err instanceof Error ? err.message : t('register.failed')))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-sm space-y-8">
        <header className="space-y-1">
          <h2 className="font-headline text-2xl font-bold text-on-surface">{t('register.title')}</h2>
          <p className="text-sm text-on-surface-variant font-body">{t('register.subtitle')}</p>
        </header>

        <div className="space-y-4">
          <button
            type="button"
            onClick={goGoogle}
            disabled={pending}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-surface-variant bg-surface-container-lowest px-4 py-3.5 transition-all duration-200 hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleMark />
            <span className="text-sm font-semibold text-on-surface">{t('register.google')}</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-surface-variant/50" />
            <span className="mx-4 shrink font-label text-[10px] uppercase tracking-[0.2em] text-outline/50">
              {t('register.orEmail')}
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
              <div>
                <label htmlFor="name" className="sr-only">
                  {t('register.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={pending}
                  placeholder={t('register.placeholderName')}
                  className="w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="sr-only">
                  {t('login.email')}
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={pending}
                  placeholder={t('register.placeholderEmail')}
                  className="w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="sr-only">
                  {t('login.password')}
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={pending}
                  placeholder={t('register.placeholderPassword')}
                  className="w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface transition-all placeholder:text-outline/40 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-on-surface py-3.5 font-headline text-sm font-bold text-surface transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {pending ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        </div>

        <footer className="pt-2 text-center">
          <p className="text-sm text-on-surface-variant font-body">
            {t('register.haveAccount')}{' '}
            <Link
              to="/login"
              className="font-bold text-primary underline decoration-1 underline-offset-4 transition-all hover:underline"
            >
              {t('register.signIn')}
            </Link>
          </p>
        </footer>
      </div>
    </AuthSplitLayout>
  )
}

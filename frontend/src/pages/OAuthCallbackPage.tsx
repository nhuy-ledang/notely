import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const oauthErrorMessages: Record<string, string> = {
  oauth_failed: 'Google sign-in was cancelled or failed. Try again.',
  no_email: 'Your Google account did not share an email address.',
  account_mismatch: 'This email is already linked to another Google account.',
  missing_token: 'Sign-in did not complete. Try again.',
}

export function OAuthCallbackPage() {
  const { completeOAuthWithToken } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in…')

  useEffect(() => {
    document.title = 'Signing in — Notely'
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      const query = new URLSearchParams(window.location.search)
      const errKey = query.get('error')
      if (errKey) {
        const text = oauthErrorMessages[errKey] ?? oauthErrorMessages.oauth_failed
        navigate(`/login?oauth_error=${encodeURIComponent(text)}`, { replace: true })
        return
      }

      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')

      if (!accessToken) {
        navigate(`/login?oauth_error=${encodeURIComponent(oauthErrorMessages.missing_token)}`, {
          replace: true,
        })
        return
      }

      try {
        await completeOAuthWithToken(accessToken)
        if (!cancelled) {
          navigate('/app', { replace: true })
        }
      } catch {
        if (!cancelled) {
          setMessage('Could not finish sign-in.')
          navigate(
            `/login?oauth_error=${encodeURIComponent('Could not verify your session. Try again.')}`,
            { replace: true },
          )
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [completeOAuthWithToken, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface font-body text-on-surface">
      <p className="text-sm text-on-surface-variant">{message}</p>
    </div>
  )
}

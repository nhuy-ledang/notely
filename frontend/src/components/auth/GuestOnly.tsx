import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function GuestOnly() {
  const { token, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface font-body text-sm text-on-surface-variant">
        Loading…
      </div>
    )
  }

  if (token) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}

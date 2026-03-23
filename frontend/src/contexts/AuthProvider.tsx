import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, TOKEN_STORAGE_KEY } from '@/lib/api'
import type { ApiUser } from '@/types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [ready, setReady] = useState(false)

  const persistToken = useCallback((value: string | null) => {
    setToken(value)
    try {
      if (value) {
        localStorage.setItem(TOKEN_STORAGE_KEY, value)
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(TOKEN_STORAGE_KEY)
      } catch {
        stored = null
      }

      if (!stored) {
        if (!cancelled) {
          setReady(true)
        }
        return
      }

      try {
        const { user: nextUser } = await authApi.me(stored)
        if (!cancelled) {
          setUser(nextUser)
          setToken(stored)
        }
      } catch {
        if (!cancelled) {
          persistToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [persistToken])

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password)
      persistToken(data.access_token)
      setUser(data.user)
    },
    [persistToken],
  )

  const registerWithPassword = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      const data = await authApi.register(payload)
      persistToken(data.access_token)
      setUser(data.user)
    },
    [persistToken],
  )

  const completeOAuthWithToken = useCallback(
    async (accessToken: string) => {
      const { user: nextUser } = await authApi.me(accessToken)
      persistToken(accessToken)
      setUser(nextUser)
    },
    [persistToken],
  )

  const patchProfile = useCallback(
    async (payload: { name?: string; email?: string; preferences?: Record<string, unknown> }) => {
      if (!token) {
        throw new Error('Not signed in')
      }
      const { user: next } = await authApi.patchMe(token, payload)
      setUser(next)
    },
    [token],
  )

  const deleteAccount = useCallback(async () => {
    if (!token) {
      throw new Error('Not signed in')
    }
    await authApi.deleteMe(token)
    persistToken(null)
    setUser(null)
  }, [token, persistToken])

  const refreshMe = useCallback(async () => {
    if (!token) {
      return
    }
    const { user: next } = await authApi.me(token)
    setUser(next)
  }, [token])

  const logout = useCallback(async () => {
    let active = token
    if (!active) {
      try {
        active = localStorage.getItem(TOKEN_STORAGE_KEY)
      } catch {
        active = null
      }
    }

    if (active) {
      try {
        await authApi.logout(active)
      } catch {
        /* still clear client */
      }
    }
    persistToken(null)
    setUser(null)
  }, [token, persistToken])

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      loginWithPassword,
      registerWithPassword,
      completeOAuthWithToken,
      logout,
      patchProfile,
      deleteAccount,
      refreshMe,
    }),
    [
      user,
      token,
      ready,
      loginWithPassword,
      registerWithPassword,
      completeOAuthWithToken,
      logout,
      patchProfile,
      deleteAccount,
      refreshMe,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

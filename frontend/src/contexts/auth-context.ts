import { createContext } from 'react'
import type { ApiUser } from '@/types/auth'

export type AuthContextValue = {
  user: ApiUser | null
  token: string | null
  ready: boolean
  loginWithPassword: (email: string, password: string) => Promise<void>
  registerWithPassword: (payload: { name: string; email: string; password: string }) => Promise<void>
  completeOAuthWithToken: (accessToken: string) => Promise<void>
  logout: () => Promise<void>
  patchProfile: (payload: {
    name?: string
    email?: string
    preferences?: Record<string, unknown>
  }) => Promise<void>
  deleteAccount: () => Promise<void>
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

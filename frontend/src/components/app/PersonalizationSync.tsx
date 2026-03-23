import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePersonalization } from '@/contexts/personalization-context'
import { personalizationFromUserRecord } from '@/lib/personalization'

/**
 * After sign-in or session restore, applies theme/accent/font from server `user.preferences`
 * when present. Runs once per user id so local edits are not overwritten on PATCH /me.
 */
export function PersonalizationSync() {
  const { user } = useAuth()
  const { commit } = usePersonalization()
  const lastUserId = useRef<number | null>(null)

  useEffect(() => {
    if (!user) {
      lastUserId.current = null
      return
    }
    if (lastUserId.current === user.id) {
      return
    }
    lastUserId.current = user.id
    const parsed = personalizationFromUserRecord(user.preferences)
    if (parsed) {
      commit(parsed)
    }
  }, [user, commit])

  return null
}

import { createContext, useContext } from 'react'
import type { PersonalizationState } from '@/lib/personalization'

export type PersonalizationContextValue = {
  preferences: PersonalizationState
  commit: (next: PersonalizationState) => void
  modalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const PersonalizationContext = createContext<PersonalizationContextValue | null>(null)

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext)
  if (!ctx) {
    throw new Error('usePersonalization must be used within PersonalizationProvider')
  }
  return ctx
}

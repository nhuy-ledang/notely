import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { PersonalizationModal } from '@/components/settings/PersonalizationModal'
import {
  applyPersonalizationToDocument,
  loadPersonalization,
  savePersonalization,
  type PersonalizationState,
} from '@/lib/personalization'
import { PersonalizationContext } from './personalization-context'

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<PersonalizationState>(() => loadPersonalization())
  const [modalOpen, setModalOpen] = useState(false)

  useLayoutEffect(() => {
    applyPersonalizationToDocument(preferences)
  }, [preferences])

  useEffect(() => {
    if (preferences.theme !== 'system') {
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyPersonalizationToDocument(preferences)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preferences])

  const commit = useCallback((next: PersonalizationState) => {
    setPreferences(next)
    savePersonalization(next)
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      commit,
      modalOpen,
      openModal: () => setModalOpen(true),
      closeModal: () => setModalOpen(false),
    }),
    [preferences, commit, modalOpen],
  )

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
      <PersonalizationModal />
    </PersonalizationContext.Provider>
  )
}

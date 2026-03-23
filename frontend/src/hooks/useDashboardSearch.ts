import { useContext } from 'react'
import { DashboardSearchContext } from '@/contexts/dashboard-search-context'

export function useDashboardSearch() {
  const ctx = useContext(DashboardSearchContext)
  if (!ctx) {
    throw new Error('useDashboardSearch must be used inside DashboardLayout')
  }
  return ctx
}

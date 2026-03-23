import { createContext } from 'react'

export type DashboardSearchValue = {
  search: string
  setSearch: (value: string) => void
}

export const DashboardSearchContext = createContext<DashboardSearchValue | null>(null)

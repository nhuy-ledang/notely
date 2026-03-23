import { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/app/AppSidebar'
import { AppTopBar } from '@/components/app/AppTopBar'
import { MobileBottomNav } from '@/components/app/MobileBottomNav'
import { NewNoteFab } from '@/components/app/NewNoteFab'
import { PersonalizationSync } from '@/components/app/PersonalizationSync'
import { DashboardSearchContext } from '@/contexts/dashboard-search-context'

export function DashboardLayout() {
  const [search, setSearch] = useState('')
  const searchValue = useMemo(() => ({ search, setSearch }), [search])

  return (
    <DashboardSearchContext.Provider value={searchValue}>
      <PersonalizationSync />
      <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased">
        <AppSidebar />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
          <AppTopBar />
          <div className="flex-1 pb-24 pt-28 md:pb-20">
            <Outlet />
          </div>
        </main>
        <MobileBottomNav />
        <NewNoteFab />
      </div>
    </DashboardSearchContext.Provider>
  )
}

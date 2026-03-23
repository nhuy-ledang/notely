import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/app/DashboardLayout'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { CollectionDetailPage } from '@/pages/CollectionDetailPage'
import { CollectionsPage } from '@/pages/CollectionsPage'
import { NoteEditorPage } from '@/pages/NoteEditorPage'
import { NotesPage } from '@/pages/NotesPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<NotesPage />} />
          <Route path="starred" element={<NotesPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:collectionId" element={<CollectionDetailPage />} />
          {/* Single route: /app/notes/new → noteId === 'new' (dedicated path would omit useParams) */}
          <Route path="notes/:noteId" element={<NoteEditorPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpCenterPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

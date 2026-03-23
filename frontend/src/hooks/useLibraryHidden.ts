import { useAuth } from '@/hooks/useAuth'

export function useLibraryHidden(): boolean {
  const { user } = useAuth()
  const v = user?.preferences?.library_hidden
  return typeof v === 'boolean' ? v : false
}

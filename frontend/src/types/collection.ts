export type ApiCollection = {
  id: number
  user_id: number
  name: string
  description: string | null
  icon: string | null
  accent: string
  notes_count?: number
  created_at: string
  updated_at: string
}

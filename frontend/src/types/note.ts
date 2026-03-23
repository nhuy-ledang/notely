export type ApiNote = {
  id: number
  user_id: number
  collection_id?: number | null
  title: string
  body: string | null
  pinned: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

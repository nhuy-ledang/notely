export type ApiUser = {
  id: number
  name: string
  email: string
  preferences: Record<string, unknown>
  google_linked?: boolean
  oauth_only_password?: boolean
  created_at: string | null
  updated_at: string | null
}

export type AuthSuccessResponse = {
  user: ApiUser
  access_token: string
  token_type: string
  expires_in: number
}

export type MeResponse = {
  user: ApiUser
}

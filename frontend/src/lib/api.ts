import type { AuthSuccessResponse, MeResponse } from '@/types/auth'
import type { ApiCollection } from '@/types/collection'
import type { ApiNote } from '@/types/note'

export const TOKEN_STORAGE_KEY = 'notely_access_token'

export function getApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL ?? '').trim()
  return raw.replace(/\/$/, '')
}

function buildApiUrl(path: string): string {
  const base = getApiBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${normalizedPath}` : normalizedPath
}

/** Full-page redirect; backend must have GOOGLE_CLIENT_ID / SECRET and matching redirect URI. */
export function getGoogleOAuthUrl(): string {
  return buildApiUrl('/auth/google')
}

/**
 * Build a URL the browser can load from the SPA origin's perspective.
 * Rewrites /storage/... to use `VITE_API_URL` host so localhost vs 127.0.0.1 mismatches don't break <img>.
 */
export function toAbsoluteMediaUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim()
  if (t.startsWith('data:') || t.startsWith('blob:')) {
    return t
  }

  const base = getApiBase()
  let apiOrigin: string | null = null
  if (base) {
    try {
      apiOrigin = new URL(base).origin
    } catch {
      apiOrigin = null
    }
  }

  if (t.startsWith('http://') || t.startsWith('https://')) {
    try {
      const u = new URL(t)
      if (apiOrigin && u.pathname.startsWith('/storage/')) {
        return `${apiOrigin}${u.pathname}${u.search}`
      }
      return t
    } catch {
      return t
    }
  }

  if (!base) {
    return t.startsWith('/') ? t : `/${t}`
  }
  const path = t.startsWith('/') ? t : `/${t}`
  return `${base}${path}`
}

export function getErrorMessage(body: unknown, fallback = 'Something went wrong'): string {
  if (body && typeof body === 'object') {
    const b = body as { message?: string; errors?: Record<string, string[]> }
    if (b.errors) {
      const first = Object.values(b.errors).flat()[0]
      if (typeof first === 'string') {
        return first
      }
    }
    if (typeof b.message === 'string' && b.message.length > 0) {
      return b.message
    }
  }
  return fallback
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  const url = buildApiUrl(path)
  const h = new Headers(headers)
  h.set('Accept', 'application/json')
  if (rest.body !== undefined && !(rest.body instanceof FormData) && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json')
  }
  if (token) {
    h.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...rest, headers: h })
  const text = await res.text()
  let data: unknown = {}
  if (text.length > 0) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = {}
    }
  }

  if (!res.ok) {
    throw new ApiError(getErrorMessage(data, res.statusText), res.status, data)
  }

  return data as T
}

export const authApi = {
  login(email: string, password: string): Promise<AuthSuccessResponse> {
    return apiFetch<AuthSuccessResponse>('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(payload: { name: string; email: string; password: string }): Promise<AuthSuccessResponse> {
    return apiFetch<AuthSuccessResponse>('/api/v1/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  me(token: string): Promise<MeResponse> {
    return apiFetch<MeResponse>('/api/v1/me', { token })
  },

  patchMe(
    token: string,
    body: { name?: string; email?: string; preferences?: Record<string, unknown> },
  ): Promise<MeResponse> {
    return apiFetch<MeResponse>('/api/v1/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    })
  },

  updatePassword(
    token: string,
    body: { current_password?: string; password: string; password_confirmation: string },
  ): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/v1/me/password', {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    })
  },

  deleteMe(token: string): Promise<void> {
    return apiFetch<void>('/api/v1/me', {
      method: 'DELETE',
      token,
    })
  },

  logout(token: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/v1/logout', {
      method: 'POST',
      token,
      body: JSON.stringify({}),
    })
  },
}

export type PaginatedNotes = {
  data: ApiNote[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const collectionsApi = {
  list(token: string): Promise<ApiCollection[]> {
    return apiFetch<ApiCollection[]>('/api/v1/collections', { token })
  },

  show(token: string, id: number): Promise<ApiCollection> {
    return apiFetch<ApiCollection>(`/api/v1/collections/${id}`, { token })
  },

  create(
    token: string,
    payload: {
      name: string
      description?: string | null
      icon?: string | null
      accent?: string
    },
  ): Promise<ApiCollection> {
    return apiFetch<ApiCollection>('/api/v1/collections', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    })
  },

  update(
    token: string,
    id: number,
    payload: Partial<{
      name: string
      description: string | null
      icon: string | null
      accent: string
    }>,
  ): Promise<ApiCollection> {
    return apiFetch<ApiCollection>(`/api/v1/collections/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    })
  },

  destroy(token: string, id: number): Promise<void> {
    return apiFetch<void>(`/api/v1/collections/${id}`, {
      method: 'DELETE',
      token,
      body: JSON.stringify({}),
    })
  },
}

export const notesApi = {
  list(
    token: string,
    params?: { search?: string; per_page?: number; pinnedOnly?: boolean; collectionId?: number },
  ): Promise<PaginatedNotes> {
    const q = new URLSearchParams()
    q.set('per_page', String(params?.per_page ?? 100))
    if (params?.search?.trim()) {
      q.set('search', params.search.trim())
    }
    if (params?.pinnedOnly) {
      q.set('filter', 'pinned')
    }
    if (params?.collectionId != null) {
      q.set('collection_id', String(params.collectionId))
    }
    return apiFetch<PaginatedNotes>(`/api/v1/notes?${q}`, { token })
  },

  show(token: string, id: number): Promise<ApiNote> {
    return apiFetch<ApiNote>(`/api/v1/notes/${id}`, { token })
  },

  create(
    token: string,
    payload: {
      title: string
      body?: string
      pinned?: boolean
      tags?: string[]
      collection_id?: number
    },
  ): Promise<ApiNote> {
    return apiFetch<ApiNote>('/api/v1/notes', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    })
  },

  update(
    token: string,
    id: number,
    payload: {
      title?: string
      body?: string | null
      pinned?: boolean
      tags?: string[]
      collection_id?: number | null
    },
  ): Promise<ApiNote> {
    return apiFetch<ApiNote>(`/api/v1/notes/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    })
  },
}

export const mediaApi = {
  upload(token: string, blob: Blob, filename: string): Promise<{ url: string }> {
    const fd = new FormData()
    fd.append('file', blob, filename)
    return apiFetch<{ url: string }>('/api/v1/media', {
      method: 'POST',
      token,
      body: fd,
    })
  },
}

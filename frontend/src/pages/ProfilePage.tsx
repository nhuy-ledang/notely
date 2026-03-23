import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ApiError, notesApi } from '@/lib/api'
import { htmlToPlainText } from '@/lib/html-to-plain'
import type { ApiNote } from '@/types/note'

const DEFAULT_BIO =
  'Curating a personal library of inspiration across design, architecture, and technology. I believe the digital space should feel like a well-tended garden, not a cluttered attic.'

const STRIP_CLASSES = ['bg-tertiary', 'bg-primary-container', 'bg-secondary'] as const

function relativeShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) {
    return 'Today'
  }
  if (days === 1) {
    return '1d ago'
  }
  if (days < 7) {
    return `${days}d ago`
  }
  const weeks = Math.floor(days / 7)
  if (weeks < 5) {
    return `${weeks}w ago`
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function memberSinceLabel(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return '—'
  }
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function readBio(prefs: Record<string, unknown> | undefined): string {
  if (!prefs || typeof prefs !== 'object') {
    return DEFAULT_BIO
  }
  const b = prefs.bio
  return typeof b === 'string' && b.trim() ? b.trim() : DEFAULT_BIO
}

function readTagline(prefs: Record<string, unknown> | undefined): string {
  if (!prefs || typeof prefs !== 'object') {
    return 'Visual researcher & digital archivist'
  }
  const t = prefs.tagline
  return typeof t === 'string' && t.trim() ? t.trim() : 'Visual researcher & digital archivist'
}

export function ProfilePage() {
  const { user, token } = useAuth()
  const [notes, setNotes] = useState<ApiNote[]>([])
  const [totalNotes, setTotalNotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchProfileData = useCallback(async () => {
    if (!token) {
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const page = await notesApi.list(token, { per_page: 200 })
      setNotes(page.data)
      setTotalNotes(page.total ?? page.data.length)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : e instanceof Error
            ? e.message
            : 'Could not load notes'
      setLoadError(msg)
      setNotes([])
      setTotalNotes(0)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchProfileData()
  }, [fetchProfileData])

  useEffect(() => {
    document.title = 'My profile — Notely'
  }, [])

  const tagCount = useMemo(() => {
    const set = new Set<string>()
    for (const n of notes) {
      for (const t of n.tags ?? []) {
        set.add(t)
      }
    }
    return set.size
  }, [notes])

  const starredPreview = useMemo(() => {
    return notes
      .filter((n) => n.pinned)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
  }, [notes])

  const displayName = user?.name?.trim() || 'Member'
  const initial = displayName.charAt(0).toUpperCase()
  const bio = readBio(user?.preferences as Record<string, unknown> | undefined)
  const tagline = readTagline(user?.preferences as Record<string, unknown> | undefined)

  return (
    <div className="mx-auto max-w-7xl px-6 pb-28 pt-2 lg:px-12">
      <section className="mb-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="flex flex-col items-center lg:col-span-4 lg:items-start">
          <div className="group relative">
            <div className="h-48 w-48 overflow-hidden rounded-3xl bg-primary-fixed shadow-2xl ring-4 ring-white dark:ring-slate-900">
              {user ? (
                <div className="flex h-full w-full items-center justify-center font-manrope text-6xl font-extrabold text-primary">
                  {initial}
                </div>
              ) : null}
            </div>
            <Link
              to="/app/settings"
              className="absolute -bottom-2 -right-2 rounded-2xl bg-primary-container p-3 text-on-primary shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Edit profile photo"
            >
              <span className="material-symbols-outlined" aria-hidden>
                edit
              </span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 font-manrope text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                {displayName}
              </h1>
              <p className="text-lg font-medium text-secondary">{tagline}</p>
            </div>
            <Link
              to="/app/settings"
              className="flex items-center justify-center gap-2 rounded-xl border-none bg-surface-container-lowest px-8 py-3 font-manrope text-sm font-bold text-primary shadow-sm transition-all hover:shadow-md active:scale-95 dark:bg-slate-800/80"
            >
              <span className="material-symbols-outlined text-xl">settings_accessibility</span>
              Edit profile
            </Link>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-8 dark:bg-slate-800/40">
            <h3 className="mb-3 font-manrope text-sm font-bold uppercase tracking-widest text-primary">
              Biography
            </h3>
            <p className="text-lg italic leading-relaxed text-on-surface-variant font-body">&ldquo;{bio}&rdquo;</p>
          </div>
        </div>
      </section>

      <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group flex h-40 flex-col justify-between rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-colors hover:bg-primary-fixed dark:bg-slate-900/60 dark:hover:bg-primary-container/15">
          <span className="material-symbols-outlined mb-2 text-primary">description</span>
          <div>
            <p className="font-manrope text-4xl font-extrabold text-on-surface">
              {loading ? '…' : loadError ? '—' : totalNotes.toLocaleString()}
            </p>
            <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Total notes
            </p>
          </div>
        </div>
        <div className="group flex h-40 flex-col justify-between rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-colors hover:bg-primary-fixed dark:bg-slate-900/60 dark:hover:bg-primary-container/15">
          <span className="material-symbols-outlined mb-2 text-primary">folder_special</span>
          <div>
            <p className="font-manrope text-4xl font-extrabold text-on-surface">
              {loading ? '…' : loadError ? '—' : tagCount.toLocaleString()}
            </p>
            <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Collections
            </p>
          </div>
        </div>
        <div className="group flex h-40 flex-col justify-between rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-colors hover:bg-primary-fixed dark:bg-slate-900/60 dark:hover:bg-primary-container/15">
          <span className="material-symbols-outlined mb-2 text-primary">calendar_today</span>
          <div>
            <p className="font-manrope text-2xl font-extrabold text-on-surface">
              {memberSinceLabel(user?.created_at ?? null)}
            </p>
            <p className="font-label text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Member since
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="font-manrope text-2xl font-bold text-on-surface">Recently starred</h2>
          <Link
            to="/app/starred"
            className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            View all archives
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        {loadError ? (
          <p className="text-sm text-on-surface-variant font-body">{loadError}</p>
        ) : starredPreview.length === 0 && !loading ? (
          <p className="text-on-surface-variant font-body">
            No starred notes yet. Pin notes from the library to see them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {starredPreview.map((note, i) => {
              const strip = STRIP_CLASSES[i % STRIP_CLASSES.length]
              const plain = htmlToPlainText(note.body ?? '')
              const excerpt = plain.length > 160 ? `${plain.slice(0, 160)}…` : plain
              const category = (note.tags?.[0] ?? 'Note').toUpperCase()
              return (
                <Link
                  key={note.id}
                  to={`/app/notes/${note.id}`}
                  className="group relative block overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-900/60"
                >
                  <div className={`absolute left-0 top-0 h-full w-1 ${strip}`} aria-hidden />
                  <div className="mb-6 flex items-start justify-between">
                    <span className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {category}
                    </span>
                    <span
                      className="material-symbols-outlined text-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden
                    >
                      star
                    </span>
                  </div>
                  <h4 className="mb-3 font-manrope text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="mb-6 line-clamp-3 text-sm text-on-surface-variant font-body">
                    {excerpt || 'No preview'}
                  </p>
                  <div className="flex items-center justify-between border-t border-surface-container pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      Updated {relativeShort(note.updated_at)}
                    </span>
                    <span className="material-symbols-outlined text-secondary" aria-hidden>
                      chevron_right
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

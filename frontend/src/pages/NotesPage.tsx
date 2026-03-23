import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CreateNoteCard } from '@/components/app/CreateNoteCard'
import { NoteCard } from '@/components/app/NoteCard'
import { LibraryHiddenPlaceholder } from '@/components/app/LibraryHiddenPlaceholder'
import { useDashboardSearch } from '@/hooks/useDashboardSearch'
import { useAuth } from '@/hooks/useAuth'
import { useLibraryHidden } from '@/hooks/useLibraryHidden'
import { useLocale } from '@/hooks/useLocale'
import { ApiError, notesApi } from '@/lib/api'
import type { ApiNote } from '@/types/note'

export function NotesPage() {
  const { token } = useAuth()
  const libraryHidden = useLibraryHidden()
  const { t } = useLocale()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { search } = useDashboardSearch()
  const [params] = useSearchParams()

  const starredOnly = pathname.includes('/starred')
  const [notes, setNotes] = useState<ApiNote[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!token) {
      return
    }
    if (libraryHidden) {
      setLoading(false)
      setLoadError(null)
      setNotes([])
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const page = await notesApi.list(token, {
        search,
        pinnedOnly: starredOnly,
        per_page: 100,
      })
      setNotes(page.data)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : e instanceof Error
            ? e.message
            : t('notes.errorLoad')
      setLoadError(msg)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [token, search, starredOnly, t, libraryHidden])

  useEffect(() => {
    void fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    document.title = starredOnly ? t('notes.docImportant') : t('notes.docLibrary')
  }, [starredOnly, t])

  useEffect(() => {
    if (params.get('new') === '1') {
      navigate('/app/notes/new', { replace: true })
    }
  }, [params, navigate])

  const handleTogglePin = useCallback(
    async (note: ApiNote) => {
      if (!token) {
        return
      }
      const updated = await notesApi.update(token, note.id, { pinned: !note.pinned })
      setNotes((prev) => {
        let next = prev.map((n) => (n.id === updated.id ? updated : n))
        if (starredOnly && !updated.pinned) {
          next = next.filter((n) => n.id !== updated.id)
        }
        return next
      })
    },
    [token, starredOnly],
  )

  return (
    <section className="mx-auto w-full max-w-7xl px-8 md:px-12">
      <div className="mb-12 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface">
            {starredOnly ? t('notes.titleImportant') : t('notes.titleLibrary')}
          </h2>
          <p className="mt-2 font-medium text-on-surface-variant font-body">
            {t('notes.subtitle')}
          </p>
        </div>
        <div className="hidden shrink-0 gap-3 sm:flex">
          <span className="rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {t('notes.badgeRecent')}
          </span>
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-primary">
            {t('notes.badgeGrid')}
          </span>
        </div>
      </div>

      {libraryHidden ? (
        <div className="flex min-h-[40vh] items-center justify-center py-12">
          <LibraryHiddenPlaceholder />
        </div>
      ) : loadError ? (
        <p className="mb-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {loadError}
        </p>
      ) : loading ? (
        <p className="text-on-surface-variant font-body">{t('notes.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onTogglePin={handleTogglePin} />
          ))}
          <CreateNoteCard onClick={() => navigate('/app/notes/new')} />
        </div>
      )}
    </section>
  )
}

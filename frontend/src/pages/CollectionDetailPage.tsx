import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LibraryHiddenPlaceholder } from '@/components/app/LibraryHiddenPlaceholder'
import { useAuth } from '@/hooks/useAuth'
import { useLibraryHidden } from '@/hooks/useLibraryHidden'
import { useLocale } from '@/hooks/useLocale'
import {
  ApiError,
  collectionsApi,
  getErrorMessage,
  notesApi,
  toAbsoluteMediaUrl,
} from '@/lib/api'
import { firstImageSrcFromHtml } from '@/lib/first-html-image'
import { formatNoteDate } from '@/lib/format-note-date'
import { htmlToPlainText } from '@/lib/html-to-plain'
import type { ApiCollection } from '@/types/collection'
import type { ApiNote } from '@/types/note'

function FeaturedNoteCard({ note }: { note: ApiNote }) {
  const { t } = useLocale()
  const plain = htmlToPlainText(note.body ?? '')
  const excerpt = plain || t('noteCard.noContent')
  const img = firstImageSrcFromHtml(note.body ?? null)
  const imgUrl = img ? toAbsoluteMediaUrl(img) : null
  const dateLabel = formatNoteDate(note.updated_at)

  return (
    <article className="group relative rounded-xl bg-surface-container-lowest p-8 transition-all duration-300 hover:-translate-y-1 dark:bg-surface-container-low/50 lg:col-span-2">
      <div className="absolute left-0 top-8 h-16 w-1 rounded-r-full bg-tertiary" aria-hidden />
      <div className="mb-6 flex items-start justify-between">
        <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-tertiary-fixed dark:bg-tertiary-fixed/30">
          {note.pinned ? t('collDetail.pinned') : t('collDetail.featured')}
        </span>
        <span className="text-xs text-slate-400 dark:text-on-surface-variant">{dateLabel}</span>
      </div>
      <Link
        to={`/app/notes/${note.id}`}
        className="block outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
      >
        <h3 className="mb-4 font-manrope text-3xl font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
          {note.title}
        </h3>
        <p className="mb-8 line-clamp-3 leading-relaxed text-secondary">{excerpt}</p>
      </Link>
      {imgUrl ? (
        <div className="mb-6 h-64 w-full overflow-hidden rounded-xl">
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {(note.tags ?? []).slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-surface-dim dark:text-on-surface-variant"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  )
}

function CompactNoteCard({ note }: { note: ApiNote }) {
  const { t } = useLocale()
  const plain = htmlToPlainText(note.body ?? '')
  const excerpt = plain || t('noteCard.noContent')
  const img = firstImageSrcFromHtml(note.body ?? null)
  const imgUrl = img ? toAbsoluteMediaUrl(img) : null
  const dateLabel = formatNoteDate(note.updated_at)

  return (
    <article className="group flex flex-col rounded-xl bg-surface-container-lowest p-6 transition-all duration-300 hover:-translate-y-1 dark:bg-surface-container-low/50">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-indigo-500 dark:text-primary-fixed-dim">
          <span className="material-symbols-outlined">
            {note.pinned ? 'push_pin' : 'description'}
          </span>
        </span>
        <span className="text-xs text-slate-400 dark:text-on-surface-variant">{dateLabel}</span>
      </div>
      <Link
        to={`/app/notes/${note.id}`}
        className="min-h-0 flex-1 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
      >
        <h3 className="mb-3 font-manrope text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
          {note.title}
        </h3>
        <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-secondary">{excerpt}</p>
      </Link>
      {imgUrl ? (
        <div className="mb-4 h-40 w-full overflow-hidden rounded-lg">
          <img src={imgUrl} alt="" className="h-full w-full object-cover opacity-90" />
        </div>
      ) : null}
    </article>
  )
}

function relativeActivity(
  dates: string[],
  tr: (key: string, vars?: Record<string, string | number>) => string,
): string {
  if (dates.length === 0) {
    return tr('collDetail.activityNone')
  }
  const latest = dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
  const ts = new Date(latest).getTime()
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) {
    return tr('collDetail.activityNow')
  }
  if (m < 60) {
    return tr('collDetail.activityMin', { n: m })
  }
  const h = Math.floor(m / 60)
  if (h < 48) {
    return tr('collDetail.activityHour', { n: h })
  }
  const d = Math.floor(h / 24)
  return tr('collDetail.activityDay', { n: d })
}

export function CollectionDetailPage() {
  const { collectionId: idParam } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const libraryHidden = useLibraryHidden()
  const { t } = useLocale()
  const collectionId = idParam ? Number(idParam) : NaN

  const [collection, setCollection] = useState<ApiCollection | null>(null)
  const [notes, setNotes] = useState<ApiNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(collectionId)) {
      return
    }
    if (libraryHidden) {
      setLoading(false)
      setError(null)
      setCollection(null)
      setNotes([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [c, page] = await Promise.all([
        collectionsApi.show(token, collectionId),
        notesApi.list(token, { collectionId, per_page: 48 }),
      ])
      setCollection(c)
      setNotes(page.data)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? getErrorMessage(e.body, e.message)
          : e instanceof Error
            ? e.message
            : t('collDetail.loadError')
      setError(msg)
      setCollection(null)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [token, collectionId, t, libraryHidden])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    document.title = collection ? `${collection.name} — Notely` : t('collDetail.doc')
  }, [collection, t])

  const lastActivity = useMemo(
    () => relativeActivity(notes.map((n) => n.updated_at), t),
    [notes, t],
  )

  const { featuredNote, otherNotes } = useMemo(() => {
    if (notes.length === 0) {
      return { featuredNote: null as ApiNote | null, otherNotes: [] as ApiNote[] }
    }
    const pinnedFirst = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned))
    const featured = pinnedFirst[0]!
    if (notes.length === 1) {
      return { featuredNote: null, otherNotes: notes }
    }
    return {
      featuredNote: featured,
      otherNotes: notes.filter((n) => n.id !== featured.id),
    }
  }, [notes])

  const newNoteHref = `/app/notes/new?collectionId=${collectionId}`

  async function copyShareLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* ignore */
    }
  }

  if (libraryHidden) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-6 py-16 md:px-12">
        <LibraryHiddenPlaceholder />
      </div>
    )
  }

  if (!Number.isFinite(collectionId)) {
    return (
      <div className="px-6 py-16 md:px-10">
        <p className="text-error">{t('collDetail.invalid')}</p>
        <button
          type="button"
          onClick={() => navigate('/app/collections')}
          className="mt-4 rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-on-primary"
        >
          {t('collDetail.back')}
        </button>
      </div>
    )
  }

  if (error && !collection) {
    return (
      <div className="px-6 py-16 md:px-10">
        <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/app/collections')}
          className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
        >
          {t('collDetail.back')}
        </button>
      </div>
    )
  }

  const itemsCount = collection?.notes_count ?? notes.length

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:px-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400 dark:text-on-surface-variant">
        <Link to="/app/collections" className="hover:text-primary">
          {t('collDetail.collections')}
        </Link>
        <span className="text-slate-300 dark:text-outline-variant">/</span>
        <span className="font-manrope font-bold text-indigo-700 dark:text-primary-fixed-dim">
          {collection?.name ?? '…'}
        </span>
      </nav>

      {loading && !collection ? (
        <p className="text-on-surface-variant">{t('collDetail.loading')}</p>
      ) : collection ? (
        <>
          <section className="mb-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="mb-4 font-manrope text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                  {collection.name}
                </h2>
                <p className="font-body text-lg leading-relaxed text-secondary">
                  {collection.description?.trim() || t('collDetail.placeholderDesc')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void copyShareLink()}
                  className="flex items-center gap-2 rounded-xl bg-surface-container-high px-6 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-variant dark:bg-surface-dim dark:hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  {t('collDetail.share')}
                </button>
                <Link
                  to={newNoteHref}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                  {t('collDetail.newNote')}
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-8 rounded-2xl bg-surface-container-low/50 px-8 py-6 dark:bg-surface-container-low/30">
              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-on-surface-variant">
                  {t('collDetail.statItems')}
                </span>
                <span className="font-manrope text-2xl font-bold text-indigo-600 dark:text-primary-fixed-dim">
                  {itemsCount}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-on-surface-variant">
                  {t('collDetail.statContributors')}
                </span>
                <span className="font-manrope text-2xl font-bold text-indigo-600 dark:text-primary-fixed-dim">
                  1
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-on-surface-variant">
                  {t('collDetail.statActivity')}
                </span>
                <span className="font-manrope text-2xl font-bold text-indigo-600 dark:text-primary-fixed-dim">
                  {lastActivity}
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredNote ? (
              <FeaturedNoteCard key={featuredNote.id} note={featuredNote} />
            ) : null}
            {otherNotes.map((note) => (
              <CompactNoteCard key={note.id} note={note} />
            ))}

            <Link
              to={newNoteHref}
              className="group flex min-h-[200px] flex-col justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 transition-all hover:border-indigo-300 hover:bg-indigo-50/20 dark:border-outline-variant/40 dark:hover:border-primary/40 dark:hover:bg-primary-container/10"
            >
              <div className="py-6 text-center">
                <span className="material-symbols-outlined mb-2 text-4xl text-slate-300 transition-colors group-hover:text-indigo-400 dark:text-on-surface-variant dark:group-hover:text-primary-fixed-dim">
                  add_circle
                </span>
                <p className="font-manrope font-bold text-slate-400 transition-colors group-hover:text-indigo-500 dark:text-on-surface-variant dark:group-hover:text-primary-fixed-dim">
                  {t('collDetail.addNote')}
                </p>
              </div>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}

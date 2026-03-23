import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LibraryHiddenPlaceholder } from '@/components/app/LibraryHiddenPlaceholder'
import { useAuth } from '@/hooks/useAuth'
import { useLibraryHidden } from '@/hooks/useLibraryHidden'
import { useLocale } from '@/hooks/useLocale'
import { ApiError, collectionsApi, getErrorMessage } from '@/lib/api'
import type { ApiCollection } from '@/types/collection'

function iconName(c: ApiCollection): string {
  return (c.icon?.trim() || 'folder_open').replace(/\s/g, '_')
}

export function CollectionsPage() {
  const { token } = useAuth()
  const libraryHidden = useLibraryHidden()
  const { t } = useLocale()
  const [rows, setRows] = useState<ApiCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (libraryHidden) {
      setLoading(false)
      setError(null)
      setRows([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await collectionsApi.list(token)
      setRows(list)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? getErrorMessage(e.body, e.message)
          : e instanceof Error
            ? e.message
            : t('collections.loadError')
      setError(msg)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [token, t, libraryHidden])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    document.title = t('collections.docTitle')
  }, [t])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !newName.trim()) {
      return
    }
    setCreateBusy(true)
    setCreateError(null)
    try {
      const created = await collectionsApi.create(token, {
        name: newName.trim(),
        description: newDescription.trim() || null,
      })
      setRows((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setNewDescription('')
      setCreating(false)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? getErrorMessage(err.body, err.message)
          : err instanceof Error
            ? err.message
            : t('collections.createError')
      setCreateError(msg)
    } finally {
      setCreateBusy(false)
    }
  }

  const total = rows.length

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
      <section className="mb-12">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <h1 className="mb-2 font-manrope text-4xl font-extrabold tracking-tight text-on-surface">
              {t('collections.heroTitle')}
            </h1>
            <p className="max-w-md font-body text-on-surface-variant">{t('collections.heroSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating((c) => !c)
              setCreateError(null)
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 font-manrope text-sm font-bold text-on-primary shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 dark:shadow-primary/20"
          >
            <span className="material-symbols-outlined text-xl">create_new_folder</span>
            {t('collections.new')}
          </button>
        </div>

        {creating ? (
          <form
            onSubmit={(ev) => void handleCreate(ev)}
            className="mt-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm dark:border-outline-variant/25"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-outline">
              {t('collections.createHeading')}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="coll-name" className="mb-1 block text-xs font-medium text-secondary">
                  {t('collections.name')}
                </label>
                <input
                  id="coll-name"
                  value={newName}
                  onChange={(ev) => setNewName(ev.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/25"
                  placeholder={t('collections.namePh')}
                  required
                />
              </div>
              <div>
                <label htmlFor="coll-desc" className="mb-1 block text-xs font-medium text-secondary">
                  {t('collections.description')}
                </label>
                <input
                  id="coll-desc"
                  value={newDescription}
                  onChange={(ev) => setNewDescription(ev.target.value)}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/25"
                  placeholder={t('collections.descriptionPh')}
                />
              </div>
            </div>
            {createError ? (
              <p className="mt-3 text-sm text-error" role="alert">
                {createError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={createBusy}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
              >
                {createBusy ? t('settings.saving') : t('collections.save')}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-secondary hover:bg-surface-container"
              >
                {t('collections.cancel')}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {libraryHidden ? (
        <div className="flex min-h-[40vh] items-center justify-center py-12">
          <LibraryHiddenPlaceholder />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</p>
      ) : loading ? (
        <p className="text-on-surface-variant">{t('collections.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => {
            const count = c.notes_count ?? 0
            const warm = c.accent === 'warm'
            const icon = iconName(c)
            return (
              <Link
                key={c.id}
                to={`/app/collections/${c.id}`}
                className={`group flex h-full cursor-pointer flex-col rounded-xl border border-transparent p-6 transition-all duration-300 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/80 dark:hover:border-primary/20 dark:hover:shadow-none ${
                  warm
                    ? 'relative overflow-hidden bg-tertiary-fixed dark:bg-tertiary-fixed/20'
                    : 'bg-surface-container-lowest dark:bg-surface-container-low/40'
                }`}
              >
                {warm ? <div className="absolute bottom-0 left-0 top-0 w-1 bg-tertiary" aria-hidden /> : null}
                <div className="mb-6 flex items-start justify-between">
                  <div
                    className={`rounded-xl p-3 ${
                      warm
                        ? 'bg-white/40 text-tertiary backdrop-blur-sm dark:bg-black/10'
                        : 'bg-primary-fixed text-primary dark:bg-primary-container/30 dark:text-primary-fixed-dim'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-inter text-xs font-medium ${
                      warm
                        ? 'bg-white/40 font-bold text-tertiary backdrop-blur-sm dark:bg-black/10'
                        : 'bg-slate-50 text-slate-400 dark:bg-surface-dim dark:text-on-surface-variant'
                    }`}
                  >
                    {count === 1 ? t('collections.notesCountOne') : t('collections.notesCount', { n: count })}
                  </span>
                </div>
                <h3
                  className={`mb-2 font-manrope text-xl font-bold transition-colors group-hover:text-primary ${
                    warm ? 'text-on-tertiary-fixed dark:text-on-surface' : 'text-on-surface'
                  }`}
                >
                  {c.name}
                </h3>
                <p
                  className={`mb-6 line-clamp-3 flex-grow text-sm leading-relaxed ${
                    warm ? 'text-on-tertiary-fixed-variant dark:text-on-surface-variant' : 'text-on-surface-variant'
                  }`}
                >
                  {c.description?.trim() || t('collections.emptyDesc')}
                </p>
                <div className="mt-auto grid h-24 grid-cols-3 gap-2">
                  <div
                    className={`rounded-lg border border-dashed border-slate-200/80 dark:border-outline-variant/30 ${
                      warm ? 'bg-white/30' : 'bg-surface-container-high dark:bg-surface-dim/50'
                    }`}
                  />
                  <div
                    className={`rounded-lg border border-dashed border-slate-200/80 dark:border-outline-variant/30 ${
                      warm ? 'bg-white/30' : 'bg-surface-container-high dark:bg-surface-dim/50'
                    }`}
                  />
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs font-bold text-slate-400 dark:border-outline-variant/40 dark:text-on-surface-variant">
                    {t('collections.open')}
                  </div>
                </div>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setCreating(true)}
            className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-indigo-200 p-6 transition-all duration-300 hover:bg-indigo-50/30 dark:border-primary/30 dark:hover:bg-primary-container/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-100 dark:bg-primary-container/20 dark:text-primary-fixed-dim">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <div className="text-center">
              <p className="font-manrope font-bold text-indigo-700 dark:text-primary-fixed-dim">
                {t('collections.addTitle')}
              </p>
              <p className="font-inter text-xs text-slate-500 dark:text-on-surface-variant">
                {t('collections.addSubtitle')}
              </p>
            </div>
          </button>
        </div>
      )}

      {!libraryHidden && !loading && !error ? (
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-8 dark:border-outline-variant/20 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-400 dark:text-on-surface-variant">
            {total === 0
              ? t('collections.footerNone')
              : total === 1
                ? t('collections.footerOne')
                : t('collections.footerMany', { n: total })}
          </p>
        </div>
      ) : null}
    </div>
  )
}

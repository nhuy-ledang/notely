import { useEffect, useState, type CSSProperties } from 'react'
import { usePersonalization } from '@/contexts/personalization-context'
import { accentHex, type PersonalizationState } from '@/lib/personalization'

const sectionLabelClass =
  'mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100'

const sectionIconClass = 'material-symbols-outlined text-lg text-slate-500 dark:text-slate-400'

export function PersonalizationModal() {
  const { preferences, commit, modalOpen, closeModal } = usePersonalization()
  const [draft, setDraft] = useState<PersonalizationState>(preferences)

  useEffect(() => {
    if (modalOpen) {
      setDraft(preferences)
    }
  }, [modalOpen, preferences])

  useEffect(() => {
    if (!modalOpen) {
      return
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, closeModal])

  if (!modalOpen) {
    return null
  }

  const accent = accentHex(draft.accent)
  const innerRing = document.documentElement.classList.contains('dark') ? 'rgb(15 23 42)' : '#ffffff'

  function handleApply() {
    commit(draft)
    closeModal()
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalization-title"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md rounded-[1.35rem] border border-slate-200/80 bg-white p-7 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="personalization-title"
              className="font-manrope text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Personalization
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Configure your space
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden>
              close
            </span>
          </button>
        </div>

        <div className="mt-8 space-y-8">
          <section aria-labelledby="visual-theme-label">
            <div id="visual-theme-label" className={sectionLabelClass}>
              <span className={sectionIconClass} aria-hidden>
                palette
              </span>
              Visual Theme
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light' as const, label: 'Light', icon: 'light_mode' },
                  { id: 'dark' as const, label: 'Dark', icon: 'dark_mode' },
                  { id: 'system' as const, label: 'System', icon: 'brightness_auto' },
                ] as const
              ).map(({ id, label, icon }) => {
                const selected = draft.theme === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, theme: id }))}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all ${
                      selected
                        ? 'bg-slate-100 shadow-[inset_0_0_0_2px_var(--accent)] dark:bg-slate-800'
                        : 'bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                    }`}
                    style={
                      {
                        '--accent': accent,
                      } as CSSProperties
                    }
                  >
                    <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-slate-300" aria-hidden>
                      {icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="primary-accent-label">
            <div id="primary-accent-label" className={sectionLabelClass}>
              <span className={sectionIconClass} aria-hidden>
                auto_awesome
              </span>
              Primary Accent
            </div>
            <div className="flex gap-4" role="radiogroup" aria-label="Primary accent color">
              {(
                [
                  { id: 'purple' as const, fill: '#4f46e5' },
                  { id: 'teal' as const, fill: '#14b8a6' },
                  { id: 'coral' as const, fill: '#e11d48' },
                ] as const
              ).map(({ id, fill }) => {
                const selected = draft.accent === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDraft((d) => ({ ...d, accent: id }))}
                    className="relative flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    style={{
                      backgroundColor: fill,
                      boxShadow: selected ? `0 0 0 2px ${innerRing}, 0 0 0 4px ${fill}` : undefined,
                    }}
                  >
                    {selected ? (
                      <span className="material-symbols-outlined text-xl text-white drop-shadow-sm" aria-hidden>
                        check
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="typography-label">
            <div id="typography-label" className={sectionLabelClass}>
              <span className={sectionIconClass} aria-hidden>
                title
              </span>
              Typography
            </div>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Typography">
              {(
                [
                  {
                    id: 'manrope' as const,
                    title: 'Manrope',
                    subtitle: 'Modern',
                    sampleClass: 'font-manrope',
                    sample: 'Aa',
                  },
                  {
                    id: 'inter' as const,
                    title: 'Inter',
                    subtitle: 'Neutral',
                    sampleClass: 'font-inter',
                    sample: 'Aa',
                  },
                  {
                    id: 'playfair' as const,
                    title: 'Playfair Display',
                    subtitle: 'Editorial',
                    sampleClass: 'font-playfair-editorial',
                    sample: 'Aa',
                  },
                ] as const
              ).map(({ id, title, subtitle, sampleClass }) => {
                const selected = draft.font === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDraft((d) => ({ ...d, font: id }))}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'bg-slate-200/80 dark:bg-slate-800'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`block text-base font-semibold text-slate-900 dark:text-white ${sampleClass}`}>
                        {title}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">({subtitle})</span>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600 ${
                        selected ? '' : 'bg-transparent'
                      }`}
                      style={
                        selected
                          ? {
                              borderColor: accent,
                              backgroundColor: accent,
                              boxShadow: `inset 0 0 0 3px ${innerRing}`,
                            }
                          : undefined
                      }
                    />
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="mt-10 w-full rounded-full py-3.5 text-center text-sm font-bold text-white shadow-lg transition-[transform,box-shadow] hover:brightness-105 active:scale-[0.99]"
          style={{
            backgroundColor: accent,
            boxShadow: `0 12px 28px -8px ${accent}aa`,
          }}
        >
          Apply Changes
        </button>
      </div>
    </div>
  )
}

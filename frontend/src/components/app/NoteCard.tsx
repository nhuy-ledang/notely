import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '@/hooks/useLocale'
import type { ApiNote } from '@/types/note'
import { formatNoteDate } from '@/lib/format-note-date'
import { htmlToPlainText } from '@/lib/html-to-plain'

type NoteCardProps = {
  note: ApiNote
  onTogglePin: (note: ApiNote) => Promise<void>
}

export function NoteCard({ note, onTogglePin }: NoteCardProps) {
  const { t } = useLocale()
  const [busy, setBusy] = useState(false)
  const isImportant = note.pinned
  const category = isImportant ? t('noteCard.important') : t('noteCard.note')
  const preview = htmlToPlainText(note.body ?? '') || t('noteCard.noContent')
  const dateLabel = formatNoteDate(note.created_at)

  async function handlePinClick() {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      await onTogglePin(note)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article
      className={`group relative flex h-72 flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 dark:border-outline-variant/25 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)] ${
        isImportant ? 'border-l-4 border-tertiary' : ''
      }`}
    >
      <Link
        to={`/app/notes/${note.id}`}
        className="absolute inset-0 z-0 rounded-xl outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
        aria-label={t('noteCard.open', { title: note.title })}
      />
      <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col p-8">
        <div className="mb-4 flex items-start justify-between">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isImportant ? 'text-tertiary' : 'text-slate-400'
            }`}
          >
            {category}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePinClick()}
            className={`pointer-events-auto material-symbols-outlined transition-colors disabled:opacity-50 ${
              isImportant
                ? 'text-tertiary'
                : 'text-slate-300 hover:text-tertiary'
            }`}
            style={isImportant ? { fontVariationSettings: "'FILL' 1" } : undefined}
            aria-label={isImportant ? t('noteCard.unpin') : t('noteCard.pin')}
          >
            grade
          </button>
        </div>
        <h3 className="mb-3 font-manrope text-xl font-bold leading-tight transition-colors group-hover:text-primary">
          {note.title}
        </h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-on-surface-variant font-body">{preview}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {dateLabel}
          </span>
          <span
            className="material-symbols-outlined text-sm text-slate-300"
            aria-hidden
          >
            more_horiz
          </span>
        </div>
      </div>
    </article>
  )
}

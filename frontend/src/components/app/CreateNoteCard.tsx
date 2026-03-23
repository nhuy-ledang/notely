import { useLocale } from '@/hooks/useLocale'

type CreateNoteCardProps = {
  onClick: () => void
}

export function CreateNoteCard({ onClick }: CreateNoteCardProps) {
  const { t } = useLocale()
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/35 bg-transparent p-8 text-center transition-all duration-300 hover:border-primary-container/50 hover:bg-surface-container-lowest/60 dark:border-outline-variant/45 dark:hover:bg-surface-container-lowest/40"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-fixed group-hover:text-primary dark:bg-surface-container-high dark:group-hover:bg-primary-container/20 dark:group-hover:text-primary-fixed-dim">
        <span className="material-symbols-outlined text-2xl">add</span>
      </div>
      <span className="font-manrope font-bold text-on-surface-variant transition-colors group-hover:text-primary dark:group-hover:text-primary-fixed-dim">
        {t('createNote.title')}
      </span>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-on-surface-variant/70">
        {t('createNote.subtitle')}
      </p>
    </button>
  )
}

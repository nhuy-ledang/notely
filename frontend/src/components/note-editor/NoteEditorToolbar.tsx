import type { Editor } from '@tiptap/core'
import { useEffect, useRef, useState } from 'react'
import { NoteEditorFormatMenu } from '@/components/note-editor/NoteEditorFormatMenu'

/** TableKit + TextAlign commands (merged at runtime; widen for tsserver). */
type EditorCommands = Editor['commands'] & {
  insertTable: (opts?: { rows?: number; cols?: number; withHeaderRow?: boolean }) => boolean
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => boolean
}

const btn =
  'rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white disabled:opacity-40 dark:hover:bg-slate-800'

type VoicePhase = 'idle' | 'recording' | 'paused' | 'preview'

type NoteEditorToolbarProps = {
  editor: Editor | null
  onOpenLinkDialog: () => void
  onPickImageFile: () => void
  onOpenImageCaption: () => void
  voicePhase: VoicePhase
  voiceBusy: boolean
  onVoiceMicClick: () => void
}

export function NoteEditorToolbar({
  editor,
  onOpenLinkDialog,
  onPickImageFile,
  onOpenImageCaption,
  voicePhase,
  voiceBusy,
  onVoiceMicClick,
}: NoteEditorToolbarProps) {
  const [formatOpen, setFormatOpen] = useState(false)
  const formatWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!formatOpen) {
      return
    }
    const onDoc = (e: PointerEvent) => {
      if (formatWrapRef.current && !formatWrapRef.current.contains(e.target as Node)) {
        setFormatOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [formatOpen])

  if (!editor) {
    return (
      <div className="flex min-h-[40px] flex-wrap items-center gap-1 border-y border-outline-variant/20 bg-surface-container-low px-4 py-2" />
    )
  }

  const e = editor

  return (
    <div className="flex flex-wrap items-center gap-1 border-y border-outline-variant/20 bg-surface-container-low px-4 py-2">
      <div className="relative flex flex-wrap items-center gap-1 border-r border-outline-variant/30 pr-2" ref={formatWrapRef}>
        <button
          type="button"
          className={`${btn} flex items-center gap-0.5 font-semibold ${formatOpen ? 'bg-white dark:bg-slate-700' : ''}`}
          title="Kiểu & định dạng"
          aria-expanded={formatOpen}
          onClick={() =>
            setFormatOpen((o) => {
              const next = !o
              if (next) {
                e.commands.focus()
              }
              return next
            })
          }
        >
          <span className="px-0.5 font-manrope text-base tracking-tight text-on-surface">Aa</span>
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
        </button>
        {formatOpen ? (
          <NoteEditorFormatMenu editor={e} open={formatOpen} onClose={() => setFormatOpen(false)} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-r border-outline-variant/30 px-2">
        <button
          type="button"
          className={btn}
          title="Task list"
          onClick={() => e.chain().focus().toggleTaskList().run()}
        >
          <span className="material-symbols-outlined text-[20px]">checklist</span>
        </button>
        <button
          type="button"
          className={btn}
          title="Chèn bảng 3×3"
          onClick={() => {
            const cmd = e.commands as EditorCommands
            cmd.focus()
            cmd.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          }}
        >
          <span className="material-symbols-outlined text-[20px]">grid_on</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-r border-outline-variant/30 px-2">
        <button
          type="button"
          className={btn}
          title="Align left"
          onClick={() => {
            const cmd = e.commands as EditorCommands
            cmd.focus()
            cmd.setTextAlign('left')
          }}
        >
          <span className="material-symbols-outlined text-[20px]">format_align_left</span>
        </button>
        <button
          type="button"
          className={btn}
          title="Align center"
          onClick={() => {
            const cmd = e.commands as EditorCommands
            cmd.focus()
            cmd.setTextAlign('center')
          }}
        >
          <span className="material-symbols-outlined text-[20px]">format_align_center</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 pl-2">
        <button type="button" className={btn} title="Link" onClick={onOpenLinkDialog}>
          <span className="material-symbols-outlined text-[20px]">link</span>
        </button>
        <button type="button" className={btn} title="Chèn ảnh (file)" onClick={onPickImageFile}>
          <span className="material-symbols-outlined text-[20px]">image</span>
        </button>
        <button
          type="button"
          className={`${btn} ${e.isActive('image') ? 'bg-white dark:bg-slate-700' : ''}`}
          title="Mô tả ảnh (alt) — chọn ảnh trước"
          disabled={!e.isActive('image')}
          onClick={onOpenImageCaption}
        >
          <span className="material-symbols-outlined text-[20px]">closed_caption</span>
        </button>
        <button
          type="button"
          className={`${btn} ${voicePhase === 'recording' || voicePhase === 'paused' ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' : ''}`}
          title={
            voicePhase === 'idle'
              ? 'Ghi âm — bắt đầu (điều khiển ở thanh bên dưới)'
              : 'Đang ghi hoặc xem lại — dùng thanh ghi âm bên dưới'
          }
          disabled={voiceBusy || voicePhase !== 'idle'}
          onClick={onVoiceMicClick}
        >
          <span className="material-symbols-outlined text-[20px]">mic</span>
        </button>
      </div>
    </div>
  )
}

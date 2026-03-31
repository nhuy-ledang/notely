import type { Editor } from '@tiptap/core'
import type { ReactNode } from 'react'

const HIGHLIGHTS = [
  { color: '#fef08a', label: 'Vàng' },
  { color: '#bbf7d0', label: 'Xanh lá' },
  { color: '#fecdd3', label: 'Hồng' },
  { color: '#bfdbfe', label: 'Xanh dương' },
  { color: '#e9d5ff', label: 'Tím' },
  { color: '#fed7aa', label: 'Cam' },
  { color: '#f5d0fe', label: 'Magenta nhạt' },
  { color: '#d9f99d', label: 'Chanh' },
]

type NoteEditorFormatMenuProps = {
  editor: Editor
  open: boolean
  onClose: () => void
}

function rowBtn(active: boolean, onClick: () => void, title: string, children: ReactNode) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
        active ? 'bg-primary-container/15 text-primary-container' : 'text-on-surface hover:bg-surface-container-low'
      }`}
    >
      {children}
    </button>
  )
}

function styleRow(
  label: string,
  active: boolean,
  previewClass: string,
  onClick: () => void,
  onDone?: () => void,
) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick()
        onDone?.()
      }}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-container-low"
    >
      <span className="w-5 shrink-0 text-center text-sm text-primary-container">{active ? '✓' : ''}</span>
      <span className={`font-manrope text-on-surface ${previewClass}`}>{label}</span>
    </button>
  )
}

export function NoteEditorFormatMenu({ editor: e, open, onClose }: NoteEditorFormatMenuProps) {
  if (!open) {
    return null
  }

  const chain = () => e.chain().focus() as any

  const bodyStyleActive =
    !e.isActive('heading') && !e.isActive('blockquote') && !e.isActive('codeBlock') && !e.isActive('code')

  return (
    <div
      className="absolute left-0 top-full z-[60] mt-1 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant/35 bg-surface-container-lowest py-2 shadow-xl dark:bg-slate-900"
      role="menu"
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-outline-variant/20 px-3 pb-2 pt-1">
        {rowBtn(e.isActive('bold'), () => chain().toggleBold().run(), 'Bold', <strong className="px-1.5">B</strong>)}
        {rowBtn(e.isActive('italic'), () => chain().toggleItalic().run(), 'Italic', <em className="px-1.5">I</em>)}
        {rowBtn(
          e.isActive('underline'),
          () => chain().toggleUnderline().run(),
          'Underline',
          <span className="px-1.5 underline">U</span>,
        )}
        {rowBtn(
          e.isActive('strike'),
          () => chain().toggleStrike().run(),
          'Strikethrough',
          <s className="px-1.5">S</s>,
        )}
        <span className="mx-1 h-6 w-px bg-outline-variant/40" aria-hidden />
        <div className="flex flex-wrap gap-1 pl-1">
          {HIGHLIGHTS.map(({ color, label }) => (
            <button
              key={color}
              type="button"
              title={label}
              className="h-7 w-7 rounded-md border border-outline-variant/30 shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => chain().toggleHighlight({ color }).run()}
            />
          ))}
          <button
            type="button"
            title="Xóa highlight"
            className="rounded-md px-2 text-[10px] font-semibold text-on-surface-variant hover:bg-surface-container-low"
            onClick={() => chain().unsetHighlight().run()}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-1 py-1">
        {styleRow(
          'Title',
          e.isActive('heading', { level: 1 }),
          'text-xl font-extrabold tracking-tight',
          () => chain().setHeading({ level: 1 }).run(),
          onClose,
        )}
        {styleRow(
          'Heading',
          e.isActive('heading', { level: 2 }),
          'text-lg font-bold',
          () => chain().setHeading({ level: 2 }).run(),
          onClose,
        )}
        {styleRow(
          'Subheading',
          e.isActive('heading', { level: 3 }),
          'text-base font-bold',
          () => chain().setHeading({ level: 3 }).run(),
          onClose,
        )}
        {styleRow('Body', bodyStyleActive, 'text-sm font-normal', () => chain().setParagraph().run(), onClose)}
        {styleRow('Monostyled', e.isActive('code'), 'font-mono text-sm', () => chain().toggleCode().run(), onClose)}
        {styleRow(
          'Bulleted list',
          e.isActive('bulletList'),
          'text-sm',
          () => e.chain().focus().toggleBulletList().run(),
          onClose,
        )}
        {styleRow(
          'Dashed list',
          e.isActive('dashedBulletList'),
          'text-sm',
          () => e.chain().focus().toggleDashedBulletList().run(),
          onClose,
        )}
        {styleRow(
          'Numbered list',
          e.isActive('orderedList'),
          'text-sm',
          () => e.chain().focus().toggleOrderedList().run(),
          onClose,
        )}
      </div>

      <div className="border-t border-outline-variant/20 px-1 pb-1 pt-1">
        {styleRow(
          'Block quote',
          e.isActive('blockquote'),
          'text-sm border-l-2 border-outline pl-2',
          () => chain().toggleBlockquote().run(),
          onClose,
        )}
      </div>
    </div>
  )
}

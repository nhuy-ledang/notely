import { useEffect, useState } from 'react'

type NoteEditorLinkModalProps = {
  open: boolean
  initialUrl: string
  onClose: () => void
  onApply: (url: string) => void
  onRemove: () => void
}

export function NoteEditorLinkModal({
  open,
  initialUrl,
  onClose,
  onApply,
  onRemove,
}: NoteEditorLinkModalProps) {
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (open) {
      setDraft(initialUrl)
    }
  }, [open, initialUrl])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="link-modal-title" className="font-manrope text-lg font-bold text-on-surface">
          Link
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant font-body">
          Nhập URL (https://…). Để trống và bấm &quot;Gỡ link&quot; sẽ xóa liên kết khỏi đoạn đang chọn.
        </p>
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://example.com"
          className="mt-4 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/25"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onApply(draft.trim())
            }
            if (e.key === 'Escape') {
              onClose()
            }
          }}
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-error hover:bg-error-container/30"
          >
            Gỡ link
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onApply(draft.trim())}
            className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}

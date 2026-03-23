import { useEffect, useState } from 'react'

export type ImageModalMode = 'insert' | 'dataUrl' | 'edit'

type NoteEditorImageModalProps = {
  open: boolean
  mode: ImageModalMode
  fileLabel: string | null
  initialAlt: string
  onClose: () => void
  onConfirm: (alt: string, showCaption: boolean) => void
}

export function NoteEditorImageModal({
  open,
  mode,
  fileLabel,
  initialAlt,
  onClose,
  onConfirm,
}: NoteEditorImageModalProps) {
  const [alt, setAlt] = useState('')
  const [showCaption, setShowCaption] = useState(false)

  useEffect(() => {
    if (open) {
      setAlt(initialAlt)
      setShowCaption(false)
    }
  }, [open, initialAlt])

  if (!open) {
    return null
  }

  const title =
    mode === 'edit' ? 'Mô tả ảnh' : mode === 'dataUrl' ? 'Ảnh dán — mô tả' : 'Chèn ảnh — mô tả'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="img-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="img-modal-title" className="font-manrope text-lg font-bold text-on-surface">
          {title}
        </h2>
        {fileLabel ? (
          <p className="mt-1 truncate text-sm text-on-surface-variant font-body" title={fileLabel}>
            {fileLabel}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-on-surface-variant font-body">
          {mode === 'edit'
            ? 'Cập nhật thuộc tính alt/title cho ảnh đang chọn (trợ năng & tooltip).'
            : 'Mô tả giúp trình đọc màn hình và SEO. Tùy chọn hiển thị chú thích dưới ảnh.'}
        </p>
        <label className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-outline">
          Mô tả (alt)
        </label>
        <textarea
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Ví dụ: Sơ đồ kiến trúc ứng dụng"
          rows={3}
          className="mt-1.5 w-full resize-y rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/25"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose()
            }
          }}
        />
        {mode !== 'edit' ? (
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-on-surface font-body">
            <input
              type="checkbox"
              checked={showCaption}
              onChange={(e) => setShowCaption(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary-container"
            />
            <span>Hiển thị chú thích dưới ảnh (đoạn in nghiêng ngay sau ảnh)</span>
          </label>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(alt, showCaption)}
            className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            {mode === 'edit' ? 'Lưu' : 'Chèn'}
          </button>
        </div>
      </div>
    </div>
  )
}

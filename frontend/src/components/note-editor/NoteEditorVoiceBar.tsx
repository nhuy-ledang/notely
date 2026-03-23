function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = Math.floor(totalSec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export type VoiceBarPhase = 'recording' | 'paused' | 'preview'

type NoteEditorVoiceBarProps = {
  phase: VoiceBarPhase
  elapsedSeconds: number
  previewUrl: string | null
  busy: boolean
  canPause: boolean
  onPause: () => void
  onResume: () => void
  onFinishRecording: () => void
  onCancelRecording: () => void
  onInsertNote: () => void
  onRecordAgain: () => void
  onCancelPreview: () => void
}

export function NoteEditorVoiceBar({
  phase,
  elapsedSeconds,
  previewUrl,
  busy,
  canPause,
  onPause,
  onResume,
  onFinishRecording,
  onCancelRecording,
  onInsertNote,
  onRecordAgain,
  onCancelPreview,
}: NoteEditorVoiceBarProps) {
  if (phase === 'preview') {
    return (
      <div className="flex flex-col gap-3 border-b border-outline-variant/25 bg-surface-container-low px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-outline">
          <span className="material-symbols-outlined text-base text-primary-container">graphic_eq</span>
          Nghe lại trước khi chèn
        </div>
        {previewUrl ? (
          <audio src={previewUrl} controls className="h-10 w-full max-w-md rounded-lg" preload="metadata" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onInsertNote()}
            className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            {busy ? 'Đang tải…' : 'Chèn vào note'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onRecordAgain}
            className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-lowest disabled:opacity-50"
          >
            Ghi lại
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancelPreview}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 border-b border-red-200/60 bg-red-50/80 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-lg font-bold tabular-nums text-red-800 dark:text-red-200">
            {formatDuration(elapsedSeconds)}
          </span>
          <span className="text-xs font-medium text-red-700/90 dark:text-red-300/90">
            {phase === 'paused' ? 'Đã tạm dừng' : 'Đang ghi…'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPause ? (
            phase === 'recording' ? (
              <button
                type="button"
                onClick={onPause}
                className="inline-flex items-center gap-1 rounded-lg border border-red-300/80 bg-white px-3 py-1.5 text-sm font-semibold text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100"
              >
                <span className="material-symbols-outlined text-[18px]">pause</span>
                Tạm dừng
              </button>
            ) : (
              <button
                type="button"
                onClick={onResume}
                className="inline-flex items-center gap-1 rounded-lg border border-red-300/80 bg-white px-3 py-1.5 text-sm font-semibold text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Tiếp tục
              </button>
            )
          ) : null}
          <button
            type="button"
            onClick={onFinishRecording}
            className="inline-flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">stop</span>
            Xong
          </button>
          <button
            type="button"
            onClick={onCancelRecording}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-on-surface-variant hover:bg-white/80 dark:hover:bg-red-950/40"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

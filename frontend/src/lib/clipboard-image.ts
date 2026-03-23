/**
 * Clipboard image sources: file (screenshot / copy image), HTML <img> data URL, or remote URL.
 */
export type ClipboardImagePayload =
  | { kind: 'file'; file: File }
  | { kind: 'dataUrl'; src: string }
  | { kind: 'remoteUrl'; src: string }

/**
 * Best-effort image extraction before ProseMirror pastes HTML (which often yields broken relative <img src>).
 */
export function extractClipboardImage(cd: DataTransfer): ClipboardImagePayload | null {
  if (cd.files?.length) {
    for (let i = 0; i < cd.files.length; i++) {
      const f = cd.files[i]
      if (f.type.startsWith('image/')) {
        return { kind: 'file', file: f }
      }
    }
  }

  for (let i = 0; i < cd.items.length; i++) {
    const item = cd.items[i]
    if (item.kind !== 'file') {
      continue
    }
    const f = item.getAsFile()
    if (!f || f.size === 0) {
      continue
    }
    if (f.type.startsWith('image/')) {
      return { kind: 'file', file: f }
    }
    const name = f.name || ''
    if (/\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name)) {
      return { kind: 'file', file: f }
    }
  }

  const html = cd.getData('text/html')
  if (!html?.trim()) {
    return null
  }

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const imgs = doc.querySelectorAll('img')
    for (const img of imgs) {
      const src = img.getAttribute('src')?.trim()
      if (!src) {
        continue
      }
      if (src.startsWith('data:image/')) {
        return { kind: 'dataUrl', src }
      }
      if (/^https?:\/\//i.test(src)) {
        return { kind: 'remoteUrl', src }
      }
    }
  } catch {
    /* ignore */
  }

  return null
}

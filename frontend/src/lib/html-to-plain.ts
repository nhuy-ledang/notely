/** Plain text for previews, search hints, and reading time (browser only). */
export function htmlToPlainText(html: string): string {
  if (!html.trim()) {
    return ''
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  } catch {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

export function readingMinutesFromPlainText(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) {
    return 1
  }
  return Math.max(1, Math.round(words / 200))
}

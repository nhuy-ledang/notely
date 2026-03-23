/** First `<img src="...">` in HTML, for lightweight previews. */
export function firstImageSrcFromHtml(html: string | null | undefined): string | null {
  if (!html?.trim()) {
    return null
  }
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  const s = m?.[1]?.trim()
  return s || null
}

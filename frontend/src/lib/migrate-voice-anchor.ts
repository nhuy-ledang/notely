/**
 * Legacy notes stored voice as <p><a href="…">🎤 Đoạn ghi âm</a></p>. Replace with the same
 * markup our voiceAudio node parses so users get an inline player without re-inserting.
 */
export function migrateVoiceAnchorToPlayer(html: string): string {
  if (!html.includes('Đoạn ghi âm')) {
    return html
  }
  const doc = new DOMParser().parseFromString(`<div id="notely-migrate-root">${html}</div>`, 'text/html')
  const root = doc.getElementById('notely-migrate-root')
  if (!root) {
    return html
  }

  const paragraphs = [...root.querySelectorAll('p')]
  for (const p of paragraphs) {
    if (p.closest('li')) {
      continue
    }
    const a = p.firstElementChild
    if (!a || a.tagName !== 'A' || p.children.length !== 1) {
      continue
    }
    const href = a.getAttribute('href')?.trim()
    if (!href || !/^https?:\/\//i.test(href)) {
      continue
    }
    if (!/\.(webm|m4a|mp3|ogg)(\?|#|$)/i.test(href)) {
      continue
    }
    const label = (a.textContent || '').trim()
    if (!/(🎤\s*)?Đoạn ghi âm/.test(label)) {
      continue
    }

    const wrap = doc.createElement('div')
    wrap.setAttribute('data-notely-voice-wrap', '1')
    wrap.className = 'notely-voice-audio-wrap'
    const lab = doc.createElement('div')
    lab.className = 'notely-voice-audio-label'
    lab.textContent = '🎤 Ghi âm'
    const aud = doc.createElement('audio')
    aud.setAttribute('controls', '')
    aud.setAttribute('preload', 'metadata')
    aud.setAttribute('data-notely-voice', '1')
    aud.className = 'notely-voice-audio'
    aud.setAttribute('playsinline', '')
    aud.src = href
    wrap.append(lab, aud)
    p.replaceWith(wrap)
  }

  return root.innerHTML
}

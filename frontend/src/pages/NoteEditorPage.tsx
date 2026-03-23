import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TableKit } from '@tiptap/extension-table/kit'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ImageModalMode } from '@/components/note-editor/NoteEditorImageModal'
import { NoteEditorImageModal } from '@/components/note-editor/NoteEditorImageModal'
import { NoteEditorLinkModal } from '@/components/note-editor/NoteEditorLinkModal'
import { NoteEditorToolbar } from '@/components/note-editor/NoteEditorToolbar'
import type { VoiceBarPhase } from '@/components/note-editor/NoteEditorVoiceBar'
import { NoteEditorVoiceBar } from '@/components/note-editor/NoteEditorVoiceBar'
import { useAuth } from '@/hooks/useAuth'
import {
  ApiError,
  collectionsApi,
  getErrorMessage,
  mediaApi,
  notesApi,
  toAbsoluteMediaUrl,
} from '@/lib/api'
import type { ApiCollection } from '@/types/collection'
import { useLocale } from '@/hooks/useLocale'
import { extractClipboardImage, type ClipboardImagePayload } from '@/lib/clipboard-image'
import { escapeAttr, escapeHtml } from '@/lib/html-escape'
import { htmlToPlainText, readingMinutesFromPlainText } from '@/lib/html-to-plain'
import { suggestNoteTagsFromText } from '@/lib/note-tag-suggestions'
import { migrateVoiceAnchorToPlayer } from '@/lib/migrate-voice-anchor'
import { formatNoteDate } from '@/lib/format-note-date'
import { NotelyVoiceAudio } from '@/tiptap/notelyVoiceAudio'
import { DashedBulletList } from '@/tiptap/dashedBulletList'

const emptyDoc = '<p></p>'
const AUTOSAVE_MS = 900
const DEFAULT_NOTE_TITLE = 'Untitled note'

function normalizeTags(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const t = raw.trim()
    if (!t || seen.has(t.toLowerCase())) {
      continue
    }
    seen.add(t.toLowerCase())
    out.push(t.slice(0, 48))
    if (out.length >= 24) {
      break
    }
  }
  return out
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('read failed'))
    r.readAsDataURL(file)
  })
}

function insertImageWithCaption(
  ed: Editor,
  src: string,
  altTrim: string,
  showCaption: boolean,
) {
  const escSrc = escapeAttr(src)
  const escAlt = escapeAttr(altTrim)
  if (showCaption && altTrim) {
    ed.chain()
      .focus()
      .insertContent(
        `<img src="${escSrc}" alt="${escAlt}" title="${escAlt}" /><p class="notely-image-caption"><em>${escapeHtml(altTrim)}</em></p>`,
      )
      .run()
  } else {
    ed.chain()
      .focus()
      .setImage({ src, alt: altTrim || undefined, title: altTrim || undefined })
      .run()
  }
}

export function NoteEditorPage() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const { t } = useLocale()

  const isNew = noteId === 'new'
  const existingId = !isNew && noteId ? Number(noteId) : NaN

  const [title, setTitle] = useState('')
  const [pinned, setPinned] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [collectionId, setCollectionId] = useState<number | null>(null)
  const [collections, setCollections] = useState<ApiCollection[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingNote, setLoadingNote] = useState(!isNew)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const autosaveFieldsRef = useRef({
    title: '',
    pinned: false,
    tags: [] as string[],
    collectionId: null as number | null,
  })
  const routeNoteIdRef = useRef<string>('new')
  const dirtyRef = useRef(false)
  const savingRef = useRef(false)
  const pendingAutosaveRef = useRef(false)
  const [createdMeta, setCreatedMeta] = useState<{ created_at: string; updated_at: string } | null>(
    null,
  )
  const [contentTick, setContentTick] = useState(0)
  const baselineRef = useRef<string>('')
  const editorRef = useRef<Editor | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const linkIntentRef = useRef<'selection' | 'paste'>('selection')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const voiceStreamRef = useRef<MediaStream | null>(null)
  const voiceChunksRef = useRef<Blob[]>([])
  const voiceCancelRef = useRef(false)
  const voiceSessionStartRef = useRef(0)
  const voicePreviewUrlRef = useRef<string | null>(null)
  const pendingImageFileRef = useRef<File | null>(null)
  const pendingDataUrlRef = useRef<string | null>(null)
  const pasteCtxRef = useRef<{
    openLinkPaste: (url: string) => void
    insertImageFromFile: (file: File) => void
    applyClipboardImage: (p: ClipboardImagePayload) => Promise<void>
  }>({
    openLinkPaste: () => {},
    insertImageFromFile: () => {},
    applyClipboardImage: async () => {},
  })

  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')
  const [voicePhase, setVoicePhase] = useState<'idle' | VoiceBarPhase>('idle')
  const [voiceBusy, setVoiceBusy] = useState(false)
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null)
  const [voicePendingBlob, setVoicePendingBlob] = useState<{ blob: Blob; mime: string } | null>(null)
  const [canPauseVoice, setCanPauseVoice] = useState(false)
  const [voiceTick, setVoiceTick] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageModalMode, setImageModalMode] = useState<ImageModalMode>('insert')
  const [imageModalInitialAlt, setImageModalInitialAlt] = useState('')
  const [imageModalFileLabel, setImageModalFileLabel] = useState<string | null>(null)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: true,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-4',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph', 'tableCell', 'tableHeader'] }),
      TableKit.configure({
        table: { resizable: false, HTMLAttributes: { class: 'notely-editor-table' } },
      }),
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: true }),
      NotelyVoiceAudio,
      DashedBulletList,
      TaskList,
      TaskItem.configure({
        nested: false,
        HTMLAttributes: {
          class: 'notely-task-item',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start curating your thoughts…',
      }),
    ],
    [],
  )

  const editorProps = useMemo(
    () => ({
      attributes: {
        class:
          'prose-note min-h-[420px] px-8 pb-8 pt-2 text-lg leading-relaxed text-on-surface focus:outline-none',
      },
      handleKeyDown(_view: unknown, event: globalThis.KeyboardEvent) {
        if (event.key === '/' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          imageInputRef.current?.click()
          return true
        }
        return false
      },
      handlePaste(_view: unknown, event: globalThis.ClipboardEvent) {
        const cd = event.clipboardData
        if (!cd) {
          return false
        }
        const clipImg = extractClipboardImage(cd)
        if (clipImg) {
          event.preventDefault()
          void pasteCtxRef.current.applyClipboardImage(clipImg)
          return true
        }
        const text = cd.getData('text/plain').trim()
        let urlCandidate: string | null = null
        if (/^https?:\/\/\S+$/i.test(text)) {
          urlCandidate = text
        } else if (/^www\.\S+$/i.test(text)) {
          urlCandidate = `https://${text}`
        }
        if (urlCandidate) {
          event.preventDefault()
          pasteCtxRef.current.openLinkPaste(urlCandidate)
          return true
        }
        return false
      },
    }),
    [],
  )

  const editor = useEditor({
    extensions,
    content: emptyDoc,
    editorProps,
    onUpdate: () => setContentTick((n) => n + 1),
  })

  editorRef.current = editor

  pasteCtxRef.current = {
    openLinkPaste(url: string) {
      linkIntentRef.current = 'paste'
      setLinkDraft(url)
      setLinkModalOpen(true)
    },
    insertImageFromFile(file: File) {
      pendingImageFileRef.current = file
      pendingDataUrlRef.current = null
      setImageModalMode('insert')
      setImageModalFileLabel(file.name || 'image')
      setImageModalOpen(true)
    },
    async applyClipboardImage(payload: ClipboardImagePayload) {
      const ed = editorRef.current
      if (!ed) {
        return
      }
      switch (payload.kind) {
        case 'file': {
          pendingImageFileRef.current = payload.file
          pendingDataUrlRef.current = null
          setImageModalMode('insert')
          setImageModalFileLabel(payload.file.name || 'image')
          setImageModalOpen(true)
          return
        }
        case 'dataUrl': {
          pendingDataUrlRef.current = payload.src
          pendingImageFileRef.current = null
          setImageModalMode('dataUrl')
          setImageModalFileLabel(null)
          setImageModalOpen(true)
          return
        }
        case 'remoteUrl': {
          const remote = payload.src
          try {
            if (token) {
              const res = await fetch(remote, { mode: 'cors', credentials: 'omit' })
              if (res.ok) {
                const blob = await res.blob()
                if (blob.type.startsWith('image/')) {
                  let ext = (blob.type.split('/')[1] || 'png').toLowerCase()
                  if (ext === 'jpeg') {
                    ext = 'jpg'
                  }
                  const { url } = await mediaApi.upload(token, blob, `paste.${ext}`)
                  ed.chain().focus().setImage({ src: toAbsoluteMediaUrl(url) }).run()
                  return
                }
              }
            }
          } catch {
            /* fall through to direct URL */
          }
          ed.chain().focus().setImage({ src: remote }).run()
          return
        }
        default: {
          return
        }
      }
    },
  }

  const openLinkDialog = useCallback(() => {
    const ed = editorRef.current
    if (!ed) {
      return
    }
    linkIntentRef.current = 'selection'
    const href = (ed.getAttributes('link').href as string) || ''
    setLinkDraft(href)
    setLinkModalOpen(true)
  }, [])

  const applyLinkFromModal = useCallback((url: string) => {
    const ed = editorRef.current
    if (!ed) {
      return
    }
    const trimmed = url.trim()
    if (!trimmed) {
      ed.chain().focus().extendMarkRange('link').unsetLink().run()
    } else if (linkIntentRef.current === 'paste' && ed.state.selection.empty) {
      ed.chain()
        .focus()
        .insertContent(
          `<a href="${escapeAttr(trimmed)}" target="_blank" rel="noopener noreferrer">${escapeHtml(trimmed)}</a> `,
        )
        .run()
    } else {
      ed.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: trimmed, target: '_blank', rel: 'noopener noreferrer' })
        .run()
    }
    setLinkModalOpen(false)
  }, [])

  const removeLinkFromModal = useCallback(() => {
    editorRef.current?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkModalOpen(false)
  }, [])

  const handleImageInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]
    ev.target.value = ''
    if (!f?.type.startsWith('image/')) {
      return
    }
    pasteCtxRef.current.insertImageFromFile(f)
  }, [])

  const revokeVoicePreview = useCallback(() => {
    if (voicePreviewUrlRef.current) {
      URL.revokeObjectURL(voicePreviewUrlRef.current)
      voicePreviewUrlRef.current = null
    }
    setVoicePreviewUrl(null)
  }, [])

  const startVoiceRecording = useCallback(async () => {
    if (!token) {
      setSaveError('Đăng nhập để tải ghi âm lên.')
      return
    }
    if (voicePhase !== 'idle') {
      return
    }
    try {
      revokeVoicePreview()
      setVoicePendingBlob(null)
      voiceCancelRef.current = false
      voiceSessionStartRef.current = Date.now()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      voiceStreamRef.current = stream
      voiceChunksRef.current = []
      let mime = ''
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mime = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mime = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mime = 'audio/mp4'
        }
      }
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      setCanPauseVoice(typeof mr.pause === 'function')
      mr.ondataavailable = (ev) => {
        if (ev.data.size) {
          voiceChunksRef.current.push(ev.data)
        }
      }
      mr.onstop = () => {
        voiceStreamRef.current?.getTracks().forEach((t) => t.stop())
        voiceStreamRef.current = null
        mediaRecorderRef.current = null
        const cancelled = voiceCancelRef.current
        voiceCancelRef.current = false
        if (cancelled) {
          voiceChunksRef.current = []
          setVoicePhase('idle')
          setVoicePendingBlob(null)
          return
        }
        const chunks = [...voiceChunksRef.current]
        voiceChunksRef.current = []
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
        if (blob.size === 0) {
          setVoicePhase('idle')
          return
        }
        if (voicePreviewUrlRef.current) {
          URL.revokeObjectURL(voicePreviewUrlRef.current)
        }
        const url = URL.createObjectURL(blob)
        voicePreviewUrlRef.current = url
        setVoicePreviewUrl(url)
        setVoicePendingBlob({ blob, mime: mr.mimeType || 'audio/webm' })
        setVoicePhase('preview')
      }
      mr.start(250)
      setVoicePhase('recording')
    } catch {
      setSaveError('Không bật được micro hoặc quyền bị chặn.')
      setVoicePhase('idle')
    }
  }, [token, voicePhase, revokeVoicePreview])

  const finishVoiceRecording = useCallback(() => {
    voiceCancelRef.current = false
    const mr = mediaRecorderRef.current
    if (!mr || (mr.state !== 'recording' && mr.state !== 'paused')) {
      return
    }
    mr.requestData()
    mr.stop()
  }, [])

  const cancelVoiceRecording = useCallback(() => {
    voiceCancelRef.current = true
    const mr = mediaRecorderRef.current
    if (mr && (mr.state === 'recording' || mr.state === 'paused')) {
      mr.requestData()
      mr.stop()
    } else {
      voiceStreamRef.current?.getTracks().forEach((t) => t.stop())
      voiceStreamRef.current = null
      setVoicePhase('idle')
    }
  }, [])

  const pauseVoice = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state !== 'recording') {
      return
    }
    try {
      mr.pause()
      setVoicePhase('paused')
    } catch {
      /* MediaRecorder.pause unsupported */
    }
  }, [])

  const resumeVoice = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state !== 'paused') {
      return
    }
    try {
      mr.resume()
      setVoicePhase('recording')
    } catch {
      /* unsupported */
    }
  }, [])

  const insertVoiceFromPreview = useCallback(async () => {
    const ed = editorRef.current
    const tok = token
    if (!ed || !tok || !voicePendingBlob) {
      return
    }
    setVoiceBusy(true)
    try {
      const ext = voicePendingBlob.mime.includes('mp4') ? 'm4a' : 'webm'
      const { url } = await mediaApi.upload(tok, voicePendingBlob.blob, `voice-${Date.now()}.${ext}`)
      const abs = toAbsoluteMediaUrl(url)
      ed.chain().focus().insertContent({ type: 'voiceAudio', attrs: { src: abs } }).run()
      revokeVoicePreview()
      setVoicePendingBlob(null)
      setVoicePhase('idle')
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? getErrorMessage(e.body, e.message)
          : e instanceof Error
            ? e.message
            : 'Upload failed'
      setSaveError(msg)
    } finally {
      setVoiceBusy(false)
    }
  }, [token, voicePendingBlob, revokeVoicePreview])

  const discardVoicePreview = useCallback(() => {
    revokeVoicePreview()
    setVoicePendingBlob(null)
    setVoicePhase('idle')
  }, [revokeVoicePreview])

  const onVoiceMicClick = useCallback(() => {
    if (voicePhase !== 'idle' || voiceBusy) {
      return
    }
    void startVoiceRecording()
  }, [voicePhase, voiceBusy, startVoiceRecording])

  const closeImageModal = useCallback(() => {
    setImageModalOpen(false)
    pendingImageFileRef.current = null
    pendingDataUrlRef.current = null
  }, [])

  const handleImageModalConfirm = useCallback(
    async (alt: string, showCaption: boolean) => {
      const ed = editorRef.current
      if (!ed) {
        return
      }
      const trimmed = alt.trim()
      const mode = imageModalMode

      if (mode === 'edit') {
        setImageModalOpen(false)
        ed.chain()
          .focus()
          .updateAttributes('image', { alt: trimmed || null, title: trimmed || null })
          .run()
        return
      }

      if (mode === 'dataUrl') {
        const src = pendingDataUrlRef.current
        pendingDataUrlRef.current = null
        pendingImageFileRef.current = null
        setImageModalOpen(false)
        if (!src) {
          return
        }
        insertImageWithCaption(ed, src, trimmed, showCaption)
        return
      }

      const file = pendingImageFileRef.current
      pendingImageFileRef.current = null
      pendingDataUrlRef.current = null
      setImageModalOpen(false)
      if (!file) {
        return
      }

      try {
        let src: string
        if (token) {
          const { url } = await mediaApi.upload(token, file, file.name || 'image.png')
          src = toAbsoluteMediaUrl(url)
        } else {
          src = await readFileAsDataUrl(file)
        }
        insertImageWithCaption(ed, src, trimmed, showCaption)
      } catch {
        try {
          const src = await readFileAsDataUrl(file)
          insertImageWithCaption(ed, src, trimmed, showCaption)
        } catch {
          /* ignore */
        }
      }
    },
    [imageModalMode, token],
  )

  const openImageCaptionDialog = useCallback(() => {
    const ed = editorRef.current
    if (!ed) {
      return
    }
    const attrs = ed.getAttributes('image')
    setImageModalMode('edit')
    setImageModalInitialAlt(String(attrs.alt || attrs.title || ''))
    setImageModalFileLabel(null)
    setImageModalOpen(true)
  }, [])

  useEffect(() => {
    if (voicePhase !== 'recording' && voicePhase !== 'paused') {
      return
    }
    const id = window.setInterval(() => setVoiceTick((n) => n + 1), 200)
    return () => clearInterval(id)
  }, [voicePhase])

  useEffect(() => {
    return () => {
      if (voicePreviewUrlRef.current) {
        URL.revokeObjectURL(voicePreviewUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    document.title = isNew ? t('editor.docNew') : t('editor.docEdit')
  }, [isNew, t])

  useEffect(() => {
    if (!token) {
      return
    }
    let cancelled = false
    void collectionsApi
      .list(token)
      .then((list) => {
        if (!cancelled) {
          setCollections(list)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCollections([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token || !editor) {
      return
    }

    if (isNew) {
      setTitle('')
      setPinned(false)
      setTags([])
      const rawColl = searchParams.get('collectionId')
      const parsedColl = rawColl ? Number(rawColl) : NaN
      const initialColl = Number.isFinite(parsedColl) ? parsedColl : null
      setCollectionId(initialColl)
      setCreatedMeta(null)
      setLoadError(null)
      setLoadingNote(false)
      editor.commands.setContent(emptyDoc, { emitUpdate: false })
      queueMicrotask(() => {
        baselineRef.current = snapshot(editor, '', false, [], emptyDoc, initialColl)
      })
      return
    }

    if (!Number.isFinite(existingId)) {
      setLoadError(t('editor.invalidNote'))
      setLoadingNote(false)
      return
    }

    let cancelled = false
    setLoadingNote(true)
    setLoadError(null)

    void (async () => {
      try {
        const note = await notesApi.show(token, existingId)
        if (cancelled) {
          return
        }
        setTitle(note.title)
        setPinned(note.pinned)
        setTags(note.tags ?? [])
        setCollectionId(note.collection_id ?? null)
        setCreatedMeta({ created_at: note.created_at, updated_at: note.updated_at })
        const rawHtml = note.body?.trim() ? note.body : emptyDoc
        const html = migrateVoiceAnchorToPlayer(rawHtml)
        editor.commands.setContent(html, { emitUpdate: false })
        queueMicrotask(() => {
          baselineRef.current = snapshot(
            editor,
            note.title,
            note.pinned,
            note.tags ?? [],
            html,
            note.collection_id ?? null,
          )
        })
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof ApiError
              ? getErrorMessage(e.body, e.message)
              : e instanceof Error
                ? e.message
                : t('editor.loadNoteError')
          setLoadError(msg)
        }
      } finally {
        if (!cancelled) {
          setLoadingNote(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, editor, isNew, existingId, searchParams, t])

  const bodyHtml = editor?.getHTML() ?? emptyDoc

  const plainForHints = useMemo(() => {
    void contentTick
    return htmlToPlainText(`${title}\n${bodyHtml}`)
  }, [title, bodyHtml, contentTick])

  const suggestedTags = useMemo(() => suggestNoteTagsFromText(plainForHints), [plainForHints])

  const readingMins = useMemo(
    () => readingMinutesFromPlainText(htmlToPlainText(bodyHtml)),
    [bodyHtml],
  )

  const dirty = useMemo(() => {
    void contentTick
    if (!editor) {
      return false
    }
    return snapshot(editor, title, pinned, tags, bodyHtml, collectionId) !== baselineRef.current
  }, [editor, title, pinned, tags, bodyHtml, collectionId, contentTick])

  autosaveFieldsRef.current = { title, pinned, tags, collectionId }
  routeNoteIdRef.current = noteId ?? 'new'
  dirtyRef.current = dirty

  const performAutosaveCore = useCallback(async () => {
    const ed = editorRef.current
    const tok = token
    if (!ed || !tok || loadingNote) {
      return
    }

    const { title: rawTitle, pinned: p, tags: tg, collectionId: coll } = autosaveFieldsRef.current
    let titleForBaseline = rawTitle.trim()
    const apiTitle = titleForBaseline || DEFAULT_NOTE_TITLE
    if (!titleForBaseline) {
      setTitle(apiTitle)
      titleForBaseline = apiTitle
    }
    const tagList = normalizeTags(tg)
    const html = ed.getHTML()
    const idParam = routeNoteIdRef.current
    const isNewNow = idParam === 'new'
    const exId = !isNewNow && idParam ? Number(idParam) : NaN

    setSaveError(null)
    if (isNewNow) {
      const created = await notesApi.create(tok, {
        title: apiTitle,
        body: html === emptyDoc ? '' : html,
        pinned: p,
        tags: tagList,
        ...(coll != null ? { collection_id: coll } : {}),
      })
      routeNoteIdRef.current = String(created.id)
      setCollectionId(created.collection_id ?? null)
      setCreatedMeta({ created_at: created.created_at, updated_at: created.updated_at })
      baselineRef.current = snapshot(ed, titleForBaseline, p, tagList, html, created.collection_id ?? null)
      navigate(`/app/notes/${created.id}`, { replace: true })
      return
    }
    if (Number.isFinite(exId)) {
      const updated = await notesApi.update(tok, exId, {
        title: apiTitle,
        body: html === emptyDoc ? '' : html,
        pinned: p,
        tags: tagList,
        collection_id: coll,
      })
      setCreatedMeta({ created_at: updated.created_at, updated_at: updated.updated_at })
      baselineRef.current = snapshot(ed, titleForBaseline, p, tagList, html, updated.collection_id ?? null)
    }
  }, [token, loadingNote, navigate])

  const flushAutosave = useCallback(async () => {
    if (savingRef.current) {
      pendingAutosaveRef.current = true
      return
    }
    savingRef.current = true
    pendingAutosaveRef.current = false
    setSaving(true)
    try {
      await performAutosaveCore()
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? getErrorMessage(e.body, e.message)
          : e instanceof Error
            ? e.message
            : t('editor.saveFailed')
      setSaveError(msg)
    } finally {
      savingRef.current = false
      setSaving(false)
      if (pendingAutosaveRef.current) {
        pendingAutosaveRef.current = false
        void flushAutosave()
      }
    }
  }, [performAutosaveCore])

  useEffect(() => {
    if (!token || !editor || loadingNote || loadError) {
      return
    }
    if (!dirty) {
      return
    }
    const id = window.setTimeout(() => {
      void flushAutosave()
    }, AUTOSAVE_MS)
    return () => window.clearTimeout(id)
  }, [dirty, token, editor, loadingNote, loadError, flushAutosave, contentTick, title, pinned, tags, collectionId])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden' && dirtyRef.current && token) {
        void flushAutosave()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [token, flushAutosave])

  const addTag = useCallback((label: string) => {
    const t = label.trim()
    if (!t) {
      return
    }
    setTags((prev) => normalizeTags([...prev, t]))
  }, [])

  const removeTag = useCallback((label: string) => {
    setTags((prev) => prev.filter((x) => x !== label))
  }, [])

  const createdLabel = createdMeta?.created_at
    ? formatNoteDate(createdMeta.created_at)
    : 'Not saved yet'

  void voiceTick
  const voiceElapsedSeconds =
    voicePhase === 'recording' || voicePhase === 'paused'
      ? Math.floor((Date.now() - voiceSessionStartRef.current) / 1000)
      : 0

  if (!token) {
    return null
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-4xl px-8 py-16 md:px-12">
        <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mt-6 rounded-xl bg-primary-container px-6 py-3 font-manrope text-sm font-bold text-on-primary"
        >
          {t('editor.backLibrary')}
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10 lg:px-12">
      {loadingNote ? (
        <p className="text-on-surface-variant font-body">{t('editor.loadNote')}</p>
      ) : (
        <>
          <header className="mb-10 flex flex-col justify-end gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 font-manrope text-4xl font-extrabold tracking-tight text-primary-container md:text-5xl">
                {isNew ? t('editor.newTitle') : t('editor.editTitle')}
              </h1>
              <p
                className="cursor-default select-none font-body font-medium text-secondary"
                title={t('editor.pageHint')}
              >
                {t('editor.subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPinned((p) => !p)}
              className={`self-start rounded-full p-3 transition-colors hover:bg-tertiary-fixed sm:self-auto ${
                pinned ? 'text-tertiary' : 'text-outline hover:text-tertiary'
              }`}
              aria-pressed={pinned}
              aria-label={pinned ? t('editor.unpin') : t('editor.pin')}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={pinned ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                star
              </span>
            </button>
          </header>

          {saveError ? (
            <p
              className="mb-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container"
              role="alert"
            >
              {saveError}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
                <div className="p-8 pb-4">
                  <label
                    htmlFor="note-title"
                    className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant"
                  >
                    {t('editor.noteTitleLabel')}
                  </label>
                  <input
                    id="note-title"
                    value={title}
                    onChange={(ev) => setTitle(ev.target.value)}
                    placeholder={t('editor.titlePlaceholder')}
                    className="w-full border-none bg-transparent p-0 font-manrope text-3xl font-bold text-on-surface placeholder:text-surface-dim focus:ring-0"
                  />
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => void handleImageInputChange(e)}
                />
                <NoteEditorToolbar
                  editor={editor}
                  onOpenLinkDialog={openLinkDialog}
                  onPickImageFile={() => imageInputRef.current?.click()}
                  onOpenImageCaption={openImageCaptionDialog}
                  voicePhase={voicePhase}
                  voiceBusy={voiceBusy}
                  onVoiceMicClick={onVoiceMicClick}
                />
                {voicePhase !== 'idle' ? (
                  <NoteEditorVoiceBar
                    phase={voicePhase}
                    elapsedSeconds={voiceElapsedSeconds}
                    previewUrl={voicePreviewUrl}
                    busy={voiceBusy}
                    canPause={canPauseVoice}
                    onPause={pauseVoice}
                    onResume={resumeVoice}
                    onFinishRecording={finishVoiceRecording}
                    onCancelRecording={cancelVoiceRecording}
                    onInsertNote={() => void insertVoiceFromPreview()}
                    onRecordAgain={discardVoicePreview}
                    onCancelPreview={discardVoicePreview}
                  />
                ) : null}
                <div className="editor-content-area">
                  <div className="px-8 pt-4">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-outline-variant">
                      {t('editor.content')}
                    </span>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-4">
              <div className="space-y-6 rounded-xl bg-surface-container-low p-6">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">{t('editor.smartTagging')}</h3>
                </div>
                <p className="text-xs leading-relaxed text-secondary">
                  {t('editor.smartTaggingHint')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((s) => {
                    const active = tags.some((x) => x.toLowerCase() === s.toLowerCase())
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={active}
                        onClick={() => addTag(s)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? 'cursor-default opacity-50 bg-primary-fixed text-on-primary-fixed-variant'
                            : 'bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-container hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        {s}
                      </button>
                    )
                  })}
                </div>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 border-t border-outline-variant/20 pt-4">
                    <p className="w-full text-[10px] font-bold uppercase tracking-widest text-outline">
                      {t('editor.onNote')}
                    </p>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-lowest px-2 py-1 text-xs font-medium text-on-surface"
                      >
                        {tag}
                        <button
                          type="button"
                          className="text-outline hover:text-error"
                          aria-label={t('editor.removeTag', { tag })}
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 rounded-xl bg-surface-container-low p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
                  Metadata
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">{t('editor.created')}</span>
                    <span className="font-bold text-on-surface">{createdLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">{t('editor.reading')}</span>
                    <span className="font-bold text-on-surface">{t('editor.readingMin', { n: readingMins })}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <label htmlFor="note-collection" className="block text-secondary">
                      {t('editor.collection')}
                    </label>
                    <select
                      id="note-collection"
                      value={collectionId ?? ''}
                      onChange={(ev) => {
                        const v = ev.target.value
                        setCollectionId(v === '' ? null : Number(v))
                      }}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 py-2 text-xs font-medium text-on-surface focus:ring-2 focus:ring-primary/25 dark:bg-surface-dim"
                    >
                      <option value="">{t('editor.noCollection')}</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">{t('editor.autosave')}</span>
                    <span
                      className={`font-bold ${
                        saveError ? 'text-error' : saving ? 'text-primary-container' : dirty ? 'text-secondary' : 'text-on-surface'
                      }`}
                    >
                      {saveError ? t('editor.saveError') : saving ? t('editor.saving') : dirty ? t('editor.willSave') : t('editor.saved')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">{t('editor.visibility')}</span>
                    <span className="font-bold text-primary">{t('editor.private')}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-r-lg border-l-4 border-primary bg-primary-container/10 p-4">
                <p className="mb-1 text-xs font-semibold text-primary">{t('editor.curatorTip')}</p>
                <p className="text-[11px] leading-relaxed text-on-surface-variant">
                  {t('editor.curatorTipBody')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <NoteEditorLinkModal
        open={linkModalOpen}
        initialUrl={linkDraft}
        onClose={() => setLinkModalOpen(false)}
        onApply={applyLinkFromModal}
        onRemove={removeLinkFromModal}
      />
      <NoteEditorImageModal
        open={imageModalOpen}
        mode={imageModalMode}
        fileLabel={imageModalFileLabel}
        initialAlt={imageModalInitialAlt}
        onClose={closeImageModal}
        onConfirm={(alt, cap) => void handleImageModalConfirm(alt, cap)}
      />
    </section>
  )
}

function snapshot(
  ed: Editor | null,
  noteTitle: string,
  notePinned: boolean,
  tagList: string[],
  htmlFallback: string,
  collId: number | null,
): string {
  const body = ed?.getHTML() ?? htmlFallback
  return JSON.stringify({
    title: noteTitle.trim(),
    pinned: notePinned,
    tags: normalizeTags(tagList),
    body,
    collection_id: collId,
  })
}

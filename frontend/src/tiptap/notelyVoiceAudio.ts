import { mergeAttributes, Node } from '@tiptap/core'

/**
 * Embedded voice note: native &lt;audio controls&gt; (play/pause, seek, timeline) inside the editor.
 */
export const NotelyVoiceAudio = Node.create({
  name: 'voiceAudio',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-notely-voice-wrap="1"]',
        getAttrs: (el) => {
          const audio = (el as HTMLElement).querySelector(
            'audio[data-notely-voice="1"], audio.notely-voice-audio',
          )
          const src = audio?.getAttribute('src')?.trim()
          return src ? { src } : false
        },
      },
      {
        tag: 'audio[data-notely-voice="1"]',
        getAttrs: (el) => {
          const src = (el as HTMLAudioElement).getAttribute('src')?.trim()
          return src ? { src } : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string | undefined
    return [
      'div',
      {
        'data-notely-voice-wrap': '1',
        class: 'notely-voice-audio-wrap',
      },
      ['div', { class: 'notely-voice-audio-label' }, '🎤 Ghi âm'],
      [
        'audio',
        mergeAttributes(
          {
            controls: true,
            preload: 'metadata',
            'data-notely-voice': '1',
            class: 'notely-voice-audio',
            playsinline: '',
          },
          { src },
        ),
      ],
    ]
  },

})

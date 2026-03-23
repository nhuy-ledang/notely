import { BulletList } from '@tiptap/extension-bullet-list'
import { mergeAttributes } from '@tiptap/core'

/**
 * Second bullet style (dash marker) — same listItem as default bullet list.
 */
export const DashedBulletList = BulletList.extend({
  name: 'dashedBulletList',

  parseHTML() {
    return [{ tag: 'ul[data-type="dashed"]', priority: 60 }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ul',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'dashed',
        class: 'notely-list-dashed',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleDashedBulletList:
        () =>
        ({ commands }) =>
          commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks),
    }
  },

  addKeyboardShortcuts() {
    return {}
  },

  addInputRules() {
    return []
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dashedBulletList: {
      toggleDashedBulletList: () => ReturnType
    }
  }
}

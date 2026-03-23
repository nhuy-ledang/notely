/** Keyword → label for “smart” tag suggestions from note text (client-side). */
const VOCAB: { keyword: string; label: string }[] = [
  { keyword: 'strategy', label: 'Strategy' },
  { keyword: 'editorial', label: 'Editorial' },
  { keyword: 'research', label: 'Research' },
  { keyword: 'goal', label: 'Goals' },
  { keyword: 'q4', label: 'Q4 Goals' },
  { keyword: 'design', label: 'Design' },
  { keyword: 'meeting', label: 'Meeting' },
  { keyword: 'budget', label: 'Budget' },
  { keyword: 'creative', label: 'Creative' },
  { keyword: 'launch', label: 'Launch' },
  { keyword: 'review', label: 'Review' },
  { keyword: 'deadline', label: 'Deadline' },
]

export function suggestNoteTagsFromText(text: string): string[] {
  const lower = text.toLowerCase()
  const out: string[] = []
  for (const { keyword, label } of VOCAB) {
    if (lower.includes(keyword) && !out.includes(label)) {
      out.push(label)
    }
  }
  return out.slice(0, 10)
}

export type TranslationMode = 'show' | 'hide' | 'tap'

export interface StoryToken {
  text: string
  wordId: string | null
}

const LETTER = /\p{L}/u

interface Range {
  start: number
  end: number
  wordId: string
}

export function tokenizeSentence(pl: string, forms: Record<string, string> = {}): StoryToken[] {
  const ranges: Range[] = []
  const keys = Object.keys(forms).sort((a, b) => b.length - a.length)

  for (const form of keys) {
    let from = 0
    for (;;) {
      const start = pl.indexOf(form, from)
      if (start === -1) break
      const end = start + form.length
      const wholeWord = !LETTER.test(pl[start - 1] ?? '') && !LETTER.test(pl[end] ?? '')
      const overlaps = ranges.some((r) => start < r.end && end > r.start)
      if (wholeWord && !overlaps) ranges.push({ start, end, wordId: forms[form]! })
      from = start + 1
    }
  }

  ranges.sort((a, b) => a.start - b.start)

  const tokens: StoryToken[] = []
  let position = 0
  for (const range of ranges) {
    if (range.start > position) tokens.push({ text: pl.slice(position, range.start), wordId: null })
    tokens.push({ text: pl.slice(range.start, range.end), wordId: range.wordId })
    position = range.end
  }
  if (position < pl.length) tokens.push({ text: pl.slice(position), wordId: null })
  return tokens
}

export function storySlug(stem: string): string {
  return stem.split('/').pop() ?? stem
}

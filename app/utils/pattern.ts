export interface Segment {
  text: string
  hl: boolean
}

export function findGroup(word: string, group: string): number {
  return word.toLowerCase().indexOf(group.toLowerCase())
}

export function highlightGroup(word: string, group: string): Segment[] {
  const index = findGroup(word, group)
  if (index === -1 || group.length === 0) return [{ text: word, hl: false }]
  const end = index + group.length
  const segments: Segment[] = [
    { text: word.slice(0, index), hl: false },
    { text: word.slice(index, end), hl: true },
    { text: word.slice(end), hl: false },
  ]
  return segments.filter((s) => s.text.length > 0)
}

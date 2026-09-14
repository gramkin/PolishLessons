import MiniSearch from 'minisearch'
import type { SearchDoc, SearchDocType } from '../../shared/search'
import { foldDiacritics, normalizeLoose } from './normalize'
import type { Segment } from './pattern'

export const GROUP_LABELS: Record<SearchDocType, string> = {
  lesson: 'Уроки',
  word: 'Словарь',
  story: 'Истории',
}

const GROUP_ORDER: SearchDocType[] = ['lesson', 'word', 'story']

export type SearchHit = SearchDoc

export interface SearchGroup {
  type: SearchDocType
  label: string
  hits: SearchHit[]
}

export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'text'],
    storeFields: ['type', 'title', 'text', 'url'],
    processTerm: (term) => normalizeLoose(term) || null,
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 }, combineWith: 'AND' },
  })
  index.addAll(docs)
  return index
}

export function searchGrouped(
  index: MiniSearch<SearchDoc>,
  query: string,
  limit = 8,
): SearchGroup[] {
  if (!normalizeLoose(query)) return []
  const results = index.search(query)
  return GROUP_ORDER.map((type) => ({
    type,
    label: GROUP_LABELS[type],
    hits: results
      .filter((r) => r.type === type)
      .slice(0, limit)
      .map((r) => ({ id: String(r.id), type, title: r.title, text: r.text, url: r.url })),
  })).filter((group) => group.hits.length > 0)
}

export function highlightQuery(text: string, query: string): Segment[] {
  const terms = normalizeLoose(query).split(' ').filter(Boolean)
  if (terms.length === 0) return [{ text, hl: false }]

  const haystack = foldDiacritics(text.toLowerCase())
  const marks = new Array<boolean>(text.length).fill(false)
  for (const term of terms) {
    let from = 0
    for (;;) {
      const at = haystack.indexOf(term, from)
      if (at === -1) break
      marks.fill(true, at, at + term.length)
      from = at + term.length
    }
  }

  const segments: Segment[] = []
  for (let i = 0; i < text.length; i++) {
    const last = segments[segments.length - 1]
    if (last && last.hl === marks[i]) last.text += text[i]
    else segments.push({ text: text[i]!, hl: marks[i]! })
  }
  return segments
}

export function snippet(text: string, query: string, radius = 50): string {
  if (text.length <= radius * 2) return text
  const first = normalizeLoose(query).split(' ')[0] ?? ''
  const at = first ? foldDiacritics(text.toLowerCase()).indexOf(first) : -1
  const start = Math.max(0, (at === -1 ? 0 : at) - radius)
  const end = Math.min(text.length, start + radius * 2)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

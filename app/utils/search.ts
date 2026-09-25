import MiniSearch, { type SearchResult } from 'minisearch'
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

// Prefix and fuzzy matching belong to the headword and its gloss.
const LOOSE_FIELDS = ['title', 'text']
// The inflection table is matched exactly. MiniSearch sums a score for every
// term a prefix expands to, and a verb carries dozens of forms sharing one
// prefix, so allowing prefixes here ranks words by how many forms they happen
// to have: "zab" put zabijać (about sixty matching forms) above ząb, which
// matches exactly, and "mam" put mama above mieć for the same reason.
const EXACT_FIELDS = ['forms']
// An exact inflected form is a strong signal: it is the form the reader actually
// met in the text, so it should outweigh a headword that merely contains the
// letters somewhere.
const FORM_BOOST = 3

export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: [...LOOSE_FIELDS, ...EXACT_FIELDS],
    storeFields: ['type', 'title', 'text', 'url'],
    processTerm: (term) => normalizeLoose(term) || null,
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 }, combineWith: 'AND' },
  })
  index.addAll(docs)
  return index
}

/** Both passes for one query, each document scored by the sum of what it matched. */
function rank(index: MiniSearch<SearchDoc>, query: string): SearchResult[] {
  const loose = index.search(query, {
    fields: LOOSE_FIELDS,
    prefix: true,
    fuzzy: 0.2,
    boost: { title: 2 },
    combineWith: 'AND',
  })
  const exact = index.search(query, {
    fields: EXACT_FIELDS,
    prefix: false,
    fuzzy: false,
    combineWith: 'AND',
    // An inflection table is an enumeration, not prose, so BM25's length penalty
    // is meaningless here: it buried mieć, whose table runs to dozens of forms,
    // under tam and mąż, whose short titles merely contain "mam". b: 0 turns
    // that penalty off.
    bm25: { k: 1.2, b: 0, d: 0.5 },
    boost: { forms: FORM_BOOST },
  })

  const scored = new Map<string, { result: SearchResult; score: number }>()
  for (const result of [...loose, ...exact]) {
    const key = String(result.id)
    const seen = scored.get(key)
    if (seen) seen.score += result.score
    else scored.set(key, { result, score: result.score })
  }
  return [...scored.values()].sort((a, b) => b.score - a.score).map((s) => s.result)
}

export function searchGrouped(
  index: MiniSearch<SearchDoc>,
  query: string,
  limit = 8,
): SearchGroup[] {
  if (!normalizeLoose(query)) return []
  const results = rank(index, query)
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

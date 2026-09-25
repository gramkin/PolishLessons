import { AGLT_SUFFIXES, type CardPos, type IndexEntry, type NoteKind } from '#shared/dictionary'
import type { NavLesson } from './nav'
import type { Segment } from './pattern'

export const POS_NAMES: Record<CardPos, string> = {
  noun: 'существительное',
  verb: 'глагол',
  adj: 'прилагательное',
  adv: 'наречие',
  pron: 'местоимение',
  num: 'числительное',
  prep: 'предлог',
  conj: 'союз',
  part: 'частица',
  interj: 'междометие',
}

export const ASPECT_NAMES = {
  imperf: 'несовершенный вид',
  perf: 'совершенный вид',
  biaspectual: 'двувидовой глагол',
} as const

export const NOTE_KIND_NAMES: Record<NoteKind, string> = {
  government: 'Управление',
  'false-friend': 'Ложный друг',
  stress: 'Ударение',
  register: 'Стиль',
  pronunciation: 'Произношение',
  usage: 'Употребление',
}

function isForm(word: string, forms: Set<string>): boolean {
  const lower = word.toLowerCase()
  return (
    forms.has(lower) ||
    AGLT_SUFFIXES.some(
      (s) => lower.length > s.length && lower.endsWith(s) && forms.has(lower.slice(0, -s.length)),
    )
  )
}

export function highlightForms(text: string, forms: string[]): Segment[] {
  const single = new Set<string>()
  const phrases: string[][] = []
  for (const form of forms) {
    const parts = form.toLowerCase().split(/\s+/).filter(Boolean)
    if (parts.length > 1) phrases.push(parts)
    else if (parts[0]) single.add(parts[0])
  }
  // Tokenise with offsets so an analytic form («będę zwiększać») is bolded as one span
  // instead of two, and only when its words are actually adjacent.
  const tokens: { text: string; start: number; end: number }[] = []
  const pattern = /\p{L}+/gu
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    tokens.push({
      text: match[0].toLowerCase(),
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  const spans: [number, number][] = []
  for (const phrase of phrases) {
    for (let i = 0; i + phrase.length <= tokens.length; i += 1) {
      if (phrase.every((part, k) => tokens[i + k]!.text === part)) {
        spans.push([tokens[i]!.start, tokens[i + phrase.length - 1]!.end])
      }
    }
  }
  for (const token of tokens) {
    if (isForm(token.text, single)) spans.push([token.start, token.end])
  }

  const segments: Segment[] = []
  const push = (part: string, hl: boolean) => {
    if (!part) return
    const last = segments[segments.length - 1]
    if (last && !last.hl && !hl) last.text += part
    else segments.push({ text: part, hl })
  }
  if (spans.length === 0) {
    push(text, false)
    return segments
  }
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const merged: [number, number][] = []
  for (const [start, end] of spans) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  let pos = 0
  for (const [start, end] of merged) {
    push(text.slice(pos, start), false)
    push(text.slice(start, end), true)
    pos = end
  }
  push(text.slice(pos), false)
  return segments
}

export function rankBand(rank: number, size = 200): { start: number; end: number; label: string } {
  const start = Math.floor((rank - 1) / size) * size + 1
  const end = start + size - 1
  return { start, end, label: `${start}–${end}` }
}

function toNav(entry: IndexEntry | undefined): NavLesson | null {
  return entry ? { path: `/slovo/${entry.id}`, title: entry.lemma, label: `№${entry.rank}` } : null
}

export function rankNeighbours(
  index: IndexEntry[],
  rank: number,
): { prev: NavLesson | null; next: NavLesson | null } {
  const sorted = [...index].sort((a, b) => a.rank - b.rank)
  return {
    prev: toNav(sorted.filter((e) => e.rank < rank).pop()),
    next: toNav(sorted.find((e) => e.rank > rank)),
  }
}

export function tatoebaUrl(id: number): string {
  return `https://tatoeba.org/ru/sentences/show/${id}`
}

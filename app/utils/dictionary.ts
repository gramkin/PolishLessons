import {
  AGLT_SUFFIXES,
  type CardPos,
  type IndexEntry,
  type NoteKind,
} from '../../shared/dictionary'
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
  const set = new Set(forms.map((f) => f.toLowerCase()))
  const segments: Segment[] = []
  for (const part of text.split(/(\p{L}+)/u)) {
    if (!part) continue
    const hl = /^\p{L}+$/u.test(part) && isForm(part, set)
    const last = segments[segments.length - 1]
    if (last && !last.hl && !hl) last.text += part
    else segments.push({ text: part, hl })
  }
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

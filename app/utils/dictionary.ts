import {
  AGLT_SUFFIXES,
  type CardPos,
  type CardRef,
  type FormsTable,
  type NoteKind,
} from '#shared/dictionary'
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

// Neighbours are resolved when the card is published, so nothing here scans the
// index: doing that on the page is what put all 2362 entries into every payload.
export function cardNav(ref: CardRef | null | undefined): NavLesson | null {
  return ref ? { path: `/slovo/${ref.id}`, title: ref.lemma, label: `№${ref.rank}` } : null
}

export function tatoebaUrl(id: number): string {
  return `https://tatoeba.org/ru/sentences/show/${id}`
}

export interface Conjugation {
  number: 1 | 2 | 3 | 4
  endings: string
}

// `on` is «ты» without -sz, used only when a table has no «я» or «ты» (zabraknie). IV has
// none: its four roots (wiedzieć, jeść, umieć, rozumieć) are never impersonal.
const CONJUGATIONS: Array<Conjugation & { ja: RegExp; ty: RegExp; on: RegExp | null }> = [
  { number: 1, endings: '-ę, -esz', ja: /ę$/, ty: /esz$/, on: /e$/ },
  { number: 2, endings: '-ę, -isz/-ysz', ja: /ę$/, ty: /[iy]sz$/, on: /[iy]$/ },
  { number: 3, endings: '-am, -asz', ja: /am$/, ty: /asz$/, on: /a$/ },
  { number: 4, endings: '-em, -esz', ja: /em$/, ty: /esz$/, on: null },
]

// The four conjugations of lesson 5.1, read off the «я» and «ты» forms of the present (or a
// perfective's simple future), which share their endings. A cell can hold several forms, not
// aligned between «я» and «ты» and sometimes from two verbs (stać: stanę, stoję), so every pair is
// tried and the forms the card skips as spurious (bolę, oprzeję) are left out. A verb used only
// in the third person is read off «он». być (jestem, jesteś, jest) fits none.
export function conjugations(tables: FormsTable[], skip: readonly string[] = []): Conjugation[] {
  const table = tables.find((t) => /^(Настоящее|Простое будущее)/.test(t.title))
  // A card that skips the whole table says the verb has no present (słychać, zwyknąć). Otherwise
  // a skip can also mean a real form with no example (smakuję), so it only decides between
  // variants: a cell whose every form is skipped is read as it stands.
  const all = table?.rows.flatMap((r) => r.cells.flat()).filter(Boolean) ?? []
  if (all.every((form) => skip.includes(form))) return []
  const cell = (label: string) => {
    const forms = (table?.rows.find((r) => r.label === label)?.cells[0] ?? []).filter(Boolean)
    const kept = forms.filter((form) => !skip.includes(form))
    return kept.length > 0 ? kept : forms
  }
  const ja = cell('1-е лицо')
  const ty = cell('2-е лицо')
  const on = ja.length === 0 || ty.length === 0 ? cell('3-е лицо') : []
  return CONJUGATIONS.filter(
    (c) =>
      (ja.some((form) => c.ja.test(form)) && ty.some((form) => c.ty.test(form))) ||
      on.some((form) => c.on?.test(form)),
  ).map(({ number, endings }) => ({ number, endings }))
}

const ROMAN = ['', 'I', 'II', 'III', 'IV']

/** «II спряжение (-ę, -isz/-ysz)», or «I или II спряжение (…; …)» for a verb with two. */
export function conjugationLabel(list: Conjugation[]): string | null {
  if (list.length === 0) return null
  const numbers = list.map((c) => ROMAN[c.number]).join(' или ')
  return `${numbers} спряжение (${list.map((c) => c.endings).join('; ')})`
}

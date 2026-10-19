import {
  AGLT_SUFFIXES,
  type CardPos,
  type CardRef,
  type FormExample,
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

/** Labels of the rows in `table` whose cells hold `form`, in table order. */
export function rowsHoldingForm(table: FormsTable, form: string): string[] {
  return table.rows
    .filter((row) => row.cells.some((cell) => cell.includes(form)))
    .map((r) => r.label)
}

/**
 * Rows that only repeat another row of the same table, mapped to that row: they
 * borrow its examples instead of needing their own. An adjective's vocative is its
 * nominative — every vocative form stands in the nominative cell (the short
 * «pełen» is nominative-only, so the vocative may hold fewer).
 */
export function rowAliases(table: FormsTable, pos: CardPos | undefined): Map<string, string> {
  const aliases = new Map<string, string>()
  if (pos !== 'adj') return aliases
  const nom = table.rows.find((r) => r.label === 'Именительный')
  const voc = table.rows.find((r) => r.label === 'Звательный')
  if (
    nom &&
    voc &&
    voc.cells.length === nom.cells.length &&
    voc.cells.every((cell, i) => cell.every((form) => nom.cells[i]!.includes(form)))
  ) {
    aliases.set(voc.label, nom.label)
  }
  return aliases
}

/**
 * The examples to show for a form clicked in row `row`. When the form fills one
 * row, every example is the cell's own. When it fills several, `own` holds the
 * ones tagged for this row, `shared` the untagged ones (they may illustrate any
 * of the rows), and examples tagged for another row are left out.
 */
export function examplesForCell(
  examples: FormExample[],
  row: string,
  rowCount: number,
): { own: FormExample[]; shared: FormExample[] } {
  if (rowCount <= 1) return { own: examples, shared: [] }
  return {
    own: examples.filter((e) => e.cell === row),
    shared: examples.filter((e) => !e.cell),
  }
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

const CONJUGATIONS: Conjugation[] = [
  { number: 1, endings: '-ę, -esz' },
  { number: 2, endings: '-ę, -isz/-ysz' },
  { number: 3, endings: '-am, -asz' },
  { number: 4, endings: '-em, -esz' },
]

// The four conjugations of lesson 5.1, read off the present (or a perfective's simple future).
// «он» is «ты» without -sz, so it names the conjugation by itself — -e I, -i/-y II, -a III —
// except that IV also gives -e (wie, je) and is told apart by «я» on -em (wiem, jem). «он» is
// used rather than «я» and «ты» because it exists for every verb: a card skips «я» when the
// meaning rules it out (bolę), not because the form is wrong.
//
// A cell can hold variants, sometimes of two verbs (stać: stanie, stoi), so each is read; the
// forms the card skips (the archaic wykonywa) are dropped unless nothing else is left. A card
// that skips the whole table says the verb has no present (słychać, zwyknąć). być (jest) fits
// none.
export function conjugations(tables: FormsTable[], skip: readonly string[] = []): Conjugation[] {
  const table = tables.find((t) => /^(Настоящее|Простое будущее)/.test(t.title))
  const all = table?.rows.flatMap((r) => r.cells.flat()).filter(Boolean) ?? []
  if (all.every((form) => skip.includes(form))) return []
  const cell = (label: string) => {
    const forms = (table?.rows.find((r) => r.label === label)?.cells[0] ?? []).filter(Boolean)
    const kept = forms.filter((form) => !skip.includes(form))
    return kept.length > 0 ? kept : forms
  }
  const fourth = cell('1-е лицо').some((form) => /em$/.test(form))
  const found = new Set<number>()
  for (const on of cell('3-е лицо')) {
    if (/e$/.test(on)) found.add(fourth ? 4 : 1)
    else if (/[iy]$/.test(on)) found.add(2)
    else if (/a$/.test(on)) found.add(3)
  }
  return CONJUGATIONS.filter((c) => found.has(c.number))
}

const ROMAN = ['', 'I', 'II', 'III', 'IV']

/** «II спряжение (-ę, -isz/-ysz)», or «I или II спряжение (…; …)» for a verb with two. */
export function conjugationLabel(list: Conjugation[]): string | null {
  if (list.length === 0) return null
  const numbers = list.map((c) => ROMAN[c.number]).join(' или ')
  return `${numbers} спряжение (${list.map((c) => c.endings).join('; ')})`
}

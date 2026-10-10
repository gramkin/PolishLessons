import type { Card, FormsFile } from '../../shared/dictionary'
import type { Drill, DrillCell } from '../../shared/schemas'

export const BLANK = '___'

/** One fill-in-the-blank sentence: `pl` has the form replaced by {@link BLANK}. */
export interface DrillItem {
  pl: string
  answer: string
  hint: string
  ru: string
  card: string
}

/** What `public/drills/<id>.json` holds. */
export interface DrillFile {
  id: string
  title: string
  instruction: string
  items: DrillItem[]
}

interface Cell {
  table: string
  row: string
  column: string
}

/** Every paradigm cell each spelling fills. A spelling in two cells cannot show which one a sentence means. */
export function formCells(forms: Pick<FormsFile, 'tables'>): Map<string, Cell[]> {
  const cells = new Map<string, Cell[]>()
  for (const table of forms.tables)
    for (const row of table.rows)
      row.cells.forEach((spellings, i) => {
        for (const form of spellings) {
          const cell = { table: table.title, row: row.label, column: table.columns[i] ?? '' }
          cells.set(form, [...(cells.get(form) ?? []), cell])
        }
      })
  return cells
}

function matchesCell(cell: Cell, spec: DrillCell): boolean {
  return (
    cell.table.startsWith(spec.table) &&
    (spec.row === undefined || cell.row === spec.row) &&
    (spec.column === undefined || cell.column === spec.column)
  )
}

const PERSON: Record<string, [string, string]> = {
  '1-е лицо': ['я', 'мы'],
  '2-е лицо': ['ты', 'вы'],
  '3-е лицо': ['он', 'они'],
}
const THIRD_SINGULAR: Record<string, string> = { 'м. р.': 'он', 'ж. р.': 'она', 'ср. р.': 'оно' }
const GENDER: Record<string, string> = { 'м. р.': ', м.', 'ж. р.': ', ж.' }
const PLURAL_GROUP: Record<string, string> = {
  'мужско-личный': ', есть мужчины',
  прочие: ', без мужчин',
}

/** Who a verb form is for, in the learner's terms: «я, ж.», «она», «они, без мужчин». */
export function personHint(cell: Cell): string {
  const persons = PERSON[cell.row]
  if (!persons) return ''
  // Present and simple-future tables split number by column; past and conditional by table.
  const plural = cell.column === 'Мн. ч.' || cell.table.includes('мн. ч.')
  const byColumn = cell.column === 'Ед. ч.' || cell.column === 'Мн. ч.'
  if (byColumn) return plural ? persons[1] : cell.row === '3-е лицо' ? 'он/она' : persons[0]
  if (plural) return persons[1] + (PLURAL_GROUP[cell.column] ?? '')
  if (cell.row === '3-е лицо') return THIRD_SINGULAR[cell.column] ?? persons[0]
  return persons[0] + (GENDER[cell.column] ?? '')
}

const LETTER = '\\p{L}'
function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface DrillOptions {
  maxWords?: number
  perCard?: number
  limit?: number
}

// A card whose register notes call some sense vulgar or rude stays out of drills altogether:
// a drill shows sentences without the card's warnings around them.
const COARSE = /вульгарн|нецензурн|матерн|обсценн|бранн|ругательн|груб/i
export function isCoarse(card: Pick<Card, 'notes'>): boolean {
  return card.notes.some((note) => note.kind === 'register' && COARSE.test(note.text))
}

interface Candidate {
  item: DrillItem
  cell: string
}

/**
 * Pick a drill's sentences. A form example qualifies when its form fills
 * exactly one paradigm cell and that cell is one the drill asks for, when
 * the form occurs once in the sentence, and when the sentence is short.
 * `require` must match the text before the gap: the negation, verb or
 * preposition that decides the form comes first. The commonest words come
 * first, and each word gives a few items from different cells, so a session
 * is neither ten sentences about one noun nor ten forms of one person.
 */
export function drillItems(
  spec: Drill,
  cards: { card: Card; forms: Pick<FormsFile, 'tables'> }[],
  options: DrillOptions = {},
): DrillItem[] {
  const { maxWords = 10, limit = 600 } = options
  // A closed list of words is small: take everything it has.
  const perCard = options.perCard ?? (spec.cards ? Infinity : 3)
  const require = spec.require ? new RegExp(spec.require, 'iu') : null
  const allowed = spec.cards ? new Set(spec.cards) : null
  const items: DrillItem[] = []
  const seen = new Set<string>()
  const eligible = cards
    .filter(({ card }) => card.pos === spec.pos && card.rank <= spec.maxRank && !isCoarse(card))
    .filter(({ card }) => !allowed || allowed.has(card.id))
    .filter(({ card }) => !spec.aspect || card.aspect === spec.aspect)
    .sort((a, b) => a.card.rank - b.card.rank)
  for (const { card, forms } of eligible) {
    const cells = formCells(forms)
    const byCell = new Map<string, Candidate[]>()
    for (const example of card.formExamples) {
      const where = cells.get(example.form)
      if (where?.length !== 1 || !spec.cells.some((c) => matchesCell(where[0]!, c))) continue
      const words = example.pl.split(/\s+/).length
      // A one-word sentence is the form alone: nothing in it to read the form from.
      if (words < 2 || words > maxWords || seen.has(example.pl)) continue
      if (spec.sourcedOnly && example.source.kind === 'authored') continue
      const pattern = new RegExp(`(?<!${LETTER})${escape(example.form)}(?!${LETTER})`, 'giu')
      const matches = [...example.pl.matchAll(pattern)]
      if (matches.length !== 1) continue
      const match = matches[0]!
      const before = example.pl.slice(0, match.index)
      if (require && !require.test(before)) continue
      const cell = where[0]!
      const person = spec.hint === 'person' ? personHint(cell) : ''
      const key = `${cell.table}|${cell.row}|${cell.column}`
      const candidate = {
        cell: key,
        item: {
          pl: before + BLANK + example.pl.slice(match.index + match[0].length),
          answer: match[0],
          hint: person ? `${card.lemma} — ${person}` : card.lemma,
          ru: example.ru,
          card: card.id,
        },
      }
      byCell.set(key, [...(byCell.get(key) ?? []), candidate])
      seen.add(example.pl)
    }
    // Round-robin over cells, so the first picks for a word are different forms of it. The
    // starting cell moves with the word's rank, or every word would open with the same cell.
    const cellQueues = [...byCell.values()]
    const shift = cellQueues.length > 0 ? card.rank % cellQueues.length : 0
    const queues = [...cellQueues.slice(shift), ...cellQueues.slice(0, shift)]
    for (let taken = 0, round = 0; taken < perCard && queues.some((q) => q.length > round); round++)
      for (const queue of queues) {
        if (taken >= perCard) break
        const next = queue[round]
        if (next) {
          items.push(next.item)
          taken++
        }
      }
    if (items.length >= limit) break
  }
  return items.slice(0, limit)
}

/** `n` distinct items in random order. */
export function sampleItems<T>(
  items: readonly T[],
  n: number,
  random: () => number = Math.random,
): T[] {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  return pool.slice(0, n)
}

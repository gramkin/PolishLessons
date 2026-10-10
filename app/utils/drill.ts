import type { Card, CardRef, FormsFile } from '../../shared/dictionary'
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

// Imperative rows name the person outright.
const IMPERATIVE: Record<string, string> = {
  '2-е л. ед. ч.': 'ты',
  '1-е л. мн. ч.': 'мы',
  '2-е л. мн. ч.': 'вы',
}

/** Who a verb form is for, in the learner's terms: «я, ж.», «она», «они, без мужчин». */
export function personHint(cell: Cell): string {
  if (IMPERATIVE[cell.row]) return IMPERATIVE[cell.row]!
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
 * exactly one paradigm cell and that cell is one the drill asks for (with
 * `syncretic`: only cells the drill asks for, and it is not the lemma), when
 * the form occurs once in the sentence, and when the sentence is short.
 * `require` must match the text before the gap: the negation, verb or
 * preposition that decides the form comes first. The commonest words come
 * first, and each word gives a few items from different cells, so a session
 * is neither ten sentences about one noun nor ten forms of one person.
 */
export interface DrillSource {
  card: Card
  forms: Pick<FormsFile, 'tables'> & Partial<Pick<FormsFile, 'grammarLabel'>>
  aspectPair?: CardRef | null
}

const DEMONSTRATIVE: [RegExp, string, string][] = [
  [/^мужской род/, 'ten', 'мужской род'],
  [/^женский род/, 'ta', 'женский род'],
  [/^средний род/, 'to', 'средний род'],
]

/**
 * The gender drill: «___ książka» → ta. Every singular noun with a known gender, commonest
 * first; plural-only nouns have no ten / ta / to to choose.
 */
export function genderItems(spec: Drill, cards: DrillSource[], limit = 600): DrillItem[] {
  const items: DrillItem[] = []
  for (const { card, forms } of [...cards].sort((a, b) => a.card.rank - b.card.rank)) {
    if (card.pos !== 'noun' || card.rank > spec.maxRank || isCoarse(card)) continue
    const gender = DEMONSTRATIVE.find(([label]) => label.test(forms.grammarLabel ?? ''))
    if (!gender) continue
    items.push({
      pl: `${BLANK} ${card.lemma}`,
      answer: gender[1],
      hint: 'ten / ta / to',
      ru: `${card.lemma} — ${gender[2]}: ${card.senses[0]?.ru ?? ''}`,
      card: card.id,
    })
    if (items.length >= limit) break
  }
  return items
}

/** «robić / zrobić»: the imperfective first, whichever of the two the card is. */
function aspectPairHint(card: Card, pair: CardRef | null | undefined): string {
  if (!pair) return card.lemma
  return card.aspect === 'perf' ? `${pair.lemma} / ${card.lemma}` : `${card.lemma} / ${pair.lemma}`
}

export function drillItems(
  spec: Drill,
  cards: DrillSource[],
  options: DrillOptions = {},
): DrillItem[] {
  if (spec.kind === 'gender') return genderItems(spec, cards, options.limit)
  const { maxWords = 10, limit = 600 } = options
  // A closed list of words is small: take everything it has.
  const perCard = options.perCard ?? (spec.cards ? Infinity : 3)
  const require = spec.require ? new RegExp(spec.require, 'iu') : null
  const requireAfter = spec.requireAfter ? new RegExp(spec.requireAfter, 'iu') : null
  const allowed = spec.cards ? new Set(spec.cards) : null
  const items: DrillItem[] = []
  const seen = new Set<string>()
  const eligible = cards
    .filter(({ card }) => card.pos === spec.pos && card.rank <= spec.maxRank && !isCoarse(card))
    .filter(({ card }) => !allowed || allowed.has(card.id))
    .filter(({ card }) => !spec.aspect || card.aspect === spec.aspect)
    // Choosing an aspect needs a partner to choose between.
    .filter(({ aspectPair }) => spec.hint !== 'aspect' || Boolean(aspectPair))
    .sort((a, b) => a.card.rank - b.card.rank)
  for (const { card, forms, aspectPair } of eligible) {
    const cells = formCells(forms)
    // A variant spelled in the lemma's own cell (wolen beside wolny) has the lemma as an equally
    // right answer, so a syncretic drill cannot ask for it.
    const lemmaCells = new Set(
      (cells.get(card.lemma) ?? []).map((c) => `${c.table}|${c.row}|${c.column}`),
    )
    const byCell = new Map<string, Candidate[]>()
    for (const example of card.formExamples) {
      const where = cells.get(example.form) ?? []
      const fits = (cell: Cell) => spec.cells.some((c) => matchesCell(cell, c))
      if (spec.syncretic) {
        if (where.length === 0 || !where.every(fits) || example.form === card.lemma) continue
        if (where.some((c) => lemmaCells.has(`${c.table}|${c.row}|${c.column}`))) continue
      } else if (where.length !== 1 || !fits(where[0]!)) continue
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
      if (requireAfter && !requireAfter.test(example.pl.slice(match.index + match[0].length)))
        continue
      const cell = where[0]!
      const person = spec.hint === 'lemma' ? '' : personHint(cell)
      // Both aspects usually make a Polish sentence; the Russian, which has aspect too, decides.
      const lemma =
        spec.hint === 'aspect'
          ? `${aspectPairHint(card, aspectPair)}${person ? ` — ${person}` : ''}; «${example.ru}»`
          : card.lemma
      const key = `${cell.table}|${cell.row}|${cell.column}`
      const candidate = {
        cell: key,
        item: {
          pl: before + BLANK + example.pl.slice(match.index + match[0].length),
          answer: match[0],
          hint: person && spec.hint !== 'aspect' ? `${lemma} — ${person}` : lemma,
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

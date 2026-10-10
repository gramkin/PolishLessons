/**
 * How often each dictionary idiom occurs in a corpus. An idiom is matched as a run of tokens;
 * a content word (verb, noun, adjective) matches any of its forms, so «trzymać kciuki» also
 * counts «trzymam kciuki», while pronouns, prepositions and particles must match exactly
 * («przykro mi» is not «przykro mnie»). «…» in an idiom stands for up to GAP_MAX tokens
 * («równie … jak»).
 */

export const GAP_MAX = 4

const LETTERS = /\p{L}+/gu

/** Lower-case word tokens of a line. */
export function tokenize(line: string): string[] {
  return line.toLowerCase().match(LETTERS) ?? []
}

/** An idiom as tokens, with `null` for a «…» gap; a trailing gap («z tą różnicą, że...») is dropped. */
export function idiomTokens(pl: string): (string | null)[] {
  const parts = pl
    .toLowerCase()
    .replace(/\.\.\.|…/g, ' … ')
    .split(/\s+/)
    .flatMap((p) => (p === '…' ? [null] : (p.match(LETTERS) ?? [])))
  while (parts.length > 0 && parts.at(-1) === null) parts.pop()
  while (parts.length > 0 && parts[0] === null) parts.shift()
  return parts.filter((p, i) => p !== null || parts[i - 1] !== null)
}

/** PoliMorf tag heads whose words inflect in an idiom. */
const INFLECTING = new Set([
  'subst',
  'depr',
  'adj',
  'adjc',
  'fin',
  'inf',
  'praet',
  'impt',
  'imps',
  'bedzie',
  'ger',
  'pact',
  'ppas',
  'pcon',
  'pant',
])

export interface Lexicon {
  /** lemmas of a form, with the tag head of each reading */
  readings(form: string): { lemma: string; head: string }[]
  /** every form of a lemma */
  forms(lemma: string): string[]
}

/**
 * Tag heads of closed-class words. A token with any such reading never inflects: PoliMorf also
 * reads ona/one/oni as adjectives of «on», to as a noun and bądź as an imperative, and letting
 * them inflect made «oni byli» count every «one były».
 */
const CLOSED = new Set([
  'ppron12',
  'ppron3',
  'siebie',
  'prep',
  'conj',
  'comp',
  'qub',
  'interj',
  'num',
  'numcol',
  'adv',
  'pred',
  'brev',
  'burk',
  'winien',
])

/**
 * The forms a token of an idiom accepts: itself, and for a content word every form of its
 * lemma. In a one-word entry (pomocy!, przestań!) the word is the expression, so it never
 * inflects.
 */
export function acceptedForms(token: string, lexicon: Lexicon, inflect = true): Set<string> {
  const accepted = new Set([token])
  const readings = lexicon.readings(token)
  if (!inflect || readings.some((r) => CLOSED.has(r.head))) return accepted
  for (const { lemma, head } of readings)
    if (INFLECTING.has(head)) for (const f of lexicon.forms(lemma)) accepted.add(f.toLowerCase())
  return accepted
}

export type Pattern = (Set<string> | null)[]

export function compile(pl: string, lexicon: Lexicon): Pattern | null {
  const tokens = idiomTokens(pl)
  if (tokens.length === 0) return null
  const inflect = tokens.filter((t) => t !== null).length > 1
  return tokens.map((t) => (t === null ? null : acceptedForms(t, lexicon, inflect)))
}

/** Does `pattern` match `tokens` starting at `start`? */
export function matchesAt(pattern: Pattern, tokens: string[], start: number): boolean {
  const go = (p: number, t: number): boolean => {
    if (p === pattern.length) return true
    const slot = pattern[p]
    if (slot === null) {
      for (let skip = 0; skip <= GAP_MAX && t + skip <= tokens.length; skip++)
        if (go(p + 1, t + skip)) return true
      return false
    }
    return t < tokens.length && slot.has(tokens[t]!) && go(p + 1, t + 1)
  }
  return go(0, start)
}

/**
 * Counts lines containing each pattern (a line repeating an idiom counts once, so a subtitle
 * that loops «no dobra, no dobra» does not inflate it). Patterns are indexed by their first
 * token's forms, so a line costs one lookup per token.
 */
export class IdiomCounter {
  readonly counts: number[]
  tokens = 0
  lines = 0
  private readonly index = new Map<string, number[]>()

  constructor(private readonly patterns: Pattern[]) {
    this.counts = patterns.map(() => 0)
    patterns.forEach((pattern, id) => {
      for (const form of pattern[0] ?? []) {
        const list = this.index.get(form)
        if (list) list.push(id)
        else this.index.set(form, [id])
      }
    })
  }

  add(line: string): void {
    const tokens = tokenize(line)
    this.lines++
    this.tokens += tokens.length
    const seen = new Set<number>()
    tokens.forEach((token, i) => {
      for (const id of this.index.get(token) ?? [])
        if (!seen.has(id) && matchesAt(this.patterns[id]!, tokens, i)) seen.add(id)
    })
    for (const id of seen) this.counts[id]!++
  }
}

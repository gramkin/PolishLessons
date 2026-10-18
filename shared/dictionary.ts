import { z } from 'zod'

export const CARD_POS = [
  'noun',
  'verb',
  'adj',
  'adv',
  'pron',
  'num',
  'prep',
  'conj',
  'part',
  'interj',
] as const
export const ASPECTS = ['imperf', 'perf', 'biaspectual'] as const
export const SOURCE_KINDS = ['tatoeba', 'translated', 'authored'] as const
export const NOTE_KINDS = [
  'government',
  'false-friend',
  'stress',
  'register',
  'pronunciation',
  'usage',
] as const
export const FAMILY_RELATIONS = ['derived', 'aspect', 'root', 'antonym'] as const
export const CARD_DEPTHS = ['standard', 'deep'] as const

export type CardPos = (typeof CARD_POS)[number]
export type Aspect = (typeof ASPECTS)[number]
export type SourceKind = (typeof SOURCE_KINDS)[number]
export type NoteKind = (typeof NOTE_KINDS)[number]
export type CardDepth = (typeof CARD_DEPTHS)[number]

const text = z.string().min(1)
const cardId = z.string().regex(/^[a-z0-9-]+$/)
// Integers are declared as numbers with a refinement (Nuxt Content maps JSON-schema "integer" to TEXT).
const positiveInt = z
  .number()
  .positive()
  .refine(Number.isInteger, { message: 'Expected an integer' })

export const sourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tatoeba'), id: positiveInt }),
  z.object({ kind: z.literal('translated'), id: positiveInt }),
  z.object({ kind: z.literal('authored') }),
])

export const exampleSchema = z.object({
  pl: text,
  ru: text,
  source: sourceSchema,
})

export const formExampleSchema = exampleSchema.extend({
  form: text,
  /**
   * The table row this sentence illustrates, for a form that fills several rows
   * («tchórzu» is both «Предложный» and «Звательный»). Untagged examples show in
   * every cell the form fills.
   */
  cell: text.optional(),
})

export const senseSchema = z.object({
  id: cardId,
  ru: text,
  note: z.string().optional(),
  examples: z.array(exampleSchema).min(1),
})

/**
 * Card content format. Bump when the required shape of a card changes, so
 * existing cards are reported as needing an upgrade.
 *
 * 1 — senses with examples, notes, collocations, family.
 * 2 — adds three examples per affirmative form, etymology, memory hook, idioms.
 */
export const CARD_FORMAT = 2

export const cardSchema = z.object({
  id: cardId,
  format: positiveInt,
  /**
   * How much explanation the word owes. Difficulty here is semantic, not
   * structural: a big paradigm (ten) can be easy, a single form (się) hard.
   * See the depth test in CLAUDE.md.
   */
  depth: z.enum(CARD_DEPTHS).default('standard'),
  lemma: text,
  rank: positiveInt,
  pos: z.enum(CARD_POS),
  aspect: z.enum(ASPECTS).optional(),
  aspectPair: cardId.nullable().optional(),
  pron: z.object({ cyr: text }),
  senses: z.array(senseSchema).min(1),
  notes: z.array(z.object({ kind: z.enum(NOTE_KINDS), text })).default([]),
  collocations: z.array(z.object({ pl: text, ru: text })).default([]),
  formExamples: z.array(formExampleSchema).default([]),
  /** Forms that cannot carry an example, e.g. clitics that never stand alone. */
  formExamplesSkip: z.array(z.object({ form: text, reason: text })).default([]),
  etymology: z.string().optional(),
  memory: z.string().optional(),
  idioms: z.array(z.object({ pl: text, ru: text })).default([]),
  synonyms: z.array(text).default([]),
  antonyms: z.array(text).default([]),
  family: z
    .array(
      z.object({
        pl: text,
        ru: text,
        relation: z.enum(FAMILY_RELATIONS),
        id: cardId.nullable().optional(),
      }),
    )
    .default([]),
})

export const formsTableSchema = z.object({
  title: text,
  columns: z.array(z.string()),
  rows: z.array(z.object({ label: text, cells: z.array(z.array(text)) })),
  extra: z.boolean(),
})

export const audioSchema = z.object({ file: text, url: text, license: text, author: text })

export const formsFileSchema = z.object({
  generated: z.literal(true),
  sources: z.object({ polimorf: text, wiktionary: text, tatoeba: text }),
  id: cardId,
  lemma: text,
  pos: z.enum(CARD_POS),
  grammarLabel: z.string().nullable(),
  ipa: z.string().nullable(),
  audio: audioSchema.nullable(),
  allForms: z.array(text).min(1),
  tables: z.array(formsTableSchema),
  tatoeba: z.record(z.string(), z.object({ pl: text, ru: z.string().nullable() })),
})

export const indexEntrySchema = z.object({
  id: cardId,
  lemma: text,
  rank: positiveInt,
  pos: z.enum(CARD_POS),
  gloss: text,
})

// A neighbouring or related word, small enough to bake into a card of its own.
export const cardRefSchema = z.object({ id: cardId, lemma: text, rank: positiveInt })

export const publishedCardSchema = z.object({
  card: cardSchema,
  forms: formsFileSchema,
  // Precomputed at publish time. The card page used to load the whole index to
  // find these few values, which serialised 332 KB of other words into every
  // prerendered payload -- some 780 MB across the 2362 cards, and 332 KB down
  // the wire on each visit.
  prev: cardRefSchema.nullable(),
  next: cardRefSchema.nullable(),
  aspectPair: cardRefSchema.nullable(),
  familyIds: z.array(cardId),
})

export type Example = z.infer<typeof exampleSchema>
export type FormExample = z.infer<typeof formExampleSchema>
export type ExampleSource = z.infer<typeof sourceSchema>
export type Sense = z.infer<typeof senseSchema>
export type Card = z.infer<typeof cardSchema>
export type FormsTable = z.infer<typeof formsTableSchema>
export type Audio = z.infer<typeof audioSchema>
export type FormsFile = z.infer<typeof formsFileSchema>
export type CardRef = z.infer<typeof cardRefSchema>
export type IndexEntry = z.infer<typeof indexEntrySchema>
export type PublishedCard = z.infer<typeof publishedCardSchema>
// Agglutinated person/conditional endings attached to past-tense forms (byłem = był + em).
export const AGLT_SUFFIXES = [
  'byśmy',
  'byście',
  'śmy',
  'ście',
  'bym',
  'byś',
  'em',
  'eś',
  'm',
  'ś',
] as const

import { z } from 'zod'

/**
 * Idioms and set expressions, ranked by how often they occur in Polish film subtitles.
 * `data/idiom-frequency.json` is generated (`pnpm idioms:count`) from the cards' `idioms`
 * lists; `data/idioms.yml` is the hand-checked classification of its most frequent entries,
 * keyed by the frequency file's `pl`. `pnpm idioms` joins them into the published list.
 */

export const IDIOM_KINDS = ['idiom', 'phrase', 'proverb', 'skip'] as const
export const IDIOM_REGISTERS = ['neutral', 'colloquial', 'vulgar', 'bookish'] as const

export const curatedIdiomSchema = z
  .object({
    pl: z.string().min(1),
    kind: z.enum(IDIOM_KINDS),
    register: z.enum(IDIOM_REGISTERS).optional(),
    ru: z.string().min(1).optional(),
    /** the Polish a learner should see, when the card's entry is misspelled or oddly cased */
    fix: z.string().min(1).optional(),
  })
  .strict()
export const curatedIdiomFileSchema = z.array(curatedIdiomSchema)

export const frequencyEntrySchema = z.object({
  pl: z.string(),
  ru: z.string(),
  cards: z.array(z.string()),
  count: z.number(),
  perMillion: z.number(),
})
export const frequencyFileSchema = z.object({
  source: z.string(),
  lines: z.number(),
  tokens: z.number(),
  idioms: z.array(frequencyEntrySchema),
})

export type CuratedIdiom = z.infer<typeof curatedIdiomSchema>
export type FrequencyFile = z.infer<typeof frequencyFileSchema>
export type IdiomKind = (typeof IDIOM_KINDS)[number]
export type IdiomRegister = (typeof IDIOM_REGISTERS)[number]

/** One row of `public/dictionary/idioms.json`. */
export interface PublishedIdiom {
  pl: string
  ru: string
  kind: Exclude<IdiomKind, 'skip'>
  register: IdiomRegister
  /** 1 = the most frequent published expression */
  rank: number
  perMillion: number
  cards: string[]
}

export const IDIOM_KIND_NAMES: Record<PublishedIdiom['kind'], string> = {
  phrase: 'выражение',
  idiom: 'идиома',
  proverb: 'пословица',
}

/** Rank bands, so a learner can start with the first hundred. */
export const IDIOM_BANDS = [
  { start: 1, end: 100, label: 'Первые 100' },
  { start: 101, end: 300, label: '101–300' },
  { start: 301, end: 1000, label: '301–1000' },
  { start: 1001, end: Infinity, label: 'Дальше 1000' },
] as const

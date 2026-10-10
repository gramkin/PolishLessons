import { z } from 'zod'

export const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const
export const POS = [
  'noun',
  'verb',
  'adj',
  'adv',
  'pron',
  'num',
  'prep',
  'conj',
  'part',
  'phrase',
] as const
export const WORD_ID_RE = /^[a-z0-9-]+$/

const text = z.string().min(1)
const wordId = z.string().regex(WORD_ID_RE)
// Nuxt Content maps JSON-schema "integer" to TEXT columns (numbers come back as strings),
// so content integers are declared as numbers with an integer refinement.
const positiveInt = z
  .number()
  .positive()
  .refine(Number.isInteger, { message: 'Expected an integer' })

export const levelSchema = z.enum(LEVELS)

export const wordSchema = z.object({
  id: wordId,
  pl: text,
  ru: text,
  pos: z.enum(POS),
  gender: z.enum(['m', 'f', 'n']).optional(),
  pron: text,
  pattern: text.optional(),
  falseFriend: z.object({ ru: text, meaning: text }).optional(),
  topic: text,
  chapter: positiveInt,
})
export const wordFileSchema = z.object({ words: z.array(wordSchema).min(1) })

export const patternSchema = z.object({ id: text, pl: text, ru: text, rule: text })
export const patternFileSchema = z.object({ patterns: z.array(patternSchema).min(1) })

export const chapterSchema = z.object({ number: positiveInt, title: text })
export const chapterFileSchema = z.object({ chapters: z.array(chapterSchema).min(1) })

export const sentenceSchema = z.object({
  pl: text,
  ru: text,
  words: z.record(z.string(), wordId).optional(),
})
// A graded reader: `chapter` is the first chapter after which the text is readable, so every
// linked word must be taught by then. `questions` follow the story (comprehension, one
// dictation) in the lesson-quiz format; they stay untyped here because Nuxt Content cannot
// store the question union, and are checked with quizSchema by the validator and Quiz.vue.
export const storySchema = z.object({
  title: text,
  titleRu: text,
  level: levelSchema,
  chapter: positiveInt,
  description: z.string().optional(),
  sentences: z.array(sentenceSchema).min(1),
  questions: z.array(z.record(z.string(), z.unknown())).optional(),
})

// Books are read with the Ilya Frank method: each paragraph is split into chunks
// carrying an inline Russian gloss, then repeated clean for a second, unaided pass.
// `note` carries the teaching: a set phrase, a case government, a false friend.
// It rides inside the bracket next to the gloss, which is what separates the Frank
// method from a plain parallel text.
export const bookChunkSchema = z.object({ pl: text, ru: text, note: z.string().optional() })
export const bookParagraphSchema = z.object({
  clean: text,
  chunks: z.array(bookChunkSchema).min(1),
  /** exact surface form -> dictionary card id */
  words: z.record(z.string(), wordId).optional(),
  /**
   * The source sentence this paragraph was translated from, when the Polish is
   * itself a translation rather than the original. Kept so every paragraph stays
   * traceable to its source and coverage can be checked mechanically.
   */
  en: z.string().optional(),
  /** true when the Polish is a draft translation awaiting a native check */
  draft: z.boolean().optional(),
  /**
   * Verse keeps its line breaks. Alice's poems parody Victorian schoolroom
   * verse, so running their lines together would lose the point of them.
   */
  verse: z.boolean().optional(),
})
// Source and licence are structural, not decoration: a freely licensed translation
// may require attribution and share-alike, so a book cannot be published without them.
export const bookSourceSchema = z.object({
  name: text,
  url: text,
  license: text,
  licenseUrl: text,
})
export const bookSchema = z.object({
  title: text,
  titleRu: text,
  author: text,
  translator: z.string().optional(),
  source: bookSourceSchema,
  chapter: positiveInt,
  chapterTitle: text,
  chapterTitleRu: text,
  level: levelSchema,
  paragraphs: z.array(bookParagraphSchema).min(1),
})

export const lessonMetaSchema = z.object({
  chapter: positiveInt,
  order: positiveInt,
  level: levelSchema,
  words: z.array(wordId).default([]),
})
export const lessonFrontmatterSchema = lessonMetaSchema.extend({
  title: text,
  description: z.string().optional(),
})

const explain = z.string().optional()
const textAnswer = z.union([text, z.array(text).min(1)])

const choiceQuestionSchema = z.object({
  type: z.literal('choice'),
  q: text,
  options: z.array(text).min(2),
  answer: z.number().int().nonnegative(),
  explain,
})
const inputQuestionSchema = z.object({
  type: z.literal('input'),
  q: text,
  answer: textAnswer,
  explain,
})
const patternQuestionSchema = z.object({
  type: z.literal('pattern'),
  q: text,
  pattern: text,
  answer: textAnswer,
  explain,
})
const matchQuestionSchema = z.object({
  type: z.literal('match'),
  q: text,
  pairs: z
    .array(z.tuple([text, text]))
    .min(2)
    .max(6),
  explain,
})

// A Russian sentence to put into Polish. Many translations are right, so `answer` lists the
// accepted ones and a learner whose version differs judges it against the first.
const translateQuestionSchema = z.object({
  type: z.literal('translate'),
  q: text,
  answer: textAnswer,
  explain,
})
// Dictation: the Polish `text` is played, never shown, and typed back.
const listenQuestionSchema = z.object({
  type: z.literal('listen'),
  q: text.default('Напишите, что услышите.'),
  text,
  explain,
})

export const questionSchema = z.discriminatedUnion('type', [
  choiceQuestionSchema,
  inputQuestionSchema,
  patternQuestionSchema,
  matchQuestionSchema,
  translateQuestionSchema,
  listenQuestionSchema,
])

export const quizSchema = z
  .array(questionSchema)
  .min(1)
  .superRefine((questions, ctx) => {
    questions.forEach((q, i) => {
      if (q.type === 'choice' && q.answer >= q.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, 'answer'],
          message: 'answer index out of range',
        })
      }
    })
  })

/**
 * A drill picks dictionary form examples whose form fills exactly one cell
 * of its word's paradigm, so the sentence shows that cell and nothing else.
 * `table` matches a forms-table title by prefix; `row` and `column` must
 * match exactly when given.
 */
export const drillCellSchema = z.object({
  table: text,
  row: text.optional(),
  column: text.optional(),
})

export const drillSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  instruction: text,
  pos: z.enum(['noun', 'verb', 'adj', 'pron', 'num']),
  cells: z.array(drillCellSchema).min(1),
  // Case-insensitive regex the Polish sentence must contain (e.g. a negation).
  require: z.string().optional(),
  // Only these card ids, for drills on a closed list of words.
  cards: z.array(text).optional(),
  // Only sentences from Tatoeba, whose forms come from real text, not from a generated table.
  sourcedOnly: z.boolean().default(false),
  // Only verbs of this aspect, for drills on the simple future.
  aspect: z.enum(['imperf', 'perf']).optional(),
  maxRank: z.number().int().positive().default(3000),
  // `person` adds who the verb form is for («я (ж.)», «они (без мужчин)»).
  hint: z.enum(['lemma', 'person']).default('lemma'),
})

export const drillFileSchema = z.object({ drills: z.array(drillSchema).min(1) })

export type DrillCell = z.infer<typeof drillCellSchema>
export type Drill = z.infer<typeof drillSchema>

export type Level = z.infer<typeof levelSchema>
export type Word = z.infer<typeof wordSchema>
export type Pattern = z.infer<typeof patternSchema>
export type Chapter = z.infer<typeof chapterSchema>
export type Sentence = z.infer<typeof sentenceSchema>
export type Story = z.infer<typeof storySchema>
export type Book = z.infer<typeof bookSchema>
export type BookParagraph = z.infer<typeof bookParagraphSchema>
export type LessonMeta = z.infer<typeof lessonMetaSchema>
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>
export type Question = z.infer<typeof questionSchema>
export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>
export type InputQuestion = z.infer<typeof inputQuestionSchema>
export type PatternQuestion = z.infer<typeof patternQuestionSchema>
export type MatchQuestion = z.infer<typeof matchQuestionSchema>
export type TranslateQuestion = z.infer<typeof translateQuestionSchema>
export type ListenQuestion = z.infer<typeof listenQuestionSchema>

import { z } from 'zod'

export const LEVELS = ['A1', 'A2'] as const
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
export const storySchema = z.object({
  title: text,
  titleRu: text,
  level: levelSchema,
  description: z.string().optional(),
  sentences: z.array(sentenceSchema).min(1),
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

export const questionSchema = z.discriminatedUnion('type', [
  choiceQuestionSchema,
  inputQuestionSchema,
  patternQuestionSchema,
  matchQuestionSchema,
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

export type Level = z.infer<typeof levelSchema>
export type Word = z.infer<typeof wordSchema>
export type Pattern = z.infer<typeof patternSchema>
export type Chapter = z.infer<typeof chapterSchema>
export type Sentence = z.infer<typeof sentenceSchema>
export type Story = z.infer<typeof storySchema>
export type LessonMeta = z.infer<typeof lessonMetaSchema>
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>
export type Question = z.infer<typeof questionSchema>
export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>
export type InputQuestion = z.infer<typeof inputQuestionSchema>
export type PatternQuestion = z.infer<typeof patternQuestionSchema>
export type MatchQuestion = z.infer<typeof matchQuestionSchema>

import { z } from 'zod'
import {
  bookChunkSchema,
  bookParagraphSchema,
  bookSchema,
  bookSourceSchema,
  chapterFileSchema,
  chapterSchema,
  lessonFrontmatterSchema,
  patternFileSchema,
  quizSchema,
  drillCellSchema,
  drillFileSchema,
  drillSchema,
  patternSchema,
  sentenceSchema,
  storySchema,
  wordFileSchema,
  wordSchema,
  type Pattern,
  type Word,
} from '../../shared/schemas'
import { parse as parseYaml } from 'yaml'
import { findGroup } from '../../app/utils/pattern'
import type { ContentBundle, MarkdownFile } from './load-content'

const chapterFileStrict = chapterFileSchema
  .extend({ chapters: z.array(chapterSchema.strict()).min(1) })
  .strict()
const patternFileStrict = patternFileSchema
  .extend({ patterns: z.array(patternSchema.strict()).min(1) })
  .strict()
const wordFileStrict = wordFileSchema
  .extend({ words: z.array(wordSchema.strict()).min(1) })
  .strict()
const storyStrict = storySchema
  .extend({ sentences: z.array(sentenceSchema.strict()).min(1) })
  .strict()
const bookParagraphStrict = bookParagraphSchema
  .extend({ chunks: z.array(bookChunkSchema.strict()).min(1) })
  .strict()
const bookStrict = bookSchema
  .extend({
    paragraphs: z.array(bookParagraphStrict).min(1),
    source: bookSourceSchema.strict(),
  })
  .strict()

const drillFileStrict = drillFileSchema
  .extend({
    drills: z.array(
      drillSchema.extend({ cells: z.array(drillCellSchema.strict()).min(1) }).strict(),
    ),
  })
  .strict()

const REFERENCE_COMPONENTS = ['pl-word', 'pron', 'false-friend', 'cognate-list', 'drill']
const COMPONENT_RE = /:{1,2}([a-z][a-z-]*)\{([^}]*)\}/g
const ATTR_RE = /([a-zA-Z][\w-]*)="([^"]*)"/g

export interface ComponentRef {
  name: string
  attrs: Record<string, string>
}

export function findComponentRefs(markdown: string): ComponentRef[] {
  const refs: ComponentRef[] = []
  for (const match of markdown.matchAll(COMPONENT_RE)) {
    const name = match[1]!
    if (!REFERENCE_COMPONENTS.includes(name)) continue
    const attrs: Record<string, string> = {}
    for (const attr of match[2]!.matchAll(ATTR_RE)) attrs[attr[1]!] = attr[2]!
    refs.push({ name, attrs })
  }
  return refs
}

const QUIZ_RE = /^::quiz[ \t]*\n---\n([\s\S]*?)\n---\n::[ \t]*$/gm

/**
 * Quiz blocks are YAML props the Quiz component parses at runtime; a broken one renders as an
 * error box only in dev. Check every block here so it fails `pnpm validate` instead.
 */
export function checkQuizzes(file: MarkdownFile, errors: string[]): void {
  let index = 0
  for (const match of file.body.matchAll(QUIZ_RE)) {
    index++
    let data: unknown
    try {
      data = parseYaml(match[1]!)
    } catch (error) {
      errors.push(
        `${file.path}: quiz ${index}: invalid YAML (${(error as Error).message.split('\n')[0]})`,
      )
      continue
    }
    const props = z.object({ questions: z.unknown(), final: z.boolean().optional() }).strict()
    const top = props.safeParse(data)
    if (!top.success) {
      errors.push(
        `${file.path}: quiz ${index}: ${top.error.issues.map((i) => i.message).join('; ')}`,
      )
      continue
    }
    const parsed = quizSchema.safeParse(top.data.questions)
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        errors.push(
          `${file.path}: quiz ${index}: questions.${issue.path.join('.')}: ${issue.message}`,
        )
    }
  }
}

function parseWith<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  data: unknown,
  path: string,
  errors: string[],
): T | null {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  for (const issue of result.error.issues) {
    const where = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    const keys = issue.code === 'unrecognized_keys' ? ` (${issue.keys.join(', ')})` : ''
    errors.push(`${path}: ${where}${issue.message}${keys}`)
  }
  return null
}

function checkMarkdownRefs(
  file: MarkdownFile,
  words: Map<string, Word>,
  patterns: Map<string, Pattern>,
  drills: Set<string>,
  errors: string[],
): void {
  for (const ref of findComponentRefs(file.body)) {
    const id = ref.attrs.id
    if (ref.name === 'drill') {
      if (!id || !drills.has(id))
        errors.push(`${file.path}: drill references unknown drill "${id ?? ''}"`)
      continue
    }
    if (ref.name === 'cognate-list') {
      const pattern = ref.attrs.pattern
      if (!pattern || !patterns.has(pattern)) {
        errors.push(`${file.path}: cognate-list references unknown pattern "${pattern ?? ''}"`)
      }
      continue
    }
    if (id === undefined) {
      if (ref.name === 'pl-word') errors.push(`${file.path}: pl-word is missing id`)
      continue
    }
    const word = words.get(id)
    if (!word) {
      errors.push(`${file.path}: ${ref.name} references unknown word id "${id}"`)
    } else if (ref.name === 'false-friend' && !word.falseFriend) {
      errors.push(`${file.path}: false-friend id "${id}" is not a false friend`)
    }
  }
}

export function validateContent(bundle: ContentBundle): string[] {
  const errors: string[] = []

  const chapterNumbers = new Set<number>()
  if (!bundle.chapters) {
    errors.push('chapters.yml: file is missing')
  } else {
    const parsed = parseWith(chapterFileStrict, bundle.chapters.data, bundle.chapters.path, errors)
    parsed?.chapters.forEach((c) => chapterNumbers.add(c.number))
  }

  const patterns = new Map<string, Pattern>()
  if (!bundle.patterns) {
    errors.push('patterns.yml: file is missing')
  } else {
    const parsed = parseWith(patternFileStrict, bundle.patterns.data, bundle.patterns.path, errors)
    parsed?.patterns.forEach((p) => patterns.set(p.id, p))
  }

  const drills = new Set<string>()
  if (bundle.drills) {
    const parsed = parseWith(drillFileStrict, bundle.drills.data, bundle.drills.path, errors)
    for (const drill of parsed?.drills ?? []) {
      if (drills.has(drill.id))
        errors.push(`${bundle.drills.path}: duplicate drill id "${drill.id}"`)
      drills.add(drill.id)
      if (drill.require) {
        try {
          new RegExp(drill.require, 'iu')
        } catch {
          errors.push(`${bundle.drills.path}: drill "${drill.id}" has an invalid require pattern`)
        }
      }
    }
  }

  const words = new Map<string, Word>()
  const wordFileOf = new Map<string, string>()
  for (const file of bundle.words) {
    const parsed = parseWith(wordFileStrict, file.data, file.path, errors)
    for (const word of parsed?.words ?? []) {
      const first = wordFileOf.get(word.id)
      if (first) {
        errors.push(`${file.path}: duplicate word id "${word.id}" (first defined in ${first})`)
        continue
      }
      words.set(word.id, word)
      wordFileOf.set(word.id, file.path)

      if (chapterNumbers.size > 0 && !chapterNumbers.has(word.chapter)) {
        errors.push(`${file.path}: word "${word.id}": unknown chapter ${word.chapter}`)
      }
      if (word.pattern !== undefined) {
        const pattern = patterns.get(word.pattern)
        if (!pattern) {
          errors.push(`${file.path}: word "${word.id}": unknown pattern "${word.pattern}"`)
        } else {
          if (findGroup(word.pl, pattern.pl) === -1) {
            errors.push(
              `${file.path}: word "${word.id}": group "${pattern.pl}" of pattern "${pattern.id}" not found in "${word.pl}"`,
            )
          }
          if (findGroup(word.ru, pattern.ru) === -1) {
            errors.push(
              `${file.path}: word "${word.id}": group "${pattern.ru}" of pattern "${pattern.id}" not found in "${word.ru}"`,
            )
          }
        }
      }
    }
  }

  const lessonAt = new Map<string, string>()
  for (const file of bundle.lessons) {
    const meta = parseWith(lessonFrontmatterSchema, file.frontmatter, file.path, errors)
    if (meta) {
      if (chapterNumbers.size > 0 && !chapterNumbers.has(meta.chapter)) {
        errors.push(`${file.path}: unknown chapter ${meta.chapter}`)
      }
      const key = `${meta.chapter}:${meta.order}`
      const other = lessonAt.get(key)
      if (other) {
        errors.push(
          `${file.path}: duplicate chapter ${meta.chapter} order ${meta.order} (also ${other})`,
        )
      } else {
        lessonAt.set(key, file.path)
      }
      for (const id of meta.words) {
        if (!words.has(id))
          errors.push(`${file.path}: unknown word id "${id}" in frontmatter words`)
      }
    }
    checkMarkdownRefs(file, words, patterns, drills, errors)
    checkQuizzes(file, errors)
  }

  if (bundle.cheatsheet) checkMarkdownRefs(bundle.cheatsheet, words, patterns, drills, errors)

  for (const file of bundle.stories) {
    const story = parseWith(storyStrict, file.data, file.path, errors)
    if (story && chapterNumbers.size > 0 && !chapterNumbers.has(story.chapter)) {
      errors.push(`${file.path}: unknown chapter ${story.chapter}`)
    }
    if (story?.questions) {
      const parsed = quizSchema.safeParse(story.questions)
      if (!parsed.success) {
        for (const issue of parsed.error.issues)
          errors.push(`${file.path}: questions.${issue.path.join('.')}: ${issue.message}`)
      }
    }
    story?.sentences.forEach((sentence, index) => {
      for (const [form, id] of Object.entries(sentence.words ?? {})) {
        const word = words.get(id)
        if (!word) {
          errors.push(`${file.path}: sentence ${index + 1}: unknown word id "${id}"`)
        } else if (word.chapter > story.chapter) {
          // A graded text may only lean on words taught by its chapter.
          errors.push(
            `${file.path}: sentence ${index + 1}: "${form}" (${id}) is taught in chapter ${word.chapter}, after the story's chapter ${story.chapter}`,
          )
        }
        if (!sentence.pl.includes(form)) {
          errors.push(
            `${file.path}: sentence ${index + 1}: form "${form}" not found in Polish text`,
          )
        }
      }
    })
  }

  // A book's chunks carry the spacing that rebuilds the source text. Stripping it
  // is invisible in the data and only shows up as ")слово" on the page, so the
  // rebuild is asserted here rather than trusted.
  const cardIds = new Set(
    bundle.cards
      .map((file) => (file.data as { id?: string } | null)?.id)
      .filter((id): id is string => typeof id === 'string'),
  )
  for (const file of bundle.books) {
    const book = parseWith(bookStrict, file.data, file.path, errors)
    book?.paragraphs.forEach((paragraph, index) => {
      const rebuilt = paragraph.chunks.map((chunk) => chunk.pl).join('')
      if (rebuilt !== paragraph.clean) {
        errors.push(`${file.path}: paragraph ${index + 1}: chunks do not rebuild the source text`)
      }
      for (const [form, id] of Object.entries(paragraph.words ?? {})) {
        if (cardIds.size > 0 && !cardIds.has(id)) {
          errors.push(`${file.path}: paragraph ${index + 1}: unknown card id "${id}"`)
        }
        if (!paragraph.clean.includes(form)) {
          errors.push(`${file.path}: paragraph ${index + 1}: form "${form}" not found in the text`)
        }
      }
    })
  }

  return errors
}

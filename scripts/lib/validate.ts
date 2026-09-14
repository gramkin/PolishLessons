import { z } from 'zod'
import {
  chapterFileSchema,
  chapterSchema,
  lessonFrontmatterSchema,
  patternFileSchema,
  patternSchema,
  sentenceSchema,
  storySchema,
  wordFileSchema,
  wordSchema,
  type Pattern,
  type Word,
} from '../../shared/schemas'
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

const REFERENCE_COMPONENTS = ['pl-word', 'pron', 'false-friend', 'cognate-list']
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
  errors: string[],
): void {
  for (const ref of findComponentRefs(file.body)) {
    const id = ref.attrs.id
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
    checkMarkdownRefs(file, words, patterns, errors)
  }

  if (bundle.cheatsheet) checkMarkdownRefs(bundle.cheatsheet, words, patterns, errors)

  for (const file of bundle.stories) {
    const story = parseWith(storyStrict, file.data, file.path, errors)
    story?.sentences.forEach((sentence, index) => {
      for (const [form, id] of Object.entries(sentence.words ?? {})) {
        if (!words.has(id)) {
          errors.push(`${file.path}: sentence ${index + 1}: unknown word id "${id}"`)
        }
        if (!sentence.pl.includes(form)) {
          errors.push(
            `${file.path}: sentence ${index + 1}: form "${form}" not found in Polish text`,
          )
        }
      }
    })
  }

  return errors
}

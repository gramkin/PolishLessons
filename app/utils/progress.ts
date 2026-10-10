import { z } from 'zod'
import { questionSchema } from '#shared/schemas'
import type { Mistake } from './mistakes'

export const STORAGE_KEY = 'polski:v1'
export const THEMES = ['system', 'light', 'sepia', 'dark'] as const
export type Theme = (typeof THEMES)[number]

const PASS_PERCENT = 80

export const settingsSchema = z.object({
  showPron: z.enum(['auto', 'always', 'never']).default('auto'),
  translationMode: z.enum(['show', 'hide', 'tap']).default('tap'),
  direction: z.enum(['pl-ru', 'ru-pl', 'mixed']).default('pl-ru'),
})

const lessonProgressSchema = z.object({
  completed: z.boolean(),
  bestScore: z.number().min(0).max(100),
  at: z.string(),
})

const phraseSchema = z.object({
  id: z.string().min(1),
  pl: z.string().min(1),
  ru: z.string().min(1),
  from: z.string().min(1),
  form: z.string().nullable(),
  box: z.number().int().min(1).max(5),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  added: z.string().min(1),
})

const cardProgressSchema = z.object({
  box: z.number().int().min(1).max(5),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const mistakeSchema = z.object({
  id: z.string().min(1),
  question: questionSchema,
  source: z.object({
    kind: z.enum(['lesson', 'drill']),
    path: z.string().min(1),
    title: z.string().min(1),
    card: z.string().min(1).optional(),
  }),
  box: z.number().int().min(1).max(5),
  due: day,
  added: day,
})

// Each mistake is a snapshot of a question; if a later schema change makes one unreadable,
// drop that one instead of failing the whole file (which would reset all progress).
const mistakesSchema = z
  .record(z.string(), z.unknown())
  .default({})
  .transform((entries): Record<string, Mistake> =>
    Object.fromEntries(
      Object.entries(entries).flatMap(([id, value]) => {
        const parsed = mistakeSchema.safeParse(value)
        return parsed.success ? [[id, parsed.data as Mistake]] : []
      }),
    ),
  )

export const PROGRESS_VERSION = 2

export const progressSchema = z.object({
  version: z.literal(PROGRESS_VERSION),
  lessons: z.record(z.string(), lessonProgressSchema).default({}),
  cards: z.record(z.string(), cardProgressSchema).default({}),
  phrases: z.record(z.string(), phraseSchema).default({}),
  mistakes: mistakesSchema,
  settings: settingsSchema.default({}),
})

export type Settings = z.infer<typeof settingsSchema>
export type Progress = z.infer<typeof progressSchema>
export type LessonProgress = z.infer<typeof lessonProgressSchema>
export type CardProgress = z.infer<typeof cardProgressSchema>
export type StoredPhrase = z.infer<typeof phraseSchema>

export function defaultProgress(): Progress {
  return progressSchema.parse({ version: PROGRESS_VERSION })
}

// Version 1 files (no saved phrases) stay importable.
function migrate(data: unknown): unknown {
  if (data && typeof data === 'object' && (data as { version?: unknown }).version === 1) {
    return { ...(data as object), version: PROGRESS_VERSION, phrases: {} }
  }
  return data
}

export function parseProgress(data: unknown): { progress: Progress; valid: boolean } {
  const result = progressSchema.safeParse(migrate(data))
  return result.success
    ? { progress: result.data, valid: true }
    : { progress: defaultProgress(), valid: false }
}

export function readStoredProgress(raw: string | null): { progress: Progress; valid: boolean } {
  if (raw === null) return { progress: defaultProgress(), valid: true }
  try {
    return parseProgress(JSON.parse(raw))
  } catch {
    return { progress: defaultProgress(), valid: false }
  }
}

export function recordQuizResult(p: Progress, path: string, percent: number, now: Date): Progress {
  const previous = p.lessons[path]
  return {
    ...p,
    lessons: {
      ...p.lessons,
      [path]: {
        completed: (previous?.completed ?? false) || percent >= PASS_PERCENT,
        bestScore: Math.max(previous?.bestScore ?? 0, percent),
        at: now.toISOString(),
      },
    },
  }
}

export function markLessonRead(p: Progress, path: string, now: Date): Progress {
  return {
    ...p,
    lessons: {
      ...p.lessons,
      [path]: {
        completed: true,
        bestScore: p.lessons[path]?.bestScore ?? 0,
        at: now.toISOString(),
      },
    },
  }
}

export function exportProgress(p: Progress, theme: string): string {
  return JSON.stringify({ ...p, theme }, null, 2)
}

export function importProgress(text: string): { progress: Progress; theme: Theme | null } | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  const { progress, valid } = parseProgress(data)
  if (!valid) return null
  const theme = (data as { theme?: unknown }).theme
  return {
    progress,
    theme: THEMES.includes(theme as Theme) ? (theme as Theme) : null,
  }
}

import { z } from 'zod'

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

const cardProgressSchema = z.object({
  box: z.number().int().min(1).max(5),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const progressSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), lessonProgressSchema).default({}),
  cards: z.record(z.string(), cardProgressSchema).default({}),
  settings: settingsSchema.default({}),
})

export type Settings = z.infer<typeof settingsSchema>
export type Progress = z.infer<typeof progressSchema>
export type LessonProgress = z.infer<typeof lessonProgressSchema>
export type CardProgress = z.infer<typeof cardProgressSchema>

export function defaultProgress(): Progress {
  return progressSchema.parse({ version: 1 })
}

export function parseProgress(data: unknown): { progress: Progress; valid: boolean } {
  const result = progressSchema.safeParse(data)
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

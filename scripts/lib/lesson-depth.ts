import type { MarkdownFile } from './load-content'

/**
 * The depth gate: a lesson below these minimums is reported by `pnpm validate`, so a thin
 * lesson is found by the check rather than by a learner. Warnings, not errors: a lesson can be
 * thin on purpose (21.1 «Что дальше» is a signpost, not a lesson).
 */
export const LESSON_MINIMUM = { examples: 10, questions: 8 }

const QUIZ = /^::quiz[ \t]*\n---\n([\s\S]*?)\n---\n::/gm
const MISTAKES = /^#{2,4}\s+Типичные ошибки/m

export interface LessonDepth {
  examples: number
  questions: number
  mistakes: boolean
}

/** Spoken examples (`:pron`), quiz questions and whether there is a «Типичные ошибки» section. */
export function lessonDepth(body: string): LessonDepth {
  let questions = 0
  for (const quiz of body.matchAll(QUIZ)) questions += quiz[1]!.match(/^\s*- type:/gm)?.length ?? 0
  return {
    examples: body.match(/:pron\{/g)?.length ?? 0,
    questions,
    mistakes: MISTAKES.test(body),
  }
}

export function lessonDepthWarnings(lessons: MarkdownFile[]): string[] {
  const warnings: string[] = []
  for (const file of lessons) {
    const depth = lessonDepth(file.body)
    const missing: string[] = []
    if (depth.examples < LESSON_MINIMUM.examples)
      missing.push(`${depth.examples} spoken examples (min ${LESSON_MINIMUM.examples})`)
    if (depth.questions < LESSON_MINIMUM.questions)
      missing.push(`${depth.questions} questions (min ${LESSON_MINIMUM.questions})`)
    if (!depth.mistakes) missing.push('no «Типичные ошибки» section')
    if (missing.length > 0) warnings.push(`${file.path}: thin lesson: ${missing.join(', ')}`)
  }
  return warnings
}

import type { InjectionKey, Ref } from 'vue'
import type { Question } from '../../shared/schemas'
import { addDays, isDue, MAX_BOX, review, toDay } from './leitner'

/** Where a mistake was made: the lesson (always) and, for a drill sentence, the word's card. */
export interface MistakeSource {
  kind: 'lesson' | 'drill'
  path: string
  title: string
  card?: string
}

/**
 * A question answered wrongly, kept as a snapshot (like a saved phrase) so a
 * later edit to the lesson never breaks it, and scheduled with the same
 * Leitner boxes as the flashcards.
 */
export interface Mistake {
  id: string
  question: Question
  source: MistakeSource
  box: number
  due: string
  added: string
}

export const MAX_MISTAKES = 300

/** The lesson page provides its «6.1 Винительный падеж» title for the mistakes it records. */
export const LESSON_TITLE_KEY: InjectionKey<Ref<string>> = Symbol('lesson-title')

// FNV-1a, as for phrase ids: short, stable, computable in the browser.
function hash(text: string): string {
  let value = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 0x01000193) >>> 0
  }
  return value.toString(16).padStart(8, '0')
}

function answerText(question: Question): string {
  if (question.type === 'choice') return question.options[question.answer] ?? ''
  if (question.type === 'match') return question.pairs.map((p) => p.join('=')).join(';')
  return Array.isArray(question.answer) ? question.answer.join('|') : question.answer
}

/** The same question from the same place always gets the same id, so a repeat mistake is one item. */
export function mistakeId(question: Question, source: MistakeSource): string {
  return `m${hash(`${source.path}|${source.card ?? ''}|${question.q}|${answerText(question)}`)}`
}

/** Matching questions are five pairs, not one point to remember, so they are not kept. */
export function isRecordable(question: Question): boolean {
  return question.type !== 'match'
}

/**
 * Add a wrong answer, or send an existing item back to box 1. It comes back
 * tomorrow, not today: reviewing it right after the explanation tests memory
 * of the last minute, not of the rule.
 */
export function recordMistake(
  mistakes: Record<string, Mistake>,
  question: Question,
  source: MistakeSource,
  now: Date,
): Record<string, Mistake> {
  if (!isRecordable(question)) return mistakes
  const id = mistakeId(question, source)
  const today = toDay(now)
  const item: Mistake = {
    id,
    question,
    source,
    box: 1,
    due: addDays(today, 1),
    added: mistakes[id]?.added ?? today,
  }
  return capMistakes({ ...mistakes, [id]: item })
}

/** A right answer in the last box graduates the item; otherwise the usual Leitner step. */
export function reviewMistake(
  mistakes: Record<string, Mistake>,
  id: string,
  correct: boolean,
  now: Date,
): Record<string, Mistake> {
  const item = mistakes[id]
  if (!item) return mistakes
  if (correct && item.box >= MAX_BOX) {
    const { [id]: _graduated, ...rest } = mistakes
    return rest
  }
  return { ...mistakes, [id]: { ...item, ...review(item, correct, now) } }
}

/** Over the cap, the items closest to graduating go first: they are the ones already learned. */
export function capMistakes(
  mistakes: Record<string, Mistake>,
  max: number = MAX_MISTAKES,
): Record<string, Mistake> {
  const items = Object.values(mistakes)
  if (items.length <= max) return mistakes
  const kept = [...items]
    .sort((a, b) => a.box - b.box || b.added.localeCompare(a.added))
    .slice(0, max)
  return Object.fromEntries(kept.map((m) => [m.id, m]))
}

export function dueMistakes(mistakes: Record<string, Mistake>, now: Date): Mistake[] {
  return Object.values(mistakes)
    .filter((m) => isDue(m, now))
    .sort((a, b) => a.due.localeCompare(b.due) || a.added.localeCompare(b.added))
}

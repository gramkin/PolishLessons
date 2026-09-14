import type { ChoiceQuestion, MatchQuestion } from '../../shared/schemas'
import { foldDiacritics, normalizeText } from './normalize'

export type Verdict = 'correct' | 'almost' | 'wrong'

export const PASS_PERCENT = 80

export interface QuizScore {
  correct: number
  total: number
  percent: number
  passed: boolean
}

export function checkText(input: string, answer: string | string[]): Verdict {
  const given = normalizeText(input)
  if (!given) return 'wrong'
  const answers = (Array.isArray(answer) ? answer : [answer]).map(normalizeText)
  if (answers.includes(given)) return 'correct'
  const loose = foldDiacritics(given)
  return answers.some((a) => foldDiacritics(a) === loose) ? 'almost' : 'wrong'
}

export function checkChoice(q: ChoiceQuestion, selected: number): Verdict {
  return selected === q.answer ? 'correct' : 'wrong'
}

export function checkMatch(q: MatchQuestion, selection: Record<string, string>): Verdict {
  return q.pairs.every(([pl, ru]) => selection[pl] === ru) ? 'correct' : 'wrong'
}

export function scoreQuiz(verdicts: Verdict[]): QuizScore {
  const total = verdicts.length
  const correct = verdicts.filter((v) => v !== 'wrong').length
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { correct, total, percent, passed: total > 0 && percent >= PASS_PERCENT }
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

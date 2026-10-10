import type { ChoiceQuestion, MatchQuestion } from '../../shared/schemas'
import { foldDiacritics, normalizeText } from './normalize'

// `skipped`: a dictation with no voice or recording to play. It counts neither way.
export type Verdict = 'correct' | 'almost' | 'wrong' | 'skipped'

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

// Sentences compare without any punctuation: a missing comma is not a wrong translation.
const PUNCTUATION = /[.,!?;:«»"„”…—–()]/g
function normalizeSentence(s: string): string {
  return normalizeText(s.replace(PUNCTUATION, ' '))
}

/** Like checkText, for whole sentences: case, spacing and all punctuation are ignored. */
export function checkSentence(input: string, answer: string | string[]): Verdict {
  const given = normalizeSentence(input)
  if (!given) return 'wrong'
  const answers = (Array.isArray(answer) ? answer : [answer]).map(normalizeSentence)
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

export function scoreQuiz(all: Verdict[]): QuizScore {
  const verdicts = all.filter((v) => v !== 'skipped')
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

import { describe, expect, it } from 'vitest'
import {
  checkChoice,
  checkMatch,
  checkText,
  scoreQuiz,
  shuffle,
  checkSentence,
} from '../../app/utils/quiz'

describe('checkText', () => {
  it('accepts exact answers ignoring case, spaces and edge punctuation', () => {
    expect(checkText('  Dzień  dobry! ', 'dzień dobry')).toBe('correct')
  })

  it('accepts any of several answers', () => {
    expect(checkText('cześć', ['hej', 'cześć'])).toBe('correct')
  })

  it('returns almost when only diacritics differ', () => {
    expect(checkText('zab', 'ząb')).toBe('almost')
    expect(checkText('zolw', ['żółw'])).toBe('almost')
  })

  it('returns wrong otherwise or for empty input', () => {
    expect(checkText('reka', 'rzeka')).toBe('wrong')
    expect(checkText('   ', 'rzeka')).toBe('wrong')
  })
})

describe('checkChoice', () => {
  it('compares the selected index', () => {
    const q = { type: 'choice' as const, q: '?', options: ['a', 'b'], answer: 1 }
    expect(checkChoice(q, 1)).toBe('correct')
    expect(checkChoice(q, 0)).toBe('wrong')
  })
})

describe('checkMatch', () => {
  const q = {
    type: 'match' as const,
    q: '?',
    pairs: [
      ['rzeka', 'река'],
      ['brzeg', 'берег'],
    ] as [string, string][],
  }

  it('is correct only when all pairs match', () => {
    expect(checkMatch(q, { rzeka: 'река', brzeg: 'берег' })).toBe('correct')
    expect(checkMatch(q, { rzeka: 'берег', brzeg: 'река' })).toBe('wrong')
    expect(checkMatch(q, { rzeka: 'река' })).toBe('wrong')
  })
})

describe('scoreQuiz', () => {
  it('counts almost as correct and applies the 80% threshold', () => {
    expect(scoreQuiz(['correct', 'almost', 'correct', 'correct', 'wrong'])).toEqual({
      correct: 4,
      total: 5,
      percent: 80,
      passed: true,
    })
    expect(scoreQuiz(['correct', 'wrong', 'wrong'])).toEqual({
      correct: 1,
      total: 3,
      percent: 33,
      passed: false,
    })
  })

  it('handles an empty quiz', () => {
    expect(scoreQuiz([])).toEqual({ correct: 0, total: 0, percent: 0, passed: false })
  })
})

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4]
    const result = shuffle(input, () => 0)
    expect(input).toEqual([1, 2, 3, 4])
    expect([...result].sort()).toEqual([1, 2, 3, 4])
    expect(result).toEqual([2, 3, 4, 1])
  })
})

describe('checkSentence', () => {
  it('ignores case, spacing and all punctuation', () => {
    expect(checkSentence('dzień dobry jak się masz', 'Dzień dobry, jak się masz?')).toBe('correct')
    expect(checkSentence('  Nie mam  czasu ', ['Nie mam czasu.', 'Czasu nie mam.'])).toBe('correct')
    expect(checkSentence('Czasu nie mam!', ['Nie mam czasu.', 'Czasu nie mam.'])).toBe('correct')
  })

  it('calls a diacritic slip almost, and anything else wrong', () => {
    expect(checkSentence('Nie mam czasu', 'Nie mam czasu.')).toBe('correct')
    expect(checkSentence('Dzien dobry', 'Dzień dobry.')).toBe('almost')
    expect(checkSentence('Nie mam pieniędzy', 'Nie mam czasu.')).toBe('wrong')
    expect(checkSentence('  ', 'Nie mam czasu.')).toBe('wrong')
  })
})

describe('scoreQuiz with skipped questions', () => {
  it('leaves skipped dictation out of the total', () => {
    expect(scoreQuiz(['correct', 'skipped', 'wrong', 'skipped'])).toEqual({
      correct: 1,
      total: 2,
      percent: 50,
      passed: false,
    })
    expect(scoreQuiz(['skipped'])).toMatchObject({ total: 0, passed: false })
  })
})

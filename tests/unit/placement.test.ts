import { describe, expect, it } from 'vitest'
import { placementResult } from '../../app/utils/placement'

describe('placementResult', () => {
  it('starts at the first chapter that is not mostly right', () => {
    const chapters = [1, 1, 3, 3, 3, 5, 5]
    const verdicts = ['correct', 'correct', 'correct', 'wrong', 'almost', 'wrong', null] as const
    expect(placementResult(chapters, [...verdicts], 21)).toEqual({
      start: 5,
      byChapter: [
        { chapter: 1, correct: 2, total: 2 },
        { chapter: 3, correct: 2, total: 3 },
        { chapter: 5, correct: 0, total: 2 },
      ],
    })
  })

  it('counts unanswered as wrong, ignores skipped, and goes past the end when all is known', () => {
    expect(placementResult([2, 2], [null, 'correct'], 21).start).toBe(2)
    expect(placementResult([2, 4], ['skipped', 'correct'], 21).start).toBe(21)
  })
})

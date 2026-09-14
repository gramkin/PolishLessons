import { describe, expect, it } from 'vitest'
import { addDays, buildSession, isDue, review, toDay } from '../../app/utils/leitner'

const now = new Date(2026, 8, 14, 23, 30) // 14 Sep 2026, local time

describe('toDay / addDays', () => {
  it('formats local dates', () => {
    expect(toDay(now)).toBe('2026-09-14')
  })

  it('adds days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-09-14', 0)).toBe('2026-09-14')
  })
})

describe('review', () => {
  it('moves a new remembered card to box 2 due tomorrow', () => {
    expect(review(undefined, true, now)).toEqual({ box: 2, due: '2026-09-15' })
  })

  it('keeps a forgotten card in box 1 due today', () => {
    expect(review(undefined, false, now)).toEqual({ box: 1, due: '2026-09-14' })
  })

  it('uses the interval of the new box', () => {
    expect(review({ box: 2, due: '2026-09-14' }, true, now)).toEqual({ box: 3, due: '2026-09-17' })
    expect(review({ box: 3, due: '2026-09-14' }, true, now)).toEqual({ box: 4, due: '2026-09-21' })
  })

  it('caps at box 5 with a 14-day interval', () => {
    expect(review({ box: 5, due: '2026-09-14' }, true, now)).toEqual({ box: 5, due: '2026-09-28' })
  })

  it('resets any box to 1 when forgotten', () => {
    expect(review({ box: 4, due: '2026-09-14' }, false, now)).toEqual({ box: 1, due: '2026-09-14' })
  })
})

describe('isDue', () => {
  it('is due on or after the due date', () => {
    expect(isDue({ box: 2, due: '2026-09-14' }, now)).toBe(true)
    expect(isDue({ box: 2, due: '2026-09-13' }, now)).toBe(true)
    expect(isDue({ box: 2, due: '2026-09-15' }, now)).toBe(false)
  })
})

describe('buildSession', () => {
  it('puts due cards first by due date, then new cards up to the limit', () => {
    const cards = {
      a: { box: 2, due: '2026-09-14' },
      b: { box: 3, due: '2026-09-10' },
      c: { box: 4, due: '2026-10-01' },
    }
    expect(buildSession(['n1', 'a', 'n2', 'b', 'c', 'n3'], cards, now, 2)).toEqual([
      'b',
      'a',
      'n1',
      'n2',
    ])
  })

  it('defaults to 10 new cards', () => {
    const ids = Array.from({ length: 15 }, (_, i) => `w${i}`)
    expect(buildSession(ids, {}, now)).toHaveLength(10)
  })
})

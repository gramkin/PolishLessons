import { describe, expect, it } from 'vitest'
import {
  lessonsToReview,
  capMistakes,
  dueMistakes,
  isRecordable,
  mistakeId,
  recordMistake,
  reviewMistake,
  type Mistake,
  type MistakeSource,
} from '../../app/utils/mistakes'
import { parseProgress, PROGRESS_VERSION } from '../../app/utils/progress'
import type { Question } from '../../shared/schemas'

const lesson: MistakeSource = {
  kind: 'lesson',
  path: '/lessons/06-cases/01-accusative',
  title: '6.1 Винительный падеж',
}
const input: Question = { type: 'input', q: 'Czytam ___. (gazeta)', answer: 'gazetę' }
const choice: Question = {
  type: 'choice',
  q: 'Lubię ___. (herbata)',
  options: ['herbata', 'herbatę', 'herbaty'],
  answer: 1,
}
const match: Question = {
  type: 'match',
  q: 'Соедините',
  pairs: [
    ['a', 'б'],
    ['в', 'г'],
  ],
}

const day = (d: number) => new Date(2026, 9, d, 12)

describe('mistakeId', () => {
  it('is stable for the same question in the same place and differs elsewhere', () => {
    expect(mistakeId(input, lesson)).toBe(mistakeId({ ...input }, { ...lesson }))
    expect(mistakeId(input, lesson)).not.toBe(mistakeId(input, { ...lesson, path: '/lessons/x' }))
    expect(mistakeId(input, lesson)).not.toBe(mistakeId({ ...input, answer: 'gazety' }, lesson))
    expect(mistakeId(input, lesson)).toMatch(/^m[0-9a-f]{8}$/)
  })
})

describe('recordMistake', () => {
  it('adds a wrong answer, due tomorrow in box 1', () => {
    const mistakes = recordMistake({}, input, lesson, day(10))
    const [item] = Object.values(mistakes)
    expect(item).toMatchObject({
      question: input,
      source: lesson,
      box: 1,
      due: '2026-10-11',
      added: '2026-10-10',
    })
  })

  it('sends a repeat back to box 1 instead of adding a duplicate, keeping when it was first added', () => {
    let mistakes = recordMistake({}, choice, lesson, day(1))
    const id = mistakeId(choice, lesson)
    mistakes = reviewMistake(mistakes, id, true, day(2))
    mistakes = reviewMistake(mistakes, id, true, day(4))
    expect(mistakes[id]!.box).toBe(3)
    mistakes = recordMistake(mistakes, choice, lesson, day(8))
    expect(Object.keys(mistakes)).toEqual([id])
    expect(mistakes[id]).toMatchObject({ box: 1, due: '2026-10-09', added: '2026-10-01' })
  })

  it('does not keep matching questions', () => {
    expect(isRecordable(match)).toBe(false)
    expect(recordMistake({}, match, lesson, day(1))).toEqual({})
  })

  it('never keeps a writing task', () => {
    const write = {
      type: 'write',
      q: 'Напишите письмо.',
      model: 'Szanowni Państwo, piszę w sprawie zamówienia.',
      checklist: ['обращение', 'просьба'],
    } as Question
    expect(isRecordable(write)).toBe(false)
    expect(recordMistake({}, write, lesson, day(1))).toEqual({})
  })
})

describe('reviewMistake', () => {
  it('climbs the boxes on right answers and graduates out of the last one', () => {
    let mistakes = recordMistake({}, input, lesson, day(1))
    const id = mistakeId(input, lesson)
    for (const [d, box] of [
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ] as const) {
      mistakes = reviewMistake(mistakes, id, true, day(d))
      expect(mistakes[id]!.box).toBe(box)
    }
    expect(reviewMistake(mistakes, id, true, day(20))).toEqual({})
  })

  it('drops back to box 1 on a wrong answer', () => {
    let mistakes = recordMistake({}, input, lesson, day(1))
    const id = mistakeId(input, lesson)
    mistakes = reviewMistake(mistakes, id, true, day(2))
    mistakes = reviewMistake(mistakes, id, false, day(5))
    expect(mistakes[id]).toMatchObject({ box: 1, due: '2026-10-05' })
  })
})

describe('capMistakes and dueMistakes', () => {
  const item = (id: string, box: number, due: string, added = '2026-10-01'): Mistake => ({
    id,
    question: input,
    source: lesson,
    box,
    due,
    added,
  })

  it('drops the items closest to graduating first', () => {
    const mistakes = {
      a: item('a', 5, '2026-10-01'),
      b: item('b', 1, '2026-10-01'),
      c: item('c', 3, '2026-10-01'),
    }
    expect(Object.keys(capMistakes(mistakes, 2)).sort()).toEqual(['b', 'c'])
  })

  it('lists what is due, oldest due first', () => {
    const mistakes = {
      a: item('a', 1, '2026-10-12'),
      b: item('b', 2, '2026-10-09'),
      c: item('c', 1, '2026-10-10'),
    }
    expect(dueMistakes(mistakes, day(10)).map((m) => m.id)).toEqual(['b', 'c'])
  })
})

describe('mistakes in saved progress', () => {
  it('loads progress saved before mistakes existed', () => {
    const { progress, valid } = parseProgress({ version: PROGRESS_VERSION, lessons: {} })
    expect(valid).toBe(true)
    expect(progress.mistakes).toEqual({})
  })

  it('drops one unreadable mistake instead of rejecting the whole file', () => {
    const good = recordMistake({}, input, lesson, day(1))
    const { progress, valid } = parseProgress({
      version: PROGRESS_VERSION,
      lessons: { '/lessons/x': { completed: true, bestScore: 100, at: '2026-10-01' } },
      mistakes: { ...good, broken: { id: 'broken', question: { type: 'nope' } } },
    })
    expect(valid).toBe(true)
    expect(Object.keys(progress.mistakes)).toEqual(Object.keys(good))
    expect(progress.lessons['/lessons/x']?.completed).toBe(true)
  })
})

describe('lessonsToReview', () => {
  const at = (path: string, title = path) => ({ source: { kind: 'lesson' as const, path, title } })
  it('names lessons with at least three mistakes, worst first', () => {
    const list = [
      ...Array.from({ length: 4 }, () => at('/lessons/b', '7.1 B')),
      ...Array.from({ length: 3 }, () => at('/lessons/a', '5.1 A')),
      ...Array.from({ length: 2 }, () => at('/lessons/c')),
    ]
    expect(lessonsToReview(list)).toEqual([
      { path: '/lessons/b', title: '7.1 B', count: 4 },
      { path: '/lessons/a', title: '5.1 A', count: 3 },
    ])
    expect(lessonsToReview(list, { limit: 1 })).toHaveLength(1)
  })
})

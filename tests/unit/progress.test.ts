import { describe, expect, it } from 'vitest'
import {
  defaultProgress,
  exportProgress,
  importProgress,
  markLessonRead,
  parseProgress,
  readStoredProgress,
  recordQuizResult,
} from '../../app/utils/progress'

const now = new Date('2026-09-14T10:00:00Z')
const later = new Date('2026-09-15T10:00:00Z')

describe('defaultProgress', () => {
  it('has version 2, empty records and default settings', () => {
    expect(defaultProgress()).toEqual({
      version: 2,
      lessons: {},
      cards: {},
      settings: { showPron: 'auto', translationMode: 'tap', direction: 'pl-ru' },
      phrases: {},
      mistakes: {},
    })
  })
})

describe('parseProgress', () => {
  it('accepts valid progress and fills missing settings', () => {
    const { progress, valid } = parseProgress({
      version: 1,
      lessons: { '/lessons/a': { completed: true, bestScore: 90, at: now.toISOString() } },
      cards: { rzeka: { box: 2, due: '2026-09-15' } },
      settings: { showPron: 'never' },
    })
    expect(valid).toBe(true)
    expect(progress.settings).toEqual({
      showPron: 'never',
      translationMode: 'tap',
      direction: 'pl-ru',
    })
    expect(progress.cards.rzeka).toEqual({ box: 2, due: '2026-09-15' })
  })

  it('rejects other versions, bad boxes and garbage', () => {
    expect(parseProgress({ version: 3 }).valid).toBe(false)
    expect(parseProgress({ version: 1, cards: { x: { box: 9, due: '2026-09-15' } } }).valid).toBe(
      false,
    )
    expect(parseProgress('nope')).toEqual({ progress: defaultProgress(), valid: false })
  })
})

describe('readStoredProgress', () => {
  it('returns valid defaults when nothing is stored', () => {
    expect(readStoredProgress(null)).toEqual({ progress: defaultProgress(), valid: true })
  })

  it('returns invalid defaults for broken JSON', () => {
    expect(readStoredProgress('{broken')).toEqual({ progress: defaultProgress(), valid: false })
  })

  it('parses stored JSON', () => {
    const raw = JSON.stringify({
      ...defaultProgress(),
      cards: { dom: { box: 3, due: '2026-09-20' } },
    })
    expect(readStoredProgress(raw).progress.cards.dom?.box).toBe(3)
  })
})

describe('recordQuizResult', () => {
  it('completes a lesson at 80% and keeps the best score', () => {
    let p = recordQuizResult(defaultProgress(), '/lessons/a', 60, now)
    expect(p.lessons['/lessons/a']).toEqual({
      completed: false,
      bestScore: 60,
      at: now.toISOString(),
    })

    p = recordQuizResult(p, '/lessons/a', 80, later)
    expect(p.lessons['/lessons/a']).toEqual({
      completed: true,
      bestScore: 80,
      at: later.toISOString(),
    })

    p = recordQuizResult(p, '/lessons/a', 40, later)
    expect(p.lessons['/lessons/a']).toMatchObject({ completed: true, bestScore: 80 })
  })

  it('does not mutate the input', () => {
    const original = defaultProgress()
    recordQuizResult(original, '/lessons/a', 100, now)
    expect(original.lessons).toEqual({})
  })
})

describe('markLessonRead', () => {
  it('completes a lesson without changing the best score', () => {
    const scored = recordQuizResult(defaultProgress(), '/lessons/a', 50, now)
    expect(markLessonRead(scored, '/lessons/a', later).lessons['/lessons/a']).toEqual({
      completed: true,
      bestScore: 50,
      at: later.toISOString(),
    })
    expect(
      markLessonRead(defaultProgress(), '/lessons/b', now).lessons['/lessons/b']?.bestScore,
    ).toBe(0)
  })
})

describe('export / import', () => {
  it('round-trips progress and theme', () => {
    const p = markLessonRead(defaultProgress(), '/lessons/a', now)
    const imported = importProgress(exportProgress(p, 'sepia'))
    expect(imported).toEqual({ progress: p, theme: 'sepia' })
  })

  it('returns null for invalid files', () => {
    expect(importProgress('not json')).toBeNull()
    expect(importProgress(JSON.stringify({ version: 5 }))).toBeNull()
  })

  it('migrates version 1 files by adding an empty phrase list', () => {
    const v1 = {
      version: 1,
      lessons: {},
      cards: {},
      settings: { showPron: 'auto', translationMode: 'tap', direction: 'pl-ru' },
    }
    const { progress, valid } = parseProgress(v1)
    expect(valid).toBe(true)
    expect(progress.version).toBe(2)
    expect(progress.phrases).toEqual({})
    expect(importProgress(JSON.stringify({ ...v1, theme: 'dark' }))?.theme).toBe('dark')
  })

  it('ignores unknown themes', () => {
    const text = JSON.stringify({ ...defaultProgress(), theme: 'neon' })
    expect(importProgress(text)?.theme).toBeNull()
  })
})

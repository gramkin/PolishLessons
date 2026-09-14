import { describe, expect, it } from 'vitest'
import { buildNav, flattenNav, normalizePath, surroundings } from '../../app/utils/nav'

const chapters = [
  { number: 2, title: 'Звуковые соответствия' },
  { number: 1, title: 'Алфавит и произношение' },
  { number: 3, title: 'Первые фразы' },
]

const lessons = [
  { path: '/lessons/02-sounds/01-rz', title: 'rz и р', chapter: 2, order: 1 },
  { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', chapter: 1, order: 5 },
  { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', chapter: 1, order: 1 },
  { path: '/lessons/99-orphan/01', title: 'Сирота', chapter: 99, order: 1 },
]

describe('buildNav', () => {
  it('groups and sorts lessons by chapter and order with position labels', () => {
    expect(buildNav(lessons, chapters)).toEqual([
      {
        number: 1,
        title: 'Алфавит и произношение',
        lessons: [
          { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
          { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
        ],
      },
      {
        number: 2,
        title: 'Звуковые соответствия',
        lessons: [{ path: '/lessons/02-sounds/01-rz', title: 'rz и р', label: '2.1' }],
      },
    ])
  })
})

describe('normalizePath', () => {
  it('removes trailing slash, query and hash', () => {
    expect(normalizePath('/lessons/a/?x=1#top')).toBe('/lessons/a')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('surroundings', () => {
  const flat = flattenNav(buildNav(lessons, chapters))

  it('returns previous and next lessons across chapters', () => {
    const { prev, next } = surroundings(flat, '/lessons/01-alphabet/02-stress/')
    expect(prev?.label).toBe('1.1')
    expect(next?.label).toBe('2.1')
  })

  it('returns null at the edges', () => {
    expect(surroundings(flat, '/lessons/01-alphabet/01-letters').prev).toBeNull()
    expect(surroundings(flat, '/lessons/02-sounds/01-rz').next).toBeNull()
  })

  it('returns nulls for a path that is not a lesson', () => {
    expect(surroundings(flat, '/vocabulary')).toEqual({ prev: null, next: null })
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildNav,
  chapterEndingAt,
  flattenNav,
  normalizePath,
  slimNav,
  surroundings,
} from '../../app/utils/nav'

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

describe('chapterEndingAt', () => {
  it('names the chapter only on its last lesson', () => {
    const nav = buildNav(lessons, chapters)
    expect(chapterEndingAt(nav, '/lessons/01-alphabet/02-stress/')).toBe(1)
    expect(chapterEndingAt(nav, '/lessons/01-alphabet/01-letters')).toBeNull()
    expect(chapterEndingAt(nav, '/lessons/02-sounds/01-rz')).toBe(2)
  })
})

describe('slimNav', () => {
  const nav = buildNav(lessons, chapters)

  it("keeps only the current chapter's lessons and a first-lesson link for the rest", () => {
    const slim = slimNav(nav, '/lessons/01-alphabet/02-stress/')
    expect(slim.chapters).toEqual([
      {
        number: 1,
        title: 'Алфавит и произношение',
        firstPath: '/lessons/01-alphabet/01-letters',
        lessons: [
          { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
          { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
        ],
      },
      {
        number: 2,
        title: 'Звуковые соответствия',
        firstPath: '/lessons/02-sounds/01-rz',
        lessons: [],
      },
    ])
  })

  it('carries the neighbours, which may sit in another chapter', () => {
    const slim = slimNav(nav, '/lessons/01-alphabet/02-stress')
    expect(slim.prev?.path).toBe('/lessons/01-alphabet/01-letters')
    expect(slim.next).toEqual({ path: '/lessons/02-sounds/01-rz', title: 'rz и р', label: '2.1' })
  })

  it('lists chapter titles only on a page that is not a lesson', () => {
    const slim = slimNav(nav, '/slovo/kot')
    expect(slim.chapters.every((c) => c.lessons.length === 0)).toBe(true)
    expect(slim.prev).toBeNull()
    expect(slim.next).toBeNull()
  })

  it("still finds the chapter that a slim nav's current lesson ends", () => {
    expect(
      chapterEndingAt(
        slimNav(nav, '/lessons/02-sounds/01-rz').chapters,
        '/lessons/02-sounds/01-rz',
      ),
    ).toBe(2)
  })
})

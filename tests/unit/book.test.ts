import { describe, expect, it } from 'vitest'
import { bookSlug, chapterNeighbours, type BookChapterInput } from '../../app/utils/book'

function chapter(n: number, title = 'Alicja'): BookChapterInput {
  return {
    stem: `books/${title.toLowerCase()}-${String(n).padStart(2, '0')}`,
    title,
    chapter: n,
    chapterTitle: `Rozdział ${n}`,
    chapterTitleRu: `Глава ${n}`,
  }
}

describe('bookSlug', () => {
  it('keeps only the last segment of a content stem', () => {
    expect(bookSlug('books/alicja-pl-01-krolicza-nora')).toBe('alicja-pl-01-krolicza-nora')
  })
})

describe('chapterNeighbours', () => {
  const all = [chapter(3), chapter(1), chapter(2)]

  it('finds the chapters either side, whatever order they arrive in', () => {
    const { prev, next } = chapterNeighbours(all, chapter(2))
    expect(prev?.path).toBe('/books/alicja-01')
    expect(prev?.label).toBe('Глава 1')
    expect(next?.path).toBe('/books/alicja-03')
    expect(next?.title).toBe('Rozdział 3')
    expect(next?.titleRu).toBe('Глава 3')
  })

  it('leaves the first chapter without a previous one', () => {
    expect(chapterNeighbours(all, chapter(1)).prev).toBeNull()
    expect(chapterNeighbours(all, chapter(1)).next?.label).toBe('Глава 2')
  })

  it('leaves the last chapter without a next one', () => {
    expect(chapterNeighbours(all, chapter(3)).next).toBeNull()
    expect(chapterNeighbours(all, chapter(3)).prev?.label).toBe('Глава 2')
  })

  it('never pairs chapters from different books', () => {
    const mixed = [chapter(1), chapter(2), chapter(1, 'Pan'), chapter(2, 'Pan')]
    const { prev, next } = chapterNeighbours(mixed, chapter(1, 'Pan'))
    expect(prev).toBeNull()
    expect(next?.path).toBe('/books/pan-02')
  })

  it('returns nothing for a chapter that is not in the list', () => {
    expect(chapterNeighbours(all, chapter(9))).toEqual({ prev: null, next: null })
    expect(chapterNeighbours(all, null)).toEqual({ prev: null, next: null })
  })
})

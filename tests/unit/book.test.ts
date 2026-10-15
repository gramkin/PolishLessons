import { describe, expect, it } from 'vitest'
import {
  bookId,
  bookSlug,
  chapterNeighbours,
  groupBooks,
  type BookChapterInput,
} from '../../app/utils/book'

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

describe('bookId', () => {
  it('drops the chapter number and title from a chapter slug or stem', () => {
    expect(bookId('alicja-pl-01-krolicza-nora')).toBe('alicja-pl')
    expect(bookId('books/doyle-04-czarny-piotr-iv')).toBe('doyle')
    expect(bookId('alicja-01')).toBe('alicja')
  })
})

describe('groupBooks', () => {
  const meta = (n: number, title: string, level = 'B1') => ({
    ...chapter(n, title),
    titleRu: `${title} (ru)`,
    author: 'Autor',
    level,
  })

  it('gives one entry per book with its chapters in order', () => {
    const books = groupBooks([meta(2, 'Alicja'), meta(1, 'Alicja'), meta(1, 'Piotr', 'B2')])
    expect(books.map((b) => b.id)).toEqual(['alicja', 'piotr'])
    expect(books[0]!.path).toBe('/books/alicja')
    expect(books[0]!.chapters.map((c) => c.path)).toEqual(['/books/alicja-01', '/books/alicja-02'])
    expect(books[1]!.level).toBe('B2')
  })

  it('shows a span when chapters differ in level', () => {
    expect(groupBooks([meta(1, 'Alicja', 'B2'), meta(2, 'Alicja', 'B1')])[0]!.level).toBe('B1–B2')
  })
})

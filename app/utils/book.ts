/** Content stems look like `books/<slug>`; the route only wants the last segment. */
export function bookSlug(stem: string): string {
  return stem.split('/').pop() ?? stem
}

/**
 * A chapter slug with its `-NN-…` chapter part removed names the whole book:
 * `alicja-pl-01-krolicza-nora` belongs to `alicja-pl`. `/books/<id>` is that
 * book's table of contents.
 */
export function bookId(slugOrStem: string): string {
  return bookSlug(slugOrStem).replace(/-\d{2}(?:-.*)?$/, '')
}

/** The parts of a chapter the navigation links need. */
export interface BookChapterInput {
  stem: string
  title: string
  chapter: number
  chapterTitle: string
  chapterTitleRu: string
}

export interface BookChapterRef {
  path: string
  title: string
  titleRu: string
  label: string
}

function toRef(chapter: BookChapterInput | undefined): BookChapterRef | null {
  if (!chapter) return null
  return {
    path: `/books/${bookSlug(chapter.stem)}`,
    title: chapter.chapterTitle,
    titleRu: chapter.chapterTitleRu,
    label: `Глава ${chapter.chapter}`,
  }
}

/**
 * The chapters either side of `current`, in reading order. Chapters are grouped
 * by book title, so two books' third chapters are never neighbours.
 */
export function chapterNeighbours(
  chapters: BookChapterInput[],
  current: BookChapterInput | null | undefined,
): { prev: BookChapterRef | null; next: BookChapterRef | null } {
  if (!current) return { prev: null, next: null }
  const sameBook = chapters
    .filter((chapter) => chapter.title === current.title)
    .sort((a, b) => a.chapter - b.chapter)
  const at = sameBook.findIndex((chapter) => chapter.stem === current.stem)
  if (at === -1) return { prev: null, next: null }
  return { prev: toRef(sameBook[at - 1]), next: toRef(sameBook[at + 1]) }
}

export interface BookChapterMeta extends BookChapterInput {
  titleRu: string
  author: string
  level: string
}

export interface BookSummary {
  id: string
  path: string
  title: string
  titleRu: string
  author: string
  /** The book's levels in order, e.g. `B1` or `B1–B2`. */
  level: string
  chapters: BookChapterRef[]
}

/**
 * One entry per book, in the order their chapters arrive (content order is by
 * stem, so a book's position follows its slug). Chapters are sorted by number.
 */
export function groupBooks(chapters: BookChapterMeta[]): BookSummary[] {
  const books = new Map<string, BookChapterMeta[]>()
  for (const chapter of chapters) {
    const id = bookId(chapter.stem)
    books.set(id, [...(books.get(id) ?? []), chapter])
  }
  return [...books].map(([id, list]) => {
    const sorted = [...list].sort((a, b) => a.chapter - b.chapter)
    const first = sorted[0]!
    const levels = [...new Set(sorted.map((c) => c.level))].sort()
    return {
      id,
      path: `/books/${id}`,
      title: first.title,
      titleRu: first.titleRu,
      author: first.author,
      level: levels.length > 1 ? `${levels[0]}–${levels[levels.length - 1]}` : levels[0]!,
      chapters: sorted.map((c) => toRef(c)!),
    }
  })
}

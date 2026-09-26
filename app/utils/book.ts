/** Content stems look like `books/<slug>`; the route only wants the last segment. */
export function bookSlug(stem: string): string {
  return stem.split('/').pop() ?? stem
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

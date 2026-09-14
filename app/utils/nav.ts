export interface LessonNavInput {
  path: string
  title: string
  chapter: number
  order: number
}

export interface ChapterInfo {
  number: number
  title: string
}

export interface NavLesson {
  path: string
  title: string
  label: string
}

export interface NavChapter {
  number: number
  title: string
  lessons: NavLesson[]
}

export function buildNav(lessons: LessonNavInput[], chapters: ChapterInfo[]): NavChapter[] {
  return [...chapters]
    .sort((a, b) => a.number - b.number)
    .map((chapter) => ({
      number: chapter.number,
      title: chapter.title,
      lessons: lessons
        .filter((l) => l.chapter === chapter.number)
        .sort((a, b) => a.order - b.order)
        .map((l, i) => ({ path: l.path, title: l.title, label: `${chapter.number}.${i + 1}` })),
    }))
    .filter((chapter) => chapter.lessons.length > 0)
}

export function flattenNav(nav: NavChapter[]): NavLesson[] {
  return nav.flatMap((chapter) => chapter.lessons)
}

export function normalizePath(path: string): string {
  const bare = path.split(/[?#]/)[0] ?? '/'
  return bare.length > 1 ? bare.replace(/\/+$/, '') : bare
}

export function surroundings(
  flat: NavLesson[],
  path: string,
): { prev: NavLesson | null; next: NavLesson | null } {
  const index = flat.findIndex((l) => l.path === normalizePath(path))
  if (index === -1) return { prev: null, next: null }
  return { prev: flat[index - 1] ?? null, next: flat[index + 1] ?? null }
}

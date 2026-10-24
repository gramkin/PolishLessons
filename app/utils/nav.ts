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
  /** The chapter's first lesson, set when `lessons` was left out (`slimNav`). */
  firstPath?: string
}

/** What every prerendered page carries: the contents with only the current chapter opened. */
export interface SlimNav {
  chapters: NavChapter[]
  prev: NavLesson | null
  next: NavLesson | null
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

/** The chapter whose last lesson is at `path`, or null when the lesson is not the last one. */
export function chapterEndingAt(nav: NavChapter[], path: string): number | null {
  const bare = normalizePath(path)
  const chapter = nav.find((c) => c.lessons.at(-1)?.path === bare)
  return chapter?.number ?? null
}

/**
 * The contents as a single page needs them: every chapter's title and first lesson, the lessons of
 * the chapter holding `path` and its neighbours. The full contents would add about 55 KB of HTML
 * and payload to each of the ~5600 prerendered pages; the browser loads them once, from nav.json.
 */
export function slimNav(nav: NavChapter[], path: string): SlimNav {
  const bare = normalizePath(path)
  return {
    chapters: nav.map((chapter) => ({
      number: chapter.number,
      title: chapter.title,
      firstPath: chapter.lessons[0]?.path,
      lessons: chapter.lessons.some((l) => l.path === bare) ? chapter.lessons : [],
    })),
    ...surroundings(flattenNav(nav), bare),
  }
}

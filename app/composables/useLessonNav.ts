import { buildNav, flattenNav, normalizePath, surroundings } from '~/utils/nav'

export function useLessonNav() {
  const route = useRoute()

  const lessons = useAsyncData('content:lesson-nav', () =>
    queryCollection('lessons').select('path', 'title', 'chapter', 'order').all(),
  )
  const chapters = useAsyncData('content:chapters', () => queryCollection('chapters').first())

  const nav = computed(() =>
    buildNav(lessons.data.value ?? [], chapters.data.value?.chapters ?? []),
  )
  const flat = computed(() => flattenNav(nav.value))
  const current = computed(
    () => flat.value.find((l) => l.path === normalizePath(route.path)) ?? null,
  )
  const around = computed(() => surroundings(flat.value, route.path))

  return {
    nav,
    current,
    prev: computed(() => around.value.prev),
    next: computed(() => around.value.next),
    ready: Promise.all([lessons, chapters]),
  }
}

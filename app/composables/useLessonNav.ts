import {
  buildNav,
  flattenNav,
  normalizePath,
  slimNav,
  type NavChapter,
  type SlimNav,
} from '~/utils/nav'

let fullNav: Promise<NavChapter[]> | null = null

/** The full contents: queried while prerendering, fetched once from nav.json in the browser. */
function loadFullNav(baseURL: string): Promise<NavChapter[]> {
  if (import.meta.server) {
    return Promise.all([
      queryCollection('lessons').select('path', 'title', 'chapter', 'order').all(),
      queryCollection('chapters').first(),
    ]).then(([lessons, chapters]) => buildNav(lessons, chapters?.chapters ?? []))
  }
  fullNav ??= $fetch<NavChapter[]>(`${baseURL.replace(/\/$/, '')}/nav.json`).catch((error) => {
    fullNav = null
    throw error
  })
  return fullNav
}

export function useLessonNav() {
  const route = useRoute()
  const { baseURL } = useRuntimeConfig().app
  const path = computed(() => normalizePath(route.path))

  // Only the slim contents go into a page's payload and HTML (see `slimNav`).
  const slim = useAsyncData(
    () => `lesson-nav:${path.value}`,
    async (): Promise<SlimNav> => slimNav(await loadFullNav(baseURL), path.value),
  )
  // The rest arrives after hydration, so the first client render matches the prerendered one.
  const full = useState<NavChapter[] | null>('lesson-nav:full', () => null)
  if (import.meta.client && !full.value) {
    onMounted(() => {
      loadFullNav(baseURL)
        .then((nav) => (full.value = nav))
        .catch(() => {
          // offline or missing nav.json: the slim contents stay
        })
    })
  }

  const nav = computed(() => full.value ?? slim.data.value?.chapters ?? [])
  const current = computed(() => flattenNav(nav.value).find((l) => l.path === path.value) ?? null)

  return {
    nav,
    current,
    prev: computed(() => slim.data.value?.prev ?? null),
    next: computed(() => slim.data.value?.next ?? null),
    ready: slim.then(() => undefined),
  }
}

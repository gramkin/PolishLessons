import type { IndexEntry, PublishedCard } from '#shared/dictionary'

function dictionaryUrl(path: string): string {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return `${base}/dictionary/${path}`
}

export function useDictionaryIndex(options: { lazy?: boolean } = {}) {
  const url = dictionaryUrl('index.json')
  const result = options.lazy
    ? useLazyAsyncData('dictionary:index:client', () => $fetch<IndexEntry[]>(url), {
        server: false,
        default: () => [],
      })
    : useAsyncData('dictionary:index', () => $fetch<IndexEntry[]>(url), { default: () => [] })
  const entries = computed<IndexEntry[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(entries.value.map((e) => [e.id, e])))
  return { entries, byId, ready: result }
}

export function useWordCard(id: string) {
  return useAsyncData(`dictionary:card:${id}`, () =>
    $fetch<PublishedCard>(dictionaryUrl(`cards/${id}.json`)),
  )
}

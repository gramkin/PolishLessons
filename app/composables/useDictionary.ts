import type { IndexEntry, PublishedCard } from '#shared/dictionary'
import type { IdiomExamples, PublishedIdiom } from '#shared/idioms'

const SAFE_ID = /^[a-z0-9-]+$/

function dictionaryUrl(path: string): string {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return `${base}/dictionary/${path}`
}

// The published JSON lives in public/dictionary. It is fetched over HTTP in the browser, but the
// prerender server cannot serve public files to internal fetches, so server rendering reads the files.
async function loadDictionaryJson<T>(path: string, url: string): Promise<T> {
  if (import.meta.server) {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    return JSON.parse(
      await readFile(join(process.cwd(), 'public', 'dictionary', path), 'utf8'),
    ) as T
  }
  return $fetch<T>(url)
}

export function useDictionaryIndex(options: { lazy?: boolean } = {}) {
  const url = dictionaryUrl('index.json')
  const load = () => loadDictionaryJson<IndexEntry[]>('index.json', url)
  const result = options.lazy
    ? useLazyAsyncData('dictionary:index:client', load, { server: false, default: () => [] })
    : useAsyncData('dictionary:index', load, { default: () => [] })
  const entries = computed<IndexEntry[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(entries.value.map((e) => [e.id, e])))
  return { entries, byId, ready: result }
}

export function useWordCard(id: string) {
  const path = `cards/${SAFE_ID.test(id) ? id : '__invalid__'}.json`
  const url = dictionaryUrl(path)
  return useAsyncData(`dictionary:card:${id}`, () => loadDictionaryJson<PublishedCard>(path, url))
}

/** Idioms and set expressions by frequency (`pnpm idioms` writes the file). */
export function useIdioms() {
  const result = useAsyncData(
    'dictionary:idioms',
    () => loadDictionaryJson<PublishedIdiom[]>('idioms.json', dictionaryUrl('idioms.json')),
    { default: () => [] },
  )
  return { idioms: computed(() => result.data.value ?? []), ready: result }
}

/**
 * Example sentences of the idioms, keyed by idiomKey. Loaded in the browser after the page, once
 * for every component that asks: card pages and /idioms prerender without them.
 */
export function useIdiomExamples() {
  const result = useLazyAsyncData(
    'dictionary:idiom-examples',
    () => $fetch<IdiomExamples>(dictionaryUrl('idiom-examples.json')),
    { server: false, default: () => ({}) },
  )
  return computed<IdiomExamples>(() => result.data.value ?? {})
}

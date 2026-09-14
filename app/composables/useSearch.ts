import type MiniSearch from 'minisearch'
import type { SearchDoc } from '#shared/search'
import { createSearchIndex, searchGrouped, type SearchGroup } from '~/utils/search'

let index: MiniSearch<SearchDoc> | null = null
let pending: Promise<void> | null = null
const ready = ref(false)
const loading = ref(false)
const error = ref(false)

export function resetSearch() {
  index = null
  pending = null
  ready.value = false
  loading.value = false
  error.value = false
}

export function useSearch() {
  const open = useState('search:open', () => false)
  const config = useRuntimeConfig()

  function ensureIndex(): Promise<void> {
    if (index) return Promise.resolve()
    if (!pending) {
      loading.value = true
      error.value = false
      pending = $fetch<{ docs: SearchDoc[] }>(
        `${config.app.baseURL.replace(/\/$/, '')}/search-index.json`,
      )
        .then((data) => {
          index = createSearchIndex(data.docs)
          ready.value = true
        })
        .catch(() => {
          error.value = true
          pending = null
        })
        .finally(() => {
          loading.value = false
        })
    }
    return pending
  }

  function search(query: string): SearchGroup[] {
    return ready.value && index ? searchGrouped(index, query) : []
  }

  return { open, ready, loading, error, ensureIndex, search }
}

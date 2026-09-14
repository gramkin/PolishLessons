import type { Pattern } from '#shared/schemas'

export function usePatterns() {
  const result = useAsyncData('content:patterns', async () => {
    const file = await queryCollection('patterns').first()
    return file?.patterns ?? []
  })
  const patterns = computed<Pattern[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(patterns.value.map((p) => [p.id, p])))
  return { patterns, byId, ready: result }
}

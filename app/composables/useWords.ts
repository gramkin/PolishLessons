import type { Word } from '#shared/schemas'

export function useWords() {
  const result = useAsyncData('content:words', async () => {
    const files = await queryCollection('words').all()
    return files.flatMap((file) => file.words)
  })
  const words = computed<Word[]>(() => result.data.value ?? [])
  const byId = computed(() => new Map(words.value.map((w) => [w.id, w])))
  return { words, byId, ready: result }
}

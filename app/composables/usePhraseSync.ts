import type { PublishedCard } from '#shared/dictionary'
import { freshPhraseText } from '~/utils/phrases'

const SAFE_ID = /^[a-z0-9-]+$/

/**
 * Bring saved phrases up to date with their cards, once per page visit after
 * progress loads: fetch each source card once and copy over any example text
 * that changed since the phrase was saved.
 */
export function usePhraseSync() {
  const { progress, loaded, updatePhraseText } = useProgress()
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  let started = false

  async function sync(): Promise<number> {
    const phrases = Object.values(progress.value.phrases)
    const cardIds = [...new Set(phrases.map((p) => p.from))].filter((id) => SAFE_ID.test(id))
    const cards = new Map(
      await Promise.all(
        cardIds.map(
          async (id) =>
            [
              id,
              await $fetch<PublishedCard>(`${base}/dictionary/cards/${id}.json`).catch(() => null),
            ] as const,
        ),
      ),
    )
    const updates: Record<string, { pl: string; ru: string }> = {}
    for (const phrase of phrases) {
      const card = cards.get(phrase.from)?.card
      const fresh = card ? freshPhraseText(phrase, card) : null
      if (fresh) updates[phrase.id] = fresh
    }
    updatePhraseText(updates)
    return Object.keys(updates).length
  }

  watch(
    loaded,
    (isLoaded) => {
      if (!isLoaded || started) return
      started = true
      void sync()
    },
    { immediate: true },
  )

  return { sync }
}

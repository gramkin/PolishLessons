import { readStoredProgress, STORAGE_KEY } from '~/utils/progress'

export default defineNuxtPlugin(() => {
  const { progress, loaded } = useProgress()

  // Load after hydration so the first client render matches the prerendered HTML.
  // Not app:mounted: pages with an async setup hydrate inside Suspense, which
  // resolves after the root mounts, so app:mounted fires too early for them.
  onNuxtReady(() => {
    let raw: string | null
    try {
      raw = localStorage.getItem(STORAGE_KEY)
    } catch {
      raw = null
    }

    const { progress: stored, valid } = readStoredProgress(raw)
    if (!valid) console.warn('[polski] Saved progress is invalid; starting with defaults.')
    progress.value = stored
    loaded.value = true

    watch(
      progress,
      (value) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch {
          // storage unavailable — progress lasts for this visit only
        }
      },
      { deep: true },
    )
  })
})

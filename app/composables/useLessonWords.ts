export function useLessonWords() {
  return useAsyncData('content:lesson-words', () =>
    queryCollection('lessons').select('path', 'words').all(),
  )
}

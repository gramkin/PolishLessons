import {
  defaultProgress,
  markLessonRead,
  recordQuizResult,
  type Progress,
  type Settings,
} from '~/utils/progress'
import { review } from '~/utils/leitner'
import type { Phrase } from '~/utils/phrases'

export function useProgress() {
  const progress = useState<Progress>('progress', defaultProgress)
  const loaded = useState('progress:loaded', () => false)

  function isLessonCompleted(path: string): boolean {
    return loaded.value && progress.value.lessons[path]?.completed === true
  }

  function recordQuiz(path: string, percent: number) {
    progress.value = recordQuizResult(progress.value, path, percent, new Date())
  }

  function markRead(path: string) {
    progress.value = markLessonRead(progress.value, path, new Date())
  }

  function updateSettings(patch: Partial<Settings>) {
    progress.value = { ...progress.value, settings: { ...progress.value.settings, ...patch } }
  }

  function reviewCard(wordId: string, remembered: boolean) {
    progress.value = {
      ...progress.value,
      cards: {
        ...progress.value.cards,
        [wordId]: review(progress.value.cards[wordId], remembered, new Date()),
      },
    }
  }

  function savePhrase(phrase: Phrase) {
    progress.value = {
      ...progress.value,
      phrases: { ...progress.value.phrases, [phrase.id]: phrase },
    }
  }

  function deletePhrase(id: string) {
    progress.value = {
      ...progress.value,
      phrases: Object.fromEntries(
        Object.entries(progress.value.phrases).filter(([key]) => key !== id),
      ),
    }
  }

  function hasPhrase(id: string): boolean {
    return loaded.value && id in progress.value.phrases
  }

  function reviewPhrase(id: string, remembered: boolean) {
    const phrase = progress.value.phrases[id]
    if (!phrase) return
    const next = review({ box: phrase.box, due: phrase.due }, remembered, new Date())
    progress.value = {
      ...progress.value,
      phrases: { ...progress.value.phrases, [id]: { ...phrase, box: next.box, due: next.due } },
    }
  }

  function replace(next: Progress) {
    progress.value = next
  }

  return {
    progress,
    loaded,
    isLessonCompleted,
    recordQuiz,
    markRead,
    reviewCard,
    savePhrase,
    deletePhrase,
    hasPhrase,
    reviewPhrase,
    updateSettings,
    replace,
  }
}

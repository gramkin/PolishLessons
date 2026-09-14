import {
  defaultProgress,
  markLessonRead,
  recordQuizResult,
  type Progress,
  type Settings,
} from '~/utils/progress'
import { review } from '~/utils/leitner'

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
    updateSettings,
    replace,
  }
}

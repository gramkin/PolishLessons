import {
  defaultProgress,
  markLessonRead,
  recordQuizResult,
  type Progress,
  type Settings,
} from '~/utils/progress'

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

  function replace(next: Progress) {
    progress.value = next
  }

  return { progress, loaded, isLessonCompleted, recordQuiz, markRead, updateSettings, replace }
}

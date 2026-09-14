import { beforeEach, describe, expect, it } from 'vitest'
import { defaultProgress } from '~/utils/progress'

describe('useProgress', () => {
  beforeEach(() => {
    const { replace, loaded } = useProgress()
    replace(defaultProgress())
    loaded.value = false
  })

  it('hides completion until progress is loaded', () => {
    const { markRead, isLessonCompleted, loaded } = useProgress()
    markRead('/lessons/a')
    expect(isLessonCompleted('/lessons/a')).toBe(false)
    loaded.value = true
    expect(isLessonCompleted('/lessons/a')).toBe(true)
  })

  it('records quiz results into shared state', () => {
    useProgress().recordQuiz('/lessons/b', 90)
    const { progress } = useProgress()
    expect(progress.value.lessons['/lessons/b']).toMatchObject({ completed: true, bestScore: 90 })
  })

  it('merges settings patches', () => {
    const { updateSettings, progress } = useProgress()
    updateSettings({ showPron: 'never' })
    expect(progress.value.settings).toEqual({
      showPron: 'never',
      translationMode: 'tap',
      direction: 'pl-ru',
    })
  })
})

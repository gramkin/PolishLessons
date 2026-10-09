import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import { defaultProgress, markLessonRead } from '~/utils/progress'

const { lessonWords } = vi.hoisted(() => ({
  lessonWords: [
    { path: '/lessons/a', words: ['rzeka', 'brzeg'] },
    { path: '/lessons/b', words: ['dom'] },
  ],
}))
mockNuxtImport('useLessonWords', () => () => Promise.resolve({ data: { value: lessonWords } }))

// The progress plugin loads once in onNuxtReady, which runs on an idle callback.
// Let it fire before the tests reset the state, or it lands mid-test.
beforeAll(() => new Promise((resolve) => setTimeout(resolve, 50)))

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = false
})

describe('index page', () => {
  it('renders the course title and a start link', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
    expect(wrapper.find('.progress-summary').exists()).toBe(false)
  })

  it('summarizes learned and due words once progress is loaded', async () => {
    const { replace, loaded } = useProgress()
    const progress = markLessonRead(defaultProgress(), '/lessons/a', new Date())
    progress.cards = { rzeka: { box: 2, due: '2000-01-01' }, dom: { box: 3, due: '2999-01-01' } }
    replace(progress)
    loaded.value = true

    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.find('.progress-summary').text().replace(/\s+/g, ' ')).toBe(
      'Изучено слов: 2 · фраз: 0 · к повторению сегодня: 1',
    )
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LessonDone from '~/components/LessonDone.vue'
import { defaultProgress } from '~/utils/progress'

beforeEach(() => {
  const { replace, loaded } = useProgress()
  replace(defaultProgress())
  loaded.value = true
})

describe('LessonDone', () => {
  it('marks the lesson as read', async () => {
    const wrapper = await mountSuspended(LessonDone, { props: { path: '/lessons/a' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('✓ Урок пройден')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders nothing before progress is loaded', async () => {
    useProgress().loaded.value = false
    const wrapper = await mountSuspended(LessonDone, { props: { path: '/lessons/a' } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('✓')
  })
})

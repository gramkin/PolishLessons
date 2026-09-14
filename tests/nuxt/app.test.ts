import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

const { ref } = await vi.hoisted(() => import('vue'))

// Content queries need the Nitro content API, which the Vitest Nuxt environment does not run;
// real content is covered by `pnpm generate` checks and the Playwright suite.
mockNuxtImport('useLessonNav', () => () => ({
  nav: ref([
    {
      number: 1,
      title: 'Алфавит и произношение',
      lessons: [{ path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' }],
    },
  ]),
  current: ref(null),
  prev: ref(null),
  next: ref(null),
  ready: Promise.resolve(),
}))

describe('index page', () => {
  it('renders the course title and chapter list', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.text()).toContain('1. Алфавит и произношение')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
  })
})

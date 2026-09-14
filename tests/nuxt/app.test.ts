import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('index page', () => {
  it('renders the course title and a start link', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Польский для русскоговорящих')
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"]').exists()).toBe(true)
  })
})

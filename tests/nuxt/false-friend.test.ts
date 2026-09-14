import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FalseFriend from '~/components/content/FalseFriend.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

describe('FalseFriend', () => {
  it('reads a false friend from the dictionary', async () => {
    const wrapper = await mountSuspended(FalseFriend, { props: { id: 'uroda' } })
    const aside = wrapper.find('aside.false-friend')
    expect(aside.attributes('role')).toBe('note')
    expect(aside.text().replace(/\s+/g, ' ')).toContain(
      'uroda ≠ урод. Значит: красота, привлекательность',
    )
    expect(aside.find('[lang="pl"]').text()).toBe('uroda')
  })

  it('accepts explicit props', async () => {
    const wrapper = await mountSuspended(FalseFriend, {
      props: { pl: 'sklep', ru: 'склеп', meaning: 'магазин' },
    })
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain('sklep ≠ склеп. Значит: магазин')
  })
})

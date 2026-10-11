import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import IdiomExamples from '~/components/dictionary/IdiomExamples.vue'

const { examples } = vi.hoisted(() => ({
  examples: {
    'trzymać kciuki': [
      { pl: 'Trzymam kciuki!', ru: 'Держу кулаки!', source: { kind: 'authored' } },
      { pl: 'Trzymaj za mnie kciuki.', ru: 'Держи за меня кулаки.', source: { kind: 'authored' } },
      {
        pl: 'Wszyscy trzymali kciuki.',
        ru: 'Все держали кулаки.',
        source: { kind: 'tatoeba', id: 7 },
      },
    ],
  },
}))
mockNuxtImport('useIdiomExamples', () => () => computed(() => examples))

describe('IdiomExamples', () => {
  it('opens the examples of an idiom, matched however the card writes it', async () => {
    const wrapper = await mountSuspended(IdiomExamples, {
      props: { pl: 'Trzymać kciuki!', from: 'kciuk' },
    })
    const toggle = wrapper.get('button.toggle')
    expect(toggle.text()).toBe('примеры (3)')
    expect(wrapper.find('li').exists()).toBe(false)
    await toggle.trigger('click')
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]!.text()).toContain('Trzymam kciuki!')
    expect(items[0]!.text()).toContain('Держу кулаки!')
  })

  it('shows nothing for an idiom without examples', async () => {
    const wrapper = await mountSuspended(IdiomExamples, {
      props: { pl: 'nudy na pudy', from: 'nuda' },
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

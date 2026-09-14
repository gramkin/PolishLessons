import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import StoryView from '~/components/StoryView.vue'
import type { Story } from '../../shared/schemas'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

const story: Story = {
  title: 'Kot i rzeka',
  titleRu: 'Кот и река',
  level: 'A1',
  sentences: [
    { pl: 'Kot mieszka nad rzeką.', ru: 'Кот живёт у реки.', words: { rzeką: 'rzeka' } },
    {
      pl: 'Na brzegu jest dom.',
      ru: 'На берегу стоит дом.',
      words: { brzegu: 'brzeg', dom: 'dom' },
    },
  ],
}

describe('StoryView', () => {
  it('renders Polish sentences with word links', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    const pl = wrapper.findAll('p.pl')
    expect(pl).toHaveLength(2)
    expect(pl[0]!.attributes('lang')).toBe('pl')
    expect(pl[0]!.find('.pl-word-trigger').text()).toBe('rzeką')
    expect(pl[1]!.findAll('.pl-word')).toHaveLength(2)
  })

  it('starts in tap mode and toggles a translation by clicking the sentence', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    expect(wrapper.find('[data-mode="tap"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)

    await wrapper.findAll('p.pl')[1]!.trigger('click')
    const ru = wrapper.findAll('p.ru')
    expect(ru).toHaveLength(1)
    expect(ru[0]!.text()).toBe('На берегу стоит дом.')

    await wrapper.findAll('p.pl')[1]!.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('does not toggle when a word inside the sentence is clicked', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    await wrapper.find('.pl-word-trigger').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('toggles with the reveal button', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    const button = wrapper.findAll('button.reveal')[0]!
    await button.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(1)
    expect(wrapper.findAll('button.reveal')[0]!.attributes('aria-expanded')).toBe('true')
  })

  it('shows all translations in show mode and none in hide mode', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story } })
    await wrapper.find('[data-mode="show"]').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(2)
    expect(wrapper.find('[data-mode="show"]').attributes('aria-pressed')).toBe('true')

    await wrapper.find('[data-mode="hide"]').trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
    expect(wrapper.findAll('button.reveal')).toHaveLength(0)
    await wrapper.findAll('p.pl')[0]!.trigger('click')
    expect(wrapper.findAll('p.ru')).toHaveLength(0)
  })

  it('respects initialMode', async () => {
    const wrapper = await mountSuspended(StoryView, { props: { story, initialMode: 'show' } })
    expect(wrapper.findAll('p.ru')).toHaveLength(2)
  })
})

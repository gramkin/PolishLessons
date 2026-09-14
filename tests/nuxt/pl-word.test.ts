import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import PlWord from '~/components/content/PlWord.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)
const { cardIndex } = await vi.hoisted(async () => {
  const { computed } = await import('vue')
  return {
    cardIndex: {
      entries: computed(() => []),
      byId: computed(() => new Map([['rzeka', { id: 'rzeka' }]])),
      ready: Promise.resolve(),
    },
  }
})
mockNuxtImport('useDictionaryIndex', () => () => cardIndex)

function cardHidden(wrapper: Awaited<ReturnType<typeof mountSuspended>>): boolean {
  return (wrapper.find('.pl-word-card').element as HTMLElement).style.display === 'none'
}

describe('PlWord', () => {
  it('renders a cognate with its Polish form', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(wrapper.classes()).toContain('is-cognate')
    const trigger = wrapper.find('button.pl-word-trigger')
    expect(trigger.text()).toBe('rzeka')
    expect(trigger.attributes('lang')).toBe('pl')
  })

  it('renders a slot form instead of the dictionary form', async () => {
    const wrapper = await mountSuspended(PlWord, {
      props: { id: 'rzeka' },
      slots: { default: () => 'rzekę' },
    })
    expect(wrapper.find('button.pl-word-trigger').text()).toBe('rzekę')
  })

  it('marks false friends and warns in the card', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'uroda' } })
    expect(wrapper.classes()).toContain('is-false-friend')
    expect(wrapper.find('.card-ff').text()).toContain('Не путать с «урод»')
  })

  it('shows translation, transcription and grammar in the card', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'glowa' } })
    const card = wrapper.find('.pl-word-card')
    expect(card.find('.card-ru').text()).toBe('голова')
    expect(card.find('.card-pron').text()).toBe('[гуо́ва]')
    expect(card.find('.card-meta').text()).toBe('сущ., ж. р.')
  })

  it('opens on hover, pins on click and closes on Escape', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(cardHidden(wrapper)).toBe(true)

    await wrapper.trigger('mouseenter')
    expect(cardHidden(wrapper)).toBe(false)
    await wrapper.trigger('mouseleave')
    expect(cardHidden(wrapper)).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(cardHidden(wrapper)).toBe(false)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    await wrapper.trigger('mouseleave')
    expect(cardHidden(wrapper)).toBe(false)

    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(cardHidden(wrapper)).toBe(true)
  })

  it('falls back to the id for unknown words', async () => {
    const wrapper = await mountSuspended(PlWord, { props: { id: 'ghost' } })
    expect(wrapper.find('button').text()).toBe('ghost')
    expect(wrapper.find('.pl-word-card').exists()).toBe(false)
    if (import.meta.dev) expect(wrapper.find('.pl-word-missing').text()).toBe('?ghost')
  })
  it('links to the detailed card when one exists', async () => {
    const withCard = await mountSuspended(PlWord, { props: { id: 'rzeka' } })
    expect(withCard.find('a.card-more').attributes('href')).toBe('/slovo/rzeka')
    const without = await mountSuspended(PlWord, { props: { id: 'glowa' } })
    expect(without.find('a.card-more').exists()).toBe(false)
  })
})

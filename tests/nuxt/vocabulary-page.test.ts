import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import VocabularyPage from '~/pages/vocabulary.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
const { dictionary } = await vi.hoisted(async () => {
  const { computed } = await import('vue')
  const entries = [
    { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb', gloss: 'иметь' },
    { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом, здание' },
  ]
  return {
    dictionary: {
      entries: computed(() => entries),
      byId: computed(() => new Map(entries.map((e) => [e.id, e]))),
      ready: Promise.resolve(),
    },
  }
})
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('useDictionaryIndex', () => () => dictionary)

describe('vocabulary page', () => {
  it('lists cards by rank with links, then lesson words', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    const ids = wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))
    expect(ids.slice(0, 2)).toEqual(['miec', 'dom'])
    expect(ids).toContain('rzeka')
    expect(wrapper.find('tr#dom a').attributes('href')).toBe('/slovo/dom')
    expect(wrapper.find('tr#rzeka a').exists()).toBe(false)
  })

  it('filters by frequency band and lessons', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper
      .find('select[aria-label="Частотность"]')
      .setValue(
        wrapper
          .find('select[aria-label="Частотность"] option:nth-child(2)')
          .element.getAttribute('value'),
      )
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['miec', 'dom'])
  })

  it('shows only lesson words when asked', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="checkbox"]').setValue(true)
    const ids = wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))
    expect(ids).toContain('dom')
    expect(ids).not.toContain('miec')
  })
})

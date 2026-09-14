import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import VocabularyPage from '~/pages/vocabulary.vue'

const { wordsApi, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)
mockNuxtImport('usePatterns', () => patternsApi)

describe('vocabulary page', () => {
  it('lists all words with anchors and notes', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    expect(wrapper.find('.count').text()).toBe('Найдено слов: 5')
    expect(wrapper.find('tr#rzeka').exists()).toBe(true)
    expect(wrapper.find('tr#rzeka .pattern').text()).toContain('rz ↔ р')
    expect(wrapper.find('tr#uroda .ff').text()).toContain('урод')
    expect(wrapper.find('tr#glowa td.meta').text()).toBe('сущ., ж. р.')
  })

  it('filters by search text without diacritics', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="search"]').setValue('glowa')
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['glowa'])
  })

  it('filters false friends only', async () => {
    const wrapper = await mountSuspended(VocabularyPage)
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('id'))).toEqual(['uroda'])
  })
})

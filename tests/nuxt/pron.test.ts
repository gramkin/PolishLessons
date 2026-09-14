import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Pron from '~/components/content/Pron.vue'

const { wordsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('useWords', () => wordsApi)

describe('Pron', () => {
  it('reads Polish text and transcription from the dictionary', async () => {
    const wrapper = await mountSuspended(Pron, { props: { id: 'rzeka' } })
    expect(wrapper.find('.pron-pl').text()).toBe('rzeka')
    expect(wrapper.find('.pron-pl').attributes('lang')).toBe('pl')
    expect(wrapper.find('.pron-ru').text()).toBe('[жэ́ка]')
  })

  it('accepts explicit text and transcription', async () => {
    const wrapper = await mountSuspended(Pron, { props: { pl: 'szczęście', ru: 'щэ́нщьчэ' } })
    expect(wrapper.find('.pron-pl').text()).toBe('szczęście')
    expect(wrapper.find('.pron-ru').text()).toBe('[щэ́нщьчэ]')
  })
})

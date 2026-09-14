import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import Pron from '~/components/content/Pron.vue'
import { defaultProgress } from '~/utils/progress'
import { LESSON_CHAPTER_KEY } from '~/utils/pron'

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

describe('Pron transcription visibility', () => {
  beforeEach(() => {
    useProgress().replace(defaultProgress())
  })

  it('hides transcription when the setting is never', async () => {
    useProgress().updateSettings({ showPron: 'never' })
    const wrapper = await mountSuspended(Pron, { props: { id: 'rzeka' } })
    expect(wrapper.find('.pron-ru').exists()).toBe(false)
    expect(wrapper.find('.pron-pl').text()).toBe('rzeka')
  })

  it('hides transcription in auto mode after chapter 3', async () => {
    const wrapper = await mountSuspended(Pron, {
      props: { id: 'rzeka' },
      global: { provide: { [LESSON_CHAPTER_KEY as symbol]: 4 } },
    })
    expect(wrapper.find('.pron-ru').exists()).toBe(false)
  })

  it('shows transcription in auto mode in chapter 2', async () => {
    const wrapper = await mountSuspended(Pron, {
      props: { id: 'rzeka' },
      global: { provide: { [LESSON_CHAPTER_KEY as symbol]: 2 } },
    })
    expect(wrapper.find('.pron-ru').exists()).toBe(true)
  })
})

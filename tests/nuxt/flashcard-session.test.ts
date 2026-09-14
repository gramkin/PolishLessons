import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import FlashcardSession from '~/components/FlashcardSession.vue'
import { nextTick } from 'vue'

const { words, patternsApi } = await vi.hoisted(() => import('./fixtures'))
mockNuxtImport('usePatterns', () => patternsApi)

const deck = [words[0]!, words[3]!] // rzeka, uroda
let wrapper: VueWrapper | undefined

afterEach(() => wrapper?.unmount())

async function press(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  await nextTick()
}

describe('FlashcardSession', () => {
  it('flips and answers with the keyboard, then finishes', async () => {
    wrapper = await mountSuspended(FlashcardSession, { props: { words: deck, direction: 'pl-ru' } })
    expect(wrapper.find('.card-front').text()).toContain('rzeka')
    expect(wrapper.find('.card-back').exists()).toBe(false)

    await press('2')
    expect(wrapper.emitted('review')).toBeUndefined()

    await press(' ')
    expect(wrapper.find('.card-back').text()).toContain('река')
    expect(wrapper.find('.card-back').text()).toContain('rz ↔ р')

    await press('2')
    expect(wrapper.emitted('review')?.[0]).toEqual(['rzeka', true])
    expect(wrapper.find('.card-front').text()).toContain('uroda')

    await wrapper.find('button.flip').trigger('click')
    expect(wrapper.find('.card-back').text()).toContain('Ложный друг')
    await wrapper.find('button.forgot').trigger('click')

    expect(wrapper.emitted('review')?.[1]).toEqual(['uroda', false])
    expect(wrapper.emitted('finish')?.[0]).toEqual([{ remembered: 1, forgotten: 1 }])
  })

  it('shows Russian on the front for ru-pl', async () => {
    wrapper = await mountSuspended(FlashcardSession, { props: { words: deck, direction: 'ru-pl' } })
    expect(wrapper.find('.card-front').text()).toContain('река')
    await wrapper.find('button.flip').trigger('click')
    expect(wrapper.find('.card-back [lang="pl"]').text()).toBe('rzeka')
  })
})

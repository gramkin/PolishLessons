import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchPanel from '~/components/SearchPanel.vue'
import { resetSearch } from '~/composables/useSearch'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

registerEndpoint('/search-index.json', () => ({
  docs: [
    { id: 'lesson:a:0', type: 'lesson', title: '2.1 rz и р', text: 'rzeka', url: '/lessons/a' },
    { id: 'word:zab', type: 'word', title: 'ząb — зуб', text: 'ząb зуб', url: '/vocabulary#zab' },
  ],
}))

let wrapper: VueWrapper | undefined

beforeEach(() => {
  resetSearch()
  useSearch().open.value = false
})

afterEach(() => {
  wrapper?.unmount()
  navigateToMock.mockReset()
})

async function openWithKey(code: string, key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, key }))
  await nextTick()
  await vi.waitFor(() => expect(useSearch().ready.value).toBe(true))
  await nextTick()
}

describe('SearchPanel', () => {
  it('opens with the S key (any layout) and shows grouped results', async () => {
    wrapper = await mountSuspended(SearchPanel)
    expect(wrapper.find('.search-overlay').exists()).toBe(false)

    await openWithKey('KeyS', 'ы')
    expect(wrapper.find('.search-overlay').exists()).toBe(true)

    await wrapper.find('input[type="search"]').setValue('zab')
    const group = wrapper.find('.search-group')
    expect(group.find('h2').text()).toBe('Словарь')
    expect(group.find('mark').text()).toBe('ząb')
  })

  it('opens the active result with Enter and closes', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    const input = wrapper.find('input[type="search"]')
    await input.setValue('zab')
    await input.trigger('keydown', { key: 'Enter' })
    expect(navigateToMock).toHaveBeenCalledWith('/vocabulary#zab')
    expect(wrapper.find('.search-overlay').exists()).toBe(false)
  })

  it('closes with Escape', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    await wrapper.find('input[type="search"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.search-overlay').exists()).toBe(false)
  })

  it('shows a message when nothing is found', async () => {
    wrapper = await mountSuspended(SearchPanel)
    await openWithKey('Slash', '/')
    await wrapper.find('input[type="search"]').setValue('xyzxyz')
    expect(wrapper.find('.search-status').text()).toBe('Ничего не найдено.')
  })
})

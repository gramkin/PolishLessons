import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import PageNav from '~/components/PageNav.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

const prev = { path: '/lessons/a', title: 'Буквы', label: '1.1' }
const next = { path: '/lessons/b', title: 'Ударение', label: '1.2' }

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  navigateToMock.mockReset()
})

function press(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }))
}

describe('PageNav', () => {
  it('renders links to previous and next lessons', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    expect(wrapper.find('a[rel="prev"]').attributes('href')).toBe('/lessons/a')
    expect(wrapper.find('a[rel="next"]').attributes('href')).toBe('/lessons/b')
  })

  it('omits missing links', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev: null, next } })
    expect(wrapper.find('a[rel="prev"]').exists()).toBe(false)
  })

  it('navigates with arrow keys', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    press('ArrowRight')
    expect(navigateToMock).toHaveBeenCalledWith('/lessons/b')
    press('ArrowLeft')
    expect(navigateToMock).toHaveBeenCalledWith('/lessons/a')
  })

  it('ignores arrows with modifier keys', async () => {
    wrapper = await mountSuspended(PageNav, { props: { prev, next } })
    press('ArrowRight', { altKey: true })
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})

import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppSidebar from '~/components/AppSidebar.vue'
import type { NavChapter } from '~/utils/nav'

const nav: NavChapter[] = [
  {
    number: 1,
    title: 'Алфавит и произношение',
    lessons: [
      { path: '/lessons/01-alphabet/01-letters', title: 'Буквы', label: '1.1' },
      { path: '/lessons/01-alphabet/02-stress', title: 'Ударение', label: '1.2' },
    ],
  },
]

describe('AppSidebar', () => {
  it('renders numbered chapters and lessons', async () => {
    const wrapper = await mountSuspended(AppSidebar, { props: { nav, currentPath: '/' } })
    expect(wrapper.text()).toContain('1. Алфавит и произношение')
    expect(wrapper.text()).toContain('1.2 Ударение')
    expect(wrapper.find('a[href="/cheatsheet"]').text()).toBe('Шпаргалка')
  })

  it('marks the current lesson', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: { nav, currentPath: '/lessons/01-alphabet/02-stress' },
    })
    const active = wrapper.find('a.active')
    expect(active.text()).toContain('Ударение')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('shows a check mark for completed lessons', async () => {
    const wrapper = await mountSuspended(AppSidebar, {
      props: {
        nav,
        currentPath: '/',
        isCompleted: (path: string) => path === '/lessons/01-alphabet/01-letters',
      },
    })
    expect(wrapper.findAll('.done')).toHaveLength(1)
    expect(wrapper.find('a[href="/lessons/01-alphabet/01-letters"] .done').exists()).toBe(true)
  })
})
